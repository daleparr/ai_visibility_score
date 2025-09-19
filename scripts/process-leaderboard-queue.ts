import { LeaderboardPopulationService } from '../src/lib/leaderboard-population-service'

/**
 * Queue processing script for leaderboard evaluations
 * This processes pending evaluations in the queue
 */
async function processLeaderboardQueue() {
  console.log('🔄 Starting leaderboard queue processing...')
  
  try {
    const service = LeaderboardPopulationService.getInstance({
      batchSize: 5,
      dailyLimit: 20,
      retryAttempts: 3,
      cacheExpiryDays: 30
    })

    // Get current queue stats
    const initialStats = await service.getQueueStats()
    console.log('📊 Initial queue stats:', initialStats)

    if (initialStats.pending === 0) {
      console.log('✅ No pending evaluations in queue')
      return
    }

    // Process the queue
    await service.processEvaluationQueue()
    
    // Get updated stats
    const finalStats = await service.getQueueStats()
    console.log('📊 Final queue stats:', finalStats)
    
    console.log('✅ Queue processing completed!')
    
  } catch (error) {
    console.error('❌ Error processing leaderboard queue:', error)
    process.exit(1)
  }
}

// Run the processing function
processLeaderboardQueue()