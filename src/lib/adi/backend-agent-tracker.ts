import { db } from '../db'
import { backendAgentExecutions } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export interface BackendAgentExecution {
  id: string
  evaluationId: string
  agentName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  result?: any
  error?: string
  executionTime?: number
}

export class BackendAgentTracker {
  /**
   * Start tracking a backend agent execution
   */
  async startExecution(evaluationId: string, agentName: string): Promise<string> {
    const executionId = `${evaluationId}-${agentName}-${Date.now()}`
    
    await db.insert(backendAgentExecutions).values({
      id: executionId,
      evaluationId,
      agentName,
      status: 'pending',
      startedAt: new Date(),
    })

    console.log(`📋 [Tracker] Started tracking ${agentName} execution: ${executionId}`)
    return executionId
  }

  /**
   * Update execution status to running
   */
  async markRunning(executionId: string): Promise<void> {
    await db.update(backendAgentExecutions)
      .set({ 
        status: 'running',
        startedAt: new Date() // Update to actual start time
      })
      .where(eq(backendAgentExecutions.id, executionId))

    console.log(`🏃 [Tracker] Marked ${executionId} as running`)
  }

  /**
   * Complete an execution with results
   */
  async completeExecution(
    executionId: string, 
    result: any, 
    executionTime: number
  ): Promise<void> {
    await db.update(backendAgentExecutions)
      .set({
        status: 'completed',
        completedAt: new Date(),
        result,
        executionTime
      })
      .where(eq(backendAgentExecutions.id, executionId))

    console.log(`✅ [Tracker] Completed ${executionId} in ${executionTime}ms`)
  }

  /**
   * Mark execution as failed
   */
  async failExecution(executionId: string, error: string): Promise<void> {
    await db.update(backendAgentExecutions)
      .set({
        status: 'failed',
        completedAt: new Date(),
        error
      })
      .where(eq(backendAgentExecutions.id, executionId))

    console.log(`❌ [Tracker] Failed ${executionId}: ${error}`)
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<BackendAgentExecution | null> {
    const results = await db.select()
      .from(backendAgentExecutions)
      .where(eq(backendAgentExecutions.id, executionId))
      .limit(1)

    return results[0] || null
  }

  /**
   * Get all executions for an evaluation
   */
  async getEvaluationExecutions(evaluationId: string): Promise<BackendAgentExecution[]> {
    return await db.select()
      .from(backendAgentExecutions)
      .where(eq(backendAgentExecutions.evaluationId, evaluationId))
  }

  /**
   * Check if all backend agents for an evaluation are complete
   */
  async areAllAgentsComplete(
    evaluationId: string, 
    expectedAgents: string[]
  ): Promise<{ allComplete: boolean; completedAgents: string[]; failedAgents: string[] }> {
    const executions = await this.getEvaluationExecutions(evaluationId)
    
    const completedAgents = executions
      .filter(e => e.status === 'completed')
      .map(e => e.agentName)
    
    const failedAgents = executions
      .filter(e => e.status === 'failed')
      .map(e => e.agentName)
    
    const allComplete = expectedAgents.every(agent => 
      completedAgents.includes(agent) || failedAgents.includes(agent)
    )

    return { allComplete, completedAgents, failedAgents }
  }

  /**
   * Get results for completed agents
   */
  async getCompletedResults(evaluationId: string): Promise<Record<string, any>> {
    const executions = await db.select()
      .from(backendAgentExecutions)
      .where(
        and(
          eq(backendAgentExecutions.evaluationId, evaluationId),
          eq(backendAgentExecutions.status, 'completed')
        )
      )

    const results: Record<string, any> = {}
    for (const execution of executions) {
      results[execution.agentName] = execution.result
    }

    return results
  }
}
