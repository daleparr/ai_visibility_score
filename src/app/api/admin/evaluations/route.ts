import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo purposes
// In production, this would be stored in a database
let evaluationLogs: any[] = []

export async function POST(request: NextRequest) {
  try {
    const evaluationData = await request.json()
    
    // Add timestamp and unique ID
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...evaluationData
    }
    
    // Store the evaluation log
    evaluationLogs.push(logEntry)
    
    // Keep only last 1000 evaluations to prevent memory issues
    if (evaluationLogs.length > 1000) {
      evaluationLogs = evaluationLogs.slice(-1000)
    }
    
    return NextResponse.json({ success: true, id: logEntry.id })
  } catch (error) {
    console.error('Error logging evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to log evaluation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Filter by tier if specified
    let filteredLogs = evaluationLogs
    if (tier) {
      filteredLogs = evaluationLogs.filter(log => log.tier === tier)
    }
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)
    
    // Calculate summary statistics
    const totalEvaluations = filteredLogs.length
    const freeEvaluations = filteredLogs.filter(log => log.tier === 'free').length
    const professionalEvaluations = filteredLogs.filter(log => log.tier === 'professional').length
    
    const averageScore = filteredLogs.length > 0 
      ? filteredLogs.reduce((sum, log) => sum + (log.overallScore || 0), 0) / filteredLogs.length
      : 0
    
    // Group by date for trend analysis
    const evaluationsByDate = filteredLogs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Identify upsell opportunities (free tier users with high engagement)
    const upsellOpportunities = filteredLogs
      .filter(log => log.tier === 'free')
      .reduce((acc, log) => {
        const domain = new URL(log.url).hostname
        acc[domain] = (acc[domain] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    const highEngagementDomains = Object.entries(upsellOpportunities)
      .filter(([_, count]) => (count as number) >= 3)
      .map(([domain, count]) => ({ domain, evaluations: count as number }))
      .sort((a, b) => b.evaluations - a.evaluations)
    
    return NextResponse.json({
      evaluations: paginatedLogs,
      summary: {
        totalEvaluations,
        freeEvaluations,
        professionalEvaluations,
        averageScore: parseFloat(averageScore.toFixed(2)),
        evaluationsByDate,
        upsellOpportunities: highEngagementDomains
      },
      pagination: {
        total: filteredLogs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredLogs.length
      }
    })
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    )
  }
}