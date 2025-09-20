/**
 * Netlify Scheduled Function: Process Leaderboard Evaluation Queue
 * Runs periodically to process pending evaluations and refresh leaderboard cache.
 * Schedule is configured in netlify.toml under [functions."scheduled-leaderboard-queue"].schedule
 */
export const handler = async () => {
  const startedAt = Date.now();
  try {
    const { LeaderboardPopulationService } = await import('../../src/lib/leaderboard-population-service');

    // Default config is fine; service enforces daily limits and batching internally
    const service = LeaderboardPopulationService.getInstance();

    // Process pending evaluations (handles retries, status updates)
    await service.processEvaluationQueue();

    // Optional maintenance: clean up expired cache entries
    await service.cleanupExpiredCache();

    const tookMs = Date.now() - startedAt;
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, action: 'process_queue', tookMs })
    };
  } catch (error: any) {
    console.error('Scheduled queue processing failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: error?.message || 'Unknown error'
      })
    };
  }
};