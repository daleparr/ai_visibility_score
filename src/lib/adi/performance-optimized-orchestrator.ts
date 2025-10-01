import type {
  ADIOrchestrationPlan,
  ADIOrchestrationResult,
  IADIAgent,
  ADIEvaluationContext,
  ADIAgentInput,
  ADIAgentOutput,
  AgentStatus
} from '../../types/adi'
import { ProgressiveScoreCalculator, type ProgressiveScoreUpdate } from './progressive-score-calculator'

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
  private readonly TARGET_EXECUTION_TIME = 120000 // 2 minutes instead of 8 seconds
  private progressiveCalculator: ProgressiveScoreCalculator = new ProgressiveScoreCalculator()

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

      // Execute phases without global timeout
      await this.executeOptimizedPhases(plan, context, agentResults, errors, warnings)

      const totalExecutionTime = Date.now() - startTime
      const overallStatus = this.determineOverallStatus(agentResults, errors)

      console.log(`✅ Optimized evaluation completed in ${totalExecutionTime}ms`)

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
          performanceGain: `${totalExecutionTime}ms (target: ${this.TARGET_EXECUTION_TIME}ms)`
        }
      }

      // OPTIMIZATION 4: Cache successful results
      if (overallStatus === 'completed') {
        this.cache.set(cacheKey, result)
      }

      return result

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime
      console.error(`❌ Optimized evaluation failed after ${totalExecutionTime}ms:`, error)
      
      return {
        evaluationId: context.evaluationId,
        overallStatus: 'failed',
        agentResults,
        totalExecutionTime,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        warnings,
        optimizations: {
          cacheUsed: false,
          parallelPhases: 0,
          totalAgents: 0,
          performanceGain: 'failed'
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
      
      // Merge results and update progressive score
      for (const [agentName, result] of Object.entries(phaseResults)) {
        agentResults[agentName] = result
        
        if (result.status === 'failed') {
          errors.push(`Agent ${agentName} failed: ${result.errorMessage}`)
        } else if (result.status === 'skipped') {
          warnings.push(`Agent ${agentName} was skipped: ${result.errorMessage}`)
        } else if (result.status === 'completed' && result.results && result.results.length > 0) {
          // Update progressive score calculation
          const score = result.results[0].normalizedScore
          if (typeof score === 'number' && score >= 0 && score <= 100) {
            const progressUpdate = this.progressiveCalculator.updateScore(agentName, score)
            console.log(`📊 Progressive Score: ${progressUpdate.currentScore} (${progressUpdate.confidence.toFixed(2)} confidence, ${progressUpdate.dataCompleteness})`)
          }
        }
      }

      const phaseTime = Date.now() - phaseStartTime
      console.log(`✅ Phase ${phaseIndex + 1} completed in ${phaseTime}ms`)

      // BULLETPROOF: Log critical agent failures but NEVER terminate evaluation
      const criticalAgents = ['crawl_agent']
      const failedCriticalAgents = phase.filter((name: string) =>
        criticalAgents.includes(name) && agentResults[name]?.status === 'failed'
      )

      if (failedCriticalAgents.length > 0) {
        console.warn(`⚠️ Critical agents had issues: ${failedCriticalAgents.join(', ')} - continuing with fallback data`)
        warnings.push(`Critical agents experienced issues: ${failedCriticalAgents.join(', ')}`)
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
          console.warn(`⚠️ Score aggregator had issues: ${result.errorMessage} - this should not happen with bulletproof aggregator`)
          warnings.push(`Score aggregator experienced issues but evaluation continued`)
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
    
    const agentTimeouts: Record<string, number> = {
      'crawl_agent': 90000,          // 90 seconds (was 60s) - Allow extra buffer for serverless crawl
      'schema_agent': 15000,         // 15 seconds for schema analysis  
      'semantic_agent': 15000,       // 15 seconds for semantic analysis
      'knowledge_graph_agent': 15000, // 15 seconds for KG analysis
      'conversational_copy_agent': 10000, // 10 seconds
      'llm_test_agent': 45000,       // 45 seconds (was 20s) - Allow for AI API calls + retries
      'geo_visibility_agent': 15000, // 15 seconds for geo analysis
      'citation_agent': 45000,       // 45 seconds (was 20s) - Allow for external API calls + retries
      'sentiment_agent': 10000,      // 10 seconds
      'commerce_agent': 15000,       // 15 seconds
      'brand_heritage_agent': 15000, // 15 seconds (was 10s)
      'score_aggregator': 10000      // 10 seconds (was 5s) for aggregation
    }

    const promises = agentNames.map(agentName => {
      const timeout = agentTimeouts[agentName] || 10000
      
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
      previousResults: Object.values(previousResults).slice(0, 5).map(result => {
        // Special handling for crawl agent results - include actual content
        if (result.agentName === 'crawl_agent' && result.results && result.results.length > 0) {
          const crawlResult = result.results[0]
          console.log(`🔍 [ORCHESTRATOR] Processing crawl result:`, {
            agentName: result.agentName,
            hasResults: !!result.results,
            resultCount: result.results?.length,
            hasEvidence: !!crawlResult.evidence,
            hasHtml: !!crawlResult.evidence?.html,
            hasContent: !!crawlResult.evidence?.content,
            htmlLength: crawlResult.evidence?.html?.length || 0,
            contentLength: crawlResult.evidence?.content?.length || 0,
            evidenceKeys: Object.keys(crawlResult.evidence || {}),
            evidenceHtmlLength: crawlResult.evidence?.html?.length || 0
          })
          
          return {
            id: '',
            agent_id: 'crawl_agent',
            result_type: 'homepage_crawl_optimized',
            raw_value: crawlResult.normalizedScore || 0,
            normalized_score: crawlResult.normalizedScore || 0,
            confidence_level: crawlResult.confidenceLevel || 0,
            evidence: {
              ...crawlResult.evidence,
              // Include the actual HTML content for analysis
              htmlContent: crawlResult.evidence?.html || crawlResult.evidence?.content || '',
              structuredData: crawlResult.evidence?.structuredData || [],
              metaData: crawlResult.evidence?.metaData || {}
            },
            created_at: new Date().toISOString()
          }
        }
        
        // Standard handling for other agents
        return {
          id: '',
          agent_id: '',
          result_type: result.agentName,
          raw_value: 0,
          normalized_score: 0,
          confidence_level: 0,
          evidence: result.metadata,
          created_at: new Date().toISOString()
        }
      }),
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
    // Detect build environment and use conservative estimates
    const isBuildTime = process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build'
    
    // Optimized estimates - aggressive reduction for runtime, conservative for build
    const optimizedEstimates: Record<string, number> = {
      'crawl_agent': isBuildTime ? 10000 : 4000,        // Build: 10s, Runtime: 4s
      'schema_agent': 1500,       // 5s → 1.5s
      'semantic_agent': 2000,     // 8s → 2s
      'knowledge_graph_agent': 2000, // 10s → 2s
      'conversational_copy_agent': 1500, // 6s → 1.5s
      'llm_test_agent': 3000,     // 20s → 3s (reduced queries)
      'geo_visibility_agent': 2000, // 12s → 2s
      'citation_agent': isBuildTime ? 8000 : 2000,     // Build: 8s, Runtime: 2s
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