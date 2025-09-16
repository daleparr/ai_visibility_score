export interface AgentTrace {
  agentName: string
  agentType: string
  executionId: string
  timestamp: string
  duration: number
  input: {
    url: string
    websiteContent?: string
    parameters?: Record<string, any>
  }
  output: {
    score: number
    confidence: number
    reasoning: string
    evidence: string[]
    warnings?: string[]
    errors?: string[]
  }
  metadata: {
    model?: string
    provider?: string
    tokenUsage?: number
    retryCount?: number
    cacheHit?: boolean
  }
  status: 'success' | 'error' | 'timeout' | 'partial'
  debugInfo?: {
    rawResponse?: string
    processingSteps?: string[]
    validationResults?: Record<string, any>
  }
}

export interface EvaluationTrace {
  evaluationId: string
  url: string
  tier: string
  timestamp: string
  totalDuration: number
  agentTraces: AgentTrace[]
  aggregationTrace: {
    pillarScores: Record<string, number>
    overallScore: number
    methodology: string
    weightings: Record<string, number>
  }
  issues: {
    failedAgents: string[]
    warnings: string[]
    dataQualityIssues: string[]
  }
}

class TraceLogger {
  private traces: Map<string, EvaluationTrace> = new Map()
  private agentTraces: Map<string, AgentTrace[]> = new Map()

  startEvaluation(evaluationId: string, url: string, tier: string): void {
    const trace: EvaluationTrace = {
      evaluationId,
      url,
      tier,
      timestamp: new Date().toISOString(),
      totalDuration: 0,
      agentTraces: [],
      aggregationTrace: {
        pillarScores: {},
        overallScore: 0,
        methodology: '',
        weightings: {}
      },
      issues: {
        failedAgents: [],
        warnings: [],
        dataQualityIssues: []
      }
    }
    this.traces.set(evaluationId, trace)
  }

  logAgentExecution(
    evaluationId: string,
    agentName: string,
    agentType: string,
    input: AgentTrace['input'],
    output: AgentTrace['output'],
    metadata: AgentTrace['metadata'],
    duration: number,
    status: AgentTrace['status'],
    debugInfo?: AgentTrace['debugInfo']
  ): void {
    const agentTrace: AgentTrace = {
      agentName,
      agentType,
      executionId: `${evaluationId}-${agentName}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration,
      input,
      output,
      metadata,
      status,
      debugInfo
    }

    // Add to evaluation trace
    const evaluationTrace = this.traces.get(evaluationId)
    if (evaluationTrace) {
      evaluationTrace.agentTraces.push(agentTrace)
      
      // Track issues
      if (status === 'error') {
        evaluationTrace.issues.failedAgents.push(agentName)
      }
      if (output.warnings?.length) {
        evaluationTrace.issues.warnings.push(...output.warnings)
      }
    }

    // Store agent-specific traces
    if (!this.agentTraces.has(agentName)) {
      this.agentTraces.set(agentName, [])
    }
    this.agentTraces.get(agentName)!.push(agentTrace)
  }

  logAggregation(
    evaluationId: string,
    pillarScores: Record<string, number>,
    overallScore: number,
    methodology: string,
    weightings: Record<string, number>
  ): void {
    const trace = this.traces.get(evaluationId)
    if (trace) {
      trace.aggregationTrace = {
        pillarScores,
        overallScore,
        methodology,
        weightings
      }
    }
  }

  completeEvaluation(evaluationId: string, totalDuration: number): EvaluationTrace | null {
    const trace = this.traces.get(evaluationId)
    if (trace) {
      trace.totalDuration = totalDuration
      return trace
    }
    return null
  }

  getEvaluationTrace(evaluationId: string): EvaluationTrace | null {
    return this.traces.get(evaluationId) || null
  }

  getAgentTraces(agentName: string, limit: number = 100): AgentTrace[] {
    const traces = this.agentTraces.get(agentName) || []
    return traces.slice(-limit).reverse() // Most recent first
  }

  getAllTraces(limit: number = 50): EvaluationTrace[] {
    return Array.from(this.traces.values())
      .slice(-limit)
      .reverse() // Most recent first
  }

  getTraceAnalytics(): {
    totalEvaluations: number
    averageDuration: number
    agentPerformance: Record<string, {
      successRate: number
      averageDuration: number
      averageScore: number
      totalExecutions: number
    }>
    commonIssues: Record<string, number>
  } {
    const allTraces = Array.from(this.traces.values())
    const totalEvaluations = allTraces.length
    const averageDuration = allTraces.reduce((sum, t) => sum + t.totalDuration, 0) / totalEvaluations || 0

    // Agent performance analysis
    const agentPerformance: Record<string, any> = {}
    const commonIssues: Record<string, number> = {}

    for (const [agentName, traces] of this.agentTraces.entries()) {
      const successfulTraces = traces.filter(t => t.status === 'success')
      const successRate = successfulTraces.length / traces.length
      const averageAgentDuration = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length
      const averageScore = successfulTraces.reduce((sum, t) => sum + t.output.score, 0) / successfulTraces.length || 0

      agentPerformance[agentName] = {
        successRate,
        averageDuration: averageAgentDuration,
        averageScore,
        totalExecutions: traces.length
      }

      // Collect common issues
      traces.forEach(trace => {
        if (trace.output.errors) {
          trace.output.errors.forEach(error => {
            commonIssues[error] = (commonIssues[error] || 0) + 1
          })
        }
        if (trace.output.warnings) {
          trace.output.warnings.forEach(warning => {
            commonIssues[warning] = (commonIssues[warning] || 0) + 1
          })
        }
      })
    }

    return {
      totalEvaluations,
      averageDuration,
      agentPerformance,
      commonIssues
    }
  }

  // Clean up old traces to prevent memory issues
  cleanup(maxTraces: number = 1000): void {
    if (this.traces.size > maxTraces) {
      const sortedTraces = Array.from(this.traces.entries())
        .sort(([, a], [, b]) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      
      const toDelete = sortedTraces.slice(0, sortedTraces.length - maxTraces)
      toDelete.forEach(([id]) => this.traces.delete(id))
    }

    // Clean up agent traces
    for (const [agentName, traces] of this.agentTraces.entries()) {
      if (traces.length > maxTraces) {
        this.agentTraces.set(agentName, traces.slice(-maxTraces))
      }
    }
  }
}

// Global trace logger instance
export const traceLogger = new TraceLogger()

// Helper function to create agent execution wrapper
export function withTracing<T extends any[], R>(
  agentName: string,
  agentType: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    const evaluationId = (args[0] as any)?.evaluationId || 'unknown'
    const url = (args[0] as any)?.url || 'unknown'
    
    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime
      
      // Extract trace information from result
      const output = {
        score: (result as any)?.score || 0,
        confidence: (result as any)?.confidence || 0,
        reasoning: (result as any)?.reasoning || 'No reasoning provided',
        evidence: (result as any)?.evidence || [],
        warnings: (result as any)?.warnings || [],
        errors: []
      }

      const metadata = {
        model: (result as any)?.model,
        provider: (result as any)?.provider,
        tokenUsage: (result as any)?.tokenUsage,
        retryCount: (result as any)?.retryCount || 0,
        cacheHit: (result as any)?.cacheHit || false
      }

      traceLogger.logAgentExecution(
        evaluationId,
        agentName,
        agentType,
        { url, parameters: args[1] as any },
        output,
        metadata,
        duration,
        'success'
      )

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      traceLogger.logAgentExecution(
        evaluationId,
        agentName,
        agentType,
        { url, parameters: args[1] as any },
        {
          score: 0,
          confidence: 0,
          reasoning: 'Agent execution failed',
          evidence: [],
          errors: [error instanceof Error ? error.message : String(error)]
        },
        { retryCount: 0 },
        duration,
        'error',
        { rawResponse: String(error) }
      )

      throw error
    }
  }
}