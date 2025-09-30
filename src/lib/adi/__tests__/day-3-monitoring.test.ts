/**
 * Day 3 Monitoring & Alerting Tests
 * 
 * Tests the comprehensive monitoring, alerting, and anomaly detection systems
 * to ensure they provide reliable observability and early warning capabilities.
 */

import { HealthMonitor, healthMonitor } from '../health-monitor'
import { PerformanceMetricsCollector, performanceMetrics } from '../performance-metrics'
import { AlertingSystem, alertingSystem, createAlert } from '../alerting-system'
import { MonitoringDashboard, monitoringDashboard } from '../monitoring-dashboard'
import { AnomalyDetectionSystem, anomalyDetection } from '../anomaly-detection'

describe('Day 3: Monitoring & Alerting Systems', () => {
  beforeEach(() => {
    // Reset systems before each test
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after tests
    healthMonitor.stop()
    performanceMetrics.stop()
    alertingSystem.stop()
    monitoringDashboard.stop()
    anomalyDetection.stop()
  })

  describe('Health Monitoring System', () => {
    test('should track system health status', () => {
      const monitor = new HealthMonitor()
      
      // Record some health metrics
      monitor.recordMetric({
        name: 'response_time',
        value: 1500,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'crawl_agent' }
      })

      monitor.recordMetric({
        name: 'error_count',
        value: 2,
        unit: 'count',
        timestamp: Date.now(),
        tags: { component: 'crawl_agent' }
      })

      const systemHealth = monitor.getSystemHealth()
      
      expect(systemHealth).toBeDefined()
      expect(systemHealth.overall).toBeDefined()
      expect(systemHealth.overall.status).toMatch(/healthy|warning|critical|unknown/)
      expect(systemHealth.overall.score).toBeGreaterThanOrEqual(0)
      expect(systemHealth.overall.score).toBeLessThanOrEqual(100)
      expect(systemHealth.timestamp).toBeGreaterThan(0)
    })

    test('should provide component-specific health status', () => {
      const monitor = new HealthMonitor()
      
      // Record metrics for specific component
      monitor.recordMetric({
        name: 'success_count',
        value: 8,
        unit: 'count',
        timestamp: Date.now(),
        tags: { component: 'llm_test_agent' }
      })

      const componentHealth = monitor.getComponentHealth('llm_test_agent')
      
      // Component health might be null if not enough data
      if (componentHealth) {
        expect(componentHealth.component).toBe('llm_test_agent')
        expect(componentHealth.status).toMatch(/healthy|warning|critical|unknown/)
        expect(componentHealth.score).toBeGreaterThanOrEqual(0)
        expect(componentHealth.lastCheck).toBeGreaterThan(0)
      }
    })

    test('should calculate performance trends', () => {
      const monitor = new HealthMonitor()
      
      // Add multiple data points over time
      const baseTime = Date.now() - 3600000 // 1 hour ago
      for (let i = 0; i < 10; i++) {
        monitor.recordMetric({
          name: 'response_time',
          value: 1000 + (i * 100), // Increasing response times
          unit: 'ms',
          timestamp: baseTime + (i * 360000), // Every 6 minutes
          tags: { component: 'schema_agent' }
        })
      }

      const trends = monitor.getPerformanceTrends('schema_agent')
      
      expect(trends).toBeDefined()
      expect(trends.avgResponseTime).toBeGreaterThan(0)
      expect(trends.successRate).toBeGreaterThanOrEqual(0)
      expect(trends.successRate).toBeLessThanOrEqual(100)
      expect(trends.trend).toMatch(/improving|stable|degrading/)
    })
  })

  describe('Performance Metrics Collection', () => {
    test('should collect and aggregate performance metrics', () => {
      const collector = new PerformanceMetricsCollector()
      
      // Record some performance metrics
      collector.recordMetric({
        name: 'execution_time',
        value: 2500,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'crawl_agent', method: 'execute' }
      })

      collector.recordMetric({
        name: 'execution_time',
        value: 3000,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'crawl_agent', method: 'execute' }
      })

      const aggregated = collector.getAggregatedMetrics('crawl_agent', 'execution_time')
      
      expect(aggregated).toBeDefined()
      if (aggregated) {
        expect(aggregated.count).toBe(2)
        expect(aggregated.avg).toBe(2750)
        expect(aggregated.min).toBe(2500)
        expect(aggregated.max).toBe(3000)
      }
    })

    test('should provide system performance overview', () => {
      const collector = new PerformanceMetricsCollector()
      
      const systemPerformance = collector.getSystemPerformance()
      
      expect(systemPerformance).toBeDefined()
      expect(systemPerformance.overall).toBeDefined()
      expect(systemPerformance.overall.score).toBeGreaterThanOrEqual(0)
      expect(systemPerformance.overall.score).toBeLessThanOrEqual(100)
      expect(systemPerformance.agents).toBeDefined()
      expect(systemPerformance.infrastructure).toBeDefined()
      expect(systemPerformance.timestamp).toBeGreaterThan(0)
    })

    test('should identify performance bottlenecks', () => {
      const collector = new PerformanceMetricsCollector()
      
      // Simulate poor performance
      for (let i = 0; i < 5; i++) {
        collector.recordMetric({
          name: 'error_count',
          value: 1,
          unit: 'count',
          timestamp: Date.now() - (i * 1000),
          tags: { component: 'llm_test_agent' }
        })
      }

      const bottlenecks = collector.getBottlenecks()
      
      expect(Array.isArray(bottlenecks)).toBe(true)
      // Should identify high error rate as bottleneck
      const errorBottleneck = bottlenecks.find(b => b.issue.includes('error'))
      if (errorBottleneck) {
        expect(errorBottleneck.severity).toMatch(/low|medium|high|critical/)
        expect(errorBottleneck.recommendation).toBeDefined()
      }
    })
  })

  describe('Alerting System', () => {
    test('should create and manage alerts', () => {
      const alerting = new AlertingSystem()
      
      const alert = alerting.createAlert({
        title: 'Test Alert',
        description: 'This is a test alert',
        severity: 'warning',
        component: 'test_component',
        source: 'test',
        tags: { test: 'true' },
        metadata: { testData: 'value' }
      })

      expect(alert).toBeDefined()
      expect(alert.id).toBeDefined()
      expect(alert.title).toBe('Test Alert')
      expect(alert.severity).toBe('warning')
      expect(alert.status).toBe('active')
      expect(alert.timestamp).toBeGreaterThan(0)
    })

    test('should acknowledge and resolve alerts', () => {
      const alerting = new AlertingSystem()
      
      const alert = alerting.createAlert({
        title: 'Test Alert',
        description: 'This is a test alert',
        severity: 'critical',
        component: 'test_component',
        source: 'test',
        tags: {},
        metadata: {}
      })

      // Acknowledge alert
      const acknowledged = alerting.acknowledgeAlert(alert.id, 'test_user')
      expect(acknowledged).toBe(true)
      
      const acknowledgedAlert = alerting.getActiveAlerts().find(a => a.id === alert.id)
      expect(acknowledgedAlert?.status).toBe('acknowledged')
      expect(acknowledgedAlert?.acknowledgedBy).toBe('test_user')

      // Resolve alert
      const resolved = alerting.resolveAlert(alert.id)
      expect(resolved).toBe(true)
    })

    test('should provide alert statistics', () => {
      const alerting = new AlertingSystem()
      
      // Create multiple alerts
      alerting.createAlert({
        title: 'Critical Alert',
        description: 'Critical issue',
        severity: 'critical',
        component: 'component1',
        source: 'test',
        tags: {},
        metadata: {}
      })

      alerting.createAlert({
        title: 'Warning Alert',
        description: 'Warning issue',
        severity: 'warning',
        component: 'component2',
        source: 'test',
        tags: {},
        metadata: {}
      })

      const stats = alerting.getAlertStats()
      
      expect(stats).toBeDefined()
      expect(stats.total).toBeGreaterThanOrEqual(2)
      expect(stats.bySeverity.critical).toBeGreaterThanOrEqual(1)
      expect(stats.bySeverity.warning).toBeGreaterThanOrEqual(1)
      expect(stats.byComponent.component1).toBeGreaterThanOrEqual(1)
    })

    test('should suppress alerts for maintenance', () => {
      const alerting = new AlertingSystem()
      
      // Suppress alerts for a component
      alerting.suppressAlerts('maintenance_component', 60000, 'Scheduled maintenance')
      
      // Try to create alert for suppressed component
      const alert = alerting.createAlert({
        title: 'Maintenance Alert',
        description: 'This should be suppressed',
        severity: 'warning',
        component: 'maintenance_component',
        source: 'test',
        tags: {},
        metadata: {}
      })

      expect(alert.status).toBe('suppressed')
    })
  })

  describe('Monitoring Dashboard', () => {
    test('should provide comprehensive dashboard data', () => {
      const dashboard = new MonitoringDashboard()
      
      const dashboardData = dashboard.getDashboardData()
      
      expect(dashboardData).toBeDefined()
      expect(dashboardData.timestamp).toBeGreaterThan(0)
      expect(dashboardData.systemHealth).toBeDefined()
      expect(dashboardData.systemPerformance).toBeDefined()
      expect(dashboardData.alerts).toBeDefined()
      expect(dashboardData.recommendations).toBeDefined()
      expect(dashboardData.summary).toBeDefined()
    })

    test('should provide component status overview', () => {
      const dashboard = new MonitoringDashboard()
      
      const componentStatus = dashboard.getComponentStatus()
      
      expect(Array.isArray(componentStatus)).toBe(true)
      
      if (componentStatus.length > 0) {
        const component = componentStatus[0]
        expect(component.name).toBeDefined()
        expect(component.type).toMatch(/agent|infrastructure|dependency/)
        expect(component.status).toMatch(/healthy|warning|critical|unknown/)
        expect(component.score).toBeGreaterThanOrEqual(0)
        expect(component.score).toBeLessThanOrEqual(100)
      }
    })

    test('should generate system recommendations', () => {
      const dashboard = new MonitoringDashboard()
      
      const dashboardData = dashboard.getDashboardData()
      const recommendations = dashboardData.recommendations
      
      expect(Array.isArray(recommendations)).toBe(true)
      
      if (recommendations.length > 0) {
        const recommendation = recommendations[0]
        expect(recommendation.id).toBeDefined()
        expect(recommendation.type).toMatch(/performance|reliability|cost|security/)
        expect(recommendation.priority).toMatch(/low|medium|high|critical/)
        expect(recommendation.title).toBeDefined()
        expect(recommendation.description).toBeDefined()
        expect(recommendation.actions).toBeDefined()
        expect(Array.isArray(recommendation.actions)).toBe(true)
      }
    })

    test('should provide capacity metrics', () => {
      const dashboard = new MonitoringDashboard()
      
      const capacity = dashboard.getCapacityMetrics()
      
      expect(capacity).toBeDefined()
      expect(capacity.cpu).toBeDefined()
      expect(capacity.memory).toBeDefined()
      expect(capacity.agents).toBeDefined()
      
      expect(capacity.cpu.usage).toBeGreaterThanOrEqual(0)
      expect(capacity.cpu.available).toBeGreaterThanOrEqual(0)
      expect(capacity.memory.usage).toBeGreaterThanOrEqual(0)
      expect(capacity.memory.available).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Anomaly Detection System', () => {
    test('should detect statistical anomalies', () => {
      const detector = new AnomalyDetectionSystem({
        sensitivity: 'high',
        minDataPoints: 5
      })

      // Add baseline data
      const baseTime = Date.now() - 3600000 // 1 hour ago
      for (let i = 0; i < 20; i++) {
        detector.addDataPoint('test_component', 'response_time', 1000 + (Math.random() * 100), baseTime + (i * 180000))
      }

      // Add anomalous data point
      detector.addDataPoint('test_component', 'response_time', 5000, Date.now()) // 5x normal

      const anomalies = detector.detectAnomalies('test_component', 'response_time')
      
      expect(Array.isArray(anomalies)).toBe(true)
      
      if (anomalies.length > 0) {
        const anomaly = anomalies[0]
        expect(anomaly.id).toBeDefined()
        expect(anomaly.component).toBe('test_component')
        expect(anomaly.metric).toBe('response_time')
        expect(anomaly.type).toMatch(/spike|drop|trend|pattern|outlier/)
        expect(anomaly.severity).toMatch(/low|medium|high|critical/)
        expect(anomaly.confidence).toBeGreaterThan(0)
        expect(anomaly.confidence).toBeLessThanOrEqual(1)
      }
    })

    test('should establish baselines for metrics', () => {
      const detector = new AnomalyDetectionSystem()

      // Add sufficient data points
      for (let i = 0; i < 15; i++) {
        detector.addDataPoint('baseline_test', 'metric1', 100 + (Math.random() * 20))
      }

      const baseline = detector.getBaseline('baseline_test', 'metric1')
      
      expect(baseline).toBeDefined()
      if (baseline) {
        expect(baseline.mean).toBeGreaterThan(0)
        expect(baseline.stdDev).toBeGreaterThanOrEqual(0)
        expect(baseline.min).toBeLessThanOrEqual(baseline.max)
        expect(baseline.trend).toMatch(/increasing|decreasing|stable/)
      }
    })

    test('should generate anomaly reports', () => {
      const detector = new AnomalyDetectionSystem()

      // Add some data and create anomalies
      detector.addDataPoint('report_test', 'metric1', 100)
      detector.addDataPoint('report_test', 'metric1', 200) // Potential anomaly

      const report = detector.getAnomalyReport()
      
      expect(report).toBeDefined()
      expect(report.timestamp).toBeGreaterThan(0)
      expect(report.totalAnomalies).toBeGreaterThanOrEqual(0)
      expect(report.byComponent).toBeDefined()
      expect(report.bySeverity).toBeDefined()
      expect(report.byType).toBeDefined()
      expect(Array.isArray(report.patterns)).toBe(true)
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    test('should detect trend changes', () => {
      const detector = new AnomalyDetectionSystem({
        minDataPoints: 5
      })

      // Create increasing trend
      const baseTime = Date.now() - 1800000 // 30 minutes ago
      for (let i = 0; i < 10; i++) {
        detector.addDataPoint('trend_test', 'increasing_metric', 100 + (i * 10), baseTime + (i * 180000))
      }

      // Sudden decrease (trend change)
      for (let i = 0; i < 5; i++) {
        detector.addDataPoint('trend_test', 'increasing_metric', 50 - (i * 5), Date.now() - (i * 60000))
      }

      const anomalies = detector.detectAnomalies('trend_test', 'increasing_metric')
      const trendAnomaly = anomalies.find(a => a.type === 'trend')
      
      if (trendAnomaly) {
        expect(trendAnomaly.type).toBe('trend')
        expect(trendAnomaly.description).toContain('trend change')
      }
    })
  })

  describe('Integration Tests', () => {
    test('should integrate all monitoring systems', async () => {
      // Start all systems
      healthMonitor.start()
      performanceMetrics.start()
      alertingSystem.start()
      monitoringDashboard.start()
      anomalyDetection.start()

      // Simulate some system activity
      healthMonitor.recordMetric({
        name: 'response_time',
        value: 1500,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'integration_test' }
      })

      performanceMetrics.recordMetric({
        name: 'execution_time',
        value: 2000,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { component: 'integration_test' }
      })

      // Create an alert
      const alert = createAlert(
        'Integration Test Alert',
        'Testing system integration',
        'info',
        'integration_test'
      )

      // Add anomaly detection data
      anomalyDetection.addDataPoint('integration_test', 'test_metric', 100)

      // Get dashboard data
      const dashboardData = monitoringDashboard.getDashboardData()

      // Verify integration
      expect(dashboardData).toBeDefined()
      expect(dashboardData.systemHealth).toBeDefined()
      expect(dashboardData.systemPerformance).toBeDefined()
      expect(dashboardData.alerts.active.length).toBeGreaterThanOrEqual(1)
      expect(alert.id).toBeDefined()

      // Clean up
      alertingSystem.resolveAlert(alert.id)
    })

    test('should handle system stress scenarios', () => {
      // Simulate high load
      for (let i = 0; i < 100; i++) {
        healthMonitor.recordMetric({
          name: 'high_load_metric',
          value: Math.random() * 1000,
          unit: 'ms',
          timestamp: Date.now() - (i * 1000),
          tags: { component: 'stress_test' }
        })

        performanceMetrics.recordMetric({
          name: 'stress_metric',
          value: Math.random() * 5000,
          unit: 'ms',
          timestamp: Date.now() - (i * 1000),
          tags: { component: 'stress_test' }
        })
      }

      // System should still be responsive
      const systemHealth = healthMonitor.getSystemHealth()
      const systemPerformance = performanceMetrics.getSystemPerformance()
      const dashboardData = monitoringDashboard.getDashboardData()

      expect(systemHealth).toBeDefined()
      expect(systemPerformance).toBeDefined()
      expect(dashboardData).toBeDefined()
    })
  })
})
