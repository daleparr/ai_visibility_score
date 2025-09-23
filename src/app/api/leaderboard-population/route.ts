import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardPopulationService } from '@/lib/leaderboard-population-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Leaderboard Population Management API
 * Handles initialization, queue management, and monitoring
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    const service = LeaderboardPopulationService.getInstance()

    switch (action) {
      case 'leaderboard':
        const niche = searchParams.get('niche')
        if (!niche) {
          return NextResponse.json({ error: 'Niche parameter required' }, { status: 400 })
        }
        const leaderboardData = await service.getLeaderboardData(niche)
        return NextResponse.json({ data: leaderboardData })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Leaderboard population API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Allow scheduled/cron runs via secret header or Bearer token
    const headers = request.headers
    const authHeader = headers.get('authorization') || ''
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const cronSecretHeader = headers.get('x-cron-secret') || ''
    const incomingSecret = bearer || cronSecretHeader
    const isCronAuthorized = Boolean(
      incomingSecret &&
      process.env.LEADERBOARD_CRON_SECRET &&
      incomingSecret === process.env.LEADERBOARD_CRON_SECRET
    )

    if (!isCronAuthorized) {
      // Check authentication for admin actions
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { action } = body

    const service = LeaderboardPopulationService.getInstance()

    switch (action) {
      case 'initialize':
        await service.initializeNichePopulation()
        return NextResponse.json({ message: 'Niche population initialized' })

      case 'add_competitor':
        const { userId, brandId, competitorUrl, competitorName } = body
        if (!userId || !brandId || !competitorUrl) {
          return NextResponse.json({ 
            error: 'Missing required fields: userId, brandId, competitorUrl' 
          }, { status: 400 })
        }
        
        await service.handleCompetitorAdded(userId, brandId, competitorUrl, competitorName)
        return NextResponse.json({ message: 'Competitor added to evaluation queue' })

      case 'cleanup_cache':
        await service.cleanupExpiredCache()
        return NextResponse.json({ message: 'Cache cleanup completed' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Leaderboard population API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}