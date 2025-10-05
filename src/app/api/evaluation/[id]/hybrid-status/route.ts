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
    
    const tracker = new BackendAgentTracker()
    
    // Get slow agent execution status with retry logic for database consistency
    let executions = await tracker.getEvaluationExecutions(evaluationId)
    
    // If we get fewer executions than expected, wait and retry once
    // This handles potential database consistency issues
    if (executions.length < 6) {
      console.log(`⚠️ [API] Only found ${executions.length} executions, retrying in 1 second...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      executions = await tracker.getEvaluationExecutions(evaluationId)
      console.log(`🔄 [API] Retry found ${executions.length} executions`)
    }
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
