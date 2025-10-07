import { NextRequest, NextResponse } from 'next/server'
import { withSchema } from '@/lib/db'
import jwt from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

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

/**
 * Bridge Callback: Progress updates from Railway agents
 * POST /api/bridge/callback/progress
 */
export async function POST(request: NextRequest) {
  const requestId = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const url = new URL(request.url)
    const endpoint = url.pathname.split('/').pop()
    
    console.log(`🔄 [Callback-${requestId}] Received ${endpoint} from Railway`)
    
    // Verify authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid authorization header'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const body = await request.json()
    
    if (endpoint === 'progress') {
      return await handleProgressUpdate(body as CallbackPayload, token, requestId)
    } else if (endpoint === 'complete') {
      return await handleCompletion(body as CompletionPayload, token, requestId)
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid callback endpoint'
      }, { status: 404 })
    }

  } catch (error) {
    console.error(`❌ [Callback-${requestId}] Callback processing failed:`, error)
    return NextResponse.json({
      success: false,
      error: 'Callback processing failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

async function handleProgressUpdate(
  payload: CallbackPayload,
  token: string,
  requestId: string
): Promise<NextResponse> {
  const { evaluationId, agentName, status, result, error, progress } = payload

  // Verify token
  if (!verifyBridgeToken(token, evaluationId)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid authentication token'
    }, { status: 401 })
  }

  console.log(`📈 [Callback-${requestId}] Progress update`, {
    evaluationId,
    agentName,
    status,
    progress
  })

  try {
    await withSchema(async () => {
      const { backendAgentExecutions } = await import('@/lib/db/schema')
      const { eq, and } = await import('drizzle-orm')
      const { db } = await import('@/lib/db')

      // Update agent execution status
      if (agentName) {
        const executionId = `${evaluationId}-${agentName}-${Date.now()}`
        
        if (status === 'running') {
          // Update to running status
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
          // Update to completed with result
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
          // Update to failed with error
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

    return NextResponse.json({
      success: true,
      message: 'Progress update processed',
      evaluationId,
      agentName,
      status
    })

  } catch (dbError) {
    console.error(`❌ [Callback-${requestId}] Database update failed:`, dbError)
    return NextResponse.json({
      success: false,
      error: 'Database update failed',
      message: dbError instanceof Error ? dbError.message : String(dbError)
    }, { status: 500 })
  }
}

async function handleCompletion(
  payload: CompletionPayload,
  token: string,
  requestId: string
): Promise<NextResponse> {
  const { evaluationId, status, results, error, summary } = payload

  // Verify token
  if (!verifyBridgeToken(token, evaluationId)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid authentication token'
    }, { status: 401 })
  }

  console.log(`🏁 [Callback-${requestId}] Completion notification`, {
    evaluationId,
    status,
    summary
  })

  try {
    // Import the evaluation finalizer
    const { EvaluationFinalizer } = await import('@/lib/adi/evaluation-finalizer')
    const finalizer = new EvaluationFinalizer()

    if (status === 'completed' || status === 'failed') {
      // Get all agent names that were supposed to run
      const agentNames = results?.map(r => r.agentName) || []
      
      // Trigger evaluation finalization
      await finalizer.checkAndFinalizeEvaluation(evaluationId)
      
      console.log(`✅ [Callback-${requestId}] Evaluation finalized`, {
        evaluationId,
        status,
        agentCount: agentNames.length
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Completion processed and evaluation finalized',
      evaluationId,
      status,
      summary
    })

  } catch (finalizationError) {
    console.error(`❌ [Callback-${requestId}] Finalization failed:`, finalizationError)
    
    // Still return success for the callback, but log the finalization error
    // The Railway side should not retry due to our finalization issues
    return NextResponse.json({
      success: true,
      message: 'Completion received but finalization failed',
      evaluationId,
      status,
      warning: 'Finalization failed - manual intervention may be required'
    })
  }
}

// Handle GET requests for health checks
export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Bridge Callback Handler',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/bridge/callback/progress',
      'POST /api/bridge/callback/complete'
    ]
  })
}
