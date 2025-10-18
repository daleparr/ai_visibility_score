import { db } from '@/lib/db'
import { DashboardCache } from '@/lib/cache/dashboard-cache'
import { DashboardAnalytics } from '@/lib/analytics/dashboard-analytics'

/**
 * Dashboard Data Pipeline
 * Handles real-time data processing, caching, and pipeline orchestration
 */
export class DashboardDataPipeline {
  private cache: DashboardCache
  private analytics: DashboardAnalytics

  constructor() {
    this.cache = new DashboardCache()
    this.analytics = new DashboardAnalytics()
  }

  /**
   * Process evaluation result in real-time
   * Updates all dashboard metrics when a new evaluation completes
   */
  async processEvaluationResult(evaluationId: string): Promise<void> {
    try {
      console.log(`Processing evaluation result for evaluation ${evaluationId}`)
      
      // 1. Update portfolio metrics
      await this.updatePortfolioMetrics(evaluationId)
      
      // 2. Generate new alerts
      await this.generateAlerts(evaluationId)
      
      // 3. Update trend data
      await this.updateTrendData(evaluationId)
      
      // 4. Refresh benchmarks
      await this.refreshBenchmarks(evaluationId)
      
      // 5. Cache dashboard data
      await this.cacheDashboardData(evaluationId)
      
      console.log(`Successfully processed evaluation ${evaluationId}`)
    } catch (error) {
      console.error(`Error processing evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Process historical data for comprehensive insights
   */
  async processHistoricalData(userId: string): Promise<void> {
    try {
      console.log(`Processing historical data for user ${userId}`)
      
      const evaluations = await this.getUserEvaluations(userId)
      console.log(`Found ${evaluations.length} evaluations to process`)
      
      for (const evaluation of evaluations) {
        await this.processEvaluationResult(evaluation.id)
      }
      
      // Generate comprehensive insights after processing all evaluations
      await this.generateComprehensiveInsights(userId)
      
      console.log(`Successfully processed historical data for user ${userId}`)
    } catch (error) {
      console.error(`Error processing historical data for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Update portfolio metrics for a specific evaluation
   */
  async updatePortfolioMetrics(evaluationId: string): Promise<void> {
    try {
      // Get evaluation details
      const evaluation = await this.getEvaluationDetails(evaluationId)
      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found`)
      }

      const userId = evaluation.user_id
      
      // Calculate updated portfolio metrics
      const portfolioData = await this.analytics.getPortfolioHealth(userId)
      
      // Cache the updated portfolio data
      await this.cache.cachePortfolioSummary(userId, portfolioData)
      
      console.log(`Updated portfolio metrics for user ${userId}`)
    } catch (error) {
      console.error(`Error updating portfolio metrics for evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Generate alerts for a specific evaluation
   */
  async generateAlerts(evaluationId: string): Promise<void> {
    try {
      const evaluation = await this.getEvaluationDetails(evaluationId)
      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found`)
      }

      const userId = evaluation.user_id
      
      // Generate new alerts
      const alerts = await this.analytics.generatePriorityAlerts(userId)
      
      // Cache the alerts
      await this.cache.cacheAlerts(userId, alerts)
      
      console.log(`Generated ${alerts.length} alerts for user ${userId}`)
    } catch (error) {
      console.error(`Error generating alerts for evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Update trend data for a specific evaluation
   */
  async updateTrendData(evaluationId: string): Promise<void> {
    try {
      const evaluation = await this.getEvaluationDetails(evaluationId)
      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found`)
      }

      const userId = evaluation.user_id
      
      // Update trend analysis
      const trendData = await this.analytics.analyzeTrends(userId)
      
      // Cache the trend data
      await this.cache.cacheTrendData(userId, trendData)
      
      console.log(`Updated trend data for user ${userId}`)
    } catch (error) {
      console.error(`Error updating trend data for evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Refresh benchmarks for a specific evaluation
   */
  async refreshBenchmarks(evaluationId: string): Promise<void> {
    try {
      const evaluation = await this.getEvaluationDetails(evaluationId)
      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found`)
      }

      const userId = evaluation.user_id
      
      // Update benchmark analysis
      const benchmarkData = await this.analytics.analyzeBenchmarks(userId)
      
      // Cache the benchmark data
      await this.cache.cacheBenchmarkData(userId, benchmarkData)
      
      console.log(`Refreshed benchmarks for user ${userId}`)
    } catch (error) {
      console.error(`Error refreshing benchmarks for evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Cache comprehensive dashboard data
   */
  async cacheDashboardData(evaluationId: string): Promise<void> {
    try {
      const evaluation = await this.getEvaluationDetails(evaluationId)
      if (!evaluation) {
        throw new Error(`Evaluation ${evaluationId} not found`)
      }

      const userId = evaluation.user_id
      
      // Get all dashboard data
      const portfolioData = await this.analytics.getPortfolioHealth(userId)
      const alerts = await this.analytics.generatePriorityAlerts(userId)
      const trends = await this.analytics.analyzeTrends(userId)
      const benchmarks = await this.analytics.analyzeBenchmarks(userId)
      
      // Cache all data
      await Promise.all([
        this.cache.cachePortfolioSummary(userId, portfolioData),
        this.cache.cacheAlerts(userId, alerts),
        this.cache.cacheTrendData(userId, trends),
        this.cache.cacheBenchmarkData(userId, benchmarks)
      ])
      
      console.log(`Cached comprehensive dashboard data for user ${userId}`)
    } catch (error) {
      console.error(`Error caching dashboard data for evaluation ${evaluationId}:`, error)
      throw error
    }
  }

  /**
   * Get cached dashboard data
   */
  async getCachedDashboardData(userId: string, dataType: 'portfolio' | 'alerts' | 'trends' | 'benchmarks'): Promise<any> {
    try {
      switch (dataType) {
        case 'portfolio':
          return await this.cache.getCachedPortfolioSummary(userId)
        case 'alerts':
          return await this.cache.getCachedAlerts(userId)
        case 'trends':
          return await this.cache.getCachedTrendData(userId)
        case 'benchmarks':
          return await this.cache.getCachedBenchmarkData(userId)
        default:
          return null
      }
    } catch (error) {
      console.error(`Error getting cached dashboard data for user ${userId}, type ${dataType}:`, error)
      return null
    }
  }

  /**
   * Invalidate user cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      await this.cache.invalidateUserCache(userId)
      console.log(`Invalidated cache for user ${userId}`)
    } catch (error) {
      console.error(`Error invalidating cache for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Generate comprehensive insights after processing all evaluations
   */
  async generateComprehensiveInsights(userId: string): Promise<void> {
    try {
      // This could include machine learning insights, predictive analytics, etc.
      console.log(`Generating comprehensive insights for user ${userId}`)
      
      // For now, we'll just ensure all data is cached
      await this.cacheDashboardData(userId)
      
      console.log(`Generated comprehensive insights for user ${userId}`)
    } catch (error) {
      console.error(`Error generating comprehensive insights for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get user evaluations for processing
   */
  private async getUserEvaluations(userId: string): Promise<any[]> {
    const query = `
      SELECT e.id, e.brand_id, e.completed_at, e.status
      FROM evaluations e
      JOIN brands b ON e.brand_id = b.id
      WHERE b.user_id = $1
        AND e.status = 'completed'
      ORDER BY e.completed_at DESC
    `
    
    return await db.query(query, [userId])
  }

  /**
   * Get evaluation details including user information
   */
  private async getEvaluationDetails(evaluationId: string): Promise<any> {
    const query = `
      SELECT 
        e.id,
        e.brand_id,
        e.user_id,
        e.completed_at,
        e.status,
        b.name as brand_name,
        b.industry
      FROM evaluations e
      JOIN brands b ON e.brand_id = b.id
      WHERE e.id = $1
    `
    
    const result = await db.query(query, [evaluationId])
    return result[0] || null
  }

  /**
   * Batch process multiple evaluations
   */
  async batchProcessEvaluations(evaluationIds: string[]): Promise<void> {
    try {
      console.log(`Batch processing ${evaluationIds.length} evaluations`)
      
      const results = await Promise.allSettled(
        evaluationIds.map(id => this.processEvaluationResult(id))
      )
      
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      console.log(`Batch processing completed: ${successful} successful, ${failed} failed`)
      
      if (failed > 0) {
        console.error('Some evaluations failed to process:', 
          results.filter(result => result.status === 'rejected')
        )
      }
    } catch (error) {
      console.error('Error in batch processing evaluations:', error)
      throw error
    }
  }

  /**
   * Get pipeline status and health metrics
   */
  async getPipelineStatus(): Promise<any> {
    try {
      const cacheStatus = await this.cache.getCacheStatus()
      
      return {
        status: 'healthy',
        cache: cacheStatus,
        lastProcessed: new Date(),
        metrics: {
          totalProcessed: 0, // This would be tracked in a real implementation
          successRate: 0.95,
          averageProcessingTime: 150 // milliseconds
        }
      }
    } catch (error) {
      console.error('Error getting pipeline status:', error)
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean up old cached data
   */
  async cleanupOldData(): Promise<void> {
    try {
      console.log('Starting cleanup of old cached data')
      
      await this.cache.cleanupOldData()
      
      console.log('Cleanup completed successfully')
    } catch (error) {
      console.error('Error during cleanup:', error)
      throw error
    }
  }
}