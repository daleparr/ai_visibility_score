import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardAnalytics } from '@/lib/analytics/dashboard-analytics'
import { DashboardDataPipeline } from '@/lib/data-pipeline/dashboard-pipeline'

export const dynamic = 'force-dynamic'

// Initialize analytics and pipeline
const analytics = new DashboardAnalytics()
const pipeline = new DashboardDataPipeline()

/**
 * GET /api/dashboard/portfolio-summary
 * Retrieve comprehensive portfolio health summary for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check cache first
    const cachedData = await pipeline.getCachedDashboardData(sessionUser.id, 'portfolio')
    if (cachedData) {
      return NextResponse.json({ 
        success: true,
        data: cachedData,
        cached: true,
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          version: 'ADI-v1.0'
        }
      })
    }

    // Get fresh data from analytics engine
    const portfolioData = await analytics.getPortfolioHealth(sessionUser.id)
    
    // Cache the result
    await pipeline.updatePortfolioMetrics(sessionUser.id)

    return NextResponse.json({ 
      success: true,
      data: portfolioData,
      cached: false,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0'
      }
    })

  } catch (error) {
    console.error('Portfolio summary API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/portfolio-summary
 * Trigger portfolio data refresh (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges (you can implement your own admin check)
    const isAdmin = await checkAdminPrivileges(sessionUser.id)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Process historical data for the specified user
    await pipeline.processHistoricalData(userId)

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio data refresh initiated',
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        userId: userId
      }
    })

  } catch (error) {
    console.error('Portfolio refresh API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if user has admin privileges
 */
async function checkAdminPrivileges(userId: string): Promise<boolean> {
  try {
    // This is a placeholder - implement your own admin check logic
    // For example, check user roles in database
    return false // For now, return false to prevent unauthorized access
  } catch (error) {
    console.error('Error checking admin privileges:', error)
    return false
  }
}
