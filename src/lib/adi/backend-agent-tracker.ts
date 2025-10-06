import { db, ensureSchema, withSchema } from '../db'
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
    
    await withSchema(async () => {
      await db.insert(backendAgentExecutions).values({
        id: executionId,
        evaluationId,
        agentName,
        status: 'pending',
        startedAt: new Date(),
      })
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
      
      await withSchema(async () => {
        // First verify the execution exists
        const existingExecution = await db.select()
          .from(backendAgentExecutions)
          .where(eq(backendAgentExecutions.id, executionId))
          .limit(1)
        
        if (existingExecution.length === 0) {
          throw new Error(`Execution ${executionId} not found in database`)
        }
        
        console.log(`🔍 [Tracker] Found existing execution ${executionId} with status: ${existingExecution[0].status}`)
        
        await db.update(backendAgentExecutions)
          .set({ 
            status: 'running',
            startedAt: new Date() // Update to actual start time
          })
          .where(eq(backendAgentExecutions.id, executionId))
      })

      console.log(`🏃 [Tracker] Successfully marked ${executionId} as running`)
      
      // Verify the update worked
      const verification = await this.getExecution(executionId)
      if (!verification) {
        throw new Error(`Execution ${executionId} not found after running update`)
      }
      if (verification.status !== 'running') {
        throw new Error(`Execution ${executionId} status is still ${verification.status} after running update`)
      }
      console.log(`🔍 [Tracker] Verification - ${executionId} status: ${verification.status}`)
    } catch (error) {
      console.error(`❌ [Tracker] Failed to mark ${executionId} as running:`, error)
      console.error(`❌ [Tracker] Running update error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        executionId
      })
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
      
      await withSchema(async () => {
        // First verify the execution exists
        const existingExecution = await db.select()
          .from(backendAgentExecutions)
          .where(eq(backendAgentExecutions.id, executionId))
          .limit(1)
        
        if (existingExecution.length === 0) {
          throw new Error(`Execution ${executionId} not found in database`)
        }
        
        console.log(`🔍 [Tracker] Found existing execution ${executionId} with status: ${existingExecution[0].status}`)
        
        // Update the execution
        await db.update(backendAgentExecutions)
          .set({
            status: 'completed',
            completedAt: new Date(),
            result,
            executionTime
          })
          .where(eq(backendAgentExecutions.id, executionId))
      })

      console.log(`✅ [Tracker] Successfully completed ${executionId} in ${executionTime}ms`)
      
      // Verify the update worked by reading it back
      const verification = await this.getExecution(executionId)
      if (!verification) {
        throw new Error(`Execution ${executionId} not found after completion update`)
      }
      if (verification.status !== 'completed') {
        throw new Error(`Execution ${executionId} status is still ${verification.status} after completion update`)
      }
      if (!verification.completedAt) {
        throw new Error(`Execution ${executionId} completedAt is null after completion update`)
      }
      
      console.log(`🔍 [Tracker] Verification - ${executionId} status: ${verification.status}, completed: ${verification.completedAt}`)
    } catch (error) {
      console.error(`❌ [Tracker] Failed to complete ${executionId}:`, error)
      console.error(`❌ [Tracker] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        executionId,
        executionTime
      })
      throw error
    }
  }

  /**
   * Mark execution as failed
   */
  async failExecution(executionId: string, error: string): Promise<void> {
    await withSchema(async () => {
      await db.update(backendAgentExecutions)
        .set({
          status: 'failed',
          completedAt: new Date(),
          error
        })
        .where(eq(backendAgentExecutions.id, executionId))
    })

    console.log(`❌ [Tracker] Failed ${executionId}: ${error}`)
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<BackendAgentExecution | null> {
    return await withSchema(async () => {
      const results = await db.select()
        .from(backendAgentExecutions)
        .where(eq(backendAgentExecutions.id, executionId))
        .limit(1)

      return results[0] || null
    })
  }

  /**
   * Get all executions for an evaluation
   */
  async getEvaluationExecutions(evaluationId: string): Promise<BackendAgentExecution[]> {
    try {
      console.log(`🔍 [Tracker] Fetching executions for evaluation ${evaluationId}...`)
      
      const executions = await withSchema(async () => {
        // Add detailed SQL logging
        console.log(`🔍 [Tracker] About to execute SQL query for evaluationId: ${evaluationId}`)
        console.log(`🔍 [Tracker] Query: SELECT * FROM backend_agent_executions WHERE evaluation_id = '${evaluationId}'`)
        
        // First, let's check the current schema and connection
        const { sql } = await import('../db')
        const schemaCheck = await sql`SELECT current_schema() as current_schema, current_database() as current_database`
        console.log(`🔍 [Tracker] Current database context:`, schemaCheck[0])
        
        // Try a raw SQL query first to see if we get different results
        const rawResults = await sql`
          SELECT id, evaluation_id, agent_name, status, started_at, completed_at, result, error, execution_time 
          FROM backend_agent_executions 
          WHERE evaluation_id = ${evaluationId}
        `
        console.log(`🔍 [Tracker] Raw SQL query returned ${rawResults.length} rows`)
        if (rawResults.length > 0) {
          console.log(`🔍 [Tracker] Raw SQL sample:`, rawResults[0])
        }
        
        // Now try the Drizzle query
        const drizzleResults = await db.select()
          .from(backendAgentExecutions)
          .where(eq(backendAgentExecutions.evaluationId, evaluationId))
        
        console.log(`🔍 [Tracker] Drizzle query returned ${drizzleResults.length} rows`)
        if (drizzleResults.length > 0) {
          console.log(`🔍 [Tracker] Drizzle sample:`, drizzleResults[0])
        }
        
        return drizzleResults
      })
      
      console.log(`🔍 [Tracker] Found ${executions.length} executions for ${evaluationId}`)
      
      // Enhanced logging for debugging
      if (executions.length === 0) {
        console.warn(`⚠️ [Tracker] No executions found for ${evaluationId}. Performing comprehensive checks...`)
        
        // Check if the evaluation exists at all
        try {
          const { evaluations } = await import('../db/schema')
          const evalCheck = await withSchema(async () => {
            return await db.select()
              .from(evaluations)
              .where(eq(evaluations.id, evaluationId))
              .limit(1)
          })
          
          if (evalCheck.length === 0) {
            console.error(`❌ [Tracker] Evaluation ${evaluationId} does not exist in database`)
          } else {
            console.log(`✅ [Tracker] Evaluation ${evaluationId} exists with status: ${evalCheck[0].status}`)
          }
        } catch (evalCheckError) {
          console.error(`❌ [Tracker] Failed to check evaluation existence:`, evalCheckError)
        }
        
        // Check if there are ANY backend_agent_executions at all
        try {
          await withSchema(async () => {
            const { sql } = await import('../db')
            const totalCount = await sql`SELECT COUNT(*) as total FROM backend_agent_executions`
            console.log(`🔍 [Tracker] Total backend_agent_executions in database: ${totalCount[0].total}`)
            
            // Get a sample of recent executions
            const recentExecutions = await sql`
              SELECT evaluation_id, agent_name, status, started_at 
              FROM backend_agent_executions 
              ORDER BY started_at DESC 
              LIMIT 5
            `
            console.log(`🔍 [Tracker] Recent executions sample:`, recentExecutions)
          })
        } catch (countError) {
          console.error(`❌ [Tracker] Failed to get execution count:`, countError)
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
    return await withSchema(async () => {
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
    })
  }
}
