import { BaseADIAgent } from './agents/base-agent'
import { BackendAgentTracker } from './backend-agent-tracker'
import { apiUrl } from '@/lib/url'
import { db, evaluations, brands, users } from '../db/index'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
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
    'crawl_agent',         // Needs 45s for quality sitemap processing and HTML extraction
    'llm_test_agent',      // Multiple AI model calls
    'sentiment_agent',     // LLM sentiment analysis  
    'citation_agent',      // Media mention analysis
    'geo_visibility_agent', // Location-based LLM testing
    'commerce_agent'       // Product analysis with LLM
  ]

  private readonly FAST_AGENTS = [
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
      // Ensure evaluation record exists in database before proceeding
      await this.ensureEvaluationRecord(context)
      
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
        // Try multiple URL strategies for better reliability
        const possibleUrls = [
          // Strategy 1: Use environment variables
          process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/.netlify/functions/background-agents` : null,
          process.env.URL ? `${process.env.URL}/.netlify/functions/background-agents` : null,
          process.env.DEPLOY_PRIME_URL ? `${process.env.DEPLOY_PRIME_URL}/.netlify/functions/background-agents` : null,
          // Strategy 2: Fallback to production URL
          'https://ai-discoverability-index.netlify.app/.netlify/functions/background-agents',
          // Strategy 3: Relative URL (for client-side)
          typeof window !== 'undefined' ? '/.netlify/functions/background-agents' : null
        ].filter(Boolean)
        
        console.log(`🔗 [Hybrid] Available environment variables:`, {
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
          URL: process.env.URL,
          DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
          NODE_ENV: process.env.NODE_ENV
        })
        
        console.log(`🔗 [Hybrid] Trying URLs in order:`, possibleUrls)
        
        let lastError: Error | null = null
        let response: Response | null = null
        
        for (const functionUrl of possibleUrls as string[]) {
          try {
            console.log(`🔗 [Hybrid] Attempting to call: ${functionUrl}`)
            console.log(`🔗 [Hybrid] Request payload:`, {
              agentName,
              evaluationId: context.evaluationId,
              executionId,
              inputKeys: Object.keys(agentInput)
            })
            
            response = await fetch(functionUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'ADI-Hybrid-Orchestrator/1.0'
              },
              body: JSON.stringify({
                agentName,
                input: agentInput,
                evaluationId: context.evaluationId,
                executionId
              }),
              // Add timeout to prevent hanging
              signal: AbortSignal.timeout(30000) // 30 second timeout
            })

            console.log(`📡 [Hybrid] Response from ${functionUrl}: ${response.status} ${response.statusText}`)
            console.log(`📡 [Hybrid] Response headers:`, Object.fromEntries(response.headers.entries()))

            if (response.ok) {
              const result = await response.json()
              console.log(`✅ [Hybrid] Background function response:`, result)
              console.log(`🚀 [Hybrid] Successfully triggered slow agent: ${agentName} with execution ID: ${executionId}`)
              break // Success! Exit the loop
            } else {
              const errorBody = await response.text()
              console.error(`❌ [Hybrid] Background function call failed for ${functionUrl}: ${response.status} ${response.statusText}`)
              console.error(`❌ [Hybrid] Error response body:`, errorBody)
              lastError = new Error(`Backend API call failed: ${response.status} - ${errorBody}`)
            }
          } catch (error) {
            console.error(`❌ [Hybrid] Network error calling ${functionUrl}:`, error instanceof Error ? error.message : String(error))
            lastError = error instanceof Error ? error : new Error(String(error))
            continue // Try next URL
          }
        }
        
        // If we got here and response is not ok, all URLs failed
        if (!response || !response.ok) {
          console.error(`❌ [Hybrid] All background function URLs failed for ${agentName}`)
          throw lastError || new Error('All background function URLs failed')
        }

      } catch (error) {
        console.error(`❌ [Hybrid] Failed to trigger slow agent ${agentName}:`, error)
        console.error(`❌ [Hybrid] Error details:`, {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          evaluationId: context.evaluationId,
          agentName
        })
        
        // Mark as failed in tracker - but create a new execution ID since the original might not exist
        try {
          console.log(`📋 [Hybrid] Attempting to mark ${agentName} as failed for evaluation ${context.evaluationId}`)
          const failedExecutionId = await this.tracker.startExecution(context.evaluationId, agentName)
          await this.tracker.failExecution(
            failedExecutionId, 
            error instanceof Error ? error.message : 'Failed to trigger background function'
          )
          console.log(`📋 [Hybrid] Successfully marked ${agentName} as failed with execution ID ${failedExecutionId}`)
        } catch (trackingError) {
          console.error('❌ [Hybrid] Failed to track slow agent failure:', trackingError)
          console.error('❌ [Hybrid] Tracking error details:', {
            name: trackingError instanceof Error ? trackingError.name : 'Unknown',
            message: trackingError instanceof Error ? trackingError.message : String(trackingError),
            originalError: error instanceof Error ? error.message : String(error)
          })
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

  /**
   * Ensures the evaluation record exists in the database
   * Creates brand and evaluation records as needed
   */
  private async ensureEvaluationRecord(context: ADIEvaluationContext): Promise<void> {
    try {
      console.log(`🔍 [Hybrid] Ensuring evaluation record exists for ${context.evaluationId}`)
      
      // First, check if evaluation already exists
      const existingEvaluation = await db.select().from(evaluations).where(eq(evaluations.id, context.evaluationId)).limit(1)
      if (existingEvaluation.length > 0) {
        console.log(`✅ [Hybrid] Evaluation record already exists for ${context.evaluationId}`)
        return
      }
      
      // Ensure the brand exists or create a placeholder
      let brandId = context.brandId
      try {
        // Try to find existing brand
        const existingBrand = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1)
        if (existingBrand.length === 0) {
          // Try to find existing brand by website URL
          const existingBrandByUrl = await db.select().from(brands).where(eq(brands.websiteUrl, context.websiteUrl)).limit(1)
          if (existingBrandByUrl.length > 0) {
            console.log(`🔍 [Hybrid] Found existing brand by URL, using ${existingBrandByUrl[0].id}`)
            brandId = existingBrandByUrl[0].id
          } else {
            // Create a test user first
            const testUserId = randomUUID()
            console.log(`📝 [Hybrid] Creating test user record for ${testUserId}`)
            await db.insert(users).values({
              id: testUserId,
              email: `test-user-${Date.now()}@example.com`,
              name: 'Test User',
              createdAt: new Date(),
              updatedAt: new Date()
            })

            // Create a minimal brand record for testing
            console.log(`📝 [Hybrid] Creating placeholder brand record for ${brandId}`)
            await db.insert(brands).values({
              id: brandId,
              userId: testUserId,
              name: `Test Brand (${context.websiteUrl})`,
              websiteUrl: context.websiteUrl,
              // normalizedHost is auto-generated, don't set it manually
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }
        }
      } catch (error) {
        console.error('⚠️ [Hybrid] Brand creation failed, trying to find existing brand:', error instanceof Error ? error.message : String(error))
        // Try to find existing brand by website URL as fallback
        try {
          const existingBrandByUrl = await db.select().from(brands).where(eq(brands.websiteUrl, context.websiteUrl)).limit(1)
          if (existingBrandByUrl.length > 0) {
            console.log(`🔍 [Hybrid] Found existing brand by URL as fallback, using ${existingBrandByUrl[0].id}`)
            brandId = existingBrandByUrl[0].id
          } else {
            throw new Error('Could not create or find existing brand')
          }
        } catch (fallbackError) {
          console.error('❌ [Hybrid] Could not find existing brand either:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError))
          throw error
        }
      }

      // Now create the evaluation record (only if it doesn't exist)
      console.log(`📝 [Hybrid] Creating evaluation record for ${context.evaluationId}`)
      await db.insert(evaluations).values({
        id: context.evaluationId,
        brandId: brandId,
        status: 'pending',
        methodologyVersion: 'ADI-v1.0',
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      console.log(`✅ [Hybrid] Evaluation record created successfully`)
    } catch (error) {
      console.error('❌ [Hybrid] Failed to ensure evaluation record:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }
}
