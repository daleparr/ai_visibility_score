/**
 * Intelligent Caching Layer for ADI Agents
 * 
 * Features:
 * - TTL-based expiration
 * - LRU eviction policy
 * - Cache warming strategies
 * - Intelligent invalidation
 * - Performance metrics
 * - Memory management
 */

export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

export interface CacheConfig {
  maxSize: number // Maximum number of entries
  defaultTtl: number // Default TTL in milliseconds
  maxMemoryMB: number // Maximum memory usage in MB
  cleanupInterval: number // Cleanup interval in milliseconds
}

export interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  totalRequests: number
  hitRate: number
  memoryUsageMB: number
  entryCount: number
}

export class IntelligentCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: CacheConfig
  private metrics: CacheMetrics
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxMemoryMB: 50, // 50MB
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    }

    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
      hitRate: 0,
      memoryUsageMB: 0,
      entryCount: 0
    }

    this.startCleanupTimer()
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    this.metrics.totalRequests++
    
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.metrics.misses++
      this.updateHitRate()
      return null
    }

    // Check if entry has expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.metrics.misses++
      this.updateHitRate()
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    
    this.metrics.hits++
    this.updateHitRate()
    
    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const entryTtl = ttl || this.config.defaultTtl
    const size = this.estimateSize(value)

    // Check if we need to make space
    this.ensureCapacity(size)

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: now,
      ttl: entryTtl,
      accessCount: 1,
      lastAccessed: now,
      size
    }

    this.cache.set(key, entry)
    this.updateMetrics()
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.updateMetrics()
    }
    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.updateMetrics()
  }

  /**
   * Get or set pattern - returns cached value or computes and caches new value
   */
  async getOrSet<R>(
    key: string, 
    factory: () => Promise<R>, 
    ttl?: number
  ): Promise<R> {
    const cached = this.get(key)
    if (cached !== null) {
      return cached as R
    }

    const value = await factory()
    this.set(key, value as T, ttl)
    return value
  }

  /**
   * Batch get multiple keys
   */
  getBatch(keys: string[]): Map<string, T> {
    const results = new Map<string, T>()
    
    for (const key of keys) {
      const value = this.get(key)
      if (value !== null) {
        results.set(key, value)
      }
    }
    
    return results
  }

  /**
   * Batch set multiple key-value pairs
   */
  setBatch(entries: Array<{ key: string, value: T, ttl?: number }>): void {
    for (const entry of entries) {
      this.set(entry.key, entry.value, entry.ttl)
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number
    memoryUsageMB: number
    oldestEntry: number
    newestEntry: number
    averageAccessCount: number
  } {
    const entries = Array.from(this.cache.values())
    
    if (entries.length === 0) {
      return {
        size: 0,
        memoryUsageMB: 0,
        oldestEntry: 0,
        newestEntry: 0,
        averageAccessCount: 0
      }
    }

    const timestamps = entries.map(e => e.timestamp)
    const accessCounts = entries.map(e => e.accessCount)
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0)

    return {
      size: entries.length,
      memoryUsageMB: totalSize / (1024 * 1024),
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
      averageAccessCount: accessCounts.reduce((sum, count) => sum + count, 0) / entries.length
    }
  }

  /**
   * Warm cache with predefined data
   */
  warm(data: Array<{ key: string, value: T, ttl?: number }>): void {
    console.log(`🔥 Warming cache with ${data.length} entries`)
    this.setBatch(data)
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        invalidated++
      }
    }
    
    if (invalidated > 0) {
      this.updateMetrics()
      console.log(`🗑️ Invalidated ${invalidated} cache entries matching pattern`)
    }
    
    return invalidated
  }

  /**
   * Get keys matching pattern
   */
  getKeysMatching(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter(key => pattern.test(key))
  }

  /**
   * Ensure cache has capacity for new entry
   */
  private ensureCapacity(newEntrySize: number): void {
    // Check memory limit
    const currentMemoryMB = this.calculateMemoryUsage()
    const newEntryMB = newEntrySize / (1024 * 1024)
    
    if (currentMemoryMB + newEntryMB > this.config.maxMemoryMB) {
      this.evictByMemory(newEntryMB)
    }

    // Check size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU(1)
    }
  }

  /**
   * Evict entries to free memory
   */
  private evictByMemory(requiredMB: number): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed) // LRU first

    let freedMB = 0
    let evicted = 0

    for (const { key, entry } of entries) {
      if (freedMB >= requiredMB) break
      
      this.cache.delete(key)
      freedMB += entry.size / (1024 * 1024)
      evicted++
    }

    this.metrics.evictions += evicted
    console.log(`🗑️ Evicted ${evicted} entries to free ${freedMB.toFixed(2)}MB`)
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed)

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i].key)
      this.metrics.evictions++
    }

    console.log(`🗑️ Evicted ${Math.min(count, entries.length)} LRU entries`)
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.updateMetrics()
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`)
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Stop cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2 // Rough estimate (UTF-16)
    } catch {
      return 1024 // Default 1KB for non-serializable values
    }
  }

  /**
   * Calculate current memory usage
   */
  private calculateMemoryUsage(): number {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    return totalSize / (1024 * 1024) // Convert to MB
  }

  /**
   * Update cache metrics
   */
  private updateMetrics(): void {
    this.metrics.entryCount = this.cache.size
    this.metrics.memoryUsageMB = this.calculateMemoryUsage()
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0
  }

  /**
   * Destroy cache and cleanup resources
   */
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }
}

/**
 * Cache Manager - manages multiple named caches
 */
export class CacheManager {
  private caches: Map<string, IntelligentCache> = new Map()

  /**
   * Get or create a named cache
   */
  getCache(name: string, config?: Partial<CacheConfig>): IntelligentCache {
    if (!this.caches.has(name)) {
      this.caches.set(name, new IntelligentCache(config))
    }
    return this.caches.get(name)!
  }

  /**
   * Get all cache metrics
   */
  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {}
    for (const [name, cache] of this.caches.entries()) {
      metrics[name] = cache.getMetrics()
    }
    return metrics
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear()
    }
  }

  /**
   * Destroy all caches
   */
  destroyAll(): void {
    for (const cache of this.caches.values()) {
      cache.destroy()
    }
    this.caches.clear()
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager()

/**
 * Decorator for automatic caching
 */
export function cached(
  cacheName: string, 
  keyGenerator?: (...args: any[]) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = cacheManager.getCache(cacheName)
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`
      
      return cache.getOrSet(key, () => method.apply(this, args), ttl)
    }

    return descriptor
  }
}

/**
 * Utility function for caching expensive operations
 */
export async function withCache<T>(
  cacheName: string,
  key: string,
  factory: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cache = cacheManager.getCache(cacheName)
  return cache.getOrSet(key, factory, ttl)
}
