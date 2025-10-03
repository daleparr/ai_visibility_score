import { BaseADIAgent } from './agents/base-agent'
import { BackendAgentTracker } from './backend-agent-tracker'
import type { 
  ADIEvaluationContext, 
  ADIOrchestrationResult, 
  ADIAgentOutput
} from '../../types/adi'

/**
 * Hybrid ADI Orchestrator
 * 
 * Splits agent execution between:
 * - Fast agents: Run in Netlify functions (8-second limit)
 * - Slow agents: Run in Netlify background functions (15-minute limit)
 * 
 * Architecture:
 * 1. Execute fast agents immediately in Netlify functions
 * 2. Trigger slow agents in Netlify background functions
 * 3. Return partial results immediately
 * 4. Frontend polls for completion of slow agents
 */
export class HybridADIOrchestrator {
  private fastAgents: Map<string, BaseADIAgent> = new Map()
  private slowAgentNames: Set<string> = new Set()
  private tracker: BackendAgentTracker

  // Agent classification based on LLM intensity and execution time
  private readonly SLOW_AGENTS = [
    'llm_test_agent',      // Multiple AI model calls
    'sentiment_agent',     // LLM sentiment analysis  
    'citation_agent',      // Media mention analysis
    'geo_visibility_agent', // Location-based LLM testing
    'commerce_agent'       // Product analysis with LLM
  ]

  private readonly FAST_AGENTS = [
    'crawl_agent',              // Web scraping
    'schema_agent',             // Structured data parsing
    'semantic_agent',           // Text analysis (medium LLM)
    'conversational_copy_agent', // Content analysis (medium LLM)
    'knowledge_graph_agent',    // Entity linking (medium LLM)
    'brand_heritage_agent',     // Pattern matching
    'score_aggregator'          // Mathematical calculations
  ]

  constructor() {
    this.tracker = new BackendAgentTracker()
    
    // Initialize slow agent names set
    this.SLOW_AGENTS.forEach(name => this.slowAgentNames.add(name))
  }

  /**
   * Register a fast agent (runs in Netlify)
   */
  registerFastAgent(agent: BaseADIAgent): void {
    if (this.FAST_AGENTS.includes(agent.config.name)) {
      this.fastAgents.set(agent.config.name, agent)
      console.log(`📦 [Hybrid] Registered fast agent: ${agent.config.name}`)
    } else {
      console.warn(`⚠️ [Hybrid] Agent ${agent.config.name} is not classified as fast`)
    }
  }

  /**
   * Execute hybrid evaluation
   * Returns fast results immediately, triggers slow agents in background
   */
  async executeEvaluation(context: ADIEvaluationContext): Promise<ADIOrchestrationResult> {
    const startTime = Date.now()
    console.log(`🚀 [Hybrid] Starting hybrid evaluation for ${context.evaluationId}`)

    try {
      // Phase 1: Execute fast agents in parallel (must complete within 8 seconds)
      const fastResults = await this.executeFastAgents(context)
      
      // Phase 2: Trigger slow agents in background (don't wait)
      this.triggerSlowAgents(context, fastResults).catch(error => {
        console.error('❌ [Hybrid] Failed to trigger slow agents:', error)
      })

      const executionTime = Date.now() - startTime
      console.log(`⚡ [Hybrid] Fast phase completed in ${executionTime}ms`)

      return {
        evaluationId: context.evaluationId,
        overallStatus: 'partial', // Indicates slow agents are still running
        agentResults: fastResults.reduce((acc, result) => {
          acc[result.agentName] = result
          return acc
        }, {} as Record<string, any>),
        totalExecutionTime: executionTime,
        errors: [],
        warnings: [],
        optimizations: {
          cacheUsed: false,
          parallelPhases: 2, // Fast + slow phases
          totalAgents: fastResults.length + this.SLOW_AGENTS.length,
          performanceGain: `Hybrid execution: ${fastResults.length} fast agents completed immediately`
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error(`❌ [Hybrid] Fast phase failed after ${executionTime}ms:`, error)
      
      return {
        evaluationId: context.evaluationId,
        overallStatus: 'failed',
        agentResults: {},
        totalExecutionTime: executionTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Execute fast agents in parallel within Netlify timeout limits
   */
  private async executeFastAgents(context: ADIEvaluationContext): Promise<ADIAgentOutput[]> {
    const FAST_TIMEOUT = 7000 // 7 seconds to stay within Netlify's 10s limit
    
    console.log(`⚡ [Hybrid] Executing ${this.fastAgents.size} fast agents with ${FAST_TIMEOUT}ms timeout`)

    const agentPromises = Array.from(this.fastAgents.entries()).map(async ([name, agent]) => {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Fast agent ${name} timed out`)), FAST_TIMEOUT)
        })

        // Race between agent execution and timeout
        const result = await Promise.race([
          agent.executeWithTimeout({
            context,
            previousResults: [], // Fast agents run independently
            config: {} // Add required config property
          }),
          timeoutPromise
        ])

        console.log(`✅ [Hybrid] Fast agent ${name} completed`)
        return result

      } catch (error) {
        console.error(`❌ [Hybrid] Fast agent ${name} failed:`, error)
        
        // Return failed result instead of throwing
        return {
          agentName: name,
          status: 'failed' as const,
          results: [],
          executionTime: FAST_TIMEOUT,
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata: { fastAgent: true, timedOut: true }
        }
      }
    })

    // Wait for all fast agents (with individual timeouts)
    const results = await Promise.all(agentPromises)
    
    const successful = results.filter(r => r.status === 'completed').length
    const failed = results.filter(r => r.status === 'failed').length
    
    console.log(`📊 [Hybrid] Fast agents: ${successful} successful, ${failed} failed`)
    
    return results
  }

  /**
   * Trigger slow agents in background via API calls
   */
  private async triggerSlowAgents(
    context: ADIEvaluationContext, 
    fastResults: ADIAgentOutput[]
  ): Promise<void> {
    console.log(`🐌 [Hybrid] Triggering ${this.SLOW_AGENTS.length} slow agents in background`)

    const triggerPromises = this.SLOW_AGENTS.map(async (agentName) => {
      try {
        // Start tracking the execution
        const executionId = await this.tracker.startExecution(context.evaluationId, agentName)
        
        // Prepare input for backend agent
        const agentInput = {
          context,
          previousResults: fastResults, // Slow agents can use fast agent results
          config: {} // Add required config property
        }

        // Make API call to Netlify background function (don't wait for completion)
        const response = await fetch('/.netlify/functions/background-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName,
            input: agentInput,
            evaluationId: context.evaluationId,
            executionId
          })
        })

        if (!response.ok) {
          throw new Error(`Backend API call failed: ${response.statusText}`)
        }

        console.log(`🚀 [Hybrid] Triggered slow agent: ${agentName}`)

      } catch (error) {
        console.error(`❌ [Hybrid] Failed to trigger slow agent ${agentName}:`, error)
        
        // Mark as failed in tracker
        try {
          const executionId = await this.tracker.startExecution(context.evaluationId, agentName)
          await this.tracker.failExecution(
            executionId, 
            error instanceof Error ? error.message : 'Failed to trigger'
          )
        } catch (trackingError) {
          console.error('Failed to track slow agent failure:', trackingError)
        }
      }
    })

    // Don't wait for all triggers to complete - fire and forget
    Promise.all(triggerPromises).catch(error => {
      console.error('❌ [Hybrid] Some slow agent triggers failed:', error)
    })
  }

  /**
   * Check if all slow agents have completed for an evaluation
   */
  async checkSlowAgentCompletion(evaluationId: string): Promise<{
    allComplete: boolean
    completedAgents: string[]
    failedAgents: string[]
    results: Record<string, any>
  }> {
    const { allComplete, completedAgents, failedAgents } = await this.tracker.areAllAgentsComplete(
      evaluationId,
      this.SLOW_AGENTS
    )

    const results = await this.tracker.getCompletedResults(evaluationId)

    return {
      allComplete,
      completedAgents,
      failedAgents,
      results
    }
  }

  /**
   * Get final results combining fast and slow agents
   */
  async getFinalResults(
    evaluationId: string,
    fastResults: ADIAgentOutput[]
  ): Promise<ADIOrchestrationResult> {
    const slowAgentStatus = await this.checkSlowAgentCompletion(evaluationId)
    
    // Combine fast and slow results
    const allResults = [...fastResults]
    
    // Add slow agent results
    Object.entries(slowAgentStatus.results).forEach(([agentName, result]) => {
      allResults.push(result)
    })

    const status = slowAgentStatus.allComplete ? 'completed' : 'running'
    
    return {
      evaluationId,
      overallStatus: status === 'completed' ? 'completed' : status === 'running' ? 'partial' : 'failed',
      agentResults: allResults.reduce((acc, result) => {
        acc[result.agentName] = result
        return acc
      }, {} as Record<string, any>),
      totalExecutionTime: 0, // Total time not meaningful in hybrid mode
      errors: [],
      warnings: [],
      optimizations: {
        cacheUsed: false,
        parallelPhases: 2, // Fast + slow phases
        totalAgents: fastResults.length + slowAgentStatus.completedAgents.length + slowAgentStatus.failedAgents.length,
        performanceGain: `Hybrid execution: ${fastResults.length} fast + ${slowAgentStatus.completedAgents.length} slow agents completed`
      }
    }
  }
}
