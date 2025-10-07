import { NextRequest, NextResponse } from 'next/server'
import { getRailwayBridgeClient } from '@/lib/bridge/railway-client'
import { getFeatureFlags } from '@/lib/feature-flags'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('bridge-enqueue-api')

export const dynamic = 'force-dynamic'

/**
 * Bridge API: Enqueue agents for processing on Railway
 * POST /api/bridge/enqueue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { evaluationId, websiteUrl, tier, agents, priority = 'normal', metadata = {} } = body

    // Validate required fields
    if (!evaluationId || !websiteUrl || !tier || !agents || !Array.isArray(agents)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: evaluationId, websiteUrl, tier, agents'
      }, { status: 400 })
    }

    logger.info('Bridge enqueue request received', {
      evaluationId,
      websiteUrl,
      tier,
      agents,
      priority
    })

    // Check feature flags
    const featureFlags = getFeatureFlags()
    const routing = featureFlags.getSystemRouting(tier, agents)

    if (!routing.useRailwayBridge) {
      return NextResponse.json({
        success: false,
        error: 'Railway bridge not enabled for this request',
        reason: routing.reason,
        fallback: 'Use legacy system'
      }, { status: 503 })
    }

    // Enqueue to Railway
    const bridgeClient = getRailwayBridgeClient()
    const result = await bridgeClient.enqueueAgents({
      evaluationId,
      websiteUrl,
      tier,
      agents,
      callbackUrl: '', // Will be set by the client
      priority,
      metadata
    })

    logger.info('Successfully enqueued to Railway', {
      evaluationId,
      jobId: result.jobId,
      queuePosition: result.queuePosition
    })

    return NextResponse.json({
      success: true,
      ...result,
      routing: routing.reason
    })

  } catch (error) {
    logger.error('Bridge enqueue failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to enqueue agents to Railway',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * Bridge API: Get enqueue status/health
 * GET /api/bridge/enqueue
 */
export async function GET(request: NextRequest) {
  try {
    const featureFlags = getFeatureFlags()
    const bridgeClient = getRailwayBridgeClient()
    
    // Get Railway health status
    const healthStatus = await bridgeClient.getHealthStatus()
    
    return NextResponse.json({
      success: true,
      status: 'operational',
      bridge: {
        enabled: featureFlags.isRailwayBridgeEnabled(),
        tiers: featureFlags.getFlags().railwayBridgeTiers,
        railway: healthStatus
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Bridge health check failed',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 503 })
  }
}
