/**
 * Netlify Scheduled Function: Process Leaderboard Evaluation Queue
 * Runs periodically to process pending evaluations and refresh leaderboard cache.
 * Schedule is configured in netlify.toml under [functions."scheduled-leaderboard-queue"].schedule
 * 
 * This function executes GENUINE ADI evaluations with full multi-agent orchestration.
 * All probe results, agent outputs, and HTML content are saved to Neon database.
 */
export const handler = async () => {
  const startedAt = Date.now();
  
  console.log('\n' + '='.repeat(80))
  console.log('🕐 NETLIFY SCHEDULED EVALUATION JOB STARTED')
  console.log(`⏰ Time: ${new Date().toISOString()}`)
  console.log('='.repeat(80) + '\n')
  
  try {
    const { LeaderboardPopulationService } = await import('../../src/lib/leaderboard-population-service');

    // Initialize service with configuration
    const service = LeaderboardPopulationService.getInstance({
      batchSize: 5,        // Process 5 brands per run
      dailyLimit: 20,      // Maximum 20 evaluations per day
      retryAttempts: 3,    // Retry failed evaluations 3 times
      cacheExpiryDays: 30  // Cache results for 30 days
    });

    console.log('📊 Processing genuine brand evaluations...')

    // Process batch of pending evaluations
    // This runs REAL ADI evaluations with full agent orchestration
    const result = await service.processBatchEvaluations();

    console.log('\n' + '='.repeat(80))
    console.log('✅ BATCH PROCESSING COMPLETE')
    console.log(`📈 Processed: ${result.processed}`)
    console.log(`✅ Successful: ${result.successful}`)
    console.log(`❌ Failed: ${result.failed}`)
    console.log('='.repeat(80) + '\n')

    // Clean up expired cache entries
    console.log('🧹 Cleaning up expired cache...')
    await service.cleanupExpiredCache();

    const tookMs = Date.now() - startedAt;
    const tookMinutes = Math.round(tookMs / 60000);

    console.log('\n' + '='.repeat(80))
    console.log('✅ SCHEDULED JOB COMPLETE')
    console.log(`⏱️  Duration: ${tookMinutes} minutes`)
    console.log(`📊 Success rate: ${result.processed > 0 ? Math.round((result.successful / result.processed) * 100) : 0}%`)
    console.log('='.repeat(80) + '\n')

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        ok: true, 
        action: 'process_genuine_evaluations',
        stats: {
          processed: result.processed,
          successful: result.successful,
          failed: result.failed,
          errors: result.errors,
          durationMs: tookMs,
          durationMinutes: tookMinutes
        }
      })
    };
  } catch (error: any) {
    console.error('❌ Scheduled queue processing failed:', error);
    const tookMs = Date.now() - startedAt;
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error?.message || 'Unknown error',
        durationMs: tookMs
      })
    };
  }
};