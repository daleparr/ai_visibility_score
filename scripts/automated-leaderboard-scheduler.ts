import { LeaderboardPopulationService } from '../src/lib/leaderboard-population-service'
import { db } from '../src/lib/db'
import { leaderboardCache } from '../src/lib/db/schema'
import { count, sql } from 'drizzle-orm'

/**
 * Automated Leaderboard Evaluation Scheduler
 * Runs daily evaluations with comprehensive monitoring and error handling
 */

interface SchedulerConfig {
  dailyEvaluationHour: number // 0-23, default 2 (2 AM)
  batchSize: number
  dailyLimit: number
  retryAttempts: number
  alertWebhook?: string
  logLevel: 'info' | 'debug' | 'error'
}

interface SchedulerStatus {
  isRunning: boolean
  lastRunStatus: 'success' | 'error' | 'partial' | 'never'
  lastRunTime?: Date
  consecutiveFailures: number
  nextRunTime?: Date
}

class LeaderboardScheduler {
  private config: SchedulerConfig
  private service: LeaderboardPopulationService
  private status: SchedulerStatus
  private intervalId?: NodeJS.Timeout

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      dailyEvaluationHour: 2, // 2 AM
      batchSize: 5,
      dailyLimit: 20,
      retryAttempts: 3,
      logLevel: 'info',
      ...config
    }

    this.service = LeaderboardPopulationService.getInstance({
      batchSize: this.config.batchSize,
      dailyLimit: this.config.dailyLimit,
      retryAttempts: this.config.retryAttempts,
      intervalMinutes: 30,
      cacheExpiryDays: 30
    })

    this.status = {
      isRunning: false,
      lastRunStatus: 'never',
      consecutiveFailures: 0
    }
  }

  /**
   * Start the automated scheduler
   */
  start(): void {
    console.log(`🕐 Starting automated leaderboard scheduler...`)
    console.log(`📅 Daily evaluation time: ${this.config.dailyEvaluationHour}:00 UTC`)
    console.log(`⚙️ Batch size: ${this.config.batchSize}, Daily limit: ${this.config.dailyLimit}`)

    // Calculate next run time
    this.calculateNextRunTime()

    // Check every hour if it's time to run
    this.intervalId = setInterval(async () => {
      await this.checkAndRun()
    }, 60 * 60 * 1000) // Every hour

    // Also perform immediate health check
    this.performHealthCheck()

    console.log('✅ Automated scheduler started successfully')
    console.log(`⏰ Next evaluation: ${this.status.nextRunTime?.toISOString()}`)
  }

  /**
   * Calculate next run time
   */
  private calculateNextRunTime(): void {
    const now = new Date()
    const nextRun = new Date()
    nextRun.setUTCHours(this.config.dailyEvaluationHour, 0, 0, 0)

    // If we've passed today's time, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1)
    }

    this.status.nextRunTime = nextRun
  }

  /**
   * Check if it's time to run and execute if needed
   */
  private async checkAndRun(): Promise<void> {
    const now = new Date()
    
    if (this.status.nextRunTime && now >= this.status.nextRunTime && !this.status.isRunning) {
      await this.runDailyEvaluation()
      this.calculateNextRunTime() // Schedule next run
    }

    // Perform hourly health check
    if (now.getMinutes() === 0) { // Top of the hour
      await this.performHealthCheck()
    }
  }

  /**
   * Run daily evaluation batch
   * Processes genuine ADI evaluations for brands in the queue
   */
  private async runDailyEvaluation(): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('🕐 STARTING DAILY AUTOMATED EVALUATION RUN')
    console.log(`⏰ Time: ${new Date().toISOString()}`)
    console.log('='.repeat(80) + '\n')

    this.status.isRunning = true
    const startTime = Date.now()

    try {
      // Process batch of evaluations
      console.log(`📊 Processing batch of ${this.config.batchSize} brands...`)
      console.log(`📈 Daily limit: ${this.config.dailyLimit} evaluations`)
      
      const result = await this.service.processBatchEvaluations(this.config.batchSize)
      
      const duration = Date.now() - startTime
      const durationMinutes = Math.round(duration / 60000)

      // Update status
      if (result.failed === 0) {
        this.status.lastRunStatus = 'success'
        this.status.consecutiveFailures = 0
      } else if (result.successful > 0) {
        this.status.lastRunStatus = 'partial'
        this.status.consecutiveFailures = 0
      } else {
        this.status.lastRunStatus = 'error'
        this.status.consecutiveFailures++
      }

      this.status.lastRunTime = new Date()

      // Send success notification
      await this.sendNotification('success', {
        message: 'Daily evaluation completed',
        processed: result.processed,
        successful: result.successful,
        failed: result.failed,
        duration: `${durationMinutes} minutes`,
        timestamp: new Date().toISOString()
      })

      console.log('\n' + '='.repeat(80))
      console.log('✅ DAILY EVALUATION COMPLETE')
      console.log(`⏱️  Duration: ${durationMinutes} minutes`)
      console.log(`📊 Success rate: ${result.processed > 0 ? Math.round((result.successful / result.processed) * 100) : 0}%`)
      console.log('='.repeat(80) + '\n')

    } catch (error: any) {
      const duration = Date.now() - startTime
      console.error('❌ Daily evaluation failed:', error)
      
      this.status.lastRunStatus = 'error'
      this.status.lastRunTime = new Date()
      this.status.consecutiveFailures++

      // Send error notification
      await this.sendNotification('error', {
        message: 'Daily evaluation failed',
        error: error.message,
        consecutiveFailures: this.status.consecutiveFailures,
        duration: `${Math.round(duration / 60000)} minutes`,
        timestamp: new Date().toISOString()
      })

      // Alert on critical failure (3+ consecutive failures)
      if (this.status.consecutiveFailures >= 3) {
        await this.sendNotification('critical', {
          message: `${this.status.consecutiveFailures} consecutive evaluation failures`,
          action: 'Manual intervention required',
          timestamp: new Date().toISOString()
        })
      }

    } finally {
      this.status.isRunning = false
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const cacheStats = await this.getCacheStats()
      
      console.log('🏥 Health check:', {
        cacheStats,
        schedulerStatus: this.status
      })

    } catch (error: any) {
      console.error('❌ Health check failed:', error)
    }
  }

  /**
   * Get cache statistics
   */
  private async getCacheStats(): Promise<{
    totalEntries: number
    expiredEntries: number
  }> {
    try {
      const totalEntries = await db.select({ count: count() }).from(leaderboardCache)
      const expiredEntries = await db.select({ count: count() })
        .from(leaderboardCache)
        .where(sql`cache_expires < NOW()`)
      
      return {
        totalEntries: totalEntries[0]?.count || 0,
        expiredEntries: expiredEntries[0]?.count || 0
      }
    } catch (error) {
      return { totalEntries: 0, expiredEntries: 0 }
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(
    type: 'success' | 'error' | 'warning', 
    data: any
  ): Promise<void> {
    const notification = {
      type,
      timestamp: new Date().toISOString(),
      service: 'leaderboard-scheduler',
      data
    }

    if (this.config.alertWebhook) {
      try {
        await fetch(this.config.alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        })
      } catch (error) {
        console.error('Failed to send webhook notification:', error)
      }
    }

    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'
    console.log(`${emoji} Notification [${type.toUpperCase()}]:`, JSON.stringify(notification, null, 2))
  }

  /**
   * Send critical alert
   */
  private async sendCriticalAlert(): Promise<void> {
    const alert = {
      level: 'CRITICAL',
      service: 'leaderboard-scheduler',
      message: `${this.status.consecutiveFailures} consecutive evaluation failures`,
      timestamp: new Date().toISOString(),
      action_required: 'Manual intervention needed'
    }

    console.error('🚨 CRITICAL ALERT:', alert)
    
    if (this.config.alertWebhook) {
      try {
        await fetch(this.config.alertWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        })
      } catch (error) {
        console.error('Failed to send critical alert:', error)
      }
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): SchedulerStatus {
    return { ...this.status }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    console.log('🛑 Stopping automated scheduler...')
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerEvaluation(): Promise<void> {
    console.log('🔧 Manual evaluation trigger...')
    await this.runDailyEvaluation()
  }
}

// Export for use in other modules
export { LeaderboardScheduler }

// CLI execution
if (require.main === module) {
  const scheduler = new LeaderboardScheduler({
    dailyEvaluationHour: parseInt(process.env.DAILY_EVALUATION_HOUR || '2'),
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    dailyLimit: parseInt(process.env.DAILY_LIMIT || '20'),
    alertWebhook: process.env.ALERT_WEBHOOK_URL,
    logLevel: (process.env.LOG_LEVEL as any) || 'info'
  })

  scheduler.start()

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    scheduler.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    scheduler.stop()
    process.exit(0)
  })

  console.log('🚀 Automated leaderboard scheduler is running...')
  console.log('📊 Status API: GET /api/leaderboard-scheduler/status')
  console.log('🔧 Manual trigger: POST /api/leaderboard-scheduler/trigger')
  console.log('Press Ctrl+C to stop')

  // Keep the process alive
  setInterval(() => {
    // Just keep alive, the scheduler handles everything
  }, 60000)
}