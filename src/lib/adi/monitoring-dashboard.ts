/**
 * Real-time Monitoring Dashboard
 * 
 * Provides a comprehensive real-time view of system health, performance,
 * and alerts. Aggregates data from health monitoring, performance metrics,
 * and alerting systems to provide actionable insights.
 * 
 * Features:
 * - Real-time system status
 * - Performance metrics visualization
 * - Alert management interface
 * - Historical trend analysis
 * - Component health overview
 * - Automated recommendations
 */

import { healthMonitor, type SystemHealth, type HealthStatus } from './health-monitor'
import { performanceMetrics, type SystemPerformance, type AgentPerformance } from './performance-metrics'
import { alertingSystem, type Alert, type AlertStats } from './alerting-system'

export interface DashboardData {
  timestamp: number
  systemHealth: SystemHealth
  systemPerformance: SystemPerformance
  alerts: {
    active: Alert[]
    stats: AlertStats
    trends: any
  }
  recommendations: Recommendation[]
  summary: SystemSummary
}

export interface SystemSummary {
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown'
  overallScore: number
  activeIssues: number
  criticalAlerts: number
  performanceScore: number
  uptime: number
  lastIncident?: {
    timestamp: number
    description: string
    resolved: boolean
  }
}

export interface Recommendation {
  id: string
  type: 'performance' | 'reliability' | 'cost' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  component: string
  actions: string[]
  estimatedBenefit: string
}

export interface ComponentStatus {
  name: string
  type: 'agent' | 'infrastructure' | 'dependency'
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  score: number
  uptime: number
  lastCheck: number
  issues: string[]
  metrics: {
    responseTime: number
    errorRate: number
    throughput: number
  }
}

export class MonitoringDashboard {
  private updateInterval?: NodeJS.Timeout
  private isRunning = false
  private lastUpdate = 0
  private systemStartTime = Date.now()
  
  private readonly updateIntervalMs = 5000 // 5 seconds
  private readonly maxRecommendations = 10

  constructor() {
    // Initialize monitoring systems if not already running
    if (!healthMonitor['isRunning']) {
      healthMonitor.start()
    }
    if (!performanceMetrics['isCollecting']) {
      performanceMetrics.start()
    }
    if (!alertingSystem['isRunning']) {
      alertingSystem.start()
    }
  }

  /**
   * Start real-time dashboard updates
   */
  start(): void {
    if (this.isRunning) return

    console.log('📊 Starting monitoring dashboard...')
    this.isRunning = true
    
    // Initial update
    this.updateDashboard()
    
    // Schedule periodic updates
    this.updateInterval = setInterval(() => {
      this.updateDashboard()
    }, this.updateIntervalMs)
  }

  /**
   * Stop dashboard updates
   */
  stop(): void {
    if (!this.isRunning) return

    console.log('📊 Stopping monitoring dashboard...')
    this.isRunning = false
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): DashboardData {
    const systemHealth = healthMonitor.getSystemHealth()
    const systemPerformance = performanceMetrics.getSystemPerformance()
    const activeAlerts = alertingSystem.getActiveAlerts()
    const alertStats = alertingSystem.getAlertStats()
    const alertTrends = alertingSystem.getAlertTrends()
    
    const recommendations = this.generateRecommendations(systemHealth, systemPerformance, activeAlerts)
    const summary = this.generateSystemSummary(systemHealth, systemPerformance, activeAlerts)

    return {
      timestamp: Date.now(),
      systemHealth,
      systemPerformance,
      alerts: {
        active: activeAlerts,
        stats: alertStats,
        trends: alertTrends
      },
      recommendations,
      summary
    }
  }

  /**
   * Get component status overview
   */
  getComponentStatus(): ComponentStatus[] {
    const dashboardData = this.getDashboardData()
    const components: ComponentStatus[] = []

    // Agent components
    for (const [name, health] of Object.entries(dashboardData.systemHealth.agents)) {
      const performance = dashboardData.systemPerformance.agents[name]
      
      components.push({
        name,
        type: 'agent',
        status: health.status,
        score: health.score,
        uptime: this.calculateUptime(name),
        lastCheck: health.lastCheck,
        issues: this.getComponentIssues(name, health, performance),
        metrics: {
          responseTime: performance?.executionTime.avg || 0,
          errorRate: performance?.errorRate || 0,
          throughput: performance?.throughput || 0
        }
      })
    }

    // Infrastructure components
    for (const [name, health] of Object.entries(dashboardData.systemHealth.infrastructure)) {
      components.push({
        name,
        type: 'infrastructure',
        status: health.status,
        score: health.score,
        uptime: this.calculateUptime(name),
        lastCheck: health.lastCheck,
        issues: this.getComponentIssues(name, health),
        metrics: {
          responseTime: 0, // Would get from infrastructure metrics
          errorRate: 0,
          throughput: 0
        }
      })
    }

    // Dependency components
    for (const [name, health] of Object.entries(dashboardData.systemHealth.dependencies)) {
      components.push({
        name,
        type: 'dependency',
        status: health.status,
        score: health.score,
        uptime: this.calculateUptime(name),
        lastCheck: health.lastCheck,
        issues: this.getComponentIssues(name, health),
        metrics: {
          responseTime: 0, // Would get from dependency metrics
          errorRate: 0,
          throughput: 0
        }
      })
    }

    return components.sort((a, b) => {
      // Sort by status severity, then by score
      const statusOrder = { critical: 4, warning: 3, unknown: 2, healthy: 1 }
      const statusDiff = statusOrder[b.status] - statusOrder[a.status]
      return statusDiff !== 0 ? statusDiff : b.score - a.score
    })
  }

  /**
   * Get system performance trends
   */
  getPerformanceTrends(timeWindow: number = 3600000): {
    responseTime: Array<{ timestamp: number, value: number }>
    errorRate: Array<{ timestamp: number, value: number }>
    throughput: Array<{ timestamp: number, value: number }>
    systemScore: Array<{ timestamp: number, value: number }>
  } {
    // This would integrate with actual time-series data
    // For now, return mock data structure
    const now = Date.now()
    const points = 20
    const interval = timeWindow / points

    const generateTrend = (baseValue: number, variance: number) => {
      return Array.from({ length: points }, (_, i) => ({
        timestamp: now - (timeWindow - (i * interval)),
        value: baseValue + (Math.random() - 0.5) * variance
      }))
    }

    return {
      responseTime: generateTrend(5000, 2000), // 5s ± 1s
      errorRate: generateTrend(2, 3), // 2% ± 1.5%
      throughput: generateTrend(10, 5), // 10 req/min ± 2.5
      systemScore: generateTrend(85, 20) // 85 ± 10
    }
  }

  /**
   * Get alert summary by component
   */
  getAlertSummaryByComponent(): Record<string, {
    total: number
    critical: number
    warning: number
    info: number
    lastAlert?: number
  }> {
    const alerts = alertingSystem.getActiveAlerts()
    const summary: Record<string, any> = {}

    for (const alert of alerts) {
      if (!summary[alert.component]) {
        summary[alert.component] = {
          total: 0,
          critical: 0,
          warning: 0,
          info: 0,
          emergency: 0
        }
      }

      summary[alert.component].total++
      summary[alert.component][alert.severity]++
      
      if (!summary[alert.component].lastAlert || alert.timestamp > summary[alert.component].lastAlert) {
        summary[alert.component].lastAlert = alert.timestamp
      }
    }

    return summary
  }

  /**
   * Get system capacity metrics
   */
  getCapacityMetrics(): {
    cpu: { usage: number, available: number }
    memory: { usage: number, available: number }
    storage: { usage: number, available: number }
    network: { usage: number, available: number }
    agents: { active: number, capacity: number }
  } {
    const systemPerf = performanceMetrics.getSystemPerformance()
    
    return {
      cpu: {
        usage: systemPerf.infrastructure.cpu.usage,
        available: 100 - systemPerf.infrastructure.cpu.usage
      },
      memory: {
        usage: (systemPerf.infrastructure.memory.heapUsed / systemPerf.infrastructure.memory.heapTotal) * 100,
        available: 100 - ((systemPerf.infrastructure.memory.heapUsed / systemPerf.infrastructure.memory.heapTotal) * 100)
      },
      storage: {
        usage: 25, // Placeholder
        available: 75
      },
      network: {
        usage: 15, // Placeholder
        available: 85
      },
      agents: {
        active: Object.keys(systemPerf.agents).length,
        capacity: 12 // Total agent capacity
      }
    }
  }

  /**
   * Update dashboard data
   */
  private updateDashboard(): void {
    this.lastUpdate = Date.now()
    
    // This would trigger real-time updates to connected clients
    // For now, just log the update
    const data = this.getDashboardData()
    console.log(`📊 Dashboard updated: ${data.summary.overallStatus} (${data.summary.overallScore}/100)`)
  }

  /**
   * Generate system recommendations
   */
  private generateRecommendations(
    health: SystemHealth,
    performance: SystemPerformance,
    alerts: Alert[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Performance recommendations
    if (performance.overall.score < 70) {
      recommendations.push({
        id: 'improve_performance',
        type: 'performance',
        priority: 'high',
        title: 'Improve System Performance',
        description: `System performance score is ${performance.overall.score}/100, below optimal threshold`,
        impact: 'Faster response times and better user experience',
        effort: 'medium',
        component: 'system',
        actions: [
          'Optimize slow-performing agents',
          'Increase cache hit rates',
          'Review database query performance'
        ],
        estimatedBenefit: '20-30% improvement in response times'
      })
    }

    // Agent-specific recommendations
    for (const [name, agent] of Object.entries(performance.agents)) {
      if (agent.errorRate > 10) {
        recommendations.push({
          id: `fix_${name}_errors`,
          type: 'reliability',
          priority: agent.errorRate > 20 ? 'critical' : 'high',
          title: `Fix ${name} Error Rate`,
          description: `${name} has ${agent.errorRate.toFixed(1)}% error rate`,
          impact: 'Improved system reliability and data quality',
          effort: 'medium',
          component: name,
          actions: [
            'Review error logs and patterns',
            'Implement additional fallback mechanisms',
            'Improve input validation'
          ],
          estimatedBenefit: 'Reduce errors by 50-80%'
        })
      }

      if (agent.executionTime.avg > 30000) { // 30 seconds
        recommendations.push({
          id: `optimize_${name}_performance`,
          type: 'performance',
          priority: 'medium',
          title: `Optimize ${name} Performance`,
          description: `${name} average execution time is ${(agent.executionTime.avg/1000).toFixed(1)}s`,
          impact: 'Faster evaluations and better resource utilization',
          effort: 'medium',
          component: name,
          actions: [
            'Profile execution bottlenecks',
            'Implement caching strategies',
            'Optimize external API calls'
          ],
          estimatedBenefit: '30-50% reduction in execution time'
        })
      }
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency')
    if (criticalAlerts.length > 0) {
      recommendations.push({
        id: 'resolve_critical_alerts',
        type: 'reliability',
        priority: 'critical',
        title: 'Resolve Critical Alerts',
        description: `${criticalAlerts.length} critical alerts require immediate attention`,
        impact: 'Prevent system outages and data loss',
        effort: 'high',
        component: 'system',
        actions: [
          'Investigate root causes of critical alerts',
          'Implement immediate fixes',
          'Set up preventive monitoring'
        ],
        estimatedBenefit: 'Prevent potential system downtime'
      })
    }

    // Infrastructure recommendations
    if (performance.infrastructure.cache.hitRate < 70) {
      recommendations.push({
        id: 'improve_cache_performance',
        type: 'performance',
        priority: 'medium',
        title: 'Improve Cache Performance',
        description: `Cache hit rate is ${performance.infrastructure.cache.hitRate}%, below optimal`,
        impact: 'Reduced response times and lower resource usage',
        effort: 'low',
        component: 'cache',
        actions: [
          'Review cache TTL settings',
          'Implement cache warming strategies',
          'Optimize cache key patterns'
        ],
        estimatedBenefit: '15-25% improvement in response times'
      })
    }

    // Sort by priority and return top recommendations
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, this.maxRecommendations)
  }

  /**
   * Generate system summary
   */
  private generateSystemSummary(
    health: SystemHealth,
    performance: SystemPerformance,
    alerts: Alert[]
  ): SystemSummary {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'emergency')
    const activeIssues = performance.overall.bottlenecks.length + criticalAlerts.length
    
    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy'
    if (criticalAlerts.length > 0 || health.overall.status === 'critical') {
      overallStatus = 'critical'
    } else if (alerts.length > 0 || health.overall.status === 'warning') {
      overallStatus = 'warning'
    } else if (health.overall.status === 'unknown') {
      overallStatus = 'unknown'
    }

    // Calculate combined score
    const overallScore = Math.round((health.overall.score + performance.overall.score) / 2)
    
    // Calculate uptime
    const uptime = Date.now() - this.systemStartTime

    // Find last incident
    const lastIncident = alerts
      .filter(a => a.severity === 'critical' || a.severity === 'emergency')
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    return {
      overallStatus,
      overallScore,
      activeIssues,
      criticalAlerts: criticalAlerts.length,
      performanceScore: performance.overall.score,
      uptime,
      lastIncident: lastIncident ? {
        timestamp: lastIncident.timestamp,
        description: lastIncident.title,
        resolved: lastIncident.status === 'resolved'
      } : undefined
    }
  }

  /**
   * Calculate component uptime
   */
  private calculateUptime(component: string): number {
    // This would calculate actual uptime based on historical data
    // For now, return a placeholder based on health score
    const health = healthMonitor.getComponentHealth(component)
    if (!health) return 0

    // Simple uptime calculation based on health score
    return Math.max(0, health.score) / 100 * 99.9 // Convert to percentage
  }

  /**
   * Get component issues
   */
  private getComponentIssues(
    component: string, 
    health: HealthStatus, 
    performance?: AgentPerformance
  ): string[] {
    const issues: string[] = []

    if (health.status === 'critical') {
      issues.push('Component is in critical state')
    } else if (health.status === 'warning') {
      issues.push('Component has warnings')
    }

    if (performance) {
      if (performance.errorRate > 10) {
        issues.push(`High error rate: ${performance.errorRate.toFixed(1)}%`)
      }
      if (performance.executionTime.avg > 30000) {
        issues.push(`Slow response time: ${(performance.executionTime.avg/1000).toFixed(1)}s`)
      }
    }

    return issues
  }
}

// Global monitoring dashboard instance
export const monitoringDashboard = new MonitoringDashboard()

/**
 * Utility function to get dashboard snapshot
 */
export function getDashboardSnapshot(): DashboardData {
  return monitoringDashboard.getDashboardData()
}

/**
 * Utility function to get system status
 */
export function getSystemStatus(): {
  status: string
  score: number
  issues: number
  uptime: number
} {
  const data = monitoringDashboard.getDashboardData()
  return {
    status: data.summary.overallStatus,
    score: data.summary.overallScore,
    issues: data.summary.activeIssues,
    uptime: data.summary.uptime
  }
}
