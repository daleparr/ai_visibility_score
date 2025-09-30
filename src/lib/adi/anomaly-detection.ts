/**
 * Anomaly Detection System
 * 
 * Detects anomalies in system behavior, performance metrics, and patterns
 * to provide early warning of potential issues before they become critical.
 * 
 * Features:
 * - Statistical anomaly detection
 * - Pattern recognition
 * - Baseline establishment
 * - Trend analysis
 * - Predictive alerting
 * - Machine learning-inspired algorithms
 */

export interface AnomalyDetectionConfig {
  sensitivity: 'low' | 'medium' | 'high'
  baselineWindow: number // Time window for baseline calculation (ms)
  detectionWindow: number // Time window for anomaly detection (ms)
  minDataPoints: number // Minimum data points required for detection
  confidenceThreshold: number // Confidence threshold (0-1)
}

export interface Anomaly {
  id: string
  timestamp: number
  component: string
  metric: string
  type: 'spike' | 'drop' | 'trend' | 'pattern' | 'outlier'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // 0-1
  description: string
  currentValue: number
  expectedValue: number
  deviation: number
  context: {
    baseline: StatisticalBaseline
    recentValues: number[]
    historicalPattern?: string
  }
  metadata: Record<string, any>
}

export interface StatisticalBaseline {
  mean: number
  median: number
  stdDev: number
  min: number
  max: number
  p95: number
  p99: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality?: 'hourly' | 'daily' | 'weekly' | 'none'
}

export interface AnomalyPattern {
  name: string
  description: string
  indicators: string[]
  confidence: number
  frequency: number
  lastSeen: number
}

export interface AnomalyReport {
  timestamp: number
  totalAnomalies: number
  byComponent: Record<string, number>
  bySeverity: Record<string, number>
  byType: Record<string, number>
  patterns: AnomalyPattern[]
  recommendations: string[]
  trends: {
    increasing: string[]
    decreasing: string[]
    stable: string[]
  }
}

export class AnomalyDetectionSystem {
  private config: AnomalyDetectionConfig
  private baselines: Map<string, StatisticalBaseline> = new Map()
  private anomalies: Map<string, Anomaly> = new Map()
  private patterns: Map<string, AnomalyPattern> = new Map()
  private dataHistory: Map<string, Array<{ timestamp: number, value: number }>> = new Map()
  
  private detectionInterval?: NodeJS.Timeout
  private isRunning = false
  
  private readonly maxAnomalies = 1000
  private readonly maxHistoryPoints = 10000

  constructor(config: Partial<AnomalyDetectionConfig> = {}) {
    this.config = {
      sensitivity: 'medium',
      baselineWindow: 24 * 60 * 60 * 1000, // 24 hours
      detectionWindow: 60 * 60 * 1000, // 1 hour
      minDataPoints: 10,
      confidenceThreshold: 0.7,
      ...config
    }
  }

  /**
   * Start anomaly detection
   */
  start(): void {
    if (this.isRunning) return

    console.log('🔍 Starting anomaly detection system...')
    this.isRunning = true
    
    // Start periodic detection
    this.detectionInterval = setInterval(() => {
      this.runDetection()
    }, 60000) // Run every minute
  }

  /**
   * Stop anomaly detection
   */
  stop(): void {
    if (!this.isRunning) return

    console.log('🔍 Stopping anomaly detection system...')
    this.isRunning = false
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = undefined
    }
  }

  /**
   * Add data point for analysis
   */
  addDataPoint(component: string, metric: string, value: number, timestamp?: number): void {
    const key = `${component}:${metric}`
    const dataPoint = { timestamp: timestamp || Date.now(), value }
    
    if (!this.dataHistory.has(key)) {
      this.dataHistory.set(key, [])
    }
    
    const history = this.dataHistory.get(key)!
    history.push(dataPoint)
    
    // Keep only recent data points
    if (history.length > this.maxHistoryPoints) {
      history.splice(0, history.length - this.maxHistoryPoints)
    }
    
    // Update baseline if we have enough data
    if (history.length >= this.config.minDataPoints) {
      this.updateBaseline(key, history)
    }
  }

  /**
   * Detect anomalies for a specific metric
   */
  detectAnomalies(component: string, metric: string): Anomaly[] {
    const key = `${component}:${metric}`
    const history = this.dataHistory.get(key)
    const baseline = this.baselines.get(key)
    
    if (!history || !baseline || history.length < this.config.minDataPoints) {
      return []
    }

    const now = Date.now()
    const detectionWindowStart = now - this.config.detectionWindow
    const recentData = history.filter(d => d.timestamp >= detectionWindowStart)
    
    if (recentData.length === 0) return []

    const anomalies: Anomaly[] = []
    
    // Statistical anomaly detection
    const statisticalAnomalies = this.detectStatisticalAnomalies(component, metric, recentData, baseline)
    anomalies.push(...statisticalAnomalies)
    
    // Trend anomaly detection
    const trendAnomalies = this.detectTrendAnomalies(component, metric, recentData, baseline)
    anomalies.push(...trendAnomalies)
    
    // Pattern anomaly detection
    const patternAnomalies = this.detectPatternAnomalies(component, metric, recentData, baseline)
    anomalies.push(...patternAnomalies)

    // Store detected anomalies
    for (const anomaly of anomalies) {
      this.anomalies.set(anomaly.id, anomaly)
    }

    // Clean up old anomalies
    this.cleanupOldAnomalies()

    return anomalies
  }

  /**
   * Get all current anomalies
   */
  getCurrentAnomalies(): Anomaly[] {
    return Array.from(this.anomalies.values())
      .sort((a, b) => {
        // Sort by severity, then by timestamp
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity]
        return severityDiff !== 0 ? severityDiff : b.timestamp - a.timestamp
      })
  }

  /**
   * Get anomaly report
   */
  getAnomalyReport(timeWindow: number = 24 * 60 * 60 * 1000): AnomalyReport {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentAnomalies = Array.from(this.anomalies.values())
      .filter(a => a.timestamp >= windowStart)

    const byComponent: Record<string, number> = {}
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const byType: Record<string, number> = { spike: 0, drop: 0, trend: 0, pattern: 0, outlier: 0 }

    for (const anomaly of recentAnomalies) {
      byComponent[anomaly.component] = (byComponent[anomaly.component] || 0) + 1
      bySeverity[anomaly.severity]++
      byType[anomaly.type]++
    }

    const patterns = Array.from(this.patterns.values())
      .filter(p => p.lastSeen >= windowStart)
      .sort((a, b) => b.confidence - a.confidence)

    const trends = this.analyzeTrends()
    const recommendations = this.generateRecommendations(recentAnomalies, patterns)

    return {
      timestamp: now,
      totalAnomalies: recentAnomalies.length,
      byComponent,
      bySeverity,
      byType,
      patterns,
      recommendations,
      trends
    }
  }

  /**
   * Get baseline for a metric
   */
  getBaseline(component: string, metric: string): StatisticalBaseline | null {
    const key = `${component}:${metric}`
    return this.baselines.get(key) || null
  }

  /**
   * Get anomaly patterns
   */
  getAnomalyPatterns(): AnomalyPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Run anomaly detection for all metrics
   */
  private async runDetection(): Promise<void> {
    const detectedAnomalies: Anomaly[] = []
    
    for (const key of this.dataHistory.keys()) {
      const [component, metric] = key.split(':')
      const anomalies = this.detectAnomalies(component, metric)
      detectedAnomalies.push(...anomalies)
    }

    if (detectedAnomalies.length > 0) {
      console.log(`🔍 Detected ${detectedAnomalies.length} anomalies`)
      
      // Update patterns
      this.updatePatterns(detectedAnomalies)
      
      // Log critical anomalies
      const criticalAnomalies = detectedAnomalies.filter(a => a.severity === 'critical')
      for (const anomaly of criticalAnomalies) {
        console.warn(`🚨 Critical anomaly detected: ${anomaly.description}`)
      }
    }
  }

  /**
   * Update statistical baseline
   */
  private updateBaseline(key: string, history: Array<{ timestamp: number, value: number }>): void {
    const now = Date.now()
    const baselineWindowStart = now - this.config.baselineWindow
    const baselineData = history
      .filter(d => d.timestamp >= baselineWindowStart)
      .map(d => d.value)
      .sort((a, b) => a - b)

    if (baselineData.length < this.config.minDataPoints) return

    const mean = baselineData.reduce((sum, val) => sum + val, 0) / baselineData.length
    const median = this.calculatePercentile(baselineData, 50)
    const variance = baselineData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baselineData.length
    const stdDev = Math.sqrt(variance)
    const min = Math.min(...baselineData)
    const max = Math.max(...baselineData)
    const p95 = this.calculatePercentile(baselineData, 95)
    const p99 = this.calculatePercentile(baselineData, 99)
    
    // Calculate trend
    const trend = this.calculateTrend(history.slice(-20)) // Last 20 points
    
    // Detect seasonality (simplified)
    const seasonality = this.detectSeasonality(history)

    const baseline: StatisticalBaseline = {
      mean,
      median,
      stdDev,
      min,
      max,
      p95,
      p99,
      trend,
      seasonality
    }

    this.baselines.set(key, baseline)
  }

  /**
   * Detect statistical anomalies (outliers)
   */
  private detectStatisticalAnomalies(
    component: string,
    metric: string,
    data: Array<{ timestamp: number, value: number }>,
    baseline: StatisticalBaseline
  ): Anomaly[] {
    const anomalies: Anomaly[] = []
    const sensitivity = this.getSensitivityMultiplier()
    
    for (const point of data) {
      const zScore = Math.abs(point.value - baseline.mean) / baseline.stdDev
      const threshold = 2 * sensitivity // 2 standard deviations adjusted for sensitivity
      
      if (zScore > threshold) {
        const deviation = ((point.value - baseline.mean) / baseline.mean) * 100
        const isSpike = point.value > baseline.mean
        
        anomalies.push({
          id: this.generateAnomalyId(),
          timestamp: point.timestamp,
          component,
          metric,
          type: isSpike ? 'spike' : 'drop',
          severity: this.calculateSeverity(zScore, threshold),
          confidence: Math.min(0.95, zScore / threshold * 0.8),
          description: `${metric} ${isSpike ? 'spike' : 'drop'} detected: ${point.value.toFixed(2)} (${deviation.toFixed(1)}% from baseline)`,
          currentValue: point.value,
          expectedValue: baseline.mean,
          deviation: Math.abs(deviation),
          context: {
            baseline,
            recentValues: data.slice(-10).map(d => d.value)
          },
          metadata: {
            zScore,
            threshold,
            detectionMethod: 'statistical'
          }
        })
      }
    }

    return anomalies
  }

  /**
   * Detect trend anomalies
   */
  private detectTrendAnomalies(
    component: string,
    metric: string,
    data: Array<{ timestamp: number, value: number }>,
    baseline: StatisticalBaseline
  ): Anomaly[] {
    if (data.length < 5) return []

    const currentTrend = this.calculateTrend(data)
    const trendChange = this.compareTrends(baseline.trend, currentTrend)
    
    if (trendChange === 'significant') {
      const recentValues = data.map(d => d.value)
      const avgRecent = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length
      const deviation = ((avgRecent - baseline.mean) / baseline.mean) * 100

      return [{
        id: this.generateAnomalyId(),
        timestamp: data[data.length - 1].timestamp,
        component,
        metric,
        type: 'trend',
        severity: Math.abs(deviation) > 50 ? 'high' : 'medium',
        confidence: 0.75,
        description: `Trend change detected in ${metric}: ${baseline.trend} → ${currentTrend}`,
        currentValue: avgRecent,
        expectedValue: baseline.mean,
        deviation: Math.abs(deviation),
        context: {
          baseline,
          recentValues,
          historicalPattern: `Previous trend: ${baseline.trend}`
        },
        metadata: {
          previousTrend: baseline.trend,
          currentTrend,
          detectionMethod: 'trend'
        }
      }]
    }

    return []
  }

  /**
   * Detect pattern anomalies
   */
  private detectPatternAnomalies(
    component: string,
    metric: string,
    data: Array<{ timestamp: number, value: number }>,
    baseline: StatisticalBaseline
  ): Anomaly[] {
    // Simplified pattern detection - would be more sophisticated in production
    const anomalies: Anomaly[] = []
    
    // Check for unusual patterns like sudden flatlines or oscillations
    if (data.length >= 10) {
      const values = data.map(d => d.value)
      const uniqueValues = new Set(values.slice(-5)).size
      
      // Detect flatline (all recent values are the same)
      if (uniqueValues === 1 && baseline.stdDev > 0) {
        const flatlineValue = values[values.length - 1]
        const deviation = Math.abs(flatlineValue - baseline.mean)
        
        if (deviation > baseline.stdDev) {
          anomalies.push({
            id: this.generateAnomalyId(),
            timestamp: data[data.length - 1].timestamp,
            component,
            metric,
            type: 'pattern',
            severity: 'medium',
            confidence: 0.8,
            description: `Unusual flatline pattern detected in ${metric}`,
            currentValue: flatlineValue,
            expectedValue: baseline.mean,
            deviation: (deviation / baseline.mean) * 100,
            context: {
              baseline,
              recentValues: values.slice(-10),
              historicalPattern: 'flatline'
            },
            metadata: {
              patternType: 'flatline',
              detectionMethod: 'pattern'
            }
          })
        }
      }
    }

    return anomalies
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  /**
   * Calculate trend
   */
  private calculateTrend(data: Array<{ timestamp: number, value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 3) return 'stable'

    const values = data.map(d => d.value)
    const n = values.length
    
    // Simple linear regression slope
    const sumX = data.reduce((sum, _, i) => sum + i, 0)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0)
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    if (Math.abs(slope) < 0.1) return 'stable'
    return slope > 0 ? 'increasing' : 'decreasing'
  }

  /**
   * Detect seasonality (simplified)
   */
  private detectSeasonality(history: Array<{ timestamp: number, value: number }>): 'hourly' | 'daily' | 'weekly' | 'none' {
    // Simplified seasonality detection - would use more sophisticated algorithms in production
    if (history.length < 24) return 'none'
    
    // For now, return 'none' - would implement actual seasonality detection
    return 'none'
  }

  /**
   * Compare trends
   */
  private compareTrends(
    baseline: 'increasing' | 'decreasing' | 'stable',
    current: 'increasing' | 'decreasing' | 'stable'
  ): 'same' | 'different' | 'significant' {
    if (baseline === current) return 'same'
    if (baseline === 'stable' || current === 'stable') return 'different'
    return 'significant' // Trend reversal
  }

  /**
   * Get sensitivity multiplier
   */
  private getSensitivityMultiplier(): number {
    switch (this.config.sensitivity) {
      case 'low': return 1.5
      case 'medium': return 1.0
      case 'high': return 0.7
      default: return 1.0
    }
  }

  /**
   * Calculate anomaly severity
   */
  private calculateSeverity(zScore: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = zScore / threshold
    if (ratio > 3) return 'critical'
    if (ratio > 2) return 'high'
    if (ratio > 1.5) return 'medium'
    return 'low'
  }

  /**
   * Update anomaly patterns
   */
  private updatePatterns(anomalies: Anomaly[]): void {
    for (const anomaly of anomalies) {
      const patternKey = `${anomaly.component}:${anomaly.type}`
      
      if (!this.patterns.has(patternKey)) {
        this.patterns.set(patternKey, {
          name: `${anomaly.component} ${anomaly.type}`,
          description: `${anomaly.type} anomalies in ${anomaly.component}`,
          indicators: [anomaly.metric],
          confidence: anomaly.confidence,
          frequency: 1,
          lastSeen: anomaly.timestamp
        })
      } else {
        const pattern = this.patterns.get(patternKey)!
        pattern.frequency++
        pattern.lastSeen = Math.max(pattern.lastSeen, anomaly.timestamp)
        pattern.confidence = (pattern.confidence + anomaly.confidence) / 2
        
        if (!pattern.indicators.includes(anomaly.metric)) {
          pattern.indicators.push(anomaly.metric)
        }
      }
    }
  }

  /**
   * Analyze trends across all metrics
   */
  private analyzeTrends(): {
    increasing: string[]
    decreasing: string[]
    stable: string[]
  } {
    const trends = { increasing: [], decreasing: [], stable: [] }
    
    for (const [key, baseline] of this.baselines.entries()) {
      trends[baseline.trend].push(key)
    }
    
    return trends
  }

  /**
   * Generate recommendations based on anomalies
   */
  private generateRecommendations(anomalies: Anomaly[], patterns: AnomalyPattern[]): string[] {
    const recommendations: string[] = []
    
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical')
    if (criticalAnomalies.length > 0) {
      recommendations.push(`Investigate ${criticalAnomalies.length} critical anomalies immediately`)
    }
    
    const frequentPatterns = patterns.filter(p => p.frequency > 5)
    if (frequentPatterns.length > 0) {
      recommendations.push(`Review recurring patterns: ${frequentPatterns.map(p => p.name).join(', ')}`)
    }
    
    const componentCounts: Record<string, number> = {}
    for (const anomaly of anomalies) {
      componentCounts[anomaly.component] = (componentCounts[anomaly.component] || 0) + 1
    }
    
    const problematicComponents = Object.entries(componentCounts)
      .filter(([_, count]) => count > 3)
      .map(([component, _]) => component)
    
    if (problematicComponents.length > 0) {
      recommendations.push(`Focus on components with multiple anomalies: ${problematicComponents.join(', ')}`)
    }
    
    return recommendations
  }

  /**
   * Clean up old anomalies
   */
  private cleanupOldAnomalies(): void {
    if (this.anomalies.size <= this.maxAnomalies) return

    const sortedAnomalies = Array.from(this.anomalies.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)

    const toDelete = sortedAnomalies.slice(0, sortedAnomalies.length - this.maxAnomalies)
    for (const [id] of toDelete) {
      this.anomalies.delete(id)
    }
  }

  /**
   * Generate unique anomaly ID
   */
  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Global anomaly detection system
export const anomalyDetection = new AnomalyDetectionSystem()

/**
 * Utility function to add data point
 */
export function recordMetricForAnomalyDetection(
  component: string,
  metric: string,
  value: number,
  timestamp?: number
): void {
  anomalyDetection.addDataPoint(component, metric, value, timestamp)
}

/**
 * Utility function to get current anomalies
 */
export function getCurrentAnomalies(): Anomaly[] {
  return anomalyDetection.getCurrentAnomalies()
}
