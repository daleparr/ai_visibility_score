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
    try {
      console.log(`📋 [Tracker] Attempting to mark ${executionId} as running...`)
      await db.update(backendAgentExecutions)
        .set({ 
          status: 'running',
          startedAt: new Date() // Update to actual start time
        })
        .where(eq(backendAgentExecutions.id, executionId))

      console.log(`🏃 [Tracker] Successfully marked ${executionId} as running`)
      
      // Verify the update worked
      const verification = await this.getExecution(executionId)
      console.log(`🔍 [Tracker] Verification - ${executionId} status: ${verification?.status}`)
    } catch (error) {
      console.error(`❌ [Tracker] Failed to mark ${executionId} as running:`, error)
      throw error
    }
  }

  /**
   * Complete an execution with results
   */
  async completeExecution(
    executionId: string, 
    result: any, 
    executionTime: number
  ): Promise<void> {
    try {
      console.log(`📋 [Tracker] Attempting to complete ${executionId} with ${executionTime}ms execution time...`)
      await db.update(backendAgentExecutions)
        .set({
          status: 'completed',
          completedAt: new Date(),
          result,
          executionTime
        })
        .where(eq(backendAgentExecutions.id, executionId))

      console.log(`✅ [Tracker] Successfully completed ${executionId} in ${executionTime}ms`)
      
      // Verify the update worked
      const verification = await this.getExecution(executionId)
      console.log(`🔍 [Tracker] Verification - ${executionId} status: ${verification?.status}, completed: ${verification?.completedAt}`)
    } catch (error) {
      console.error(`❌ [Tracker] Failed to complete ${executionId}:`, error)
      throw error
    }
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
    try {
      console.log(`🔍 [Tracker] Fetching executions for evaluation ${evaluationId}...`)
      
      // Ensure we're using the correct schema
      try {
        const { sql } = await import('../db/index')
        if (sql) {
          await sql`SET search_path TO production, public`
          console.log(`🔗 [Tracker] Database search path set to production schema`)
        }
      } catch (schemaError) {
        console.warn(`⚠️ [Tracker] Could not set search path:`, schemaError instanceof Error ? schemaError.message : String(schemaError))
      }
      
      const executions = await db.select()
        .from(backendAgentExecutions)
        .where(eq(backendAgentExecutions.evaluationId, evaluationId))
      
      console.log(`🔍 [Tracker] Found ${executions.length} executions for ${evaluationId}`)
      
      // Enhanced logging for debugging
      if (executions.length === 0) {
        console.warn(`⚠️ [Tracker] No executions found for ${evaluationId}. Checking if evaluation exists...`)
        
        // Check if the evaluation exists at all
        try {
          const { evaluations } = await import('../db/schema')
          const evalCheck = await db.select()
            .from(evaluations)
            .where(eq(evaluations.id, evaluationId))
            .limit(1)
          
          if (evalCheck.length === 0) {
            console.error(`❌ [Tracker] Evaluation ${evaluationId} does not exist in database`)
          } else {
            console.log(`✅ [Tracker] Evaluation ${evaluationId} exists with status: ${evalCheck[0].status}`)
          }
        } catch (evalCheckError) {
          console.error(`❌ [Tracker] Failed to check evaluation existence:`, evalCheckError)
        }
      }
      
      executions.forEach((e: BackendAgentExecution) => {
        console.log(`  - ${e.agentName}: ${e.status} (started: ${e.startedAt}, completed: ${e.completedAt})`)
      })
      
      return executions
    } catch (error) {
      console.error(`❌ [Tracker] Failed to fetch executions for ${evaluationId}:`, error)
      console.error(`❌ [Tracker] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
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
