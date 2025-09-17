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
 * ADI Orchestrator - Coordinates the execution of all agents
 * Handles dependencies, parallel execution, error recovery, and result aggregation
 */
export class ADIOrchestrator {
  private agents: Map<string, IADIAgent> = new Map()
  private executionPlan: ADIOrchestrationPlan | null = null

  constructor() {
    this.initializeAgents()
  }

  /**
   * Initialize all available agents
   */
  private initializeAgents() {
    // Agent initialization will be done here once we have all agents implemented
    // For now, we'll define the structure
    console.log('Initializing ADI agents...')
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agent: IADIAgent) {
    this.agents.set(agent.config.name, agent)
    console.log(`Registered agent: ${agent.config.name}`)
  }

  /**
   * Create execution plan based on agent dependencies
   */
  createExecutionPlan(): ADIOrchestrationPlan {
    const agentNames = Array.from(this.agents.keys())
    
    // Define agent dependencies and execution order
    const dependencies: Record<string, string[]> = {
      'crawl_agent': [], // No dependencies
      'schema_agent': ['crawl_agent'],
      'semantic_agent': ['crawl_agent'],
      'knowledge_graph_agent': ['crawl_agent', 'semantic_agent'],
      'conversational_copy_agent': ['crawl_agent'],
      'llm_test_agent': ['crawl_agent'],
      'geo_visibility_agent': ['crawl_agent', 'llm_test_agent'],
      'citation_agent': [], // Can run in parallel with crawl
      'sentiment_agent': ['citation_agent'],
      'brand_heritage_agent': ['crawl_agent'], // NEW: Brand heritage analysis
      'commerce_agent': ['crawl_agent', 'llm_test_agent'],
      'score_aggregator': ['schema_agent', 'semantic_agent', 'knowledge_graph_agent',
                          'conversational_copy_agent', 'llm_test_agent', 'geo_visibility_agent',
                          'citation_agent', 'sentiment_agent', 'brand_heritage_agent', 'commerce_agent']
    }

    // Calculate execution phases
    const parallelPhases: string[][] = []
    const sequentialPhases: string[] = []
    const processed = new Set<string>()

    // Phase 1: Independent agents (no dependencies)
    const phase1 = agentNames.filter(name => 
      dependencies[name]?.length === 0 && !processed.has(name)
    )
    if (phase1.length > 0) {
      parallelPhases.push(phase1)
      phase1.forEach(name => processed.add(name))
    }

    // Phase 2: Agents that depend on crawl_agent
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

    // Phase 3: Agents with complex dependencies
    const phase3 = agentNames.filter(name => {
      const deps = dependencies[name] || []
      return deps.length > 0 && 
             deps.every(dep => processed.has(dep)) && 
             !processed.has(name) &&
             name !== 'score_aggregator'
    })
    if (phase3.length > 0) {
      parallelPhases.push(phase3)
      phase3.forEach(name => processed.add(name))
    }

    // Final phase: Score aggregator (sequential)
    if (agentNames.includes('score_aggregator')) {
      sequentialPhases.push('score_aggregator')
    }

    // Estimate total execution time
    const totalEstimatedTime = this.estimateExecutionTime(parallelPhases, sequentialPhases)

    this.executionPlan = {
      parallelPhases,
      sequentialPhases,
      dependencies,
      totalEstimatedTime
    }

    return this.executionPlan
  }

  /**
   * Execute the full ADI evaluation
   */
  async executeEvaluation(context: ADIEvaluationContext): Promise<ADIOrchestrationResult> {
    const startTime = Date.now()
    const plan = this.executionPlan || this.createExecutionPlan()
    const agentResults: Record<string, ADIAgentOutput> = {}
    const errors: string[] = []
    const warnings: string[] = []

    console.log(`Starting ADI evaluation for ${context.evaluationId}`)
    console.log(`Execution plan: ${plan.parallelPhases.length} parallel phases, ${plan.sequentialPhases.length} sequential phases`)

    try {
      // Execute parallel phases
      for (let phaseIndex = 0; phaseIndex < plan.parallelPhases.length; phaseIndex++) {
        const phase = plan.parallelPhases[phaseIndex]
        console.log(`Executing parallel phase ${phaseIndex + 1}: [${phase.join(', ')}]`)

        const phaseResults = await this.executeParallelPhase(phase, context, agentResults)
        
        // Merge results and check for failures
        for (const [agentName, result] of Object.entries(phaseResults)) {
          agentResults[agentName] = result
          
          if (result.status === 'failed') {
            errors.push(`Agent ${agentName} failed: ${result.errorMessage}`)
          } else if (result.status === 'skipped') {
            warnings.push(`Agent ${agentName} was skipped: ${result.errorMessage}`)
          }
        }

        // Check if critical agents failed
        const criticalAgents = ['crawl_agent', 'schema_agent', 'llm_test_agent']
        const failedCriticalAgents = phase.filter(name => 
          criticalAgents.includes(name) && agentResults[name]?.status === 'failed'
        )

        if (failedCriticalAgents.length > 0) {
          throw new Error(`Critical agents failed: ${failedCriticalAgents.join(', ')}`)
        }
      }

      // Execute sequential phases
      for (const agentName of plan.sequentialPhases) {
        console.log(`Executing sequential agent: ${agentName}`)
        
        const result = await this.executeAgent(agentName, context, agentResults)
        agentResults[agentName] = result

        if (result.status === 'failed') {
          errors.push(`Agent ${agentName} failed: ${result.errorMessage}`)
          // Score aggregator failure is critical
          if (agentName === 'score_aggregator') {
            throw new Error(`Score aggregator failed: ${result.errorMessage}`)
          }
        }
      }

      const totalExecutionTime = Date.now() - startTime
      const overallStatus = this.determineOverallStatus(agentResults, errors)

      console.log(`ADI evaluation completed in ${totalExecutionTime}ms with status: ${overallStatus}`)

      return {
        evaluationId: context.evaluationId,
        overallStatus,
        agentResults,
        totalExecutionTime,
        errors,
        warnings
      }

    } catch (error) {
      const totalExecutionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown orchestration error'
      
      console.error(`ADI evaluation failed after ${totalExecutionTime}ms:`, errorMessage)
      
      return {
        evaluationId: context.evaluationId,
        overallStatus: 'failed',
        agentResults,
        totalExecutionTime,
        errors: [...errors, errorMessage],
        warnings
      }
    }
  }

  /**
   * Execute a phase of agents in parallel
   */
  private async executeParallelPhase(
    agentNames: string[], 
    context: ADIEvaluationContext,
    previousResults: Record<string, ADIAgentOutput>
  ): Promise<Record<string, ADIAgentOutput>> {
    const promises = agentNames.map(agentName => 
      this.executeAgent(agentName, context, previousResults)
        .then(result => ({ agentName, result }))
        .catch(error => ({ 
          agentName, 
          result: this.createFailedOutput(agentName, error) 
        }))
    )

    const results = await Promise.all(promises)
    
    return results.reduce((acc, { agentName, result }) => {
      acc[agentName] = result
      return acc
    }, {} as Record<string, ADIAgentOutput>)
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(
    agentName: string,
    context: ADIEvaluationContext,
    previousResults: Record<string, ADIAgentOutput>
  ): Promise<ADIAgentOutput> {
    const agent = this.agents.get(agentName)
    
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`)
    }

    // Prepare agent input
    const input: ADIAgentInput = {
      context,
      previousResults: Object.values(previousResults).map(result => ({
        id: '',
        agent_id: '',
        result_type: result.agentName,
        raw_value: 0,
        normalized_score: 0,
        confidence_level: 0,
        evidence: result.metadata,
        created_at: new Date().toISOString()
      })),
      config: {}
    }

    try {
      // Execute with timeout protection
      return await agent.execute(input)
    } catch (error) {
      console.error(`Agent ${agentName} execution failed:`, error)
      
      // Try retry if agent supports it
      try {
        return await agent.execute(input)
      } catch (retryError) {
        console.error(`Agent ${agentName} retry failed:`, retryError)
        return this.createFailedOutput(agentName, retryError)
      }
    }
  }

  /**
   * Create a failed output for an agent
   */
  private createFailedOutput(agentName: string, error: any): ADIAgentOutput {
    return {
      agentName,
      status: 'failed',
      results: [],
      executionTime: 0,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        timestamp: new Date().toISOString(),
        error: error
      }
    }
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
    const criticalAgents = ['crawl_agent', 'schema_agent', 'llm_test_agent', 'score_aggregator']
    const failedCriticalAgents = criticalAgents.filter(name => 
      agentResults[name]?.status === 'failed'
    )

    if (failedCriticalAgents.length > 0) {
      return 'failed'
    }

    if (completedAgents === totalAgents) {
      return 'completed'
    }

    if (completedAgents >= totalAgents * 0.7) { // 70% success rate
      return 'partial'
    }

    return 'failed'
  }

  /**
   * Estimate total execution time
   */
  private estimateExecutionTime(parallelPhases: string[][], sequentialPhases: string[]): number {
    // Rough estimates based on agent complexity
    const agentEstimates: Record<string, number> = {
      'crawl_agent': 15000,
      'schema_agent': 5000,
      'semantic_agent': 8000,
      'knowledge_graph_agent': 10000,
      'conversational_copy_agent': 6000,
      'llm_test_agent': 20000,
      'geo_visibility_agent': 12000,  // NEW
      'citation_agent': 12000,
      'sentiment_agent': 5000,
      'commerce_agent': 8000,
      'score_aggregator': 3000
    }

    let totalTime = 0

    // Parallel phases: max time in each phase
    for (const phase of parallelPhases) {
      const phaseTime = Math.max(...phase.map(name => agentEstimates[name] || 5000))
      totalTime += phaseTime
    }

    // Sequential phases: sum of times
    for (const agentName of sequentialPhases) {
      totalTime += agentEstimates[agentName] || 5000
    }

    return totalTime
  }

  /**
   * Get execution plan summary
   */
  getExecutionPlanSummary(): string {
    if (!this.executionPlan) {
      return 'No execution plan created'
    }

    const { parallelPhases, sequentialPhases, totalEstimatedTime } = this.executionPlan
    
    return `
ADI Execution Plan:
- Parallel Phases: ${parallelPhases.length}
  ${parallelPhases.map((phase, i) => `  Phase ${i + 1}: [${phase.join(', ')}]`).join('\n')}
- Sequential Phases: ${sequentialPhases.length}
  ${sequentialPhases.map(agent => `  - ${agent}`).join('\n')}
- Estimated Time: ${Math.round(totalEstimatedTime / 1000)}s
- Total Agents: ${parallelPhases.flat().length + sequentialPhases.length}
    `.trim()
  }
}