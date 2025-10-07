import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import jwt from 'jsonwebtoken'
import { withSchema } from '../../src/lib/db'
import { NextResponse } from 'next/server' // Used for type definitions only

interface CallbackPayload {
  evaluationId: string
  agentName?: string
  status: 'running' | 'completed' | 'failed'
  result?: any
  error?: string
  progress?: number
  metadata?: Record<string, any>
}

interface CompletionPayload {
  evaluationId: string
  status: 'completed' | 'failed'
  results?: any[]
  error?: string
  summary?: {
    totalAgents: number
    completedAgents: number
    failedAgents: number
    totalExecutionTime: number
  }
  metadata?: Record<string, any>
}

function verifyBridgeToken(token: string, evaluationId: string): boolean {
  try {
    const jwtSecret = process.env.JWT_SECRET || process.env.RAILWAY_JWT_SECRET
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured for bridge authentication')
      return false
    }

    const decoded = jwt.verify(token, jwtSecret) as any
    
    // Verify token structure and issuer
    if (decoded.iss !== 'netlify-bridge' || decoded.evaluationId !== evaluationId) {
      return false
    }

    return true
  } catch (error) {
    console.error('Bridge token verification failed:', error instanceof Error ? error.message : String(error))
    return false
  }
}

async function handleProgressUpdate(
  payload: CallbackPayload,
  token: string,
  requestId: string
): Promise<HandlerResponse> {
  const { evaluationId, agentName, status, result, error, progress } = payload

  // Verify token
  if (!verifyBridgeToken(token, evaluationId)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid authentication token' })
    }
  }

  console.log(`📈 [Callback-${requestId}] Progress update`, {
    evaluationId,
    agentName,
    status,
    progress
  })

  try {
    await withSchema(async () => {
      const { backendAgentExecutions } = await import('../../src/lib/db/schema')
      const { eq, and } = await import('drizzle-orm')
      const { db } = await import('../../src/lib/db')

      // Update agent execution status
      if (agentName) {
        // Note: The original Next.js route had complex execution ID logic, simplifying here
        
        if (status === 'running') {
          await db.update(backendAgentExecutions)
            .set({ status: 'running', startedAt: new Date(), updatedAt: new Date() })
            .where(and(
              eq(backendAgentExecutions.evaluationId, evaluationId),
              eq(backendAgentExecutions.agentName, agentName)
            ))
        } else if (status === 'completed') {
          await db.update(backendAgentExecutions)
            .set({
              status: 'completed',
              completedAt: new Date(),
              result: result ? JSON.stringify(result) : null,
              executionTime: result?.executionTime || null,
              updatedAt: new Date()
            })
            .where(and(
              eq(backendAgentExecutions.evaluationId, evaluationId),
              eq(backendAgentExecutions.agentName, agentName)
            ))
        } else if (status === 'failed') {
          await db.update(backendAgentExecutions)
            .set({
              status: 'failed',
              completedAt: new Date(),
              error: error || 'Unknown error',
              updatedAt: new Date()
            })
            .where(and(
              eq(backendAgentExecutions.evaluationId, evaluationId),
              eq(backendAgentExecutions.agentName, agentName)
            ))
        }
      }
    })

    console.log(`✅ [Callback-${requestId}] Progress update processed`)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Progress update processed',
        evaluationId,
        agentName,
        status
      })
    }

  } catch (dbError) {
    console.error(`❌ [Callback-${requestId}] Database update failed:`, dbError)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Database update failed',
        message: dbError instanceof Error ? dbError.message : String(dbError)
      })
    }
  }
}

async function handleCompletion(
  payload: CompletionPayload,
  token: string,
  requestId: string
): Promise<HandlerResponse> {
  const { evaluationId, status, results, error, summary } = payload

  // Verify token
  if (!verifyBridgeToken(token, evaluationId)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid authentication token' })
    }
  }

  console.log(`🏁 [Callback-${requestId}] Completion notification`, {
    evaluationId,
    status,
    summary
  })

  try {
    // Import the evaluation finalizer
    const { EvaluationFinalizer } = await import('../../src/lib/adi/evaluation-finalizer')
    const finalizer = new EvaluationFinalizer()

    if (status === 'completed' || status === 'failed') {
      // Trigger evaluation finalization
      await finalizer.checkAndFinalizeEvaluation(evaluationId)
      
      console.log(`✅ [Callback-${requestId}] Evaluation finalized`, {
        evaluationId,
        status,
        agentCount: results?.length || 0
      })
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Completion processed and evaluation finalized',
        evaluationId,
        status,
        summary
      })
    }

  } catch (finalizationError) {
    console.error(`❌ [Callback-${requestId}] Finalization failed:`, finalizationError)
    
    // Still return success for the callback, but log the finalization error
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Completion received but finalization failed',
        evaluationId,
        status,
        warning: 'Finalization failed - manual intervention may be required'
      })
    }
  }
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const requestId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Netlify function path is /bridge-callback-api. We check the subpath for progress/complete
    const pathSegments = event.path.split('/').filter(Boolean)
    const endpoint = pathSegments.pop() // Should be 'progress' or 'complete'

    console.log(`🔄 [Callback-${requestId}] Received ${endpoint} from Railway`)
    
    // Only handle POST requests
    if (event.httpMethod !== 'POST') {
      // Handle GET for health check
      if (event.httpMethod === 'GET') {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'Bridge Callback Handler (Netlify Function)',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            endpoints: ['POST /progress', 'POST /complete']
          })
        }
      }
      
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      }
    }

    // Verify authentication header presence
    const authHeader = event.headers?.authorization || event.headers?.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing or invalid authorization header' })
      }
    }

    const token = authHeader.substring(7)
    const body = JSON.parse(event.body || '{}')
    
    if (endpoint === 'progress') {
      return await handleProgressUpdate(body as CallbackPayload, token, requestId)
    } else if (endpoint === 'complete') {
      return await handleCompletion(body as CompletionPayload, token, requestId)
    } else {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Invalid callback endpoint' })
      }
    }

  } catch (error) {
    console.error(`❌ [Callback-${requestId}] Callback processing failed:`, error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Callback processing failed',
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}