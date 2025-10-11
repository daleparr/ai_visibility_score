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
    const { sql } = await import('../../src/lib/db')

    // Check if record exists
    const existing = await sql`
      SELECT id FROM production.backend_agent_executions
      WHERE evaluation_id = ${evaluationId} AND agent_name = ${agentName}
      LIMIT 1
    `

    if (existing.length > 0) {
      // Record exists - UPDATE
      if (status === 'running') {
        await sql`
          UPDATE production.backend_agent_executions
          SET status = 'running', started_at = now(), updated_at = now()
          WHERE evaluation_id = ${evaluationId} AND agent_name = ${agentName}
        `
      } else if (status === 'completed') {
        const resultJson = result ? JSON.stringify(result) : null
        const executionTime = result?.executionTime ? Math.round(result.executionTime) : null

        await sql`
          UPDATE production.backend_agent_executions
          SET status = 'completed', completed_at = now(), result = ${resultJson}, 
              execution_time = ${executionTime}, updated_at = now()
          WHERE evaluation_id = ${evaluationId} AND agent_name = ${agentName}
        `
      } else if (status === 'failed') {
        await sql`
          UPDATE production.backend_agent_executions
          SET status = 'failed', completed_at = now(), error = ${error || 'Unknown error'}, 
              updated_at = now()
          WHERE evaluation_id = ${evaluationId} AND agent_name = ${agentName}
        `
      }
    } else {
      // Record doesn't exist - INSERT
      const id = `${evaluationId}-${agentName}-${Date.now()}`
      
      if (status === 'running') {
        await sql`
          INSERT INTO production.backend_agent_executions 
            (id, evaluation_id, agent_name, status, started_at, created_at, updated_at)
          VALUES 
            (${id}, ${evaluationId}, ${agentName}, 'running', now(), now(), now())
        `
      } else if (status === 'completed') {
        const resultJson = result ? JSON.stringify(result) : null
        const executionTime = result?.executionTime ? Math.round(result.executionTime) : null

        await sql`
          INSERT INTO production.backend_agent_executions 
            (id, evaluation_id, agent_name, status, completed_at, result, execution_time, created_at, updated_at)
          VALUES 
            (${id}, ${evaluationId}, ${agentName}, 'completed', now(), ${resultJson}, ${executionTime}, now(), now())
        `
      } else if (status === 'failed') {
        await sql`
          INSERT INTO production.backend_agent_executions 
            (id, evaluation_id, agent_name, status, completed_at, error, created_at, updated_at)
          VALUES 
            (${id}, ${evaluationId}, ${agentName}, 'failed', now(), ${error || 'Unknown error'}, now(), now())
        `
      }
    }

    console.log(`✅ [BridgeCallback] Agent status saved: ${agentName} -> ${status} (${existing.length > 0 ? 'updated' : 'inserted'})`)
  } catch (dbError) {
    console.error(`❌ [BridgeCallback] Database operation failed:`, dbError)
    throw dbError
  }
}

async function finalizeEvaluation(evaluationId: string, agentNames: string[]): Promise<void> {
  try {
    console.log(`🏁 [BridgeCallback] Starting finalization for evaluation ${evaluationId}`, {
      agentCount: agentNames.length,
      agents: agentNames
    })

    const { EvaluationFinalizer } = await import('../../src/lib/adi/evaluation-finalizer')
    const finalizer = new EvaluationFinalizer()
    
    console.log(`🏁 [BridgeCallback] Calling checkAndFinalizeEvaluation...`)
    const wasFinalized = await finalizer.checkAndFinalizeEvaluation(evaluationId)
    
    console.log(`✅ [BridgeCallback] Evaluation ${wasFinalized ? 'FINALIZED' : 'NOT READY'}: ${evaluationId}`)
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
      headers: Object.keys(event.headers || {}),
      bodyPreview: event.body?.substring(0, 200)
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

      console.log(``)
      console.log(`╔═══════════════════════════════════════════════════════════╗`)
      console.log(`║  🔔 COMPLETION CALLBACK RECEIVED FROM RAILWAY             ║`)
      console.log(`║  REQUEST ID: ${requestId}                                 ║`)
      console.log(`╚═══════════════════════════════════════════════════════════╝`)
      console.log(`🏁 [BridgeCallback-${requestId}] Evaluation: ${evaluationId}`)
      console.log(`🏁 [BridgeCallback-${requestId}] Status: ${status}`)
      console.log(`🏁 [BridgeCallback-${requestId}] Results count: ${results?.length || 0}`)
      console.log(`🏁 [BridgeCallback-${requestId}] Summary:`, JSON.stringify(summary, null, 2))
      console.log(``)

      // Verify token
      if (!verifyBridgeToken(token, evaluationId)) {
        console.error(`❌ [BridgeCallback-${requestId}] TOKEN VERIFICATION FAILED!`)
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid authentication token' })
        }
      }

      console.log(`✅ [BridgeCallback-${requestId}] Token verified successfully`)
      console.log(`🏁 [BridgeCallback-${requestId}] Proceeding to finalization...`)

      try {
        if (status === 'completed' || status === 'failed') {
          const agentNames = results?.map(r => r.agentName) || []
          console.log(`🏁 [BridgeCallback-${requestId}] Calling finalizeEvaluation with ${agentNames.length} agents`)
          await finalizeEvaluation(evaluationId, agentNames)
          console.log(`✅ [BridgeCallback-${requestId}] Finalization completed successfully`)
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
