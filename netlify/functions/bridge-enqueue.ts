import { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions'
import { getRailwayBridgeClient, BridgeError } from '../../src/lib/bridge/railway-client'
import { withSchema } from '../../src/lib/db'
import { NextRequest } from 'next/server' // Used for type definitions only

// Helper function to handle POST logic
async function handlePost(event: HandlerEvent, requestId: string): Promise<HandlerResponse> {
  try {
    console.log(`🌉 [Bridge-${requestId}] Enqueueing agents to Railway...`)
    
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Request body required', requestId })
      }
    }

    const body = JSON.parse(event.body)
    const {
      evaluationId,
      websiteUrl,
      tier,
      agents,
      priority = 'normal',
      metadata = {}
    } = body

    // Validate required fields
    if (!evaluationId || !websiteUrl || !agents || !Array.isArray(agents)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: evaluationId, websiteUrl, agents',
          requestId
        })
      }
    }

    // Validate agents array
    if (agents.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: 'At least one agent must be specified',
          requestId
        })
      }
    }

    // Validate tier
    const validTiers = ['free', 'index-pro', 'enterprise']
    if (!validTiers.includes(tier)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: `Invalid tier: ${tier}. Must be one of: ${validTiers.join(', ')}`,
          requestId
        })
      }
    }

    console.log(`🔄 [Bridge-${requestId}] Validation passed`, {
      evaluationId,
      websiteUrl,
      tier,
      agents,
      priority
    })

    // Get Railway bridge client
    const bridgeClient = getRailwayBridgeClient()

    // Enqueue agents to Railway
    const bridgeResponse = await bridgeClient.enqueueAgents({
      evaluationId,
      websiteUrl,
      tier,
      agents,
      callbackUrl: '', // Will be set by the bridge client
      priority,
      metadata: {
        ...metadata,
        netlifyRequestId: requestId,
        enqueuedAt: new Date().toISOString()
      }
    })

    console.log(`✅ [Bridge-${requestId}] Agents successfully enqueued to Railway`, {
      evaluationId,
      jobId: bridgeResponse.jobId,
      queuePosition: bridgeResponse.queuePosition
    })

    // Update evaluation status in database
    await withSchema(async () => {
      const { evaluations } = await import('../../src/lib/db/schema')
      const { eq } = await import('drizzle-orm')
      const { db } = await import('../../src/lib/db')

      await db.update(evaluations)
        .set({
          status: 'processing',
          updatedAt: new Date()
        })
        .where(eq(evaluations.id, evaluationId))
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Agents successfully enqueued to Railway',
        data: {
          evaluationId,
          jobId: bridgeResponse.jobId,
          queuePosition: bridgeResponse.queuePosition,
          estimatedStartTime: bridgeResponse.estimatedStartTime,
          agents,
          priority
        },
        requestId
      })
    }

  } catch (error) {
    console.error(`❌ [Bridge-${requestId}] Failed to enqueue agents:`, error)

    let statusCode = 500
    let errorMessage = 'Internal server error'
    let errorCode: string | undefined

    if (error instanceof BridgeError) {
      statusCode = error.statusCode || 500
      errorMessage = 'Bridge communication failed'
      errorCode = error.code
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to enqueue agents',
        code: errorCode,
        requestId
      })
    }
  }
}

// Helper function to handle GET logic
async function handleGet(event: HandlerEvent, requestId: string): Promise<HandlerResponse> {
  try {
    console.log(`📊 [Bridge-${requestId}] Getting Railway queue status...`)
    
    const bridgeClient = getRailwayBridgeClient()
    
    // Get queue metrics and health status
    const [queueMetrics, healthStatus] = await Promise.all([
      bridgeClient.getQueueStatus(),
      bridgeClient.getHealthStatus()
    ])

    console.log(`✅ [Bridge-${requestId}] Railway status retrieved`, {
      queueMetrics,
      healthStatus: healthStatus.status
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          queue: queueMetrics,
          health: healthStatus,
          timestamp: new Date().toISOString()
        },
        requestId
      })
    }

  } catch (error) {
    console.error(`❌ [Bridge-${requestId}] Failed to get Railway status:`, error)

    let statusCode = 503
    let errorMessage = 'Railway service unavailable'

    if (error instanceof BridgeError) {
      statusCode = error.statusCode || 503
      errorMessage = error.message
    }

    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        message: error instanceof Error ? error.message : String(error),
        requestId
      })
    }
  }
}

export const handler: Handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  const requestId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  switch (event.httpMethod) {
    case 'POST':
      return handlePost(event, requestId)
    case 'GET':
      return handleGet(event, requestId)
    default:
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      }
  }
}