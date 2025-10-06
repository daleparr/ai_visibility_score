import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import { IntelligentQueueManager } from '../../src/lib/adi/intelligent-queue-manager'
import { withSchema } from '../../src/lib/db'
import type { ADIAgentInput } from '../../src/types/adi'

/**
 * Intelligent Background Agents Function
 * 
 * Uses the IntelligentQueueManager for sophisticated agent execution with:
 * - Progressive timeout handling
 * - Intelligent fallback strategies
 * - Priority-based scheduling
 * - Resource-aware execution
 * - Circuit breaker patterns
 */

interface IntelligentAgentRequest {
  agentName: string
  input: ADIAgentInput
  evaluationId: string
  executionId: string
}

// Global queue manager instance (persists across function invocations)
let queueManager: IntelligentQueueManager | null = null

function getQueueManager(): IntelligentQueueManager {
  if (!queueManager) {
    queueManager = new IntelligentQueueManager()
    console.log('🧠 [Intelligent] Initialized new queue manager')
  }
  return queueManager
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const functionStartTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`🧠 [Intelligent-${requestId}] Function invoked at ${new Date().toISOString()}`)
  console.log(`🧠 [Intelligent-${requestId}] Method: ${event.httpMethod}`)
  console.log(`🧠 [Intelligent-${requestId}] Headers:`, JSON.stringify(event.headers, null, 2))

  // Test database connectivity immediately
  console.log(`🔍 [Intelligent-${requestId}] Testing database connectivity...`)
  try {
    await withSchema(async () => {
      const { sql } = await import('../../src/lib/db')
      const testResult = await sql`SELECT 1 as test_connection, current_schema() as current_schema`
      console.log(`✅ [Intelligent-${requestId}] Database connection test successful:`, testResult[0])
    })
  } catch (dbTestError) {
    console.error(`❌ [Intelligent-${requestId}] Database connection test failed:`, dbTestError)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Database connection test failed',
        details: dbTestError instanceof Error ? dbTestError.message : String(dbTestError),
        requestId
      })
    }
  }

  // Handle different HTTP methods
  if (event.httpMethod === 'GET') {
    // Return queue status and metrics
    return await handleGetStatus(requestId)
  }

  if (event.httpMethod === 'POST') {
    // Enqueue new agent
    return await handleEnqueueAgent(event, requestId)
  }

  if (event.httpMethod === 'DELETE') {
    // Cancel evaluation
    return await handleCancelEvaluation(event, requestId)
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    body: JSON.stringify({ 
      error: 'Method not allowed',
      allowed: ['GET', 'POST', 'DELETE'],
      received: event.httpMethod
    })
  }
}

/**
 * Handle GET request - return queue status and metrics
 */
async function handleGetStatus(requestId: string): Promise<HandlerResponse> {
  try {
    const manager = getQueueManager()
    const metrics = manager.getMetrics()
    
    console.log(`📊 [Intelligent-${requestId}] Queue metrics:`, metrics)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        metrics,
        timestamp: new Date().toISOString(),
        requestId
      })
    }
  } catch (error) {
    console.error(`❌ [Intelligent-${requestId}] Failed to get status:`, error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to get queue status',
        details: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  }
}

/**
 * Handle POST request - enqueue new agent
 */
async function handleEnqueueAgent(event: HandlerEvent, requestId: string): Promise<HandlerResponse> {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Request body is required',
          requestId
        })
      }
    }

    const body: IntelligentAgentRequest = JSON.parse(event.body)
    const { agentName, input, evaluationId, executionId } = body

    console.log(`🚀 [Intelligent-${requestId}] Enqueueing agent:`, {
      agentName,
      evaluationId,
      executionId,
      websiteUrl: input.context.websiteUrl
    })

    // Validate required fields
    if (!agentName || !input || !evaluationId || !executionId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['agentName', 'input', 'evaluationId', 'executionId'],
          received: { agentName: !!agentName, input: !!input, evaluationId: !!evaluationId, executionId: !!executionId },
          requestId
        })
      }
    }

    const manager = getQueueManager()
    
    // Enqueue the agent with intelligent scheduling
    await manager.enqueueAgent(agentName, input, evaluationId, executionId)
    
    // Get current evaluation status
    const evaluationStatus = await manager.getEvaluationStatus(evaluationId)
    
    console.log(`✅ [Intelligent-${requestId}] Agent ${agentName} enqueued successfully`)
    console.log(`📊 [Intelligent-${requestId}] Evaluation status:`, evaluationStatus)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Agent ${agentName} enqueued successfully`,
        evaluationStatus,
        metrics: manager.getMetrics(),
        requestId
      })
    }

  } catch (error) {
    console.error(`❌ [Intelligent-${requestId}] Failed to enqueue agent:`, error)
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to enqueue agent',
        details: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  }
}

/**
 * Handle DELETE request - cancel evaluation
 */
async function handleCancelEvaluation(event: HandlerEvent, requestId: string): Promise<HandlerResponse> {
  try {
    const evaluationId = event.queryStringParameters?.evaluationId
    
    if (!evaluationId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'evaluationId query parameter is required',
          requestId
        })
      }
    }

    console.log(`🚫 [Intelligent-${requestId}] Cancelling evaluation: ${evaluationId}`)

    const manager = getQueueManager()
    await manager.cancelEvaluation(evaluationId)
    
    console.log(`✅ [Intelligent-${requestId}] Evaluation ${evaluationId} cancelled successfully`)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Evaluation ${evaluationId} cancelled successfully`,
        requestId
      })
    }

  } catch (error) {
    console.error(`❌ [Intelligent-${requestId}] Failed to cancel evaluation:`, error)
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to cancel evaluation',
        details: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  }
}
