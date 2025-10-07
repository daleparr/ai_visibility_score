import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import jwt from 'jsonwebtoken'

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

async function updateAgentStatus(
  evaluationId: string,
  agentName: string,
  status: string,
  result?: any,
  error?: string
): Promise<void> {
  try {
    // Import database modules dynamically
    const { withSchema } = await import('../../src/lib/db')
    const { backendAgentExecutions } = await import('../../src/lib/db/schema')
    const { eq, and } = await import('drizzle-orm')
    const { db } = await import('../../src/lib/db')

    await withSchema(async () => {
      if (status === 'running') {
        await db.update(backendAgentExecutions)
          .set({
            status: 'running',
            startedAt: new Date(),
            updatedAt: new Date()
          })
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
    })

    console.log(`✅ [BridgeCallback] Agent status updated: ${agentName} -> ${status}`)
  } catch (dbError) {
    console.error(`❌ [BridgeCallback] Database update failed:`, dbError)
    throw dbError
  }
}

async function finalizeEvaluation(evaluationId: string, agentNames: string[]): Promise<void> {
  try {
    const { EvaluationFinalizer } = await import('../../src/lib/adi/evaluation-finalizer')
    const finalizer = new EvaluationFinalizer()
    
    await finalizer.checkAndFinalizeEvaluation(evaluationId)
    console.log(`✅ [BridgeCallback] Evaluation finalized: ${evaluationId}`)
  } catch (error) {
    console.error(`❌ [BridgeCallback] Finalization failed:`, error)
    throw error
  }
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const requestId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log(`🔄 [BridgeCallback-${requestId}] Received callback from Railway`, {
      method: event.httpMethod,
      path: event.path,
      headers: Object.keys(event.headers || {})
    })

    // Only handle POST requests
    if (event.httpMethod !== 'POST') {
      if (event.httpMethod === 'GET') {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'Bridge Callback Handler',
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

    // Verify authentication
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
    
    // Determine endpoint type from path
    const isProgressUpdate = event.path.includes('/progress')
    const isCompletion = event.path.includes('/complete')
    
    if (isProgressUpdate) {
      const payload = body as CallbackPayload
      const { evaluationId, agentName, status, result, error } = payload

      // Verify token
      if (!verifyBridgeToken(token, evaluationId)) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid authentication token' })
        }
      }

      console.log(`📈 [BridgeCallback-${requestId}] Progress update`, {
        evaluationId,
        agentName,
        status
      })

      if (agentName) {
        await updateAgentStatus(evaluationId, agentName, status, result, error)
      }

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
    }
    
    if (isCompletion) {
      const payload = body as CompletionPayload
      const { evaluationId, status, results, summary } = payload

      // Verify token
      if (!verifyBridgeToken(token, evaluationId)) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid authentication token' })
        }
      }

      console.log(`🏁 [BridgeCallback-${requestId}] Completion notification`, {
        evaluationId,
        status,
        summary
      })

      try {
        if (status === 'completed' || status === 'failed') {
          const agentNames = results?.map(r => r.agentName) || []
          await finalizeEvaluation(evaluationId, agentNames)
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
        console.error(`❌ [BridgeCallback-${requestId}] Finalization failed:`, finalizationError)
        
        // Still return success to prevent Railway retries
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

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid callback endpoint' })
    }

  } catch (error) {
    console.error(`❌ [BridgeCallback-${requestId}] Callback processing failed:`, error)
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Callback processing failed',
        message: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  }
}
