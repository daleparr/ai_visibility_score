import { NextRequest, NextResponse } from 'next/server'

/**
 * ADI Leaderboards API
 * GET /api/adi/leaderboards - Retrieve industry leaderboards
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industryId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includePrivate = searchParams.get('includePrivate') === 'true'
    const sortBy = searchParams.get('sortBy') || 'score'

    // Validate API access
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 401 }
      )
    }

    // Validate subscription (simplified for demo)
    const subscription = await validateAPIAccess(apiKey)
    if (!subscription.valid) {
      return NextResponse.json(
        { success: false, error: subscription.error },
        { status: subscription.status }
      )
    }

    // Mock leaderboard data (in production, this would query the database)
    const leaderboardData = await getLeaderboardData({
      industryId,
      category,
      limit,
      includePrivate,
      sortBy
    })

    // Log API usage
    await logAPIUsage(subscription.userId || 'anonymous', 'GET', '/api/adi/leaderboards', leaderboardData.length)

    return NextResponse.json({
      success: true,
      data: leaderboardData,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0',
        rateLimit: {
          remaining: subscription.remainingCalls,
          resetTime: subscription.resetTime
        }
      }
    })

  } catch (error) {
    console.error('Leaderboards API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock functions (in production, these would use real database queries)
async function validateAPIAccess(apiKey: string) {
  // Simplified validation
  if (apiKey.startsWith('adi_')) {
    return {
      valid: true,
      userId: 'user_123',
      subscriptionId: 'sub_123',
      tier: 'professional',
      remainingCalls: 950,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }
  
  return { valid: false, error: 'Invalid API key', status: 401 }
}

async function getLeaderboardData(params: any) {
  // Mock leaderboard data
  return [
    {
      rank: 1,
      brand: {
        id: 'brand_1',
        name: 'TechBrand Pro',
        websiteUrl: 'https://techbrandpro.com',
        industry: 'Consumer Electronics'
      },
      score: {
        current: 92,
        change30d: 3,
        change90d: 8
      },
      pillars: {
        infrastructure: 89,
        perception: 94,
        commerce: 93
      },
      badges: ['Top 10 AI-Ready Electronics 2025', 'Rising Star'],
      lastUpdated: '2025-01-10'
    },
    {
      rank: 2,
      brand: {
        id: 'brand_2',
        name: 'StyleCorp',
        websiteUrl: 'https://stylecorp.com',
        industry: 'Fashion'
      },
      score: {
        current: 88,
        change30d: -1,
        change90d: 5
      },
      pillars: {
        infrastructure: 85,
        perception: 90,
        commerce: 89
      },
      badges: ['Consistent Performer'],
      lastUpdated: '2025-01-09'
    }
  ]
}

async function logAPIUsage(userId: string, method: string, endpoint: string, responseSize: number) {
  // Mock logging
  console.log(`API Usage: ${userId} - ${method} ${endpoint} - ${responseSize} items`)
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}