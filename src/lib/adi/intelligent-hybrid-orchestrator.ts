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
 * Intelligent Hybrid ADI Orchestrator
 * 
 * Enhanced version with intelligent queuing system that provides:
 * - Progressive timeout handling with fallback strategies
 * - Priority-based agent scheduling
 * - Resource-aware execution management
 * - Circuit breaker patterns for problematic agents
 * - Graceful degradation for failed agents
 * 
 * Architecture:
 * 1. Execute fast agents immediately in Netlify functions (8-second limit)
 * 2. Use intelligent queue manager for slow agents with progressive timeouts
 * 3. Return partial results immediately with enhanced progress tracking
 * 4. Frontend polls for completion with detailed status information
 */
export class IntelligentHybridADIOrchestrator {
  private fastAgents: Map<string, BaseADIAgent> = new Map()
  private slowAgentNames: Set<string> = new Set()
  private tracker: BackendAgentTracker

  // Agent classification based on complexity and execution time
  private readonly SLOW_AGENTS = [
    'crawl_agent',         // Critical: Needs progressive timeouts for sitemap processing
    'llm_test_agent',      // High: Multiple AI model calls with fallback
    'sentiment_agent',     // Medium: LLM sentiment analysis with graceful degradation
    'citation_agent',      // Low: Media mention analysis, can be skipped
    'geo_visibility_agent', // High: Location-based LLM testing
    'commerce_agent'       // Medium: Product analysis with LLM, can be skipped
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
      console.log(`📦 [IntelligentHybrid] Registered fast agent: ${agent.config.name}`)
    } else {
      console.warn(`⚠️ [IntelligentHybrid] Agent ${agent.config.name} is not classified as fast`)
    }
  }

  /**
   * Execute intelligent hybrid evaluation
   * Returns fast results immediately, uses intelligent queue for slow agents
   */
  async executeEvaluation(context: ADIEvaluationContext): Promise<ADIOrchestrationResult> {
    const startTime = Date.now()
    console.log(`🧠 [IntelligentHybrid] Starting intelligent hybrid evaluation for ${context.evaluationId}`)

    try {
      // Ensure evaluation record exists in database before proceeding
      await this.ensureEvaluationRecord(context)
      
      // Phase 1: Execute fast agents in parallel (must complete within 8 seconds)
      const fastResults = await this.executeFastAgents(context)
      
      // Phase 2: Use intelligent queue manager for slow agents
      await this.enqueueSlowAgentsIntelligently(context, fastResults)

      const executionTime = Date.now() - startTime
      console.log(`⚡ [IntelligentHybrid] Fast phase completed in ${executionTime}ms`)

      return {
        evaluationId: context.evaluationId,
        overallStatus: 'partial', // Indicates slow agents are being processed intelligently
        agentResults: fastResults.reduce((acc, result) => {
          acc[result.agentName] = result
          return acc
        }, {} as Record<string, any>),
        totalExecutionTime: executionTime,
        errors: [],
        warnings: [],
        metadata: {
          hybridExecution: true,
          intelligentQueuing: true,
          fastAgentsCompleted: fastResults.length,
          slowAgentsQueued: this.SLOW_AGENTS.length,
          queueingStrategy: 'progressive_timeout_with_fallbacks'
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('❌ [IntelligentHybrid] Evaluation failed:', error)
      
      return {
        evaluationId: context.evaluationId,
        overallStatus: 'failed',
        agentResults: {},
        totalExecutionTime: executionTime,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metadata: {
          hybridExecution: true,
          intelligentQueuing: true,
          failedInPhase: 'fast_agents'
        }
      }
    }
  }

  /**
   * Execute fast agents in parallel with timeout protection
   */
  private async executeFastAgents(context: ADIEvaluationContext): Promise<ADIAgentOutput[]> {
    console.log(`⚡ [IntelligentHybrid] Executing ${this.fastAgents.size} fast agents`)
    
    const fastAgentPromises = Array.from(this.fastAgents.values()).map(async (agent) => {
      try {
        const input = {
          context,
          previousResults: [],
          config: {}
        }
        
        console.log(`🚀 [IntelligentHybrid] Starting fast agent: ${agent.config.name}`)
        const result = await agent.executeWithTimeout(input)
        console.log(`✅ [IntelligentHybrid] Fast agent ${agent.config.name} completed`)
        return result
      } catch (error) {
        console.error(`❌ [IntelligentHybrid] Fast agent ${agent.config.name} failed:`, error)
        
        // Return fallback result for failed fast agents
        return {
          agentName: agent.config.name,
          status: 'failed' as const,
          results: [],
          executionTime: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          metadata: { fastAgentFallback: true }
        }
      }
    })

    const results = await Promise.all(fastAgentPromises)
    console.log(`✅ [IntelligentHybrid] Fast agents completed: ${results.length} results`)
    
    return results
  }

  /**
   * Enqueue slow agents using intelligent queue manager
   */
  private async enqueueSlowAgentsIntelligently(
    context: ADIEvaluationContext, 
    fastResults: ADIAgentOutput[]
  ): Promise<void> {
    console.log(`🧠 [IntelligentHybrid] Enqueueing ${this.SLOW_AGENTS.length} slow agents with intelligent scheduling`)

    const enqueuingPromises = this.SLOW_AGENTS.map(async (agentName) => {
      try {
        // Create execution record in database
        const executionId = await this.tracker.startExecution(
          context.evaluationId,
          agentName,
          { 
            intelligentQueuing: true,
            enqueuedAt: new Date().toISOString(),
            fastResults: fastResults.length
          }
        )

        // Prepare agent input with fast results
        const input = {
          context,
          previousResults: fastResults.map(result => ({
            id: '',
            agent_id: '',
            result_type: result.agentName,
            raw_value: 0,
            normalized_score: 0,
            confidence_level: 0,
            evidence: result.metadata || {},
            created_at: new Date().toISOString()
          })),
          config: {
            intelligentQueuing: true,
            fastResultsAvailable: true
          }
        }

        // Call intelligent background function
        await this.callIntelligentBackgroundFunction({
          agentName,
          input,
          evaluationId: context.evaluationId,
          executionId
        })

        console.log(`✅ [IntelligentHybrid] Enqueued ${agentName} with execution ID: ${executionId}`)

      } catch (error) {
        console.error(`❌ [IntelligentHybrid] Failed to enqueue ${agentName}:`, error)
        // Don't throw - continue with other agents
      }
    })

    // Wait for all agents to be enqueued (but not executed)
    await Promise.allSettled(enqueuingPromises)
    console.log(`🧠 [IntelligentHybrid] All slow agents enqueued in intelligent queue`)
  }

  /**
   * Call intelligent background function with enhanced error handling
   */
  private async callIntelligentBackgroundFunction(payload: {
    agentName: string
    input: any
    evaluationId: string
    executionId: string
  }): Promise<void> {
    const { agentName, input, evaluationId, executionId } = payload
    
    // Build function URL with multiple fallback strategies
    const possibleUrls = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      'https://ai-visibility-score.netlify.app'
    ].filter(Boolean).map(baseUrl => 
      `${baseUrl}/.netlify/functions/intelligent-background-agents`
    )

    console.log(`🌐 [IntelligentHybrid] Environment variables:`, {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      URL: process.env.URL,
      DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
      NODE_ENV: process.env.NODE_ENV,
      CONTEXT: process.env.CONTEXT
    })

    console.log(`🔗 [IntelligentHybrid] Trying ${possibleUrls.length} possible URLs for intelligent background function`)

    let lastError: Error | null = null

    for (const [index, functionUrl] of possibleUrls.entries()) {
      try {
        console.log(`🌐 [IntelligentHybrid] Attempt ${index + 1}: Calling ${functionUrl}`)
        
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'IntelligentHybridOrchestrator/1.0'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000) // 30 second timeout
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`✅ [IntelligentHybrid] Successfully enqueued ${agentName} via ${functionUrl}`)
        console.log(`📊 [IntelligentHybrid] Queue response:`, result)
        return // Success - exit the retry loop

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`❌ [IntelligentHybrid] Attempt ${index + 1} failed for ${functionUrl}:`, lastError.message)
        
        if (index < possibleUrls.length - 1) {
          console.log(`🔄 [IntelligentHybrid] Retrying with next URL...`)
          continue
        }
      }
    }

    // All attempts failed
    console.error(`❌ [IntelligentHybrid] All ${possibleUrls.length} attempts failed for ${agentName}`)
    
    try {
      // Mark execution as failed in tracker
      await this.tracker.failExecution(
        executionId,
        `Failed to enqueue in intelligent queue: ${lastError?.message || 'Unknown error'}`
      )
    } catch (trackerError) {
      console.error(`❌ [IntelligentHybrid] Failed to mark execution as failed:`, trackerError)
    }

    throw new Error(`Failed to enqueue ${agentName} after ${possibleUrls.length} attempts: ${lastError?.message}`)
  }

  /**
   * Ensure evaluation record exists in database
   */
  private async ensureEvaluationRecord(context: ADIEvaluationContext): Promise<void> {
    try {
      console.log(`🔍 [IntelligentHybrid] Ensuring evaluation record exists for ${context.evaluationId}`)
      
      // Check if evaluation already exists
      const existingEvaluation = await db.select()
        .from(evaluations)
        .where(eq(evaluations.id, context.evaluationId))
        .limit(1)

      if (existingEvaluation.length > 0) {
        console.log(`✅ [IntelligentHybrid] Evaluation record already exists: ${context.evaluationId}`)
        return
      }

      // Create brand record if it doesn't exist
      let brandId: string
      const existingBrand = await db.select()
        .from(brands)
        .where(eq(brands.websiteUrl, context.websiteUrl))
        .limit(1)

      if (existingBrand.length > 0) {
        brandId = existingBrand[0].id
        console.log(`✅ [IntelligentHybrid] Using existing brand: ${brandId}`)
      } else {
        brandId = randomUUID()
        await db.insert(brands).values({
          id: brandId,
          name: context.metadata?.brandName || 'Unknown Brand',
          websiteUrl: context.websiteUrl,
          // normalizedHost is a generated column, don't insert it
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log(`✅ [IntelligentHybrid] Created new brand: ${brandId}`)
      }

      // Create user record if it doesn't exist (placeholder)
      let userId: string = 'system-user'
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (existingUser.length === 0) {
        await db.insert(users).values({
          id: userId,
          email: 'system@ai-visibility-score.com',
          name: 'System User',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        console.log(`✅ [IntelligentHybrid] Created system user: ${userId}`)
      }

      // Create evaluation record
      await db.insert(evaluations).values({
        id: context.evaluationId,
        brandId: brandId,
        userId: userId,
        status: 'running',
        overallScore: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      console.log(`✅ [IntelligentHybrid] Created evaluation record: ${context.evaluationId}`)

    } catch (error) {
      console.error('❌ [IntelligentHybrid] Failed to ensure evaluation record:', error)
      throw new Error(`Database setup failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get evaluation status with intelligent queue information
   */
  async getEvaluationStatus(evaluationId: string): Promise<{
    overallStatus: string
    progress: number
    fastAgentsCompleted: number
    slowAgentsStatus: any
    estimatedTimeRemaining: number
    intelligentQueueMetrics: any
  }> {
    try {
      // Get status from intelligent queue manager via API
      const queueStatusUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-visibility-score.netlify.app'}/.netlify/functions/intelligent-background-agents`
      
      const response = await fetch(queueStatusUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to get queue status: ${response.status}`)
      }

      const queueData = await response.json()
      
      // Get traditional execution status from database
      const executions = await this.tracker.getEvaluationExecutions(evaluationId)
      
      const completed = executions.filter(e => e.status === 'completed').length
      const total = executions.length
      const progress = total > 0 ? completed / total : 0

      return {
        overallStatus: progress >= 1.0 ? 'completed' : 'running',
        progress,
        fastAgentsCompleted: this.fastAgents.size,
        slowAgentsStatus: executions,
        estimatedTimeRemaining: queueData.metrics?.averageExecutionTime || 0,
        intelligentQueueMetrics: queueData.metrics
      }

    } catch (error) {
      console.error('❌ [IntelligentHybrid] Failed to get evaluation status:', error)
      
      // Fallback to traditional status
      const executions = await this.tracker.getEvaluationExecutions(evaluationId)
      const completed = executions.filter(e => e.status === 'completed').length
      const total = executions.length
      
      return {
        overallStatus: total > 0 && completed >= total ? 'completed' : 'running',
        progress: total > 0 ? completed / total : 0,
        fastAgentsCompleted: this.fastAgents.size,
        slowAgentsStatus: executions,
        estimatedTimeRemaining: 0,
        intelligentQueueMetrics: null
      }
    }
  }

  /**
   * Cancel evaluation and all queued agents
   */
  async cancelEvaluation(evaluationId: string): Promise<void> {
    try {
      console.log(`🚫 [IntelligentHybrid] Cancelling evaluation: ${evaluationId}`)
      
      // Cancel via intelligent queue manager
      const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-visibility-score.netlify.app'}/.netlify/functions/intelligent-background-agents?evaluationId=${evaluationId}`
      
      const response = await fetch(cancelUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        console.warn(`⚠️ [IntelligentHybrid] Failed to cancel via queue manager: ${response.status}`)
      }

      // Also update database status
      await db.update(evaluations)
        .set({ 
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(eq(evaluations.id, evaluationId))

      console.log(`✅ [IntelligentHybrid] Evaluation ${evaluationId} cancelled`)

    } catch (error) {
      console.error('❌ [IntelligentHybrid] Failed to cancel evaluation:', error)
      throw error
    }
  }
}
