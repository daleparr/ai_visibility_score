/**
 * Performance Metrics Collection System
 * 
 * Collects, aggregates, and analyzes performance metrics across the ADI system.
 * Provides insights into system performance, bottlenecks, and optimization opportunities.
 * 
 * Features:
 * - Real-time metric collection
 * - Statistical aggregation
 * - Performance benchmarking
 * - Bottleneck identification
 * - Historical analysis
 * - Custom metric types
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: number
  tags: Record<string, string>
  metadata?: Record<string, any>
}

export interface MetricAggregation {
  count: number
  sum: number
  avg: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
  stdDev: number
}

export interface PerformanceBenchmark {
  component: string
  metric: string
  target: number
  current: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  trend: 'improving' | 'stable' | 'degrading'
  lastUpdated: number
}

export interface SystemPerformance {
  overall: {
    score: number // 0-100
    status: 'excellent' | 'good' | 'warning' | 'critical'
    bottlenecks: string[]
  }
  agents: Record<string, AgentPerformance>
  infrastructure: InfrastructurePerformance
  benchmarks: PerformanceBenchmark[]
  timestamp: number
}

export interface AgentPerformance {
  name: string
  executionTime: MetricAggregation
  successRate: number
  errorRate: number
  throughput: number
  reliability: number
  efficiency: number
  score: number
}

export interface InfrastructurePerformance {
  database: {
    connectionTime: MetricAggregation
    queryTime: MetricAggregation
    connectionPool: number
  }
  cache: {
    hitRate: number
    missRate: number
    evictionRate: number
    memoryUsage: number
  }
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
  cpu: {
    usage: number
    loadAverage: number[]
  }
}

export class PerformanceMetricsCollector {
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private benchmarks: Map<string, PerformanceBenchmark> = new Map()
  private collectionInterval?: NodeJS.Timeout
  private isCollecting = false
  
  private readonly maxMetricsPerKey = 1000
  private readonly collectionIntervalMs = 10000 // 10 seconds
  
  // Performance benchmarks (targets)
  private readonly defaultBenchmarks: Record<string, number> = {
    'agent_execution_time': 15000, // 15 seconds
    'crawl_agent_execution_time': 30000, // 30 seconds
    'llm_test_agent_execution_time': 10000, // 10 seconds
    'schema_agent_execution_time': 5000, // 5 seconds
    'database_query_time': 1000, // 1 second
    'cache_hit_rate': 80, // 80%
    'system_memory_usage': 512, // 512 MB
    'evaluation_success_rate': 95 // 95%
  }

  constructor() {
    this.initializeBenchmarks()
  }

  /**
   * Start performance metrics collection
   */
  start(): void {
    if (this.isCollecting) return

    console.log('📊 Starting performance metrics collection...')
    this.isCollecting = true
    
    // Start periodic collection
    this.collectionInterval = setInterval(() => {
      this.collectSystemMetrics()
    }, this.collectionIntervalMs)
  }

  /**
   * Stop performance metrics collection
   */
  stop(): void {
    if (!this.isCollecting) return

    console.log('📊 Stopping performance metrics collection...')
    this.isCollecting = false
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval)
      this.collectionInterval = undefined
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    const key = this.generateMetricKey(metric)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metrics = this.metrics.get(key)!
    metrics.push(metric)
    
    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerKey) {
      metrics.splice(0, metrics.length - this.maxMetricsPerKey)
    }
    
    // Update benchmarks
    this.updateBenchmark(metric)
  }

  /**
   * Get aggregated metrics for a component
   */
  getAggregatedMetrics(
    component: string, 
    metricName: string, 
    timeWindow: number = 3600000 // 1 hour
  ): MetricAggregation | null {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const metrics = this.getMetrics(component, metricName)
      .filter(m => m.timestamp >= windowStart)
      .map(m => m.value)
    
    if (metrics.length === 0) return null
    
    return this.calculateAggregation(metrics)
  }

  /**
   * Get current system performance
   */
  getSystemPerformance(): SystemPerformance {
    const agents = this.getAgentPerformance()
    const infrastructure = this.getInfrastructurePerformance()
    const benchmarks = Array.from(this.benchmarks.values())
    
    // Calculate overall performance score
    const agentScores = Object.values(agents).map(a => a.score)
    const infraScore = this.calculateInfrastructureScore(infrastructure)
    const benchmarkScore = this.calculateBenchmarkScore(benchmarks)
    
    const overallScore = Math.round(
      (agentScores.reduce((sum, score) => sum + score, 0) / Math.max(agentScores.length, 1) * 0.6) +
      (infraScore * 0.3) +
      (benchmarkScore * 0.1)
    )
    
    const overallStatus = this.getStatusFromScore(overallScore)
    const bottlenecks = this.identifyBottlenecks(agents, infrastructure, benchmarks)

    return {
      overall: {
        score: overallScore,
        status: overallStatus,
        bottlenecks
      },
      agents,
      infrastructure,
      benchmarks,
      timestamp: Date.now()
    }
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(
    component: string, 
    metricName: string, 
    timeWindow: number = 3600000
  ): {
    current: number
    previous: number
    change: number
    trend: 'improving' | 'stable' | 'degrading'
    dataPoints: Array<{ timestamp: number, value: number }>
  } {
    const now = Date.now()
    const metrics = this.getMetrics(component, metricName)
      .filter(m => m.timestamp >= now - timeWindow)
      .sort((a, b) => a.timestamp - b.timestamp)

    if (metrics.length < 2) {
      return {
        current: 0,
        previous: 0,
        change: 0,
        trend: 'stable',
        dataPoints: []
      }
    }

    const midpoint = Math.floor(metrics.length / 2)
    const recent = metrics.slice(midpoint)
    const older = metrics.slice(0, midpoint)

    const currentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
    const previousAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length

    const change = ((currentAvg - previousAvg) / previousAvg) * 100
    const trend = Math.abs(change) < 5 ? 'stable' : 
                  change > 0 ? 'degrading' : 'improving' // For response times, lower is better

    return {
      current: currentAvg,
      previous: previousAvg,
      change,
      trend,
      dataPoints: metrics.map(m => ({ timestamp: m.timestamp, value: m.value }))
    }
  }

  /**
   * Get top performing agents
   */
  getTopPerformers(limit: number = 5): Array<{ name: string, score: number, metric: string }> {
    const agents = this.getAgentPerformance()
    
    return Object.entries(agents)
      .map(([name, perf]) => ({ name, score: perf.score, metric: 'overall' }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * Get performance bottlenecks
   */
  getBottlenecks(): Array<{
    component: string
    issue: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    impact: string
    recommendation: string
  }> {
    const bottlenecks: Array<any> = []
    const systemPerf = this.getSystemPerformance()

    // Check agent performance
    for (const [name, agent] of Object.entries(systemPerf.agents)) {
      if (agent.score < 60) {
        bottlenecks.push({
          component: name,
          issue: 'Low performance score',
          severity: agent.score < 40 ? 'critical' : 'high',
          impact: `Agent ${name} is performing below expectations`,
          recommendation: 'Review agent configuration and optimize execution path'
        })
      }

      if (agent.errorRate > 10) {
        bottlenecks.push({
          component: name,
          issue: 'High error rate',
          severity: agent.errorRate > 20 ? 'critical' : 'medium',
          impact: `${agent.errorRate.toFixed(1)}% of executions are failing`,
          recommendation: 'Investigate error patterns and improve error handling'
        })
      }
    }

    // Check infrastructure performance
    if (systemPerf.infrastructure.cache.hitRate < 70) {
      bottlenecks.push({
        component: 'cache',
        issue: 'Low cache hit rate',
        severity: 'medium',
        impact: 'Increased response times and resource usage',
        recommendation: 'Review cache configuration and TTL settings'
      })
    }

    if (systemPerf.infrastructure.memory.heapUsed > 1024) { // 1GB
      bottlenecks.push({
        component: 'memory',
        issue: 'High memory usage',
        severity: 'high',
        impact: 'Risk of out-of-memory errors and performance degradation',
        recommendation: 'Optimize memory usage and consider scaling resources'
      })
    }

    return bottlenecks.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - (severityOrder[a.severity as keyof typeof severityOrder] || 0)
    })
  }

  /**
   * Get metrics for specific component and metric name
   */
  private getMetrics(component: string, metricName?: string): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = []
    
    for (const [key, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => 
        m.tags.component === component && 
        (!metricName || m.name === metricName)
      )
      allMetrics.push(...filteredMetrics)
    }
    
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Calculate statistical aggregation
   */
  private calculateAggregation(values: number[]): MetricAggregation {
    if (values.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 }
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    
    // Calculate percentiles
    const p50 = this.percentile(sorted, 50)
    const p95 = this.percentile(sorted, 95)
    const p99 = this.percentile(sorted, 99)
    
    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    return {
      count: values.length,
      sum,
      avg,
      min: Math.min(...values),
      max: Math.max(...values),
      p50,
      p95,
      p99,
      stdDev
    }
  }

  /**
   * Calculate percentile
   */
  private percentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  /**
   * Get agent performance metrics
   */
  private getAgentPerformance(): Record<string, AgentPerformance> {
    const agents = [
      'crawl_agent', 'llm_test_agent', 'schema_agent', 'semantic_agent',
      'knowledge_graph_agent', 'conversational_copy_agent', 'geo_visibility_agent',
      'citation_agent', 'sentiment_agent', 'commerce_agent', 'brand_heritage_agent'
    ]

    const performance: Record<string, AgentPerformance> = {}

    for (const agentName of agents) {
      const executionTime = this.getAggregatedMetrics(agentName, 'execution_time') || 
        { count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 }
      
      const successMetrics = this.getMetrics(agentName, 'success_count')
      const errorMetrics = this.getMetrics(agentName, 'error_count')
      
      const totalExecutions = successMetrics.length + errorMetrics.length
      const successRate = totalExecutions > 0 ? (successMetrics.length / totalExecutions) * 100 : 100
      const errorRate = totalExecutions > 0 ? (errorMetrics.length / totalExecutions) * 100 : 0
      
      const throughput = totalExecutions / 3600 // executions per hour (simplified)
      const reliability = successRate
      const efficiency = executionTime.avg > 0 ? Math.max(0, 100 - (executionTime.avg / 1000)) : 100
      
      const score = Math.round((reliability * 0.4) + (efficiency * 0.4) + (Math.min(throughput * 10, 20)))

      performance[agentName] = {
        name: agentName,
        executionTime,
        successRate,
        errorRate,
        throughput,
        reliability,
        efficiency,
        score
      }
    }

    return performance
  }

  /**
   * Get infrastructure performance metrics
   */
  private getInfrastructurePerformance(): InfrastructurePerformance {
    const memoryUsage = process.memoryUsage()
    
    return {
      database: {
        connectionTime: this.getAggregatedMetrics('database', 'connection_time') || 
          { count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 },
        queryTime: this.getAggregatedMetrics('database', 'query_time') || 
          { count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0, stdDev: 0 },
        connectionPool: 10 // Placeholder
      },
      cache: {
        hitRate: 75, // Placeholder - would integrate with actual cache
        missRate: 25,
        evictionRate: 5,
        memoryUsage: 128 // MB
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      cpu: {
        usage: 0, // Would integrate with actual CPU monitoring
        loadAverage: [0, 0, 0] // Would use os.loadavg()
      }
    }
  }

  /**
   * Initialize performance benchmarks
   */
  private initializeBenchmarks(): void {
    for (const [metric, target] of Object.entries(this.defaultBenchmarks)) {
      this.benchmarks.set(metric, {
        component: metric.split('_')[0],
        metric: metric,
        target,
        current: target,
        status: 'good',
        trend: 'stable',
        lastUpdated: Date.now()
      })
    }
  }

  /**
   * Update benchmark based on new metric
   */
  private updateBenchmark(metric: PerformanceMetric): void {
    const benchmarkKey = `${metric.tags.component}_${metric.name}`
    const benchmark = this.benchmarks.get(benchmarkKey)
    
    if (benchmark) {
      const oldCurrent = benchmark.current
      benchmark.current = metric.value
      benchmark.lastUpdated = Date.now()
      
      // Update status
      const ratio = metric.value / benchmark.target
      if (ratio <= 0.8) benchmark.status = 'excellent'
      else if (ratio <= 1.0) benchmark.status = 'good'
      else if (ratio <= 1.5) benchmark.status = 'warning'
      else benchmark.status = 'critical'
      
      // Update trend
      const change = (metric.value - oldCurrent) / oldCurrent
      if (Math.abs(change) < 0.05) benchmark.trend = 'stable'
      else if (change > 0) benchmark.trend = 'degrading'
      else benchmark.trend = 'improving'
    }
  }

  /**
   * Generate metric key
   */
  private generateMetricKey(metric: PerformanceMetric): string {
    return `${metric.name}:${JSON.stringify(metric.tags)}`
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    try {
      const memoryUsage = process.memoryUsage()
      const now = Date.now()

      // Memory metrics
      this.recordMetric({
        name: 'memory_heap_used',
        value: memoryUsage.heapUsed / 1024 / 1024, // MB
        unit: 'MB',
        timestamp: now,
        tags: { component: 'system', type: 'memory' }
      })

      this.recordMetric({
        name: 'memory_heap_total',
        value: memoryUsage.heapTotal / 1024 / 1024, // MB
        unit: 'MB',
        timestamp: now,
        tags: { component: 'system', type: 'memory' }
      })

    } catch (error) {
      console.warn('Failed to collect system metrics:', error)
    }
  }

  /**
   * Calculate infrastructure score
   */
  private calculateInfrastructureScore(infra: InfrastructurePerformance): number {
    let score = 100

    // Memory usage penalty
    const memoryUsageRatio = infra.memory.heapUsed / infra.memory.heapTotal
    if (memoryUsageRatio > 0.8) score -= 20
    else if (memoryUsageRatio > 0.6) score -= 10

    // Cache performance
    if (infra.cache.hitRate < 70) score -= 15
    else if (infra.cache.hitRate < 80) score -= 5

    // Database performance
    if (infra.database.queryTime.avg > 2000) score -= 20
    else if (infra.database.queryTime.avg > 1000) score -= 10

    return Math.max(0, score)
  }

  /**
   * Calculate benchmark score
   */
  private calculateBenchmarkScore(benchmarks: PerformanceBenchmark[]): number {
    if (benchmarks.length === 0) return 100

    const statusScores = { excellent: 100, good: 80, warning: 60, critical: 20 }
    const totalScore = benchmarks.reduce((sum, b) => sum + statusScores[b.status], 0)
    
    return totalScore / benchmarks.length
  }

  /**
   * Get status from score
   */
  private getStatusFromScore(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'warning'
    return 'critical'
  }

  /**
   * Identify system bottlenecks
   */
  private identifyBottlenecks(
    agents: Record<string, AgentPerformance>,
    infrastructure: InfrastructurePerformance,
    benchmarks: PerformanceBenchmark[]
  ): string[] {
    const bottlenecks: string[] = []

    // Agent bottlenecks
    for (const [name, agent] of Object.entries(agents)) {
      if (agent.score < 60) {
        bottlenecks.push(`${name}: Low performance score (${agent.score})`)
      }
      if (agent.errorRate > 10) {
        bottlenecks.push(`${name}: High error rate (${agent.errorRate.toFixed(1)}%)`)
      }
    }

    // Infrastructure bottlenecks
    if (infrastructure.memory.heapUsed > 1024) {
      bottlenecks.push(`Memory: High usage (${infrastructure.memory.heapUsed}MB)`)
    }
    if (infrastructure.cache.hitRate < 70) {
      bottlenecks.push(`Cache: Low hit rate (${infrastructure.cache.hitRate}%)`)
    }

    // Benchmark bottlenecks
    const criticalBenchmarks = benchmarks.filter(b => b.status === 'critical')
    for (const benchmark of criticalBenchmarks) {
      bottlenecks.push(`${benchmark.component}: ${benchmark.metric} exceeds target`)
    }

    return bottlenecks
  }
}

// Global performance metrics collector
export const performanceMetrics = new PerformanceMetricsCollector()

/**
 * Decorator for automatic performance metric recording
 */
export function measurePerformance(component: string, metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    const finalMetricName = metricName || `${propertyName}_execution_time`

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      
      try {
        const result = await method.apply(this, args)
        
        // Record execution time
        performanceMetrics.recordMetric({
          name: finalMetricName,
          value: Date.now() - startTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { component, method: propertyName, status: 'success' }
        })

        return result
      } catch (error) {
        // Record execution time even for errors
        performanceMetrics.recordMetric({
          name: finalMetricName,
          value: Date.now() - startTime,
          unit: 'ms',
          timestamp: Date.now(),
          tags: { component, method: propertyName, status: 'error' }
        })

        throw error
      }
    }

    return descriptor
  }
}
