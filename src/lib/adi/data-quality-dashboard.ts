/**
 * Data Quality Monitoring Dashboard
 * 
 * Provides comprehensive visibility into data quality across the ADI system.
 * Aggregates validation results, quality scores, cleansing statistics,
 * and integrity reports into actionable insights.
 * 
 * Features:
 * - Real-time data quality metrics
 * - Quality trend analysis
 * - Issue identification and prioritization
 * - Data quality recommendations
 * - Quality SLA monitoring
 * - Automated quality reporting
 */

import { dataValidation, type ValidationResult, type DataQualityProfile } from './data-validation'
import { dataQualityScorer, type DataQualityScore, type QualityTrend } from './data-quality-scoring'
import { dataCleansingPipeline, type CleansingResult, type CleansingProfile } from './data-cleansing'
import { dataIntegrityChecker, type IntegrityValidationResult, type IntegrityReport } from './data-integrity'

export interface DataQualityDashboard {
  timestamp: number
  overview: QualityOverview
  validation: ValidationSummary
  scoring: ScoringSummary
  cleansing: CleansingSummary
  integrity: IntegritySummary
  trends: QualityTrendSummary
  recommendations: QualityRecommendation[]
  alerts: QualityAlert[]
}

export interface QualityOverview {
  overallScore: number // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  dataTypes: number
  totalRecords: number
  qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  slaCompliance: number // 0-100
  topIssues: Array<{
    issue: string
    frequency: number
    impact: 'low' | 'medium' | 'high' | 'critical'
    trend: 'improving' | 'stable' | 'worsening'
  }>
}

export interface ValidationSummary {
  totalValidations: number
  passRate: number
  errorRate: number
  warningRate: number
  topValidationIssues: Array<{
    rule: string
    failures: number
    dataTypes: string[]
  }>
  validationTrends: {
    daily: Array<{ date: string, passRate: number }>
    weekly: Array<{ week: string, passRate: number }>
  }
}

export interface ScoringSummary {
  averageScore: number
  scoreDistribution: Record<string, number> // A: 10, B: 20, etc.
  dimensionScores: Record<string, number>
  lowQualityDataTypes: Array<{
    dataType: string
    score: number
    issues: string[]
  }>
  scoreTrends: {
    overall: QualityTrend
    byDimension: Record<string, QualityTrend>
  }
}

export interface CleansingSummary {
  totalCleansed: number
  cleansingRate: number
  averageImprovement: number
  autoFixRate: number
  topIssuesFixed: Array<{
    issue: string
    frequency: number
    autoFixed: number
    manualReview: number
  }>
  cleansingEfficiency: number
}

export interface IntegritySummary {
  overallIntegrityScore: number
  violationRate: number
  criticalViolations: number
  topViolations: Array<{
    rule: string
    frequency: number
    severity: 'error' | 'warning' | 'info'
  }>
  integrityTrends: {
    scoreChange: number
    violationChange: number
    trend: 'improving' | 'stable' | 'degrading'
  }
}

export interface QualityTrendSummary {
  timeWindow: string
  overallTrend: 'improving' | 'stable' | 'degrading'
  trendVelocity: number // Change per day
  prediction: {
    nextWeekScore: number
    confidence: number
  }
  seasonality: {
    detected: boolean
    pattern?: 'daily' | 'weekly' | 'monthly'
    impact: number
  }
}

export interface QualityRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'validation' | 'scoring' | 'cleansing' | 'integrity' | 'process'
  title: string
  description: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  actions: string[]
  expectedBenefit: string
  dataTypes: string[]
  estimatedTimeToImplement: string
}

export interface QualityAlert {
  id: string
  severity: 'info' | 'warning' | 'critical' | 'emergency'
  title: string
  description: string
  dataType?: string
  metric: string
  currentValue: number
  threshold: number
  trend: 'improving' | 'stable' | 'worsening'
  timestamp: number
  acknowledged: boolean
}

export interface QualitySLA {
  name: string
  target: number
  current: number
  compliance: number
  trend: 'improving' | 'stable' | 'degrading'
  breaches: number
  lastBreach?: number
}

export class DataQualityDashboardManager {
  private updateInterval?: NodeJS.Timeout
  private isRunning = false
  private lastUpdate = 0
  
  private readonly updateIntervalMs = 30000 // 30 seconds
  private readonly qualitySLAs: QualitySLA[] = [
    { name: 'Overall Quality Score', target: 85, current: 0, compliance: 0, trend: 'stable', breaches: 0 },
    { name: 'Validation Pass Rate', target: 95, current: 0, compliance: 0, trend: 'stable', breaches: 0 },
    { name: 'Data Completeness', target: 90, current: 0, compliance: 0, trend: 'stable', breaches: 0 },
    { name: 'Integrity Score', target: 90, current: 0, compliance: 0, trend: 'stable', breaches: 0 }
  ]

  constructor() {
    // Initialize quality monitoring systems if not already running
    this.initializeQualityMonitoring()
  }

  /**
   * Start dashboard updates
   */
  start(): void {
    if (this.isRunning) return

    console.log('📊 Starting data quality dashboard...')
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

    console.log('📊 Stopping data quality dashboard...')
    this.isRunning = false
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): DataQualityDashboard {
    const overview = this.generateQualityOverview()
    const validation = this.generateValidationSummary()
    const scoring = this.generateScoringSummary()
    const cleansing = this.generateCleansingSummary()
    const integrity = this.generateIntegritySummary()
    const trends = this.generateTrendSummary()
    const recommendations = this.generateRecommendations(overview, validation, scoring, cleansing, integrity)
    const alerts = this.generateQualityAlerts(overview, validation, scoring, integrity)

    return {
      timestamp: Date.now(),
      overview,
      validation,
      scoring,
      cleansing,
      integrity,
      trends,
      recommendations,
      alerts
    }
  }

  /**
   * Get quality SLA status
   */
  getQualitySLAs(): QualitySLA[] {
    // Update current values from latest metrics
    const dashboardData = this.getDashboardData()
    
    this.qualitySLAs[0].current = dashboardData.overview.overallScore
    this.qualitySLAs[1].current = dashboardData.validation.passRate
    this.qualitySLAs[2].current = dashboardData.scoring.dimensionScores.completeness || 0
    this.qualitySLAs[3].current = dashboardData.integrity.overallIntegrityScore

    // Update compliance and trends
    for (const sla of this.qualitySLAs) {
      sla.compliance = (sla.current / sla.target) * 100
      
      if (sla.current < sla.target) {
        sla.breaches++
        sla.lastBreach = Date.now()
      }
      
      // Simple trend calculation (would be more sophisticated in production)
      sla.trend = sla.compliance > 95 ? 'improving' : 
                  sla.compliance > 85 ? 'stable' : 'degrading'
    }

    return this.qualitySLAs
  }

  /**
   * Get data quality report
   */
  generateQualityReport(timeWindow: number = 7 * 24 * 60 * 60 * 1000): {
    executiveSummary: string
    keyMetrics: Record<string, number>
    trends: string[]
    issues: string[]
    recommendations: string[]
    slaStatus: string
  } {
    const dashboard = this.getDashboardData()
    const slas = this.getQualitySLAs()
    
    // Executive summary
    const executiveSummary = this.generateExecutiveSummary(dashboard)
    
    // Key metrics
    const keyMetrics = {
      'Overall Quality Score': dashboard.overview.overallScore,
      'Validation Pass Rate': dashboard.validation.passRate,
      'Data Cleansing Rate': dashboard.cleansing.cleansingRate,
      'Integrity Score': dashboard.integrity.overallIntegrityScore,
      'Total Records Processed': dashboard.overview.totalRecords
    }
    
    // Trends
    const trends = [
      `Overall quality trend: ${dashboard.trends.overallTrend}`,
      `Quality velocity: ${dashboard.trends.trendVelocity.toFixed(2)} points/day`,
      `Predicted next week score: ${dashboard.trends.prediction.nextWeekScore}`
    ]
    
    // Issues
    const issues = dashboard.overview.topIssues.map(issue => 
      `${issue.issue} (${issue.frequency} occurrences, ${issue.impact} impact)`
    )
    
    // Recommendations
    const recommendations = dashboard.recommendations
      .filter(r => r.priority === 'high' || r.priority === 'critical')
      .map(r => r.title)
      .slice(0, 5)
    
    // SLA status
    const slaCompliant = slas.filter(sla => sla.compliance >= 100).length
    const slaStatus = `${slaCompliant}/${slas.length} SLAs compliant`
    
    return {
      executiveSummary,
      keyMetrics,
      trends,
      issues,
      recommendations,
      slaStatus
    }
  }

  /**
   * Generate quality overview
   */
  private generateQualityOverview(): QualityOverview {
    const validationStats = dataValidation.getSystemQualityMetrics()
    const scoringStats = dataQualityScorer.getQualitySummary([])
    const cleansingStats = dataCleansingPipeline.getCleansingStatistics()
    const integrityStats = dataIntegrityChecker.getIntegrityStatistics()
    
    // Calculate overall score as weighted average
    const overallScore = Math.round(
      (validationStats.overallScore * 0.3) +
      (scoringStats.overallScore * 0.3) +
      (integrityStats.overallScore * 0.25) +
      ((100 - validationStats.errorRate) * 0.15)
    )
    
    const status = this.getStatusFromScore(overallScore)
    const qualityGrade = this.getGradeFromScore(overallScore)
    
    // Aggregate top issues
    const topIssues = [
      ...validationStats.topIssues.map(issue => ({
        issue: issue.issue,
        frequency: issue.frequency,
        impact: 'medium' as const,
        trend: 'stable' as const
      })),
      ...cleansingStats.topIssuesFixed.map(issue => ({
        issue: issue.issue,
        frequency: issue.frequency,
        impact: 'low' as const,
        trend: 'improving' as const
      }))
    ].sort((a, b) => b.frequency - a.frequency).slice(0, 5)
    
    return {
      overallScore,
      status,
      dataTypes: Object.keys(integrityStats.dataTypeScores).length,
      totalRecords: validationStats.totalValidations + cleansingStats.totalRecords,
      qualityGrade,
      slaCompliance: this.calculateSLACompliance(),
      topIssues
    }
  }

  /**
   * Generate validation summary
   */
  private generateValidationSummary(): ValidationSummary {
    const stats = dataValidation.getSystemQualityMetrics()
    
    return {
      totalValidations: stats.totalValidations,
      passRate: 100 - stats.errorRate,
      errorRate: stats.errorRate,
      warningRate: stats.warningRate,
      topValidationIssues: stats.topIssues.map(issue => ({
        rule: issue.issue,
        failures: issue.frequency,
        dataTypes: ['unknown'] // Would track actual data types
      })).slice(0, 10),
      validationTrends: {
        daily: this.generateDailyTrends('validation'),
        weekly: this.generateWeeklyTrends('validation')
      }
    }
  }

  /**
   * Generate scoring summary
   */
  private generateScoringSummary(): ScoringSummary {
    const summary = dataQualityScorer.getQualitySummary([])
    
    // Generate score distribution
    const scoreDistribution: Record<string, number> = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    }
    
    // Would populate from actual data
    scoreDistribution['B (80-89)'] = 60
    scoreDistribution['C (70-79)'] = 30
    scoreDistribution['D (60-69)'] = 10
    
    return {
      averageScore: summary.overallScore,
      scoreDistribution,
      dimensionScores: summary.dimensionAverages,
      lowQualityDataTypes: Object.entries(summary.sourceScores)
        .filter(([_, score]) => score < 70)
        .map(([dataType, score]) => ({
          dataType,
          score,
          issues: ['Low completeness', 'Format inconsistencies']
        })),
      scoreTrends: {
        overall: {
          dimension: 'overall',
          timeWindow: 7 * 24 * 60 * 60 * 1000,
          dataPoints: [],
          trend: 'stable',
          velocity: 0,
          prediction: summary.overallScore
        },
        byDimension: {}
      }
    }
  }

  /**
   * Generate cleansing summary
   */
  private generateCleansingSummary(): CleansingSummary {
    const stats = dataCleansingPipeline.getCleansingStatistics()
    
    return {
      totalCleansed: stats.cleanedRecords,
      cleansingRate: stats.cleansingEfficiency,
      averageImprovement: stats.averageQualityImprovement,
      autoFixRate: stats.autoFixRate,
      topIssuesFixed: stats.topIssuesFixed.map(issue => ({
        issue: issue.issue,
        frequency: issue.frequency,
        autoFixed: Math.round(issue.frequency * 0.8), // Estimate
        manualReview: Math.round(issue.frequency * 0.2)
      })),
      cleansingEfficiency: stats.cleansingEfficiency
    }
  }

  /**
   * Generate integrity summary
   */
  private generateIntegritySummary(): IntegritySummary {
    const stats = dataIntegrityChecker.getIntegrityStatistics()
    
    return {
      overallIntegrityScore: stats.overallScore,
      violationRate: stats.violationRate,
      criticalViolations: 0, // Would calculate from actual data
      topViolations: stats.topIssues.map(issue => ({
        rule: issue.issue,
        frequency: issue.frequency,
        severity: 'warning' as const // Would determine from actual data
      })),
      integrityTrends: {
        scoreChange: 0, // Would calculate from historical data
        violationChange: 0,
        trend: 'stable'
      }
    }
  }

  /**
   * Generate trend summary
   */
  private generateTrendSummary(): QualityTrendSummary {
    return {
      timeWindow: '7 days',
      overallTrend: 'stable',
      trendVelocity: 0.5, // Points per day
      prediction: {
        nextWeekScore: 85,
        confidence: 0.8
      },
      seasonality: {
        detected: false,
        impact: 0
      }
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    overview: QualityOverview,
    validation: ValidationSummary,
    scoring: ScoringSummary,
    cleansing: CleansingSummary,
    integrity: IntegritySummary
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = []
    
    // Overall quality recommendations
    if (overview.overallScore < 80) {
      recommendations.push({
        id: 'improve_overall_quality',
        priority: 'high',
        category: 'process',
        title: 'Improve Overall Data Quality',
        description: `Overall quality score is ${overview.overallScore}/100, below target of 85`,
        impact: 'Improved data reliability and better insights for brand merchants',
        effort: 'medium',
        actions: [
          'Review and strengthen validation rules',
          'Implement additional data cleansing rules',
          'Enhance data collection processes'
        ],
        expectedBenefit: '15-20 point improvement in quality score',
        dataTypes: ['all'],
        estimatedTimeToImplement: '2-3 weeks'
      })
    }
    
    // Validation recommendations
    if (validation.errorRate > 5) {
      recommendations.push({
        id: 'reduce_validation_errors',
        priority: 'high',
        category: 'validation',
        title: 'Reduce Validation Error Rate',
        description: `Validation error rate is ${validation.errorRate.toFixed(1)}%, above target of 5%`,
        impact: 'Reduced data quality issues and improved system reliability',
        effort: 'medium',
        actions: [
          'Review failing validation rules',
          'Improve data source quality',
          'Add pre-validation data cleansing'
        ],
        expectedBenefit: 'Reduce error rate to under 3%',
        dataTypes: validation.topValidationIssues.map(issue => issue.rule),
        estimatedTimeToImplement: '1-2 weeks'
      })
    }
    
    // Cleansing recommendations
    if (cleansing.cleansingRate < 80) {
      recommendations.push({
        id: 'improve_cleansing_coverage',
        priority: 'medium',
        category: 'cleansing',
        title: 'Improve Data Cleansing Coverage',
        description: `Only ${cleansing.cleansingRate.toFixed(1)}% of data is being cleansed`,
        impact: 'Higher quality data and reduced manual intervention',
        effort: 'low',
        actions: [
          'Add more cleansing rules',
          'Improve auto-fix capabilities',
          'Expand cleansing to more data types'
        ],
        expectedBenefit: 'Increase cleansing coverage to 90%+',
        dataTypes: ['all'],
        estimatedTimeToImplement: '1 week'
      })
    }
    
    // Integrity recommendations
    if (integrity.overallIntegrityScore < 85) {
      recommendations.push({
        id: 'strengthen_data_integrity',
        priority: 'high',
        category: 'integrity',
        title: 'Strengthen Data Integrity Controls',
        description: `Integrity score is ${integrity.overallIntegrityScore}/100, below target`,
        impact: 'More reliable data relationships and consistency',
        effort: 'medium',
        actions: [
          'Add more integrity rules',
          'Implement cross-dataset validation',
          'Strengthen referential integrity checks'
        ],
        expectedBenefit: 'Achieve 90%+ integrity score',
        dataTypes: ['all'],
        estimatedTimeToImplement: '2 weeks'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Generate quality alerts
   */
  private generateQualityAlerts(
    overview: QualityOverview,
    validation: ValidationSummary,
    scoring: ScoringSummary,
    integrity: IntegritySummary
  ): QualityAlert[] {
    const alerts: QualityAlert[] = []
    
    // Overall quality alert
    if (overview.overallScore < 70) {
      alerts.push({
        id: 'low_overall_quality',
        severity: overview.overallScore < 50 ? 'critical' : 'warning',
        title: 'Low Overall Data Quality',
        description: `Overall quality score has dropped to ${overview.overallScore}/100`,
        metric: 'overall_quality_score',
        currentValue: overview.overallScore,
        threshold: 80,
        trend: 'worsening',
        timestamp: Date.now(),
        acknowledged: false
      })
    }
    
    // Validation error rate alert
    if (validation.errorRate > 10) {
      alerts.push({
        id: 'high_validation_error_rate',
        severity: validation.errorRate > 20 ? 'critical' : 'warning',
        title: 'High Validation Error Rate',
        description: `Validation error rate is ${validation.errorRate.toFixed(1)}%`,
        metric: 'validation_error_rate',
        currentValue: validation.errorRate,
        threshold: 5,
        trend: 'worsening',
        timestamp: Date.now(),
        acknowledged: false
      })
    }
    
    // Integrity violations alert
    if (integrity.violationRate > 15) {
      alerts.push({
        id: 'high_integrity_violations',
        severity: 'warning',
        title: 'High Integrity Violation Rate',
        description: `Integrity violation rate is ${integrity.violationRate.toFixed(1)}%`,
        metric: 'integrity_violation_rate',
        currentValue: integrity.violationRate,
        threshold: 10,
        trend: 'stable',
        timestamp: Date.now(),
        acknowledged: false
      })
    }
    
    return alerts
  }

  /**
   * Utility methods
   */
  private getStatusFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent'
    if (score >= 80) return 'good'
    if (score >= 70) return 'fair'
    if (score >= 60) return 'poor'
    return 'critical'
  }

  private getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private calculateSLACompliance(): number {
    const slas = this.getQualitySLAs()
    const compliantSLAs = slas.filter(sla => sla.compliance >= 100).length
    return (compliantSLAs / slas.length) * 100
  }

  private generateDailyTrends(metric: string): Array<{ date: string, passRate: number }> {
    // Generate mock daily trends - would use actual historical data
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      trends.push({
        date: date.toISOString().split('T')[0],
        passRate: 85 + Math.random() * 10
      })
    }
    return trends
  }

  private generateWeeklyTrends(metric: string): Array<{ week: string, passRate: number }> {
    // Generate mock weekly trends - would use actual historical data
    const trends = []
    for (let i = 3; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000))
      trends.push({
        week: `Week ${date.getWeek()}`,
        passRate: 80 + Math.random() * 15
      })
    }
    return trends
  }

  private generateExecutiveSummary(dashboard: DataQualityDashboard): string {
    const { overview, trends } = dashboard
    
    return `Data quality is currently ${overview.status} with an overall score of ${overview.overallScore}/100 (Grade ${overview.qualityGrade}). ` +
           `The system has processed ${overview.totalRecords.toLocaleString()} records across ${overview.dataTypes} data types. ` +
           `Quality trends are ${trends.overallTrend} with a velocity of ${trends.trendVelocity.toFixed(1)} points per day. ` +
           `SLA compliance is at ${overview.slaCompliance.toFixed(1)}%. ` +
           `${dashboard.alerts.filter(a => a.severity === 'critical').length} critical alerts require immediate attention.`
  }

  private updateDashboard(): void {
    this.lastUpdate = Date.now()
    
    // This would trigger real-time updates to connected clients
    const data = this.getDashboardData()
    console.log(`📊 Data quality dashboard updated: ${data.overview.status} (${data.overview.overallScore}/100)`)
  }

  private initializeQualityMonitoring(): void {
    // Initialize quality monitoring systems if needed
    console.log('📊 Initialized data quality monitoring')
  }
}

// Extend Date prototype for week calculation
declare global {
  interface Date {
    getWeek(): number
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// Global data quality dashboard instance
export const dataQualityDashboard = new DataQualityDashboardManager()

/**
 * Utility function to get dashboard snapshot
 */
export function getDataQualitySnapshot(): DataQualityDashboard {
  return dataQualityDashboard.getDashboardData()
}

/**
 * Utility function to get quality report
 */
export function generateDataQualityReport(timeWindow?: number): ReturnType<DataQualityDashboardManager['generateQualityReport']> {
  return dataQualityDashboard.generateQualityReport(timeWindow)
}
