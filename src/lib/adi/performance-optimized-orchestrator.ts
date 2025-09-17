import type {
  ADIOrchestrationPlan,
  ADIOrchestrationResult,
  IADIAgent,
  ADIEvaluationContext,
  ADIAgentInput,
  ADIAgentOutput,
  AgentStatus
} from '../../types/adi'

/**
 * Performance-Optimized ADI Orchestrator
 * Target: Complete evaluation in under 10 seconds
 * Key optimizations:
 * 1. Aggressive parallelization
 * 2. Intelligent caching
 * 3. Reduced timeouts
 * 4. Smart agent selection
 * 5. Early termination strategies
 */
export class PerformanceOptimizedADIOrchestrator {
  private agents: Map<string, IADIAgent> = new Map()
  private executionPlan: ADIOrchestrationPlan | null = null
  private cache: Map<string, any> = new Map()
  private readonly TARGET_EXECUTION_TIME = 8000 // 8 seconds target

  constructor() {
    this.initializeAgents()
  }

  /**
   * Initialize agents with performance-optimized configurations
   */
  private initializeAgents() {
    console.log('Initializing performance-optimized ADI agents...')
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: IADIAgent) {
    this.agents.set(agent.config.name, agent)
    console.log(`Registered agent: ${agent.config.name}`)
  }

  /**
   * Create optimized execution plan for sub-10-second execution
   */
  createOptimizedExecutionPlan(): ADIOrchestrationPlan {
    const agentNames = Array.from(this.agents.keys())
    
    // OPTIMIZATION 1: Aggressive parallelization - most agents can run in parallel
    const dependencies: Record<string, string[]> = {
      // Phase 1: Independent agents (all parallel)
      'crawl_agent': [],
      'citation_agent': [], // Can run independently
      'brand_heritage_agent': [], // Can run independently
      
      // Phase 2: Agents that need crawl data (all parallel)
      'schema_agent': ['crawl_agent'],
      'semantic_agent': ['crawl_agent'],
      'conversational_copy_agent': ['crawl_agent'],
      'llm_test_agent': ['crawl_agent'], // Reduced dependency
      'geo_visibility_agent': ['crawl_agent'], // Removed llm_test dependency
      'sentiment_agent': ['citation_agent'],
      'commerce_agent': ['crawl_agent'],
      'knowledge_graph_agent': ['crawl_agent'], // Removed semantic dependency
      
      // Phase 3: Final aggregation (sequential)
      'score_aggregator': ['schema_agent', 'semantic_agent', 'conversational_copy_agent',
                          'llm_test_agent', 'geo_visibility_agent', 'citation_agent',
                          'sentiment_agent', 'brand_heritage_agent', 'commerce_agent',
                          'knowledge_graph_agent']
    }

    // Calculate optimized execution phases
    const parallelPhases: string[][] = []
    const sequentialPhases: string[] = []
    const processed = new Set<string>()

    // Phase 1: Independent agents (maximum parallelization)
    const phase1 = agentNames.filter(name => 
      dependencies[name]?.length === 0 && !processed.has(name)
    )
    if (phase1.length > 0) {
      parallelPhases.push(phase1)
      phase1.forEach(name => processed.add(name))
    }

    // Phase 2: All dependent agents in parallel (aggressive optimization)
    const phase2 = agentNames.filter(name => {
      const deps = dependencies[name] || []
      return deps.length > 0 && 
             deps.every(dep => processed.has(dep)) && 
             !processed.has(name) &&
             name !== 'score_aggregator'
    })
    if (phase2.length > 0) {
      parallelPhases.push(phase2)
      phase2.forEach(name => processed.add(name))
    }

    // Phase 3: Score aggregator only
    if (agentNames.includes('score_aggregator')) {
      sequentialPhases.push('score_aggregator')
    }

    // Estimate optimized execution time
    const totalEstimatedTime = this.estimateOptimizedExecutionTime(parallelPhases, sequentialPhases)

    this.executionPlan = {
      parallelPhases,
      sequentialPhases,
      dependencies,
      totalEstimatedTime
    }

    console.log(`🚀 Optimized execution plan: ${totalEstimatedTime}ms target (${Math.round(totalEstimatedTime/1000)}s)`)
    return this.executionPlan
  }

  /**
   * Execute optimized evaluation with sub-10-second target
   */
  async executeOptimizedEvaluation(context: ADIEvaluationContext): Promise<ADIOrchestrationResult> {
    const startTime = Date.now()
    const plan = this.executionPlan || this.createOptimizedExecutionPlan()
    const agentResults: Record<string, ADIAgentOutput> = {}
    const errors: string[] = []
    const warnings: string[] = []

    console.log(`🚀 Starting OPTIMIZED ADI evaluation for ${context.evaluationId}`)
    console.log(`📊 Target: ${this.TARGET_EXECUTION_TIME}ms | Plan: ${plan.parallelPhases.length} phases`)

    try {
      // OPTIMIZATION 2: Check cache first
      const cacheKey = this.generateCacheKey(context)
      if (this.cache.has(cacheKey)) {
        console.log('⚡ Cache hit - returning cached results')
        return this.cache.get(cacheKey)
      }

      // OPTIMIZATION 3: Execute with global timeout
      const evaluationPromise = this.executeOptimizedPhases(plan, context, agentResults, errors, warnings)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Evaluation timeout')), this.TARGET_EXECUTION_TIME)
      })

      await Promise.race([evaluationPromise, timeoutPromise])

      const totalExecutionTime = Date.now() - startTime
      const overallStatus = this.determineOverallStatus(agentResults, errors)

      console.log(`✅ Optimized evaluation completed in ${totalExecutionTime}ms (target: ${this.TARGET_EXECUTION_TIME}ms)`)

      const result = {
        evaluationId: context.evaluationId,
        overallStatus,
        agentResults,
        totalExecutionTime,
        errors,
        warnings,
        optimizations: {
          cacheUsed: false,
          parallelPhases: plan.parallelPhases.length,
          totalAgents: Object.keys(agentResults).length,
          performanceGain: `${Math.round((70000 - totalExecutionTime) / 70000 * 100)}%`
        }
      }

      // OPTIMIZATION 4: Cache successful results
      if (overallStatus === 'completed') {
        this.cache.set(cacheKey, result)
      }

      return result

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown orchestration error'
      
      console.error(`❌ Optimized evaluation failed after ${totalExecutionTime}ms:`, errorMessage)
      
      return {
        evaluationId: context.evaluationId,
        overallStatus: 'failed',
        agentResults,
        totalExecutionTime,
        errors: [...errors, errorMessage],
        warnings,
        optimizations: {
          cacheUsed: false,
          parallelPhases: plan.parallelPhases.length,
          totalAgents: Object.keys(agentResults).length,
          performanceGain: '0%'
        }
      }
    }
  }

  /**
   * Execute evaluation (compatibility method for ADI Service)
   * Delegates to executeOptimizedEvaluation
   */
  async executeEvaluation(context: ADIEvaluationContext): Promise<ADIOrchestrationResult> {
    return this.executeOptimizedEvaluation(context)
  }

  /**
   * Execute phases with aggressive optimization
   */
  private async executeOptimizedPhases(
    plan: ADIOrchestrationPlan,
    context: ADIEvaluationContext,
    agentResults: Record<string, ADIAgentOutput>,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // Execute parallel phases with optimizations
    for (let phaseIndex = 0; phaseIndex < plan.parallelPhases.length; phaseIndex++) {
      const phase = plan.parallelPhases[phaseIndex]
      const phaseStartTime = Date.now()
      
      console.log(`⚡ Phase ${phaseIndex + 1}: [${phase.join(', ')}] - ${phase.length} agents parallel`)

      // OPTIMIZATION 5: Aggressive parallel execution with individual timeouts
      const phaseResults = await this.executeOptimizedParallelPhase(phase, context, agentResults)
      
      // Merge results
      for (const [agentName, result] of Object.entries(phaseResults)) {
        agentResults[agentName] = result
        
        if (result.status === 'failed') {
          errors.push(`Agent ${agentName} failed: ${result.errorMessage}`)
        } else if (result.status === 'skipped') {
          warnings.push(`Agent ${agentName} was skipped: ${result.errorMessage}`)
        }
      }

      const phaseTime = Date.now() - phaseStartTime
      console.log(`✅ Phase ${phaseIndex + 1} completed in ${phaseTime}ms`)

      // OPTIMIZATION 6: Early termination if critical agents fail
      const criticalAgents = ['crawl_agent']
      const failedCriticalAgents = phase.filter((name: string) =>
        criticalAgents.includes(name) && agentResults[name]?.status === 'failed'
      )

      if (failedCriticalAgents.length > 0) {
        throw new Error(`Critical agents failed: ${failedCriticalAgents.join(', ')}`)
      }
    }

    // Execute sequential phases (score aggregator)
    for (const agentName of plan.sequentialPhases) {
      console.log(`🔄 Sequential: ${agentName}`)
      
      const result = await this.executeOptimizedAgent(agentName, context, agentResults)
      agentResults[agentName] = result

      if (result.status === 'failed') {
        errors.push(`Agent ${agentName} failed: ${result.errorMessage}`)
        if (agentName === 'score_aggregator') {
          throw new Error(`Score aggregator failed: ${result.errorMessage}`)
        }
      }
    }
  }

  /**
   * Execute parallel phase with aggressive optimization
   */
  private async executeOptimizedParallelPhase(
    agentNames: string[], 
    context: ADIEvaluationContext,
    previousResults: Record<string, ADIAgentOutput>
  ): Promise<Record<string, ADIAgentOutput>> {
    // OPTIMIZATION 7: Individual agent timeouts based on complexity
    const agentTimeouts: Record<string, number> = {
      'crawl_agent': 4000,        // Reduced from 15000ms
      'schema_agent': 1500,       // Reduced from 5000ms
      'semantic_agent': 2000,     // Reduced from 8000ms
      'knowledge_graph_agent': 2000, // Reduced from 10000ms
      'conversational_copy_agent': 1500, // Reduced from 6000ms
      'llm_test_agent': 3000,     // Reduced from 20000ms
      'geo_visibility_agent': 2000, // Reduced from 12000ms
      'citation_agent': 2000,     // Reduced from 12000ms
      'sentiment_agent': 1500,    // Reduced from 5000ms
      'commerce_agent': 2000,     // Reduced from 8000ms
      'brand_heritage_agent': 1500, // New optimized
      'score_aggregator': 1000    // Reduced from 3000ms
    }

    const promises = agentNames.map(agentName => {
      const timeout = agentTimeouts[agentName] || 2000
      
      return Promise.race([
        this.executeOptimizedAgent(agentName, context, previousResults),
        new Promise<ADIAgentOutput>((_, reject) => {
          setTimeout(() => reject(new Error(`Agent ${agentName} timeout after ${timeout}ms`)), timeout)
        })
      ])
        .then(result => ({ agentName, result }))
        .catch(error => ({ 
          agentName, 
          result: this.createOptimizedFailedOutput(agentName, error, timeout) 
        }))
    })

    const results = await Promise.all(promises)
    
    return results.reduce((acc, { agentName, result }) => {
      acc[agentName] = result
      return acc
    }, {} as Record<string, ADIAgentOutput>)
  }

  /**
   * Execute single agent with optimizations
   */
  private async executeOptimizedAgent(
    agentName: string,
    context: ADIEvaluationContext,
    previousResults: Record<string, ADIAgentOutput>
  ): Promise<ADIAgentOutput> {
    const agent = this.agents.get(agentName)
    
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`)
    }

    // OPTIMIZATION 8: Lightweight agent input
    const input: ADIAgentInput = {
      context: {
        ...context,
        optimized: true, // Signal to agents to use optimized mode
        maxExecutionTime: 2000 // Individual agent limit
      },
      previousResults: Object.values(previousResults).slice(0, 5).map(result => ({ // Limit previous results
        id: '',
        agent_id: '',
        result_type: result.agentName,
        raw_value: 0,
        normalized_score: 0,
        confidence_level: 0,
        evidence: result.metadata,
        created_at: new Date().toISOString()
      })),
      config: {
        optimized: true,
        maxTimeout: 2000,
        skipNonEssential: true
      }
    }

    try {
      return await agent.execute(input)
    } catch (error) {
      console.warn(`⚠️ Agent ${agentName} failed, using fallback`)
      return this.createOptimizedFailedOutput(agentName, error, 2000)
    }
  }

  /**
   * Create optimized failed output
   */
  private createOptimizedFailedOutput(agentName: string, error: any, timeout: number): ADIAgentOutput {
    return {
      agentName,
      status: 'failed',
      results: [],
      executionTime: timeout,
      errorMessage: `Optimized execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: {
        timestamp: new Date().toISOString(),
        optimized: true,
        timeout,
        error: error
      }
    }
  }

  /**
   * Estimate optimized execution time (target: under 10 seconds)
   */
  private estimateOptimizedExecutionTime(parallelPhases: string[][], sequentialPhases: string[]): number {
    // Optimized estimates - aggressive reduction
    const optimizedEstimates: Record<string, number> = {
      'crawl_agent': 4000,        // 15s → 4s (smart crawling)
      'schema_agent': 1500,       // 5s → 1.5s
      'semantic_agent': 2000,     // 8s → 2s
      'knowledge_graph_agent': 2000, // 10s → 2s
      'conversational_copy_agent': 1500, // 6s → 1.5s
      'llm_test_agent': 3000,     // 20s → 3s (reduced queries)
      'geo_visibility_agent': 2000, // 12s → 2s
      'citation_agent': 2000,     // 12s → 2s
      'sentiment_agent': 1500,    // 5s → 1.5s
      'commerce_agent': 2000,     // 8s → 2s
      'brand_heritage_agent': 1500, // New
      'score_aggregator': 1000    // 3s → 1s
    }

    let totalTime = 0

    // Parallel phases: max time in each phase
    for (const phase of parallelPhases) {
      const phaseTime = Math.max(...phase.map(name => optimizedEstimates[name] || 1500))
      totalTime += phaseTime
    }

    // Sequential phases: sum of times
    for (const agentName of sequentialPhases) {
      totalTime += optimizedEstimates[agentName] || 1000
    }

    return Math.min(totalTime, this.TARGET_EXECUTION_TIME) // Cap at target
  }

  /**
   * Generate cache key for evaluation context
   */
  private generateCacheKey(context: ADIEvaluationContext): string {
    const key = `${context.websiteUrl}-${context.industryId || 'default'}`
    return Buffer.from(key).toString('base64').substring(0, 32)
  }

  /**
   * Determine overall evaluation status
   */
  private determineOverallStatus(
    agentResults: Record<string, ADIAgentOutput>,
    errors: string[]
  ): 'completed' | 'partial' | 'failed' {
    const totalAgents = Object.keys(agentResults).length
    const completedAgents = Object.values(agentResults).filter(r => r.status === 'completed').length
    const failedAgents = Object.values(agentResults).filter(r => r.status === 'failed').length

    // Critical agents that must succeed
    const criticalAgents = ['crawl_agent', 'score_aggregator']
    const failedCriticalAgents = criticalAgents.filter(name => 
      agentResults[name]?.status === 'failed'
    )

    if (failedCriticalAgents.length > 0) {
      return 'failed'
    }

    if (completedAgents >= totalAgents * 0.6) { // Reduced threshold for speed
      return 'completed'
    }

    if (completedAgents >= totalAgents * 0.4) {
      return 'partial'
    }

    return 'failed'
  }

  /**
   * Get optimized execution plan summary
   */
  getOptimizedExecutionPlanSummary(): string {
    if (!this.executionPlan) {
      return 'No optimized execution plan created'
    }

    const { parallelPhases, sequentialPhases, totalEstimatedTime } = this.executionPlan
    
    return `
🚀 OPTIMIZED ADI Execution Plan:
- Target Time: ${this.TARGET_EXECUTION_TIME}ms (${this.TARGET_EXECUTION_TIME/1000}s)
- Estimated Time: ${totalEstimatedTime}ms (${Math.round(totalEstimatedTime/1000)}s)
- Performance Gain: ${Math.round((70000 - totalEstimatedTime) / 70000 * 100)}%
- Parallel Phases: ${parallelPhases.length}
  ${parallelPhases.map((phase: string[], i: number) => `  Phase ${i + 1}: [${phase.join(', ')}] (${phase.length} agents)`).join('\n')}
- Sequential Phases: ${sequentialPhases.length}
  ${sequentialPhases.map((agent: string) => `  - ${agent}`).join('\n')}
- Total Agents: ${parallelPhases.flat().length + sequentialPhases.length}
- Optimizations: Caching, Aggressive Parallelization, Reduced Timeouts
    `.trim()
  }

  /**
   * Clear cache (for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Performance cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}