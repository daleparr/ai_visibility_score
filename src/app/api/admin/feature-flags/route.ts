import { NextRequest, NextResponse } from 'next/server'
import { getFeatureFlags } from '@/lib/feature-flags'

export const dynamic = 'force-dynamic'

/**
 * Admin API: Get current feature flag status
 * GET /api/admin/feature-flags
 */
export async function GET(request: NextRequest) {
  try {
    const featureFlags = getFeatureFlags()

    return NextResponse.json({
      success: true,
      data: {
        uxVariation: featureFlags.uxVariation,
        enableABTesting: featureFlags.enableABTesting,
        showVariationToggle: featureFlags.showVariationToggle,
        environment: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get feature flags:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve feature flags',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * Admin API: Test system routing for specific scenarios
 * POST /api/admin/feature-flags/test-routing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier, agents } = body

    if (!tier || !agents || !Array.isArray(agents)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: tier, agents (array)'
      }, { status: 400 })
    }

    const featureFlags = getFeatureFlags()

    // Simple routing logic for now
    const routing = {
      tier,
      agents,
      strategy: 'hybrid',
      note: 'All tiers currently use hybrid orchestration approach'
    }

    return NextResponse.json({
      success: true,
      data: {
        tier,
        agents,
        routing,
        flags: {
          uxVariation: featureFlags.uxVariation,
          enableABTesting: featureFlags.enableABTesting,
          showVariationToggle: featureFlags.showVariationToggle
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to test routing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test routing',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
