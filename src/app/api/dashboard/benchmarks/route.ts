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
 * GET /api/dashboard/benchmarks
 * Retrieve comprehensive benchmark analysis for authenticated user
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
    const includeCompetitiveAnalysis = searchParams.get('includeCompetitive') === 'true'
    const includePercentileRankings = searchParams.get('includePercentiles') === 'true'
    const industryFilter = searchParams.get('industry')

    // Check cache first
    const cachedData = await pipeline.getCachedDashboardData(sessionUser.id, 'benchmarks')
    if (cachedData) {
      let filteredData = cachedData
      
      // Apply industry filter if specified
      if (industryFilter && cachedData.industryBenchmarks) {
        filteredData = {
          ...cachedData,
          industryBenchmarks: cachedData.industryBenchmarks.filter((benchmark: any) => 
            benchmark.industry.toLowerCase().includes(industryFilter.toLowerCase())
          )
        }
      }

            // Remove competitive analysis if not requested
            if (!includeCompetitiveAnalysis) {
              delete (filteredData as any).competitiveAnalysis
            }
      
            // Remove percentile rankings if not requested
            if (!includePercentileRankings) {
              delete (filteredData as any).percentileRankings
            }

      return NextResponse.json({ 
        success: true,
        data: filteredData,
        cached: true,
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          version: 'ADI-v1.0',
          filters: { includeCompetitiveAnalysis, includePercentileRankings, industryFilter }
        }
      })
    }

    // Get fresh data from analytics engine
    const benchmarksData = await analytics.analyzeBenchmarks(sessionUser.id)
    
    // Apply industry filter if specified
    let filteredData = benchmarksData
    if (industryFilter && benchmarksData.industryBenchmarks) {
      filteredData = {
        ...benchmarksData,
        industryBenchmarks: benchmarksData.industryBenchmarks.filter((benchmark: any) => 
          benchmark.industry.toLowerCase().includes(industryFilter.toLowerCase())
        )
      }
    }

            // Remove competitive analysis if not requested
            if (!includeCompetitiveAnalysis) {
              delete (filteredData as any).competitiveAnalysis
            }
    
            // Remove percentile rankings if not requested
            if (!includePercentileRankings) {
              delete (filteredData as any).percentileRankings
            }

    // Cache the result
    await pipeline.refreshBenchmarks(sessionUser.id)

    return NextResponse.json({ 
      success: true,
      data: filteredData,
      cached: false,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0',
        filters: { includeCompetitiveAnalysis, includePercentileRankings, industryFilter }
      }
    })

  } catch (error) {
    console.error('Benchmarks API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch benchmark data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/benchmarks
 * Trigger benchmark refresh or export benchmark data
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, format, includeCompetitiveAnalysis } = body

    if (action === 'refresh') {
      // Force refresh of benchmark data
      await pipeline.invalidateUserCache(sessionUser.id)
      const freshData = await analytics.analyzeBenchmarks(sessionUser.id)
      await pipeline.refreshBenchmarks(sessionUser.id)

      return NextResponse.json({ 
        success: true,
        data: freshData,
        message: 'Benchmark data refreshed successfully',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'export') {
      // Export benchmark data in specified format
      const benchmarkData = await analytics.analyzeBenchmarks(sessionUser.id)
      
      if (format === 'csv') {
        const csvData = convertBenchmarksToCSV(benchmarkData)
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="benchmark-analysis-${Date.now()}.csv"`
          }
        })
      }

      if (format === 'json') {
        return NextResponse.json({ 
          success: true,
          data: benchmarkData,
          metadata: {
            requestId: generateRequestId(),
            timestamp: new Date().toISOString(),
            format: 'json'
          }
        })
      }

      return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    }

    if (action === 'compare') {
      // Compare with specific competitors
      const { competitorIds } = body
      
      if (!competitorIds || !Array.isArray(competitorIds)) {
        return NextResponse.json({ error: 'Competitor IDs required for comparison' }, { status: 400 })
      }

      // Get comparison data
      const comparisonData = await generateCompetitiveComparison(sessionUser.id, competitorIds)

      return NextResponse.json({ 
        success: true,
        data: comparisonData,
        message: 'Competitive comparison generated successfully',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          competitorIds
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Benchmarks POST API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process benchmark action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate competitive comparison data
 */
async function generateCompetitiveComparison(userId: string, competitorIds: string[]): Promise<any> {
  try {
    // This would generate detailed competitive analysis
    // For now, return mock comparison data
    return {
      userPerformance: {
        userId,
        avgScore: 78,
        industryPercentile: 82
      },
      competitors: competitorIds.map((id, index) => ({
        competitorId: id,
        avgScore: 75 + index * 2,
        industryPercentile: 78 + index * 2,
        comparison: index % 2 === 0 ? 'above' : 'below'
      })),
      insights: [
        'Your portfolio outperforms 80% of competitors in Technical Foundation',
        'Shopping Experience is your strongest competitive advantage',
        'Entity Clarity shows room for improvement compared to top performers'
      ]
    }
  } catch (error) {
    console.error('Error generating competitive comparison:', error)
    throw error
  }
}

/**
 * Convert benchmark data to CSV format
 */
function convertBenchmarksToCSV(benchmarkData: any): string {
  const headers = ['Industry', 'Brand Count', 'Industry Average', 'P25', 'P50', 'P75', 'P90']
  const rows = benchmarkData.industryBenchmarks?.map((benchmark: any) => [
    benchmark.industry,
    benchmark.brandCount,
    benchmark.industryAvg,
    benchmark.p25,
    benchmark.p50,
    benchmark.p75,
    benchmark.p90
  ]) || []

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