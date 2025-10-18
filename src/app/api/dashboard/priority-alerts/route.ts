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
 * GET /api/dashboard/priority-alerts
 * Retrieve priority alerts for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const alertType = searchParams.get('type') // 'Critical', 'Warning', 'Opportunity', 'Success'
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeResolved = searchParams.get('includeResolved') === 'true'

    // Check cache first
    const cachedData = await pipeline.getCachedDashboardData(sessionUser.id, 'alerts')
    if (cachedData) {
      let filteredAlerts = cachedData
      
      // Apply filters
      if (alertType) {
        filteredAlerts = filteredAlerts.filter((alert: any) => alert.type === alertType)
      }
      
      if (!includeResolved) {
        filteredAlerts = filteredAlerts.filter((alert: any) => alert.type !== 'Resolved')
      }
      
      filteredAlerts = filteredAlerts.slice(0, limit)

      return NextResponse.json({ 
        success: true,
        data: filteredAlerts,
        cached: true,
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          version: 'ADI-v1.0',
          filters: { alertType, limit, includeResolved }
        }
      })
    }

    // Get fresh data from analytics engine
    const alertsData = await analytics.generatePriorityAlerts(sessionUser.id)
    
    // Apply filters
    let filteredAlerts = alertsData
    if (alertType) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === alertType)
    }
    
    if (!includeResolved) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type !== 'Resolved')
    }
    
    filteredAlerts = filteredAlerts.slice(0, limit)

    // Cache the result
    await pipeline.generateAlerts(sessionUser.id)

    return NextResponse.json({ 
      success: true,
      data: filteredAlerts,
      cached: false,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0',
        filters: { alertType, limit, includeResolved }
      }
    })

  } catch (error) {
    console.error('Priority alerts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch priority alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/priority-alerts
 * Mark alert as resolved or create new alert
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, alertId, alertData } = body

    if (action === 'resolve') {
      if (!alertId) {
        return NextResponse.json({ error: 'Alert ID required for resolve action' }, { status: 400 })
      }

      // Mark alert as resolved in database
      await markAlertAsResolved(alertId, sessionUser.id)

      // Invalidate cache
      await pipeline.invalidateUserCache(sessionUser.id)

      return NextResponse.json({ 
        success: true,
        message: 'Alert marked as resolved',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          alertId: alertId
        }
      })
    }

    if (action === 'create') {
      if (!alertData) {
        return NextResponse.json({ error: 'Alert data required for create action' }, { status: 400 })
      }

      // Create new alert
      const newAlert = await createCustomAlert(alertData, sessionUser.id)

      // Invalidate cache
      await pipeline.invalidateUserCache(sessionUser.id)

      return NextResponse.json({ 
        success: true,
        data: newAlert,
        message: 'Alert created successfully',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Priority alerts POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process alert action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Mark alert as resolved in database
 */
async function markAlertAsResolved(alertId: string, userId: string): Promise<void> {
  try {
    // This would update the database to mark the alert as resolved
    // For now, we'll just log the action
    console.log(`Marking alert ${alertId} as resolved for user ${userId}`)
  } catch (error) {
    console.error('Error marking alert as resolved:', error)
    throw error
  }
}

/**
 * Create custom alert
 */
async function createCustomAlert(alertData: any, userId: string): Promise<any> {
  try {
    // This would create a new alert in the database
    // For now, we'll return a mock alert
    const newAlert = {
      id: `custom_${Date.now()}`,
      type: alertData.type || 'Warning',
      title: alertData.title || 'Custom Alert',
      description: alertData.description || 'Custom alert description',
      recommendation: alertData.recommendation || 'Review and take appropriate action',
      metric: alertData.metric || 'Custom Metric',
      change: alertData.change || 0,
      p_value: alertData.p_value || '< 0.05',
      confidence_interval: alertData.confidence_interval || 'N/A',
      brandName: alertData.brandName || 'Portfolio',
      brandId: alertData.brandId || 'custom',
      createdAt: new Date(),
      isCustom: true
    }

    console.log(`Created custom alert for user ${userId}:`, newAlert)
    return newAlert
  } catch (error) {
    console.error('Error creating custom alert:', error)
    throw error
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
