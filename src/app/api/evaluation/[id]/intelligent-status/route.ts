import { NextRequest, NextResponse } from 'next/server'
import { BackendAgentTracker } from '../../../../../lib/adi/backend-agent-tracker'
import { withSchema } from '../../../../../lib/db'

/**
 * Enhanced Evaluation Status API with Intelligent Queue Integration
 * 
 * Provides comprehensive status information including:
 * - Traditional database execution status
 * - Intelligent queue metrics and progress
 * - Progressive timeout information
 * - Fallback strategy status
 * - Estimated completion times
 * - Resource utilization metrics
 */

interface IntelligentStatusResponse {
  evaluationId: string
  overallStatus: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: {
    percentage: number
    completedAgents: number
    totalAgents: number
    runningAgents: number
    failedAgents: number
    queuedAgents: number
  }
  agentDetails: Array<{
    agentName: string
    status: string
    priority: string
    attempts: number
    maxAttempts: number
    currentTimeout: number
    estimatedTimeRemaining: number
    fallbackApplied: boolean
    lastError?: string
    executionTime?: number
  }>
  queueMetrics: {
    totalQueued: number
    totalRunning: number
    totalCompleted: number
    totalFailed: number
    averageWaitTime: number
    averageExecutionTime: number
    successRate: number
    resourceUtilization: number
  }
  estimatedCompletion: {
    timeRemaining: number
    expectedCompletionTime: string
    confidenceLevel: number
  }
  performance: {
    fastAgentsCompleted: boolean
    slowAgentsInProgress: number
    criticalAgentsStatus: string
    fallbacksActivated: number
  }
  lastUpdated: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const evaluationId = params.id
  const startTime = Date.now()
  
  console.log(`🧠 [IntelligentStatus] Checking evaluation ${evaluationId}`)

  try {
    // Test database connectivity immediately
    await withSchema(async () => {
      const { sql } = await import('../../../../../lib/db')
      const testResult = await sql`SELECT 1 as test_connection, current_schema() as current_schema`
      console.log(`✅ [IntelligentStatus] Database connection test successful:`, testResult[0])
    })

    // Get traditional execution status from database
    const tracker = new BackendAgentTracker()
    let executions = await tracker.getEvaluationExecutions(evaluationId)
    
    console.log(`📊 [IntelligentStatus] Found ${executions.length} executions in database`)

    // Retry logic for database consistency (enhanced for intelligent queue)
    if (executions.length < 6) {
      console.log(`🔄 [IntelligentStatus] Found fewer than 6 executions, implementing enhanced retry logic...`)
      
      const maxRetries = 5
      const retryDelays = [1500, 3000, 4500, 6000, 8000] // Progressive delays
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        console.log(`🔄 [IntelligentStatus] Retry attempt ${attempt + 1}/${maxRetries}`)
        
        await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]))
        
        // Create fresh tracker instance for each retry
        const freshTracker = new BackendAgentTracker()
        executions = await freshTracker.getEvaluationExecutions(evaluationId)
        
        console.log(`📊 [IntelligentStatus] Retry ${attempt + 1} found ${executions.length} executions`)
        
        if (executions.length >= 6) {
          console.log(`✅ [IntelligentStatus] Found sufficient executions after retry ${attempt + 1}`)
          break
        }
      }
      
      // Additional retry if all agents still show as pending
      const pendingCount = executions.filter(e => e.status === 'pending').length
      if (pendingCount === executions.length && executions.length > 0) {
        console.log(`🔄 [IntelligentStatus] All agents still pending, additional consistency retry...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        const finalTracker = new BackendAgentTracker()
        executions = await finalTracker.getEvaluationExecutions(evaluationId)
        console.log(`📊 [IntelligentStatus] Final retry found ${executions.length} executions`)
      }
    }

    // Get intelligent queue status
    let queueMetrics = null
    let queueStatus = null
    
    try {
      const queueUrl = getQueueManagerUrl()
      console.log(`🔗 [IntelligentStatus] Fetching queue status from: ${queueUrl}`)
      
      const queueResponse = await fetch(queueUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (queueResponse.ok) {
        const queueData = await queueResponse.json()
        queueMetrics = queueData.metrics
        console.log(`📊 [IntelligentStatus] Queue metrics:`, queueMetrics)
      } else {
        console.warn(`⚠️ [IntelligentStatus] Queue status request failed: ${queueResponse.status}`)
      }
    } catch (queueError) {
      console.warn(`⚠️ [IntelligentStatus] Failed to fetch queue status:`, queueError)
    }

    // Analyze execution status
    const completed = executions.filter(e => e.status === 'completed')
    const running = executions.filter(e => e.status === 'running')
    const failed = executions.filter(e => e.status === 'failed')
    const pending = executions.filter(e => e.status === 'pending')

    console.log(`📊 [IntelligentStatus] Status breakdown:`, {
      total: executions.length,
      completed: completed.length,
      running: running.length,
      failed: failed.length,
      pending: pending.length
    })

    // Calculate progress
    const totalAgents = executions.length
    const completedAgents = completed.length
    const progress = totalAgents > 0 ? (completedAgents / totalAgents) * 100 : 0

    // Determine overall status
    let overallStatus: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' = 'pending'
    
    if (totalAgents === 0) {
      overallStatus = 'pending'
    } else if (completedAgents === totalAgents) {
      overallStatus = 'completed'
    } else if (running.length > 0 || pending.length > 0) {
      overallStatus = 'running'
    } else if (failed.length > 0) {
      overallStatus = 'failed'
    }

    // Build agent details with intelligent queue information
    const agentDetails = executions.map(execution => {
      const agentConfig = getAgentConfiguration(execution.agentName)
      
      return {
        agentName: execution.agentName,
        status: execution.status,
        priority: agentConfig.priority,
        attempts: 1, // TODO: Get from queue manager
        maxAttempts: agentConfig.maxAttempts,
        currentTimeout: agentConfig.currentTimeout,
        estimatedTimeRemaining: agentConfig.estimatedDuration,
        fallbackApplied: false, // TODO: Get from queue manager
        lastError: execution.error,
        executionTime: execution.executionTime
      }
    })

    // Calculate estimated completion
    const runningAgentEstimates = running.map(e => getAgentConfiguration(e.agentName).estimatedDuration)
    const maxEstimate = runningAgentEstimates.length > 0 ? Math.max(...runningAgentEstimates) : 0
    const expectedCompletionTime = new Date(Date.now() + maxEstimate).toISOString()

    // Build response
    const response: IntelligentStatusResponse = {
      evaluationId,
      overallStatus,
      progress: {
        percentage: Math.round(progress),
        completedAgents,
        totalAgents,
        runningAgents: running.length,
        failedAgents: failed.length,
        queuedAgents: pending.length
      },
      agentDetails,
      queueMetrics: queueMetrics || {
        totalQueued: pending.length,
        totalRunning: running.length,
        totalCompleted: completed.length,
        totalFailed: failed.length,
        averageWaitTime: 0,
        averageExecutionTime: 0,
        successRate: totalAgents > 0 ? completedAgents / totalAgents : 0,
        resourceUtilization: 0
      },
      estimatedCompletion: {
        timeRemaining: maxEstimate,
        expectedCompletionTime,
        confidenceLevel: queueMetrics ? 0.8 : 0.5
      },
      performance: {
        fastAgentsCompleted: true, // Assume fast agents completed if we have any executions
        slowAgentsInProgress: running.length + pending.length,
        criticalAgentsStatus: getCriticalAgentsStatus(executions),
        fallbacksActivated: 0 // TODO: Get from queue manager
      },
      lastUpdated: new Date().toISOString()
    }

    const responseTime = Date.now() - startTime
    console.log(`✅ [IntelligentStatus] Response prepared in ${responseTime}ms`)

    return NextResponse.json(response)

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ [IntelligentStatus] Error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      {
        error: 'Failed to get evaluation status',
        details: error instanceof Error ? error.message : String(error),
        evaluationId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Get queue manager URL with fallback options
 */
function getQueueManagerUrl(): string {
  const baseUrls = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    'https://ai-visibility-score.netlify.app'
  ].filter(Boolean)

  const baseUrl = baseUrls[0] || 'https://ai-visibility-score.netlify.app'
  return `${baseUrl}/.netlify/functions/intelligent-background-agents`
}

/**
 * Get agent configuration for intelligent queue information
 */
function getAgentConfiguration(agentName: string): {
  priority: string
  maxAttempts: number
  currentTimeout: number
  estimatedDuration: number
} {
  const configs: Record<string, any> = {
    'crawl_agent': {
      priority: 'CRITICAL',
      maxAttempts: 4,
      currentTimeout: 180000,
      estimatedDuration: 180000
    },
    'llm_test_agent': {
      priority: 'HIGH',
      maxAttempts: 3,
      currentTimeout: 120000,
      estimatedDuration: 120000
    },
    'sentiment_agent': {
      priority: 'MEDIUM',
      maxAttempts: 3,
      currentTimeout: 90000,
      estimatedDuration: 90000
    },
    'geo_visibility_agent': {
      priority: 'HIGH',
      maxAttempts: 3,
      currentTimeout: 120000,
      estimatedDuration: 120000
    },
    'commerce_agent': {
      priority: 'MEDIUM',
      maxAttempts: 3,
      currentTimeout: 90000,
      estimatedDuration: 90000
    },
    'citation_agent': {
      priority: 'LOW',
      maxAttempts: 3,
      currentTimeout: 60000,
      estimatedDuration: 60000
    }
  }

  return configs[agentName] || {
    priority: 'MEDIUM',
    maxAttempts: 3,
    currentTimeout: 60000,
    estimatedDuration: 60000
  }
}

/**
 * Get status of critical agents
 */
function getCriticalAgentsStatus(executions: any[]): string {
  const criticalAgents = ['crawl_agent', 'llm_test_agent', 'geo_visibility_agent']
  const criticalExecutions = executions.filter(e => criticalAgents.includes(e.agentName))
  
  const completed = criticalExecutions.filter(e => e.status === 'completed').length
  const total = criticalExecutions.length
  
  if (total === 0) return 'unknown'
  if (completed === total) return 'all_completed'
  if (completed > 0) return 'partially_completed'
  return 'pending'
}
