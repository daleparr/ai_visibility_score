import { NextRequest, NextResponse } from 'next/server'
import { BackendAgentTracker } from '../../../../../lib/adi/backend-agent-tracker'
import { withSchema } from '../../../../../lib/db'

/**
 * API endpoint for checking hybrid evaluation status
 * 
 * Returns the status of both fast and slow agents for an evaluation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const evaluationId = params.id
  
  if (!evaluationId) {
    return NextResponse.json(
      { error: 'Evaluation ID is required' },
      { status: 400 }
    )
  }

  try {
    console.log(`📊 [API] Checking hybrid status for evaluation: ${evaluationId}`)
    
    // Test database connectivity immediately
    console.log(`🔍 [API] Testing database connectivity...`)
    try {
      await withSchema(async () => {
        const { sql } = await import('../../../../../lib/db')
        const testResult = await sql`SELECT 1 as test_connection, current_schema() as current_schema`
        console.log(`✅ [API] Database connection test successful:`, testResult[0])
      })
    } catch (dbTestError) {
      console.error(`❌ [API] Database connection test failed:`, dbTestError)
      return NextResponse.json(
        { 
          error: 'Database connection test failed',
          details: dbTestError instanceof Error ? dbTestError.message : String(dbTestError),
          evaluationId,
          status: 'failed',
          progress: 0
        },
        { status: 500 }
      )
    }
    
    const tracker = new BackendAgentTracker()
    
    // Get slow agent execution status with enhanced retry logic for database consistency
    console.log(`🔍 [API] Fetching executions for evaluation ${evaluationId}...`)
    let executions = await tracker.getEvaluationExecutions(evaluationId)
    console.log(`🔍 [API] Initial query returned ${executions.length} executions`)
    
    // Enhanced retry logic - try up to 3 times with increasing delays
    let retryAttempt = 0
    const maxRetries = 3
    while (executions.length < 6 && retryAttempt < maxRetries) {
      const delay = (retryAttempt + 1) * 1000 // 1s, 2s, 3s delays
      console.log(`⚠️ [API] Only found ${executions.length} executions, retrying in ${delay}ms (attempt ${retryAttempt + 1}/${maxRetries})...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Force a new database connection by creating a fresh tracker
      const freshTracker = new BackendAgentTracker()
      executions = await freshTracker.getEvaluationExecutions(evaluationId)
      console.log(`🔄 [API] Retry ${retryAttempt + 1} found ${executions.length} executions`)
      retryAttempt++
    }
    
    // Additional retry for status consistency - check if all agents are still showing as pending
    const pendingCount = executions.filter(e => e.status === 'pending').length
    if (pendingCount === executions.length && executions.length > 0) {
      console.log(`⚠️ [API] All ${executions.length} executions are pending, doing final status refresh...`)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      
      const finalTracker = new BackendAgentTracker()
      executions = await finalTracker.getEvaluationExecutions(evaluationId)
      console.log(`🔄 [API] Final status refresh found ${executions.length} executions with statuses:`, 
        executions.map(e => `${e.agentName}:${e.status}`).join(', '))
    }
    
    // Add detailed logging of what we found in the database
    console.log(`🔍 [DEBUG] Raw execution data from database:`)
    executions.forEach((e, index) => {
      console.log(`  [${index}] ID: ${e.id}`)
      console.log(`      Agent: ${e.agentName}`)
      console.log(`      Status: ${e.status}`)
      console.log(`      Started: ${e.startedAt}`)  
      console.log(`      Completed: ${e.completedAt}`)
      console.log(`      Execution Time: ${e.executionTime}ms`)
      console.log(`      Error: ${e.error || 'none'}`)
    })
    
    console.log(`🔍 [DEBUG] Found ${executions.length} executions for ${evaluationId}:`)
    executions.forEach(e => {
      console.log(`  - ${e.agentName}: ${e.status} (started: ${e.startedAt}, completed: ${e.completedAt})`)
    })
    
    // Classify executions by status
    const pending = executions.filter(e => e.status === 'pending')
    const running = executions.filter(e => e.status === 'running')
    const completed = executions.filter(e => e.status === 'completed')
    const failed = executions.filter(e => e.status === 'failed')
    
    console.log(`🔍 [DEBUG] Status breakdown: ${pending.length} pending, ${running.length} running, ${completed.length} completed, ${failed.length} failed`)
    
    // Calculate progress
    const totalSlowAgents = 6 // UPDATED: SitemapEnhancedCrawlAgent, BulletproofLLMTestAgent, SentimentAgent, CitationAgent, GeoVisibilityAgent, CommerceAgent
    const finishedCount = completed.length + failed.length
    const isAllComplete = finishedCount >= totalSlowAgents
    
    console.log(`🔍 [DEBUG] Progress calculation: ${finishedCount}/${totalSlowAgents} agents finished, allComplete: ${isAllComplete}`)
    
    // Progress calculation:
    // - Fast agents (6): contribute 50%
    // - Slow agents (6): contribute remaining 50%
    const slowProgress = totalSlowAgents > 0 ? (finishedCount / totalSlowAgents) * 50 : 0
    const totalProgress = isAllComplete ? 100 : Math.min(95, 50 + slowProgress)
    console.log(`🔍 [DEBUG] Calculated progress: ${slowProgress}% from slow agents, total: ${totalProgress}%`)
    
    // Determine overall status
    let overallStatus: 'running' | 'completed' | 'failed'
    if (isAllComplete) {
      overallStatus = failed.length === totalSlowAgents ? 'failed' : 'completed'
      
      // Update evaluation status in database when all agents complete
      if (overallStatus === 'completed' || overallStatus === 'failed') {
        try {
          console.log(`📝 [API] Updating evaluation ${evaluationId} status to ${overallStatus}`)
          
          await withSchema(async () => {
            const { db, evaluations } = await import('../../../../../lib/db/index')
            const { eq } = await import('drizzle-orm')
            
            await db.update(evaluations)
              .set({ 
                status: overallStatus,
                completedAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(evaluations.id, evaluationId))
          })
          
          console.log(`✅ [API] Successfully updated evaluation ${evaluationId} status to ${overallStatus}`)
        } catch (updateError) {
          console.error(`❌ [API] Failed to update evaluation status:`, updateError instanceof Error ? updateError.message : String(updateError))
          // Don't fail the request if status update fails
        }
      }
    } else {
      overallStatus = 'running'
    }
    
    // Get completed results
    const slowResults = await tracker.getCompletedResults(evaluationId)
    
    // Calculate estimated time remaining
    const avgExecutionTime = completed.length > 0 
      ? completed.reduce((sum, e) => sum + (e.executionTime || 0), 0) / completed.length
      : 30000 // Default 30 seconds
    
    const remainingAgents = totalSlowAgents - finishedCount
    const estimatedTimeRemaining = remainingAgents > 0 
      ? Math.ceil((remainingAgents * avgExecutionTime) / 1000) 
      : 0
    
    const response = {
      evaluationId,
      status: overallStatus,
      progress: Math.round(totalProgress),
      
      // Agent counts
      totalAgents: 12, // 6 fast + 6 slow agents
      fastAgentsCompleted: 6, // Fast agents complete immediately (updated count)
      slowAgentsTotal: totalSlowAgents,
      slowAgentsPending: pending.length,
      slowAgentsRunning: running.length,
      slowAgentsCompleted: completed.length,
      slowAgentsFailed: failed.length,
      
      // Results
      slowResults,
      
      // Timing
      estimatedTimeRemaining,
      
      // Detailed execution info
      executions: executions.map(e => ({
        agentName: e.agentName,
        status: e.status,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        executionTime: e.executionTime,
        error: e.error
      })),
      
      // Metadata
      timestamp: new Date().toISOString(),
      hybridExecution: true
    }
    
    console.log(`📊 [API] Hybrid status: ${overallStatus}, progress: ${totalProgress}%`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error(`❌ [API] Failed to get hybrid status for ${evaluationId}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get evaluation status',
        evaluationId,
        status: 'failed',
        progress: 0
      },
      { status: 500 }
    )
  }
}
