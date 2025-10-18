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
 * GET /api/dashboard/performance-trends
 * Retrieve performance trends analysis for authenticated user
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
    const timeRange = searchParams.get('timeRange') || '2years' // '1year', '2years', 'all'
    const includeForecasting = searchParams.get('includeForecasting') === 'true'
    const includeSeasonality = searchParams.get('includeSeasonality') === 'true'

    // Check cache first
    const cachedData = await pipeline.getCachedDashboardData(sessionUser.id, 'trends')
    if (cachedData) {
      let filteredData = cachedData
      
      // Apply time range filter
      if (timeRange !== 'all') {
        const cutoffDate = getCutoffDate(timeRange)
        filteredData = {
          ...cachedData,
          timeSeries: cachedData.timeSeries.filter((point: any) => 
            new Date(point.quarter) >= cutoffDate
          )
        }
      }

            // Remove forecasting/seasonality if not requested
            if (!includeForecasting) {
              delete (filteredData as any).forecasting
            }
            if (!includeSeasonality) {
              delete (filteredData as any).seasonality
            }

      return NextResponse.json({ 
        success: true,
        data: filteredData,
        cached: true,
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          version: 'ADI-v1.0',
          filters: { timeRange, includeForecasting, includeSeasonality }
        }
      })
    }

    // Get fresh data from analytics engine
    const trendsData = await analytics.analyzeTrends(sessionUser.id)
    
    // Apply time range filter
    let filteredData = trendsData
    if (timeRange !== 'all') {
      const cutoffDate = getCutoffDate(timeRange)
      filteredData = {
        ...trendsData,
        timeSeries: trendsData.timeSeries.filter(point => 
          new Date(point.quarter) >= cutoffDate
        )
      }
    }

            // Remove forecasting/seasonality if not requested
            if (!includeForecasting) {
              delete (filteredData as any).forecasting
            }
            if (!includeSeasonality) {
              delete (filteredData as any).seasonality
            }

    // Cache the result
    await pipeline.updateTrendData(sessionUser.id)

    return NextResponse.json({ 
      success: true,
      data: filteredData,
      cached: false,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0',
        filters: { timeRange, includeForecasting, includeSeasonality }
      }
    })

  } catch (error) {
    console.error('Performance trends API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch performance trends',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/performance-trends
 * Trigger trend analysis refresh or export trend data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, format, timeRange } = body

    if (action === 'refresh') {
      // Force refresh of trend data
      await pipeline.invalidateUserCache(sessionUser.id)
      const freshData = await analytics.analyzeTrends(sessionUser.id)
      await pipeline.updateTrendData(sessionUser.id)

      return NextResponse.json({ 
        success: true,
        data: freshData,
        message: 'Trend data refreshed successfully',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'export') {
      // Export trend data in specified format
      const trendData = await analytics.analyzeTrends(sessionUser.id)
      
      if (format === 'csv') {
        const csvData = convertTrendsToCSV(trendData)
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="performance-trends-${Date.now()}.csv"`
          }
        })
      }

      if (format === 'json') {
        return NextResponse.json({ 
          success: true,
          data: trendData,
          metadata: {
            requestId: generateRequestId(),
            timestamp: new Date().toISOString(),
            format: 'json'
          }
        })
      }

      return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Performance trends POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process trend action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Get cutoff date based on time range
 */
function getCutoffDate(timeRange: string): Date {
  const now = new Date()
  
  switch (timeRange) {
    case '1year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    case '2years':
      return new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    case 'all':
    default:
      return new Date(0) // Return epoch date to include all data
  }
}

/**
 * Convert trends data to CSV format
 */
function convertTrendsToCSV(trendData: any): string {
  const headers = ['Quarter', 'Average Score', 'Score Std Dev', 'Evaluation Count', 'Average Confidence']
  const rows = trendData.timeSeries.map((point: any) => [
    point.quarter,
    point.avgScore,
    point.scoreStddev,
    point.evaluationCount,
    point.avgConfidence
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row: any) => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
