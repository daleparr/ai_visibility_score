import { BackendAgentTracker } from './backend-agent-tracker'
import { withSchema } from '../db'
import type { ADIAgentInput, ADIAgentOutput } from '../../types/adi'

/**
 * Intelligent Queue Manager for ADI Agents
 * 
 * Provides sophisticated queuing with:
 * - Progressive timeout handling
 * - Intelligent fallback strategies  
 * - Priority-based execution
 * - Adaptive retry logic
 * - Circuit breaker patterns
 * - Resource-aware scheduling
 */

export interface QueuedAgent {
  id: string
  agentName: string
  input: ADIAgentInput
  evaluationId: string
  executionId: string
  priority: AgentPriority
  timeoutStrategy: TimeoutStrategy
  fallbackStrategy: FallbackStrategy
  queuedAt: number
  startedAt?: number
  attempts: number
  maxAttempts: number
  lastError?: string
  estimatedDuration: number
  dependencies: string[]
  status: QueueStatus
}

export enum AgentPriority {
  CRITICAL = 1,    // Must complete (e.g., crawl_agent for data foundation)
  HIGH = 2,        // Important for quality (e.g., llm_test_agent)
  MEDIUM = 3,      // Valuable but not essential (e.g., sentiment_agent)
  LOW = 4,         // Nice to have (e.g., citation_agent)
  OPTIONAL = 5     // Can be skipped if resources limited
}

export enum QueueStatus {
  PENDING = 'pending',
  RUNNING = 'running', 
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  FALLBACK = 'fallback'
}

export interface TimeoutStrategy {
  initial: number           // Initial timeout (e.g., 60s)
  progressive: number[]     // Progressive timeouts [120s, 300s, 600s]
  maxTotal: number         // Maximum total time across all attempts
  circuitBreaker: number   // Hard stop time (e.g., 900s = 15min)
}

export interface FallbackStrategy {
  enabled: boolean
  fallbackAgent?: string   // Alternative agent to use
  minimalMode: boolean     // Use minimal/fast mode if available
  gracefulDegradation: boolean // Return partial results
  skipIfFailed: boolean    // Skip this agent if it fails
}

export interface QueueMetrics {
  totalQueued: number
  totalRunning: number
  totalCompleted: number
  totalFailed: number
  averageWaitTime: number
  averageExecutionTime: number
  successRate: number
  resourceUtilization: number
}

export class IntelligentQueueManager {
  private queue: Map<string, QueuedAgent> = new Map()
  private runningAgents: Map<string, QueuedAgent> = new Map()
  private completedAgents: Map<string, QueuedAgent> = new Map()
  private tracker: BackendAgentTracker
  
  // Resource management
  private readonly MAX_CONCURRENT_AGENTS = 3  // Limit concurrent background functions
  private readonly MAX_QUEUE_SIZE = 50        // Prevent memory issues
  private readonly QUEUE_CLEANUP_INTERVAL = 300000 // 5 minutes
  
  // Agent-specific configurations
  private readonly AGENT_CONFIGS = new Map<string, {
    priority: AgentPriority
    timeoutStrategy: TimeoutStrategy
    fallbackStrategy: FallbackStrategy
    estimatedDuration: number
    dependencies: string[]
  }>([
    ['crawl_agent', {
      priority: AgentPriority.CRITICAL,
      timeoutStrategy: {
        initial: 180000,      // 3 minutes initial
        progressive: [300000, 600000, 900000], // 5min, 10min, 15min
        maxTotal: 900000,     // 15 minutes total
        circuitBreaker: 900000 // Hard stop at 15min
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,    // Use simple homepage crawl
        gracefulDegradation: true,
        skipIfFailed: false   // Critical - don't skip
      },
      estimatedDuration: 180000, // 3 minutes expected
      dependencies: []
    }],
    ['llm_test_agent', {
      priority: AgentPriority.HIGH,
      timeoutStrategy: {
        initial: 120000,      // 2 minutes initial
        progressive: [180000, 300000], // 3min, 5min
        maxTotal: 300000,     // 5 minutes total
        circuitBreaker: 300000
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,    // Reduce query count
        gracefulDegradation: true,
        skipIfFailed: false
      },
      estimatedDuration: 120000,
      dependencies: ['crawl_agent']
    }],
    ['sentiment_agent', {
      priority: AgentPriority.MEDIUM,
      timeoutStrategy: {
        initial: 90000,       // 1.5 minutes
        progressive: [120000, 180000], // 2min, 3min
        maxTotal: 180000,     // 3 minutes total
        circuitBreaker: 180000
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,
        gracefulDegradation: true,
        skipIfFailed: true    // Can skip if needed
      },
      estimatedDuration: 90000,
      dependencies: ['crawl_agent']
    }],
    ['geo_visibility_agent', {
      priority: AgentPriority.HIGH,
      timeoutStrategy: {
        initial: 120000,
        progressive: [180000, 240000],
        maxTotal: 240000,
        circuitBreaker: 240000
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,
        gracefulDegradation: true,
        skipIfFailed: false
      },
      estimatedDuration: 120000,
      dependencies: ['crawl_agent']
    }],
    ['commerce_agent', {
      priority: AgentPriority.MEDIUM,
      timeoutStrategy: {
        initial: 90000,
        progressive: [120000, 180000],
        maxTotal: 180000,
        circuitBreaker: 180000
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,
        gracefulDegradation: true,
        skipIfFailed: true
      },
      estimatedDuration: 90000,
      dependencies: ['crawl_agent']
    }],
    ['citation_agent', {
      priority: AgentPriority.LOW,
      timeoutStrategy: {
        initial: 60000,
        progressive: [90000, 120000],
        maxTotal: 120000,
        circuitBreaker: 120000
      },
      fallbackStrategy: {
        enabled: true,
        minimalMode: true,
        gracefulDegradation: true,
        skipIfFailed: true    // Lowest priority - can skip
      },
      estimatedDuration: 60000,
      dependencies: ['crawl_agent']
    }]
  ])

  constructor() {
    this.tracker = new BackendAgentTracker()
    
    // Start periodic cleanup
    setInterval(() => this.cleanupCompletedAgents(), this.QUEUE_CLEANUP_INTERVAL)
  }

  /**
   * Add agent to intelligent queue with priority and strategy
   */
  async enqueueAgent(
    agentName: string,
    input: ADIAgentInput,
    evaluationId: string,
    executionId: string
  ): Promise<void> {
    const config = this.AGENT_CONFIGS.get(agentName)
    if (!config) {
      throw new Error(`No configuration found for agent: ${agentName}`)
    }

    // Check queue capacity
    if (this.queue.size >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue is at maximum capacity')
    }

    const queuedAgent: QueuedAgent = {
      id: `${evaluationId}-${agentName}`,
      agentName,
      input,
      evaluationId,
      executionId,
      priority: config.priority,
      timeoutStrategy: config.timeoutStrategy,
      fallbackStrategy: config.fallbackStrategy,
      queuedAt: Date.now(),
      attempts: 0,
      maxAttempts: config.timeoutStrategy.progressive.length + 1,
      estimatedDuration: config.estimatedDuration,
      dependencies: config.dependencies,
      status: QueueStatus.PENDING
    }

    this.queue.set(queuedAgent.id, queuedAgent)
    
    console.log(`📋 [Queue] Enqueued ${agentName} for evaluation ${evaluationId}`)
    console.log(`📋 [Queue] Priority: ${AgentPriority[config.priority]}, Est. duration: ${config.estimatedDuration}ms`)
    
    // Try to start execution immediately if resources available
    await this.processQueue()
  }

  /**
   * Process queue with intelligent scheduling
   */
  async processQueue(): Promise<void> {
    const availableSlots = this.MAX_CONCURRENT_AGENTS - this.runningAgents.size
    if (availableSlots <= 0) {
      console.log(`📋 [Queue] No available slots (${this.runningAgents.size}/${this.MAX_CONCURRENT_AGENTS} running)`)
      return
    }

    // Get ready-to-run agents (dependencies satisfied)
    const readyAgents = Array.from(this.queue.values())
      .filter(agent => agent.status === QueueStatus.PENDING)
      .filter(agent => this.areDependenciesSatisfied(agent))
      .sort((a, b) => {
        // Sort by priority first, then by queue time
        if (a.priority !== b.priority) {
          return a.priority - b.priority // Lower number = higher priority
        }
        return a.queuedAt - b.queuedAt // FIFO within same priority
      })

    const agentsToStart = readyAgents.slice(0, availableSlots)
    
    for (const agent of agentsToStart) {
      await this.startAgentExecution(agent)
    }
  }

  /**
   * Check if agent dependencies are satisfied
   */
  private areDependenciesSatisfied(agent: QueuedAgent): boolean {
    for (const dependency of agent.dependencies) {
      const depId = `${agent.evaluationId}-${dependency}`
      const depAgent = this.completedAgents.get(depId)
      
      if (!depAgent || depAgent.status !== QueueStatus.COMPLETED) {
        console.log(`📋 [Queue] Agent ${agent.agentName} waiting for dependency: ${dependency}`)
        return false
      }
    }
    return true
  }

  /**
   * Start agent execution with progressive timeout handling
   */
  private async startAgentExecution(agent: QueuedAgent): Promise<void> {
    try {
      // Move from queue to running
      this.queue.delete(agent.id)
      agent.status = QueueStatus.RUNNING
      agent.startedAt = Date.now()
      agent.attempts++
      this.runningAgents.set(agent.id, agent)

      console.log(`🚀 [Queue] Starting ${agent.agentName} (attempt ${agent.attempts}/${agent.maxAttempts})`)
      
      // Mark as running in database
      await this.tracker.markRunning(agent.executionId)

      // Determine timeout for this attempt
      const timeout = this.getTimeoutForAttempt(agent)
      console.log(`⏱️ [Queue] Using ${timeout}ms timeout for ${agent.agentName} attempt ${agent.attempts}`)

      // Execute with timeout and fallback handling
      const result = await this.executeWithProgressiveTimeout(agent, timeout)
      
      // Handle successful completion
      await this.handleAgentSuccess(agent, result)
      
    } catch (error) {
      console.error(`❌ [Queue] Agent ${agent.agentName} failed:`, error)
      await this.handleAgentFailure(agent, error)
    }
  }

  /**
   * Get timeout for current attempt with progressive strategy
   */
  private getTimeoutForAttempt(agent: QueuedAgent): number {
    if (agent.attempts === 1) {
      return agent.timeoutStrategy.initial
    }
    
    const progressiveIndex = agent.attempts - 2
    if (progressiveIndex < agent.timeoutStrategy.progressive.length) {
      return agent.timeoutStrategy.progressive[progressiveIndex]
    }
    
    // Use last progressive timeout if we exceed the array
    return agent.timeoutStrategy.progressive[agent.timeoutStrategy.progressive.length - 1]
  }

  /**
   * Execute agent with timeout and circuit breaker
   */
  private async executeWithProgressiveTimeout(
    agent: QueuedAgent, 
    timeout: number
  ): Promise<ADIAgentOutput> {
    const totalElapsed = Date.now() - agent.queuedAt
    
    // Circuit breaker check
    if (totalElapsed > agent.timeoutStrategy.circuitBreaker) {
      throw new Error(`Circuit breaker activated: total time ${totalElapsed}ms exceeds ${agent.timeoutStrategy.circuitBreaker}ms`)
    }

    // Dynamic import of agent class
    const AgentClass = await this.getAgentClass(agent.agentName)
    const agentInstance = new AgentClass()

    // Apply fallback mode if this is a retry
    if (agent.attempts > 1 && agent.fallbackStrategy.minimalMode) {
      console.log(`🔄 [Queue] Applying minimal mode for ${agent.agentName} retry`)
      agent.input = this.applyMinimalMode(agent.input, agent.agentName)
    }

    // Execute with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${agent.agentName} timed out after ${timeout}ms`))
      }, timeout)
    })

    const executionPromise = agentInstance.execute(agent.input)
    
    return await Promise.race([executionPromise, timeoutPromise])
  }

  /**
   * Apply minimal mode configuration to reduce execution time
   */
  private applyMinimalMode(input: ADIAgentInput, agentName: string): ADIAgentInput {
    const minimalInput = { ...input }
    
    // Agent-specific minimal mode configurations
    switch (agentName) {
      case 'crawl_agent':
        // Use simple homepage crawl instead of full sitemap processing
        minimalInput.config = {
          ...minimalInput.config,
          skipSitemapProcessing: true,
          maxUrlsToCrawl: 1,
          timeout: 30000 // 30 seconds
        }
        break
        
      case 'llm_test_agent':
        // Reduce number of queries and models
        minimalInput.config = {
          ...minimalInput.config,
          maxQueries: 2,
          maxModels: 1,
          timeout: 60000 // 1 minute
        }
        break
        
      case 'sentiment_agent':
        // Use faster sentiment analysis
        minimalInput.config = {
          ...minimalInput.config,
          fastMode: true,
          maxSamples: 5
        }
        break
    }
    
    return minimalInput
  }

  /**
   * Handle successful agent completion
   */
  private async handleAgentSuccess(agent: QueuedAgent, result: ADIAgentOutput): Promise<void> {
    const executionTime = Date.now() - (agent.startedAt || agent.queuedAt)
    
    // Update database
    await this.tracker.completeExecution(agent.executionId, result, executionTime)
    
    // Move to completed
    agent.status = QueueStatus.COMPLETED
    this.runningAgents.delete(agent.id)
    this.completedAgents.set(agent.id, agent)
    
    console.log(`✅ [Queue] Agent ${agent.agentName} completed successfully in ${executionTime}ms`)
    
    // Process queue for dependent agents
    await this.processQueue()
  }

  /**
   * Handle agent failure with retry and fallback logic
   */
  private async handleAgentFailure(agent: QueuedAgent, error: any): Promise<void> {
    agent.lastError = error instanceof Error ? error.message : String(error)
    this.runningAgents.delete(agent.id)
    
    const totalElapsed = Date.now() - agent.queuedAt
    const shouldRetry = agent.attempts < agent.maxAttempts && 
                       totalElapsed < agent.timeoutStrategy.maxTotal
    
    if (shouldRetry) {
      console.log(`🔄 [Queue] Retrying ${agent.agentName} (attempt ${agent.attempts + 1}/${agent.maxAttempts})`)
      
      // Add back to queue for retry with exponential backoff
      const backoffDelay = Math.min(1000 * Math.pow(2, agent.attempts - 1), 30000) // Max 30s
      setTimeout(async () => {
        agent.status = QueueStatus.PENDING
        this.queue.set(agent.id, agent)
        await this.processQueue()
      }, backoffDelay)
      
    } else if (agent.fallbackStrategy.enabled && agent.fallbackStrategy.gracefulDegradation) {
      console.log(`🔄 [Queue] Applying graceful degradation for ${agent.agentName}`)
      await this.handleGracefulDegradation(agent)
      
    } else if (agent.fallbackStrategy.skipIfFailed) {
      console.log(`⏭️ [Queue] Skipping failed agent ${agent.agentName}`)
      await this.handleSkippedAgent(agent)
      
    } else {
      console.error(`❌ [Queue] Agent ${agent.agentName} failed permanently`)
      await this.handlePermanentFailure(agent)
    }
  }

  /**
   * Handle graceful degradation - return minimal results
   */
  private async handleGracefulDegradation(agent: QueuedAgent): Promise<void> {
    const fallbackResult: ADIAgentOutput = {
      agentName: agent.agentName,
      status: 'completed',
      results: [{
        resultType: `${agent.agentName}_fallback`,
        rawValue: 0,
        normalizedScore: 25, // Minimal score
        confidenceLevel: 0.1,
        evidence: {
          fallback: true,
          reason: agent.lastError,
          message: 'Graceful degradation applied due to timeout'
        }
      }],
      executionTime: Date.now() - (agent.startedAt || agent.queuedAt),
      metadata: {
        fallback: true,
        originalError: agent.lastError
      }
    }
    
    await this.handleAgentSuccess(agent, fallbackResult)
  }

  /**
   * Handle skipped agent
   */
  private async handleSkippedAgent(agent: QueuedAgent): Promise<void> {
    agent.status = QueueStatus.CANCELLED
    this.completedAgents.set(agent.id, agent)
    
    // Mark as failed in database but don't block evaluation
    await this.tracker.failExecution(
      agent.executionId, 
      `Agent skipped due to failure: ${agent.lastError}`
    )
    
    console.log(`⏭️ [Queue] Agent ${agent.agentName} skipped, continuing evaluation`)
    
    // Process queue for other agents
    await this.processQueue()
  }

  /**
   * Handle permanent failure
   */
  private async handlePermanentFailure(agent: QueuedAgent): Promise<void> {
    agent.status = QueueStatus.FAILED
    this.completedAgents.set(agent.id, agent)
    
    await this.tracker.failExecution(
      agent.executionId,
      `Permanent failure after ${agent.attempts} attempts: ${agent.lastError}`
    )
    
    console.error(`❌ [Queue] Agent ${agent.agentName} failed permanently, may block evaluation`)
  }

  /**
   * Get agent class dynamically
   */
  private async getAgentClass(agentName: string): Promise<any> {
    switch (agentName) {
      case 'crawl_agent':
        const { SitemapEnhancedCrawlAgent } = await import('./agents/sitemap-enhanced-crawl-agent')
        return SitemapEnhancedCrawlAgent
      case 'llm_test_agent':
        const { BulletproofLLMTestAgent } = await import('./agents/bulletproof-llm-test-agent')
        return BulletproofLLMTestAgent
      case 'sentiment_agent':
        const { SentimentAgent } = await import('./agents/sentiment-agent')
        return SentimentAgent
      case 'citation_agent':
        const { CitationAgent } = await import('./agents/citation-agent')
        return CitationAgent
      case 'geo_visibility_agent':
        const { GeoVisibilityAgent } = await import('./agents/geo-visibility-agent')
        return GeoVisibilityAgent
      case 'commerce_agent':
        const { CommerceAgent } = await import('./agents/commerce-agent')
        return CommerceAgent
      default:
        throw new Error(`Unknown agent: ${agentName}`)
    }
  }

  /**
   * Get queue metrics for monitoring
   */
  getMetrics(): QueueMetrics {
    const allAgents = [
      ...Array.from(this.queue.values()),
      ...Array.from(this.runningAgents.values()),
      ...Array.from(this.completedAgents.values())
    ]

    const completed = allAgents.filter(a => a.status === QueueStatus.COMPLETED)
    const failed = allAgents.filter(a => a.status === QueueStatus.FAILED)
    
    const totalWaitTime = allAgents
      .filter(a => a.startedAt)
      .reduce((sum, a) => sum + ((a.startedAt || 0) - a.queuedAt), 0)
    
    const totalExecutionTime = completed
      .reduce((sum, a) => sum + ((Date.now() - (a.startedAt || a.queuedAt))), 0)

    return {
      totalQueued: this.queue.size,
      totalRunning: this.runningAgents.size,
      totalCompleted: completed.length,
      totalFailed: failed.length,
      averageWaitTime: allAgents.length > 0 ? totalWaitTime / allAgents.length : 0,
      averageExecutionTime: completed.length > 0 ? totalExecutionTime / completed.length : 0,
      successRate: allAgents.length > 0 ? completed.length / (completed.length + failed.length) : 0,
      resourceUtilization: this.runningAgents.size / this.MAX_CONCURRENT_AGENTS
    }
  }

  /**
   * Get evaluation status for frontend polling
   */
  async getEvaluationStatus(evaluationId: string): Promise<{
    totalAgents: number
    completedAgents: number
    runningAgents: number
    failedAgents: number
    progress: number
    estimatedTimeRemaining: number
    status: 'running' | 'completed' | 'failed'
  }> {
    const evaluationAgents = [
      ...Array.from(this.queue.values()),
      ...Array.from(this.runningAgents.values()),
      ...Array.from(this.completedAgents.values())
    ].filter(agent => agent.evaluationId === evaluationId)

    const completed = evaluationAgents.filter(a => a.status === QueueStatus.COMPLETED || a.status === QueueStatus.CANCELLED)
    const running = evaluationAgents.filter(a => a.status === QueueStatus.RUNNING)
    const failed = evaluationAgents.filter(a => a.status === QueueStatus.FAILED)
    
    const progress = evaluationAgents.length > 0 ? completed.length / evaluationAgents.length : 0
    
    // Estimate remaining time based on running agents
    const estimatedTimeRemaining = running.reduce((max, agent) => {
      const elapsed = Date.now() - (agent.startedAt || agent.queuedAt)
      const remaining = agent.estimatedDuration - elapsed
      return Math.max(max, Math.max(0, remaining))
    }, 0)

    let status: 'running' | 'completed' | 'failed' = 'running'
    if (progress >= 1.0) {
      status = 'completed'
    } else if (failed.length > 0 && running.length === 0) {
      status = 'failed'
    }

    return {
      totalAgents: evaluationAgents.length,
      completedAgents: completed.length,
      runningAgents: running.length,
      failedAgents: failed.length,
      progress,
      estimatedTimeRemaining,
      status
    }
  }

  /**
   * Cleanup completed agents older than 1 hour
   */
  private cleanupCompletedAgents(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    
    for (const [id, agent] of this.completedAgents.entries()) {
      if (agent.queuedAt < oneHourAgo) {
        this.completedAgents.delete(id)
      }
    }
    
    console.log(`🧹 [Queue] Cleaned up old completed agents`)
  }

  /**
   * Force cancel all agents for an evaluation
   */
  async cancelEvaluation(evaluationId: string): Promise<void> {
    const agentsToCancel = [
      ...Array.from(this.queue.values()),
      ...Array.from(this.runningAgents.values())
    ].filter(agent => agent.evaluationId === evaluationId)

    for (const agent of agentsToCancel) {
      agent.status = QueueStatus.CANCELLED
      
      if (this.queue.has(agent.id)) {
        this.queue.delete(agent.id)
      }
      if (this.runningAgents.has(agent.id)) {
        this.runningAgents.delete(agent.id)
      }
      
      this.completedAgents.set(agent.id, agent)
      
      // Mark as cancelled in database
      await this.tracker.failExecution(agent.executionId, 'Evaluation cancelled')
    }
    
    console.log(`🚫 [Queue] Cancelled ${agentsToCancel.length} agents for evaluation ${evaluationId}`)
  }
}
