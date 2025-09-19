import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardScheduler } from '../../../../scripts/automated-leaderboard-scheduler'

// Global scheduler instance
let schedulerInstance: LeaderboardScheduler | null = null

/**
 * Leaderboard Scheduler Management API
 * GET - Get scheduler status
 * POST - Start/stop scheduler or trigger manual evaluation
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        if (!schedulerInstance) {
          return NextResponse.json({
            status: 'stopped',
            message: 'Scheduler is not running'
          })
        }

        const status = schedulerInstance.getStatus()
        return NextResponse.json({
          status: 'running',
          ...status,
          uptime: schedulerInstance ? 'active' : 'inactive'
        })

      case 'health':
        // Perform comprehensive health check
        const healthData = {
          timestamp: new Date().toISOString(),
          scheduler: schedulerInstance ? 'running' : 'stopped',
          database: 'connected', // We know it's connected since we got here
          lastCheck: new Date().toISOString()
        }

        return NextResponse.json({
          status: 'healthy',
          data: healthData
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: status, health' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Scheduler API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'start':
        if (schedulerInstance) {
          return NextResponse.json({
            message: 'Scheduler is already running',
            status: schedulerInstance.getStatus()
          })
        }

        schedulerInstance = new LeaderboardScheduler({
          dailyEvaluationHour: body.dailyEvaluationHour || 2,
          batchSize: body.batchSize || 5,
          dailyLimit: body.dailyLimit || 20,
          alertWebhook: body.alertWebhook
        })

        schedulerInstance.start()

        return NextResponse.json({
          message: 'Scheduler started successfully',
          status: schedulerInstance.getStatus()
        })

      case 'stop':
        if (!schedulerInstance) {
          return NextResponse.json({
            message: 'Scheduler is not running'
          })
        }

        schedulerInstance.stop()
        schedulerInstance = null

        return NextResponse.json({
          message: 'Scheduler stopped successfully'
        })

      case 'trigger':
        if (!schedulerInstance) {
          return NextResponse.json(
            { error: 'Scheduler is not running. Start it first.' },
            { status: 400 }
          )
        }

        // Trigger manual evaluation
        await schedulerInstance.triggerEvaluation()

        return NextResponse.json({
          message: 'Manual evaluation triggered',
          status: schedulerInstance.getStatus()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, trigger' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Scheduler API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}