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

// --- Queue Processing ---
const PROCESS_INTERVAL = 2000; // Process every 2 seconds
let isProcessing = false;
let intervalId: NodeJS.Timeout | null = null;

async function processQueue() {
  if (isProcessing) {
    console.log('🔄 [QueueProcessor] Skipping run, already in progress.');
    return;
  }
  isProcessing = true;
  console.log('🏃 [QueueProcessor] Starting queue processing run...');

  try {
    const manager = getQueueManager();
    await manager.processQueue();
    const metrics = manager.getMetrics();
    console.log(`✅ [QueueProcessor] Queue processed. Running: ${metrics.totalRunning}, Queued: ${metrics.totalQueued}, Completed: ${metrics.totalCompleted}`);
  } catch (error) {
    console.error('💥 [QueueProcessor] CRITICAL error during queue processing:', error);
  } finally {
    isProcessing = false;
    console.log('🏁 [QueueProcessor] Finished queue processing run.');
  }
}

// SERVERLESS FIX: Don't use intervals in serverless environment
// Instead, process queue on each function invocation
function startQueueProcessor() {
  // No-op in serverless environment - queue processing happens on invocation
  console.log('✅ [QueueProcessor] Serverless mode - queue processed on invocation.');
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const functionStartTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  // Heartbeat log to confirm invocation
  console.log(`❤️ [Intelligent-Shell] Heartbeat: Intelligent background function invoked. Request ID: ${requestId}`)

  try {
    console.log(`🧠 [Intelligent-${requestId}] Function invoked at ${new Date().toISOString()}`)
    console.log(`🧠 [Intelligent-${requestId}] Method: ${event.httpMethod}`)

    // Securely test database connectivity
    console.log(`🔍 [Intelligent-${requestId}] Securely testing database connectivity...`)
    await withSchema(async () => {
      const { sql } = await import('../../src/lib/db')
      const testResult = await sql`SELECT 1 as test_connection, current_schema() as current_schema`
      console.log(`✅ [Intelligent-${requestId}] Database connection test successful:`, testResult[0])
    })

    // SERVERLESS FIX: Process queue on every invocation
    console.log(`🔄 [Intelligent-${requestId}] Processing queue before handling request...`)
    await processQueue()
    
    // Self-trigger mechanism: Schedule next queue processing if there are pending agents
    const manager = getQueueManager()
    const metrics = manager.getMetrics()
    if (metrics.totalQueued > 0 || metrics.totalRunning > 0) {
      console.log(`⏰ [Intelligent-${requestId}] Scheduling next queue check (${metrics.totalQueued} queued, ${metrics.totalRunning} running)`)
      // Use setTimeout to trigger another queue processing cycle
      setTimeout(async () => {
        try {
          const functionUrl = `${process.env.URL || 'https://ai-visibility-score.netlify.app'}/.netlify/functions/intelligent-background-agents`
          await fetch(functionUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'QueueProcessor/1.0' }
          })
        } catch (error) {
          console.error('Failed to self-trigger queue processing:', error)
        }
      }, 5000) // Check again in 5 seconds
    }

    // Route to appropriate handler based on HTTP method
    switch (event.httpMethod) {
      case 'GET':
        console.log(`➡️ [Intelligent-${requestId}] Routing to handleGetStatus...`)
        return await handleGetStatus(requestId)
      case 'POST':
        console.log(`➡️ [Intelligent-${requestId}] Routing to handleEnqueueAgent...`)
        const postResult = await handleEnqueueAgent(event, requestId)
        // Process queue again after enqueueing to start new agents immediately
        console.log(`🔄 [Intelligent-${requestId}] Processing queue after enqueue...`)
        await processQueue()
        return postResult
      case 'DELETE':
        console.log(`➡️ [Intelligent-${requestId}] Routing to handleCancelEvaluation...`)
        return await handleCancelEvaluation(event, requestId)
      default:
        console.warn(`⚠️ [Intelligent-${requestId}] Method not allowed: ${event.httpMethod}`)
        return {
          statusCode: 405,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` })
        }
    }
  } catch (error) {
    const executionTime = Date.now() - functionStartTime
    console.error(`💥 [Intelligent-Shell] UNHANDLED CRITICAL ERROR after ${executionTime}ms. Request ID: ${requestId}`, {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack available',
      errorObject: JSON.stringify(error, null, 2),
      requestId
    })
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Critical unhandled error in intelligent background function shell.',
        details: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  } finally {
    const executionTime = Date.now() - functionStartTime
    console.log(`🔚 [Intelligent-Shell] Execution finished for Request ID: ${requestId}. Total time: ${executionTime}ms`)
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
