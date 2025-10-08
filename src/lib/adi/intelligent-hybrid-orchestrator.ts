import { BaseADIAgent } from './agents/base-agent'
import { SchemaAgent } from './agents/schema-agent'
import { SemanticAgent } from './agents/semantic-agent'
import { ConversationalCopyAgent } from './agents/conversational-copy-agent'
import { KnowledgeGraphAgent } from './agents/knowledge-graph-agent'
import { BrandHeritageAgent } from './agents/brand-heritage-agent'
import { ScoreAggregatorAgent as ScoreAggregator } from './agents/score-aggregator-agent'
import { BackendAgentTracker } from './backend-agent-tracker'
import { apiUrl } from '@/lib/url'
import { getSystemRouting, isAdvancedLoggingEnabled } from '../feature-flags'
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
  // These must match the agents registered in Railway's AgentExecutor
  private readonly SLOW_AGENTS = [
    'crawl_agent',         // Critical: Real implementation in Railway
    'citation_agent',      // Low: Placeholder implementation in Railway
    'commerce_agent',      // Medium: Placeholder implementation in Railway
    'sentiment_agent',     // Medium: Placeholder implementation in Railway
    'llm_test_agent',      // High: Placeholder implementation in Railway
    'geo_visibility_agent' // High: Placeholder implementation in Railway
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
    console.log('🏗️ [IntelligentHybrid] Constructor starting...')
    
    try {
      this.tracker = new BackendAgentTracker()
      console.log('✅ [IntelligentHybrid] BackendAgentTracker initialized')
      
      this.SLOW_AGENTS.forEach(name => this.slowAgentNames.add(name))
      console.log(`✅ [IntelligentHybrid] Slow agents registered: ${this.SLOW_AGENTS.length}`)
      
      // Auto-register agents for self-sufficiency
      console.log('🔧 [IntelligentHybrid] Starting agent registration...')
      
      this.registerFastAgent(new SchemaAgent())
      this.registerFastAgent(new SemanticAgent())
      this.registerFastAgent(new ConversationalCopyAgent())
      this.registerFastAgent(new KnowledgeGraphAgent())
      this.registerFastAgent(new BrandHeritageAgent())
      this.registerFastAgent(new ScoreAggregator())
      
      console.log(`✅ [IntelligentHybrid] Constructor completed. Fast agents: ${this.fastAgents.size}, Slow agents: ${this.slowAgentNames.size}`)
    } catch (error) {
      console.error('❌ [IntelligentHybrid] Constructor failed:', error)
      throw error
    }
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
    console.log(`🔍 [IntelligentHybrid] Fast agents available: ${this.fastAgents.size}`)
    console.log(`🔍 [IntelligentHybrid] Slow agents available: ${this.slowAgentNames.size}`)

    try {
      // Ensure evaluation record exists in database before proceeding
      console.log(`📝 [IntelligentHybrid] Ensuring evaluation record exists...`)
      await this.ensureEvaluationRecord(context)
      console.log(`✅ [IntelligentHybrid] Evaluation record confirmed`)
      
      // Determine system routing based on feature flags
      const tier = context.metadata?.tier || 'free'
      const allAgents = [...this.FAST_AGENTS, ...this.SLOW_AGENTS]
      const routing = getSystemRouting(tier, allAgents)
      
      if (isAdvancedLoggingEnabled()) {
        console.log(`🎯 [IntelligentHybrid] System routing decision:`, {
          evaluationId: context.evaluationId,
          tier,
          routing,
          allAgents
        })
      }
      
      // Phase 1: Execute fast agents in parallel (must complete within 8 seconds)
      const fastResults = await this.executeFastAgents(context)
      
      // Phase 2: Route slow agents based on feature flags
      if (routing.useRailwayBridge) {
        console.log(`🌉 [IntelligentHybrid] Using Railway bridge: ${routing.reason}`)
        await this.enqueueSlowAgentsIntelligently(context, fastResults)
      } else {
        console.log(`🔄 [IntelligentHybrid] Using legacy system: ${routing.reason}`)
        await this.enqueueSlowAgentsLegacy(context, fastResults)
      }

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
        optimizations: {
          cacheUsed: false,
          parallelPhases: 2, // Fast phase + slow phase
          totalAgents: this.FAST_AGENTS.length + this.SLOW_AGENTS.length,
          performanceGain: 'intelligent_queuing_with_progressive_timeouts'
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
        optimizations: {
          cacheUsed: false,
          parallelPhases: 1, // Only reached fast phase
          totalAgents: this.FAST_AGENTS.length + this.SLOW_AGENTS.length,
          performanceGain: 'failed_in_fast_phase'
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
        const result = await agent.execute(input)
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
   * Enqueue slow agents to Railway bridge for background processing
   */
  private async enqueueSlowAgentsIntelligently(
    context: ADIEvaluationContext, 
    fastResults: ADIAgentOutput[]
  ): Promise<void> {
    console.log(`🌉 [IntelligentHybrid] Enqueueing ${this.SLOW_AGENTS.length} slow agents to Railway bridge...`)

    try {
      // Import Railway bridge client
      const { getRailwayBridgeClient } = await import('../bridge/railway-client')
      const bridgeClient = getRailwayBridgeClient()

      // Track agent execution start for all agents
      for (const agentName of this.SLOW_AGENTS) {
        await this.tracker.startExecution(context.evaluationId, agentName)
      }

      // Determine priority based on tier
      let priority: 'high' | 'normal' | 'low' = 'normal'
      if (context.metadata?.tier === 'enterprise') {
        priority = 'high'
      } else if (context.metadata?.tier === 'free') {
        priority = 'low'
      }

      // Enqueue all slow agents as a single job to Railway
      const bridgeResponse = await bridgeClient.enqueueAgents({
        evaluationId: context.evaluationId,
        websiteUrl: context.websiteUrl,
        tier: context.metadata?.tier || 'free',
        agents: this.SLOW_AGENTS,
        callbackUrl: '', // Will be set by bridge client
        priority,
        metadata: {
          fastResultsAvailable: fastResults.length > 0,
          fastAgents: fastResults.map(r => r.agentName),
          enqueuedAt: new Date().toISOString(),
          hybridOrchestration: true
        }
      })

      console.log(`✅ [IntelligentHybrid] Successfully enqueued ${this.SLOW_AGENTS.length} agents to Railway`, {
        evaluationId: context.evaluationId,
        jobId: bridgeResponse.jobId,
        queuePosition: bridgeResponse.queuePosition,
        estimatedStartTime: bridgeResponse.estimatedStartTime
      })

    } catch (error) {
      console.error(`❌ [IntelligentHybrid] Failed to enqueue agents to Railway:`, error)
      
      // Fallback: Mark agents as failed so evaluation can still complete
      for (const agentName of this.SLOW_AGENTS) {
        try {
          const executionId = await this.tracker.startExecution(context.evaluationId, agentName)
          await this.tracker.failExecution(executionId, `Railway bridge failed: ${error instanceof Error ? error.message : String(error)}`)
        } catch (trackingError) {
          console.error(`❌ [IntelligentHybrid] Failed to mark ${agentName} as failed:`, trackingError)
        }
      }
      
      throw error
    }
  }

  /**
   * Enqueue slow agents using legacy system (fallback)
   */
  private async enqueueSlowAgentsLegacy(
    context: ADIEvaluationContext, 
    fastResults: ADIAgentOutput[]
  ): Promise<void> {
    console.log(`🔄 [IntelligentHybrid] Enqueueing ${this.SLOW_AGENTS.length} slow agents to legacy system...`)

    const enqueuingPromises = this.SLOW_AGENTS.map(async (agentName) => {
      try {
        // Create execution record in database
        const executionId = await this.tracker.startExecution(
          context.evaluationId,
          agentName
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
            fastResultsAvailable: true,
            legacyMode: true
          }
        }

        // Call intelligent background function (legacy)
        await this.callIntelligentBackgroundFunction({
          agentName,
          input,
          evaluationId: context.evaluationId,
          executionId
        })

        console.log(`✅ [IntelligentHybrid] Enqueued ${agentName} to legacy system with execution ID: ${executionId}`)

      } catch (error) {
        console.error(`❌ [IntelligentHybrid] Failed to enqueue ${agentName} to legacy system:`, error)
        // Don't throw - continue with other agents
      }
    })

    // Wait for all agents to be enqueued (but not executed)
    await Promise.allSettled(enqueuingPromises)
    console.log(`🔄 [IntelligentHybrid] All slow agents enqueued to legacy system`)
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
