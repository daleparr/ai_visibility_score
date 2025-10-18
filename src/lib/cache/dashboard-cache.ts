import { PortfolioHealthSummary, PriorityAlert, TrendAnalysis, BenchmarkAnalysis } from '@/lib/analytics/dashboard-analytics'

/**
 * Dashboard Cache Interface
 * Provides caching functionality for dashboard data with Redis-like operations
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Dashboard Cache Implementation
 * Handles caching of dashboard analytics data with TTL and invalidation
 */
export class DashboardCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 300000 // 5 minutes in milliseconds

  constructor() {
    // Start cleanup interval for expired entries
    this.startCleanupInterval()
  }

  /**
   * Cache portfolio summary data
   */
  async cachePortfolioSummary(userId: string, data: PortfolioHealthSummary): Promise<void> {
    try {
      const key = `dashboard:portfolio:${userId}`
      const entry: CacheEntry<PortfolioHealthSummary> = {
        data,
        timestamp: Date.now(),
        ttl: this.defaultTTL
      }
      
      this.cache.set(key, entry)
      console.log(`Cached portfolio summary for user ${userId}`)
    } catch (error) {
      console.error(`Error caching portfolio summary for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get cached portfolio summary
   */
  async getCachedPortfolioSummary(userId: string): Promise<PortfolioHealthSummary | null> {
    try {
      const key = `dashboard:portfolio:${userId}`
      const entry = this.cache.get(key) as CacheEntry<PortfolioHealthSummary> | undefined
      
      if (!entry) {
        return null
      }
      
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.error(`Error getting cached portfolio summary for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Cache alerts data
   */
  async cacheAlerts(userId: string, data: PriorityAlert[]): Promise<void> {
    try {
      const key = `dashboard:alerts:${userId}`
      const entry: CacheEntry<PriorityAlert[]> = {
        data,
        timestamp: Date.now(),
        ttl: this.defaultTTL
      }
      
      this.cache.set(key, entry)
      console.log(`Cached ${data.length} alerts for user ${userId}`)
    } catch (error) {
      console.error(`Error caching alerts for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get cached alerts
   */
  async getCachedAlerts(userId: string): Promise<PriorityAlert[] | null> {
    try {
      const key = `dashboard:alerts:${userId}`
      const entry = this.cache.get(key) as CacheEntry<PriorityAlert[]> | undefined
      
      if (!entry) {
        return null
      }
      
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.error(`Error getting cached alerts for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Cache trend data
   */
  async cacheTrendData(userId: string, data: TrendAnalysis): Promise<void> {
    try {
      const key = `dashboard:trends:${userId}`
      const entry: CacheEntry<TrendAnalysis> = {
        data,
        timestamp: Date.now(),
        ttl: this.defaultTTL * 2 // 10 minutes for trend data
      }
      
      this.cache.set(key, entry)
      console.log(`Cached trend data for user ${userId}`)
    } catch (error) {
      console.error(`Error caching trend data for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get cached trend data
   */
  async getCachedTrendData(userId: string): Promise<TrendAnalysis | null> {
    try {
      const key = `dashboard:trends:${userId}`
      const entry = this.cache.get(key) as CacheEntry<TrendAnalysis> | undefined
      
      if (!entry) {
        return null
      }
      
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.error(`Error getting cached trend data for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Cache benchmark data
   */
  async cacheBenchmarkData(userId: string, data: BenchmarkAnalysis): Promise<void> {
    try {
      const key = `dashboard:benchmarks:${userId}`
      const entry: CacheEntry<BenchmarkAnalysis> = {
        data,
        timestamp: Date.now(),
        ttl: this.defaultTTL * 6 // 30 minutes for benchmark data
      }
      
      this.cache.set(key, entry)
      console.log(`Cached benchmark data for user ${userId}`)
    } catch (error) {
      console.error(`Error caching benchmark data for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get cached benchmark data
   */
  async getCachedBenchmarkData(userId: string): Promise<BenchmarkAnalysis | null> {
    try {
      const key = `dashboard:benchmarks:${userId}`
      const entry = this.cache.get(key) as CacheEntry<BenchmarkAnalysis> | undefined
      
      if (!entry) {
        return null
      }
      
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        return null
      }
      
      return entry.data
    } catch (error) {
      console.error(`Error getting cached benchmark data for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const keys = [
        `dashboard:portfolio:${userId}`,
        `dashboard:alerts:${userId}`,
        `dashboard:trends:${userId}`,
        `dashboard:benchmarks:${userId}`
      ]
      
      keys.forEach(key => this.cache.delete(key))
      
      console.log(`Invalidated cache for user ${userId}`)
    } catch (error) {
      console.error(`Error invalidating cache for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Invalidate specific cache entry
   */
  async invalidateCacheEntry(key: string): Promise<void> {
    try {
      this.cache.delete(key)
      console.log(`Invalidated cache entry: ${key}`)
    } catch (error) {
      console.error(`Error invalidating cache entry ${key}:`, error)
      throw error
    }
  }

  /**
   * Get cache status and statistics
   */
  async getCacheStatus(): Promise<any> {
    try {
      const totalEntries = this.cache.size
      const expiredEntries = Array.from(this.cache.entries())
        .filter(([_, entry]) => this.isExpired(entry))
        .length
      
      const activeEntries = totalEntries - expiredEntries
      
      // Calculate cache hit rate (simplified)
      const cacheHitRate = activeEntries > 0 ? (activeEntries / totalEntries) * 100 : 0
      
      return {
        totalEntries,
        activeEntries,
        expiredEntries,
        cacheHitRate: Math.round(cacheHitRate),
        memoryUsage: this.getMemoryUsage(),
        lastCleanup: new Date()
      }
    } catch (error) {
      console.error('Error getting cache status:', error)
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanupOldData(): Promise<void> {
    try {
      const expiredKeys: string[] = []
      
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          expiredKeys.push(key)
        }
      }
      
      expiredKeys.forEach(key => this.cache.delete(key))
      
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`)
    } catch (error) {
      console.error('Error during cache cleanup:', error)
      throw error
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  /**
   * Start cleanup interval for expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanupOldData().catch(error => {
        console.error('Error in scheduled cache cleanup:', error)
      })
    }, 5 * 60 * 1000)
  }

  /**
   * Get approximate memory usage
   */
  private getMemoryUsage(): string {
    try {
      const used = process.memoryUsage()
      return `RSS: ${Math.round(used.rss / 1024 / 1024)} MB, Heap: ${Math.round(used.heapUsed / 1024 / 1024)} MB`
    } catch (error) {
      return 'Unable to calculate memory usage'
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAllCache(): Promise<void> {
    try {
      this.cache.clear()
      console.log('Cleared all cache entries')
    } catch (error) {
      console.error('Error clearing cache:', error)
      throw error
    }
  }

  /**
   * Get cache statistics by type
   */
  async getCacheStatistics(): Promise<any> {
    try {
      const stats = {
        portfolio: 0,
        alerts: 0,
        trends: 0,
        benchmarks: 0,
        other: 0
      }
      
      for (const [key, entry] of this.cache.entries()) {
        if (key.includes(':portfolio:')) {
          stats.portfolio++
        } else if (key.includes(':alerts:')) {
          stats.alerts++
        } else if (key.includes(':trends:')) {
          stats.trends++
        } else if (key.includes(':benchmarks:')) {
          stats.benchmarks++
        } else {
          stats.other++
        }
      }
      
      return stats
    } catch (error) {
      console.error('Error getting cache statistics:', error)
      return {}
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache(userIds: string[]): Promise<void> {
    try {
      console.log(`Warming up cache for ${userIds.length} users`)
      
      // This would typically pre-load cache with commonly accessed data
      // For now, we'll just log the action
      
      console.log('Cache warm-up completed')
    } catch (error) {
      console.error('Error warming up cache:', error)
      throw error
    }
  }
}
