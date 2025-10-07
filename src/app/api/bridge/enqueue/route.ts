import { NextRequest, NextResponse } from 'next/server'
import { getRailwayBridgeClient, BridgeError } from '@/lib/bridge/railway-client'
import { withSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Bridge API: Enqueue agents to Railway for background processing
 * POST /api/bridge/enqueue
 */
export async function POST(request: NextRequest) {
  const requestId = `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log(`🌉 [Bridge-${requestId}] Enqueueing agents to Railway...`)
    
    const body = await request.json()
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
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: evaluationId, websiteUrl, agents',
        requestId
      }, { status: 400 })
    }

    // Validate agents array
    if (agents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one agent must be specified',
        requestId
      }, { status: 400 })
    }

    // Validate tier
    const validTiers = ['free', 'index-pro', 'enterprise']
    if (!validTiers.includes(tier)) {
      return NextResponse.json({
        success: false,
        error: `Invalid tier: ${tier}. Must be one of: ${validTiers.join(', ')}`,
        requestId
      }, { status: 400 })
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
      const { evaluations } = await import('@/lib/db/schema')
      const { eq } = await import('drizzle-orm')
      const { db } = await import('@/lib/db')

      await db.update(evaluations)
        .set({
          status: 'processing',
          updatedAt: new Date()
        })
        .where(eq(evaluations.id, evaluationId))
    })

    return NextResponse.json({
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

  } catch (error) {
    console.error(`❌ [Bridge-${requestId}] Failed to enqueue agents:`, error)

    if (error instanceof BridgeError) {
      return NextResponse.json({
        success: false,
        error: 'Bridge communication failed',
        message: error instanceof Error ? error.message : String(error),
        code: error.code,
        requestId
      }, { status: error.statusCode || 500 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to enqueue agents',
      requestId
    }, { status: 500 })
  }
}

/**
 * Bridge API: Get Railway queue status
 * GET /api/bridge/enqueue
 */
export async function GET(request: NextRequest) {
  const requestId = `status_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
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

    return NextResponse.json({
      success: true,
      data: {
        queue: queueMetrics,
        health: healthStatus,
        timestamp: new Date().toISOString()
      },
      requestId
    })

  } catch (error) {
    console.error(`❌ [Bridge-${requestId}] Failed to get Railway status:`, error)

    if (error instanceof BridgeError) {
      return NextResponse.json({
        success: false,
        error: 'Railway service unavailable',
        message: error instanceof Error ? error.message : String(error),
        requestId
      }, { status: 503 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : String(error),
      requestId
    }, { status: 500 })
  }
}
