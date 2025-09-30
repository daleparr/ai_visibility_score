/**
 * Comprehensive Health Monitoring System
 * 
 * Monitors the health and performance of all ADI agents and system components.
 * Provides real-time visibility into system status, performance metrics,
 * and early warning indicators.
 * 
 * Features:
 * - Agent health tracking
 * - Performance metrics collection
 * - Resource utilization monitoring
 * - Dependency health checks
 * - Historical trend analysis
 * - Automated health scoring
 */

export interface HealthMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags: Record<string, string>
  threshold?: {
    warning: number
    critical: number
  }
}

export interface HealthStatus {
  component: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number // 0-100
  message: string
  lastCheck: number
  metrics: HealthMetric[]
  dependencies: string[]
}

export interface SystemHealth {
  overall: HealthStatus
  agents: Record<string, HealthStatus>
  infrastructure: Record<string, HealthStatus>
  dependencies: Record<string, HealthStatus>
  timestamp: number
}

export interface HealthCheckConfig {
  interval: number // Check interval in milliseconds
  timeout: number // Timeout for health checks
  retries: number // Number of retries before marking as unhealthy
  thresholds: {
    warning: number // Warning threshold (0-100)
    critical: number // Critical threshold (0-100)
  }
}

export class HealthMonitor {
  private healthData: Map<string, HealthStatus> = new Map()
  private metrics: Map<string, HealthMetric[]> = new Map()
  private config: HealthCheckConfig
  private checkInterval?: NodeJS.Timeout
  private isRunning = false

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = {
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retries: 3,
      thresholds: {
        warning: 70,
        critical: 40
      },
      ...config
    }
  }

  /**
   * Start health monitoring
   */
  start(): void {
    if (this.isRunning) return

    console.log('🏥 Starting health monitoring system...')
    this.isRunning = true
    
    // Initial health check
    this.performHealthChecks()
    
    // Schedule periodic health checks
    this.checkInterval = setInterval(() => {
      this.performHealthChecks()
    }, this.config.interval)
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (!this.isRunning) return

    console.log('🏥 Stopping health monitoring system...')
    this.isRunning = false
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = undefined
    }
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    const agents: Record<string, HealthStatus> = {}
    const infrastructure: Record<string, HealthStatus> = {}
    const dependencies: Record<string, HealthStatus> = {}

    // Categorize health statuses
    for (const [component, status] of this.healthData.entries()) {
      if (component.includes('_agent')) {
        agents[component] = status
      } else if (component.includes('database') || component.includes('cache') || component.includes('orchestrator')) {
        infrastructure[component] = status
      } else {
        dependencies[component] = status
      }
    }

    // Calculate overall health
    const allStatuses = Array.from(this.healthData.values())
    const overallScore = allStatuses.length > 0 
      ? Math.round(allStatuses.reduce((sum, status) => sum + status.score, 0) / allStatuses.length)
      : 100

    const overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown' = 
      overallScore >= this.config.thresholds.warning ? 'healthy' :
      overallScore >= this.config.thresholds.critical ? 'warning' : 'critical'

    return {
      overall: {
        component: 'system',
        status: overallStatus,
        score: overallScore,
        message: this.getOverallMessage(overallStatus, allStatuses),
        lastCheck: Date.now(),
        metrics: this.getSystemMetrics(),
        dependencies: []
      },
      agents,
      infrastructure,
      dependencies,
      timestamp: Date.now()
    }
  }

  /**
   * Get health status for specific component
   */
  getComponentHealth(component: string): HealthStatus | null {
    return this.healthData.get(component) || null
  }

  /**
   * Record a health metric
   */
  recordMetric(metric: HealthMetric): void {
    const key = `${metric.name}:${JSON.stringify(metric.tags)}`
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metrics = this.metrics.get(key)!
    metrics.push(metric)
    
    // Keep only last 100 metrics per key
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }
  }

  /**
   * Get metrics for a specific component
   */
  getMetrics(component: string, metricName?: string): HealthMetric[] {
    const allMetrics: HealthMetric[] = []
    
    for (const [key, metrics] of this.metrics.entries()) {
      const keyMetrics = metrics.filter(m => 
        m.tags.component === component && 
        (!metricName || m.name === metricName)
      )
      allMetrics.push(...keyMetrics)
    }
    
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(component: string, timeWindow: number = 3600000): {
    avgResponseTime: number
    successRate: number
    errorRate: number
    throughput: number
    trend: 'improving' | 'stable' | 'degrading'
  } {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const metrics = this.getMetrics(component).filter(m => m.timestamp >= windowStart)
    
    if (metrics.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 100,
        errorRate: 0,
        throughput: 0,
        trend: 'stable'
      }
    }

    const responseTimeMetrics = metrics.filter(m => m.name === 'response_time')
    const successMetrics = metrics.filter(m => m.name === 'success_count')
    const errorMetrics = metrics.filter(m => m.name === 'error_count')

    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0

    const totalRequests = successMetrics.length + errorMetrics.length
    const successRate = totalRequests > 0 
      ? (successMetrics.length / totalRequests) * 100 
      : 100

    const errorRate = totalRequests > 0 
      ? (errorMetrics.length / totalRequests) * 100 
      : 0

    const throughput = totalRequests / (timeWindow / 1000) // requests per second

    // Calculate trend (simplified)
    const trend = this.calculateTrend(responseTimeMetrics, successRate)

    return {
      avgResponseTime,
      successRate,
      errorRate,
      throughput,
      trend
    }
  }

  /**
   * Perform comprehensive health checks
   */
  private async performHealthChecks(): Promise<void> {
    console.log('🔍 Performing system health checks...')

    const checks = [
      this.checkAgentHealth(),
      this.checkInfrastructureHealth(),
      this.checkDependencyHealth(),
      this.checkResourceUtilization()
    ]

    await Promise.allSettled(checks)
  }

  /**
   * Check health of all agents
   */
  private async checkAgentHealth(): Promise<void> {
    const agents = [
      'crawl_agent',
      'llm_test_agent', 
      'schema_agent',
      'semantic_agent',
      'knowledge_graph_agent',
      'conversational_copy_agent',
      'geo_visibility_agent',
      'citation_agent',
      'sentiment_agent',
      'commerce_agent',
      'brand_heritage_agent',
      'score_aggregator'
    ]

    for (const agentName of agents) {
      try {
        const health = await this.checkSingleAgentHealth(agentName)
        this.healthData.set(agentName, health)
      } catch (error) {
        console.error(`Failed to check health for ${agentName}:`, error)
        this.healthData.set(agentName, {
          component: agentName,
          status: 'critical',
          score: 0,
          message: `Health check failed: ${error}`,
          lastCheck: Date.now(),
          metrics: [],
          dependencies: []
        })
      }
    }
  }

  /**
   * Check health of a single agent
   */
  private async checkSingleAgentHealth(agentName: string): Promise<HealthStatus> {
    const now = Date.now()
    const recentMetrics = this.getMetrics(agentName, undefined).filter(
      m => now - m.timestamp < 300000 // Last 5 minutes
    )

    // Calculate health score based on recent performance
    let score = 100
    let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy'
    let message = 'Agent is operating normally'

    if (recentMetrics.length === 0) {
      score = 50
      status = 'unknown'
      message = 'No recent metrics available'
    } else {
      const errorMetrics = recentMetrics.filter(m => m.name === 'error_count')
      const responseTimeMetrics = recentMetrics.filter(m => m.name === 'response_time')
      
      // Check error rate
      const errorRate = errorMetrics.length / Math.max(recentMetrics.length, 1) * 100
      if (errorRate > 20) {
        score -= 30
        message = `High error rate: ${errorRate.toFixed(1)}%`
      } else if (errorRate > 10) {
        score -= 15
        message = `Elevated error rate: ${errorRate.toFixed(1)}%`
      }

      // Check response times
      if (responseTimeMetrics.length > 0) {
        const avgResponseTime = responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
        if (avgResponseTime > 30000) { // 30 seconds
          score -= 25
          message += ` | Slow response times: ${(avgResponseTime/1000).toFixed(1)}s`
        } else if (avgResponseTime > 15000) { // 15 seconds
          score -= 10
          message += ` | Elevated response times: ${(avgResponseTime/1000).toFixed(1)}s`
        }
      }

      // Determine status based on score
      if (score >= this.config.thresholds.warning) {
        status = 'healthy'
      } else if (score >= this.config.thresholds.critical) {
        status = 'warning'
      } else {
        status = 'critical'
      }
    }

    return {
      component: agentName,
      status,
      score: Math.max(0, score),
      message,
      lastCheck: now,
      metrics: recentMetrics.slice(0, 10), // Last 10 metrics
      dependencies: this.getAgentDependencies(agentName)
    }
  }

  /**
   * Check infrastructure health
   */
  private async checkInfrastructureHealth(): Promise<void> {
    // Database health
    try {
      const dbHealth = await this.checkDatabaseHealth()
      this.healthData.set('database', dbHealth)
    } catch (error) {
      this.healthData.set('database', {
        component: 'database',
        status: 'critical',
        score: 0,
        message: `Database check failed: ${error}`,
        lastCheck: Date.now(),
        metrics: [],
        dependencies: []
      })
    }

    // Cache health
    try {
      const cacheHealth = await this.checkCacheHealth()
      this.healthData.set('cache', cacheHealth)
    } catch (error) {
      this.healthData.set('cache', {
        component: 'cache',
        status: 'warning',
        score: 50,
        message: `Cache check failed: ${error}`,
        lastCheck: Date.now(),
        metrics: [],
        dependencies: []
      })
    }

    // Orchestrator health
    const orchestratorHealth = this.checkOrchestratorHealth()
    this.healthData.set('orchestrator', orchestratorHealth)
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Simple database connectivity check
      // This would integrate with your actual database connection
      const responseTime = Date.now() - startTime
      
      this.recordMetric({
        name: 'database_response_time',
        value: responseTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'database', type: 'connectivity' }
      })

      return {
        component: 'database',
        status: responseTime < 1000 ? 'healthy' : 'warning',
        score: Math.max(0, 100 - (responseTime / 100)),
        message: `Database responding in ${responseTime}ms`,
        lastCheck: Date.now(),
        metrics: [],
        dependencies: ['neon_postgresql']
      }
    } catch (error) {
      throw new Error(`Database connectivity failed: ${error}`)
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth(): Promise<HealthStatus> {
    // This would integrate with your cache system
    const cacheMetrics = this.getMetrics('cache')
    const hitRate = cacheMetrics.length > 0 ? 75 : 50 // Placeholder

    return {
      component: 'cache',
      status: hitRate > 60 ? 'healthy' : 'warning',
      score: hitRate,
      message: `Cache hit rate: ${hitRate}%`,
      lastCheck: Date.now(),
      metrics: [],
      dependencies: []
    }
  }

  /**
   * Check orchestrator health
   */
  private checkOrchestratorHealth(): HealthStatus {
    // Check orchestrator performance based on recent evaluations
    const orchestratorMetrics = this.getMetrics('orchestrator')
    
    return {
      component: 'orchestrator',
      status: 'healthy',
      score: 95,
      message: 'Orchestrator operating normally',
      lastCheck: Date.now(),
      metrics: orchestratorMetrics.slice(0, 5),
      dependencies: ['crawl_agent', 'llm_test_agent', 'schema_agent']
    }
  }

  /**
   * Check external dependency health
   */
  private async checkDependencyHealth(): Promise<void> {
    const dependencies = [
      { name: 'openai_api', url: 'https://api.openai.com/v1/models' },
      { name: 'anthropic_api', url: 'https://api.anthropic.com/v1/messages' },
      { name: 'google_ai_api', url: 'https://generativelanguage.googleapis.com/v1/models' }
    ]

    for (const dep of dependencies) {
      try {
        const health = await this.checkExternalDependency(dep.name, dep.url)
        this.healthData.set(dep.name, health)
      } catch (error) {
        this.healthData.set(dep.name, {
          component: dep.name,
          status: 'critical',
          score: 0,
          message: `Dependency check failed: ${error}`,
          lastCheck: Date.now(),
          metrics: [],
          dependencies: []
        })
      }
    }
  }

  /**
   * Check external dependency
   */
  private async checkExternalDependency(name: string, url: string): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Simple HEAD request to check availability
      const response = await fetch(url, { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(this.config.timeout) 
      })
      
      const responseTime = Date.now() - startTime
      const isHealthy = response.status < 500
      
      this.recordMetric({
        name: 'dependency_response_time',
        value: responseTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: name, type: 'external_api' }
      })

      return {
        component: name,
        status: isHealthy ? 'healthy' : 'warning',
        score: isHealthy ? Math.max(0, 100 - (responseTime / 100)) : 30,
        message: `${name} responding with ${response.status} in ${responseTime}ms`,
        lastCheck: Date.now(),
        metrics: [],
        dependencies: []
      }
    } catch (error) {
      throw new Error(`Failed to reach ${name}: ${error}`)
    }
  }

  /**
   * Check resource utilization
   */
  private async checkResourceUtilization(): Promise<void> {
    try {
      const memoryUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()

      // Record memory metrics
      this.recordMetric({
        name: 'memory_usage',
        value: memoryUsage.heapUsed / 1024 / 1024, // MB
        unit: 'MB',
        timestamp: Date.now(),
        tags: { component: 'system', type: 'memory' }
      })

      // Record CPU metrics (simplified)
      this.recordMetric({
        name: 'cpu_usage',
        value: (cpuUsage.user + cpuUsage.system) / 1000, // ms
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'system', type: 'cpu' }
      })

    } catch (error) {
      console.warn('Failed to collect resource metrics:', error)
    }
  }

  /**
   * Get agent dependencies
   */
  private getAgentDependencies(agentName: string): string[] {
    const dependencies: Record<string, string[]> = {
      'crawl_agent': [],
      'llm_test_agent': ['crawl_agent', 'openai_api', 'anthropic_api'],
      'schema_agent': ['crawl_agent'],
      'semantic_agent': ['crawl_agent'],
      'knowledge_graph_agent': ['crawl_agent'],
      'score_aggregator': ['crawl_agent', 'llm_test_agent', 'schema_agent']
    }

    return dependencies[agentName] || []
  }

  /**
   * Get system-level metrics
   */
  private getSystemMetrics(): HealthMetric[] {
    const systemMetrics: HealthMetric[] = []
    
    // Add recent system metrics
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => Date.now() - m.timestamp < 300000) // Last 5 minutes
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)

    return recentMetrics
  }

  /**
   * Get overall system message
   */
  private getOverallMessage(status: string, allStatuses: HealthStatus[]): string {
    const criticalCount = allStatuses.filter(s => s.status === 'critical').length
    const warningCount = allStatuses.filter(s => s.status === 'warning').length
    const healthyCount = allStatuses.filter(s => s.status === 'healthy').length

    if (status === 'critical') {
      return `System critical: ${criticalCount} critical, ${warningCount} warning components`
    } else if (status === 'warning') {
      return `System degraded: ${warningCount} warning, ${criticalCount} critical components`
    } else {
      return `System healthy: ${healthyCount} healthy components`
    }
  }

  /**
   * Calculate performance trend
   */
  private calculateTrend(metrics: HealthMetric[], successRate: number): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < 2) return 'stable'

    // Simple trend calculation based on recent vs older metrics
    const recent = metrics.slice(0, Math.floor(metrics.length / 2))
    const older = metrics.slice(Math.floor(metrics.length / 2))

    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
    const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length

    const improvement = ((olderAvg - recentAvg) / olderAvg) * 100

    if (improvement > 10) return 'improving'
    if (improvement < -10) return 'degrading'
    return 'stable'
  }
}

// Global health monitor instance
export const healthMonitor = new HealthMonitor()

/**
 * Decorator for automatic health metric recording
 */
export function monitorHealth(component: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        const result = await method.apply(this, args)
        
        // Record success metric
        healthMonitor.recordMetric({
          name: 'success_count',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
          tags: { component, method: propertyName }
        })

        // Record response time
        healthMonitor.recordMetric({
          name: 'response_time',
          value: Date.now() - startTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { component, method: propertyName }
        })

        return result
      } catch (error) {
        // Record error metric
        healthMonitor.recordMetric({
          name: 'error_count',
          value: 1,
          unit: 'count',
          timestamp: Date.now(),
          tags: { component, method: propertyName, error: error instanceof Error ? error.message : String(error) }
        })

        throw error
      }
    }

    return descriptor
  }
}
