/**
 * Data Quality Scoring System
 * 
 * Provides comprehensive data quality assessment with multi-dimensional
 * scoring, confidence metrics, and quality trend analysis. Helps ensure
 * that only high-quality data contributes to brand insights.
 * 
 * Features:
 * - Multi-dimensional quality scoring
 * - Confidence interval calculation
 * - Data freshness assessment
 * - Completeness analysis
 * - Consistency validation
 * - Accuracy estimation
 */

export interface QualityDimension {
  name: string
  weight: number // 0-1, sum of all weights should be 1
  score: number // 0-100
  confidence: number // 0-1
  factors: QualityFactor[]
}

export interface QualityFactor {
  name: string
  description: string
  score: number // 0-100
  weight: number // 0-1 within dimension
  evidence: any[]
  issues: string[]
}

export interface DataQualityScore {
  overall: number // 0-100 weighted average of all dimensions
  confidence: number // 0-1 overall confidence in the score
  dimensions: QualityDimension[]
  metadata: {
    timestamp: number
    dataSource: string
    recordCount: number
    processingTime: number
    qualityGrade: 'A' | 'B' | 'C' | 'D' | 'F'
    recommendations: string[]
  }
}

export interface QualityBenchmark {
  dimension: string
  target: number // Target score 0-100
  current: number // Current score 0-100
  trend: 'improving' | 'stable' | 'degrading'
  gap: number // Difference from target
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface QualityTrend {
  dimension: string
  timeWindow: number // Time window in ms
  dataPoints: Array<{ timestamp: number, score: number }>
  trend: 'improving' | 'stable' | 'degrading'
  velocity: number // Rate of change per day
  prediction: number // Predicted score in 7 days
}

export class DataQualityScorer {
  private qualityHistory: Map<string, DataQualityScore[]> = new Map()
  private benchmarks: Map<string, QualityBenchmark> = new Map()
  
  private readonly maxHistorySize = 1000
  
  // Quality dimension weights (should sum to 1.0)
  private readonly dimensionWeights = {
    completeness: 0.25,    // How complete is the data
    accuracy: 0.25,        // How accurate is the data
    consistency: 0.20,     // How consistent is the data
    freshness: 0.15,       // How fresh/recent is the data
    validity: 0.15         // How valid is the data format/structure
  }

  constructor() {
    this.initializeBenchmarks()
  }

  /**
   * Calculate comprehensive data quality score
   */
  calculateQualityScore(
    dataSource: string,
    data: any,
    metadata?: any
  ): DataQualityScore {
    const startTime = Date.now()
    
    // Calculate each quality dimension
    const completeness = this.assessCompleteness(data, metadata)
    const accuracy = this.assessAccuracy(data, metadata)
    const consistency = this.assessConsistency(data, metadata)
    const freshness = this.assessFreshness(data, metadata)
    const validity = this.assessValidity(data, metadata)
    
    const dimensions: QualityDimension[] = [
      {
        name: 'completeness',
        weight: this.dimensionWeights.completeness,
        score: completeness.score,
        confidence: completeness.confidence,
        factors: completeness.factors
      },
      {
        name: 'accuracy',
        weight: this.dimensionWeights.accuracy,
        score: accuracy.score,
        confidence: accuracy.confidence,
        factors: accuracy.factors
      },
      {
        name: 'consistency',
        weight: this.dimensionWeights.consistency,
        score: consistency.score,
        confidence: consistency.confidence,
        factors: consistency.factors
      },
      {
        name: 'freshness',
        weight: this.dimensionWeights.freshness,
        score: freshness.score,
        confidence: freshness.confidence,
        factors: freshness.factors
      },
      {
        name: 'validity',
        weight: this.dimensionWeights.validity,
        score: validity.score,
        confidence: validity.confidence,
        factors: validity.factors
      }
    ]

    // Calculate overall score as weighted average
    const overallScore = Math.round(
      dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight), 0)
    )

    // Calculate overall confidence
    const overallConfidence = dimensions.reduce((sum, dim) => 
      sum + (dim.confidence * dim.weight), 0
    )

    // Generate recommendations
    const recommendations = this.generateRecommendations(dimensions)

    const qualityScore: DataQualityScore = {
      overall: overallScore,
      confidence: overallConfidence,
      dimensions,
      metadata: {
        timestamp: Date.now(),
        dataSource,
        recordCount: this.getRecordCount(data),
        processingTime: Date.now() - startTime,
        qualityGrade: this.getQualityGrade(overallScore),
        recommendations
      }
    }

    // Store in history
    this.storeQualityScore(dataSource, qualityScore)

    return qualityScore
  }

  /**
   * Get quality trends for a data source
   */
  getQualityTrends(
    dataSource: string, 
    timeWindow: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ): QualityTrend[] {
    const history = this.getQualityHistory(dataSource, timeWindow)
    
    if (history.length < 2) {
      return []
    }

    const trends: QualityTrend[] = []
    
    // Calculate trends for each dimension
    for (const dimensionName of Object.keys(this.dimensionWeights)) {
      const dataPoints = history.map(score => ({
        timestamp: score.metadata.timestamp,
        score: score.dimensions.find(d => d.name === dimensionName)?.score || 0
      }))

      const trend = this.calculateTrend(dataPoints)
      const velocity = this.calculateVelocity(dataPoints)
      const prediction = this.predictScore(dataPoints, 7 * 24 * 60 * 60 * 1000) // 7 days

      trends.push({
        dimension: dimensionName,
        timeWindow,
        dataPoints,
        trend,
        velocity,
        prediction
      })
    }

    return trends
  }

  /**
   * Get quality benchmarks
   */
  getQualityBenchmarks(dataSource?: string): QualityBenchmark[] {
    const benchmarks = Array.from(this.benchmarks.values())
    
    if (dataSource) {
      // Update current scores from latest quality assessment
      const latestScore = this.getLatestQualityScore(dataSource)
      if (latestScore) {
        for (const benchmark of benchmarks) {
          const dimension = latestScore.dimensions.find(d => d.name === benchmark.dimension)
          if (dimension) {
            benchmark.current = dimension.score
            benchmark.gap = benchmark.target - dimension.score
            benchmark.priority = this.calculateBenchmarkPriority(benchmark.gap)
          }
        }
      }
    }
    
    return benchmarks
  }

  /**
   * Get quality summary for multiple data sources
   */
  getQualitySummary(dataSources: string[]): {
    overallScore: number
    sourceScores: Record<string, number>
    dimensionAverages: Record<string, number>
    topIssues: Array<{ issue: string, frequency: number, sources: string[] }>
    recommendations: string[]
  } {
    const sourceScores: Record<string, number> = {}
    const dimensionTotals: Record<string, { total: number, count: number }> = {}
    const issueMap = new Map<string, { frequency: number, sources: Set<string> }>()
    const allRecommendations = new Set<string>()

    for (const source of dataSources) {
      const latestScore = this.getLatestQualityScore(source)
      if (latestScore) {
        sourceScores[source] = latestScore.overall
        
        // Aggregate dimension scores
        for (const dimension of latestScore.dimensions) {
          if (!dimensionTotals[dimension.name]) {
            dimensionTotals[dimension.name] = { total: 0, count: 0 }
          }
          dimensionTotals[dimension.name].total += dimension.score
          dimensionTotals[dimension.name].count++
          
          // Collect issues
          for (const factor of dimension.factors) {
            for (const issue of factor.issues) {
              if (!issueMap.has(issue)) {
                issueMap.set(issue, { frequency: 0, sources: new Set() })
              }
              const issueData = issueMap.get(issue)!
              issueData.frequency++
              issueData.sources.add(source)
            }
          }
        }
        
        // Collect recommendations
        for (const rec of latestScore.metadata.recommendations) {
          allRecommendations.add(rec)
        }
      }
    }

    // Calculate averages
    const dimensionAverages: Record<string, number> = {}
    for (const [dimension, data] of Object.entries(dimensionTotals)) {
      dimensionAverages[dimension] = Math.round(data.total / data.count)
    }

    // Calculate overall score
    const scores = Object.values(sourceScores)
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0

    // Top issues
    const topIssues = Array.from(issueMap.entries())
      .map(([issue, data]) => ({
        issue,
        frequency: data.frequency,
        sources: Array.from(data.sources)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    return {
      overallScore,
      sourceScores,
      dimensionAverages,
      topIssues,
      recommendations: Array.from(allRecommendations).slice(0, 10)
    }
  }

  /**
   * Assess data completeness
   */
  private assessCompleteness(data: any, metadata?: any): {
    score: number
    confidence: number
    factors: QualityFactor[]
  } {
    const factors: QualityFactor[] = []
    
    // Field completeness
    const requiredFields = this.getRequiredFields(data, metadata)
    const presentFields = this.getPresentFields(data)
    const fieldCompleteness = requiredFields.length > 0 
      ? (presentFields.filter(f => requiredFields.includes(f)).length / requiredFields.length) * 100
      : 100

    factors.push({
      name: 'field_completeness',
      description: 'Percentage of required fields present',
      score: Math.round(fieldCompleteness),
      weight: 0.6,
      evidence: presentFields,
      issues: requiredFields.filter(f => !presentFields.includes(f))
        .map(f => `Missing required field: ${f}`)
    })

    // Value completeness (non-empty values)
    const nonEmptyValues = this.countNonEmptyValues(data)
    const totalValues = this.countTotalValues(data)
    const valueCompleteness = totalValues > 0 ? (nonEmptyValues / totalValues) * 100 : 100

    factors.push({
      name: 'value_completeness',
      description: 'Percentage of non-empty values',
      score: Math.round(valueCompleteness),
      weight: 0.4,
      evidence: [{ nonEmptyValues, totalValues }],
      issues: valueCompleteness < 90 ? ['Some fields have empty values'] : []
    })

    // Calculate overall completeness score
    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    )

    return {
      score: overallScore,
      confidence: 0.9, // High confidence in completeness assessment
      factors
    }
  }

  /**
   * Assess data accuracy
   */
  private assessAccuracy(data: any, metadata?: any): {
    score: number
    confidence: number
    factors: QualityFactor[]
  } {
    const factors: QualityFactor[] = []
    
    // Format accuracy
    const formatIssues = this.checkFormatAccuracy(data)
    const formatScore = Math.max(0, 100 - (formatIssues.length * 10))

    factors.push({
      name: 'format_accuracy',
      description: 'Data format correctness',
      score: formatScore,
      weight: 0.4,
      evidence: [],
      issues: formatIssues
    })

    // Range accuracy
    const rangeIssues = this.checkRangeAccuracy(data)
    const rangeScore = Math.max(0, 100 - (rangeIssues.length * 15))

    factors.push({
      name: 'range_accuracy',
      description: 'Values within expected ranges',
      score: rangeScore,
      weight: 0.3,
      evidence: [],
      issues: rangeIssues
    })

    // Business rule accuracy
    const businessRuleIssues = this.checkBusinessRules(data, metadata)
    const businessRuleScore = Math.max(0, 100 - (businessRuleIssues.length * 20))

    factors.push({
      name: 'business_rule_accuracy',
      description: 'Compliance with business rules',
      score: businessRuleScore,
      weight: 0.3,
      evidence: [],
      issues: businessRuleIssues
    })

    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    )

    return {
      score: overallScore,
      confidence: 0.7, // Medium confidence in accuracy assessment
      factors
    }
  }

  /**
   * Assess data consistency
   */
  private assessConsistency(data: any, metadata?: any): {
    score: number
    confidence: number
    factors: QualityFactor[]
  } {
    const factors: QualityFactor[] = []
    
    // Internal consistency
    const internalIssues = this.checkInternalConsistency(data)
    const internalScore = Math.max(0, 100 - (internalIssues.length * 15))

    factors.push({
      name: 'internal_consistency',
      description: 'Consistency within the dataset',
      score: internalScore,
      weight: 0.6,
      evidence: [],
      issues: internalIssues
    })

    // Cross-reference consistency
    const crossRefIssues = this.checkCrossReferenceConsistency(data, metadata)
    const crossRefScore = Math.max(0, 100 - (crossRefIssues.length * 20))

    factors.push({
      name: 'cross_reference_consistency',
      description: 'Consistency with reference data',
      score: crossRefScore,
      weight: 0.4,
      evidence: [],
      issues: crossRefIssues
    })

    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    )

    return {
      score: overallScore,
      confidence: 0.6, // Lower confidence due to complexity of consistency checks
      factors
    }
  }

  /**
   * Assess data freshness
   */
  private assessFreshness(data: any, metadata?: any): {
    score: number
    confidence: number
    factors: QualityFactor[]
  } {
    const factors: QualityFactor[] = []
    const now = Date.now()
    
    // Timestamp freshness
    const timestamp = this.extractTimestamp(data, metadata)
    const age = timestamp ? now - timestamp : 0
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const freshnessScore = timestamp 
      ? Math.max(0, 100 - ((age / maxAge) * 100))
      : 50 // Default score if no timestamp

    factors.push({
      name: 'timestamp_freshness',
      description: 'How recent is the data',
      score: Math.round(freshnessScore),
      weight: 0.8,
      evidence: [{ timestamp, age, ageHours: age / (60 * 60 * 1000) }],
      issues: age > maxAge ? [`Data is ${Math.round(age / (60 * 60 * 1000))} hours old`] : []
    })

    // Update frequency
    const updateFrequency = this.assessUpdateFrequency(data, metadata)
    factors.push({
      name: 'update_frequency',
      description: 'How frequently data is updated',
      score: updateFrequency.score,
      weight: 0.2,
      evidence: [updateFrequency.evidence],
      issues: updateFrequency.issues
    })

    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    )

    return {
      score: overallScore,
      confidence: 0.8, // High confidence in freshness assessment
      factors
    }
  }

  /**
   * Assess data validity
   */
  private assessValidity(data: any, metadata?: any): {
    score: number
    confidence: number
    factors: QualityFactor[]
  } {
    const factors: QualityFactor[] = []
    
    // Schema validity
    const schemaIssues = this.checkSchemaValidity(data)
    const schemaScore = Math.max(0, 100 - (schemaIssues.length * 20))

    factors.push({
      name: 'schema_validity',
      description: 'Compliance with expected schema',
      score: schemaScore,
      weight: 0.5,
      evidence: [],
      issues: schemaIssues
    })

    // Data type validity
    const typeIssues = this.checkDataTypeValidity(data)
    const typeScore = Math.max(0, 100 - (typeIssues.length * 15))

    factors.push({
      name: 'data_type_validity',
      description: 'Correct data types for fields',
      score: typeScore,
      weight: 0.3,
      evidence: [],
      issues: typeIssues
    })

    // Constraint validity
    const constraintIssues = this.checkConstraintValidity(data)
    const constraintScore = Math.max(0, 100 - (constraintIssues.length * 10))

    factors.push({
      name: 'constraint_validity',
      description: 'Compliance with data constraints',
      score: constraintScore,
      weight: 0.2,
      evidence: [],
      issues: constraintIssues
    })

    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
    )

    return {
      score: overallScore,
      confidence: 0.85, // High confidence in validity assessment
      factors
    }
  }

  /**
   * Helper methods for quality assessment
   */
  private getRequiredFields(data: any, metadata?: any): string[] {
    // This would be configurable based on data type
    if (metadata?.dataType === 'agent_output') {
      return ['agentName', 'status', 'results']
    }
    if (metadata?.dataType === 'crawl_data') {
      return ['url', 'content']
    }
    return []
  }

  private getPresentFields(data: any): string[] {
    if (!data || typeof data !== 'object') return []
    return Object.keys(data).filter(key => data[key] !== undefined && data[key] !== null)
  }

  private countNonEmptyValues(data: any): number {
    if (!data || typeof data !== 'object') return 0
    
    let count = 0
    for (const value of Object.values(data)) {
      if (value !== null && value !== undefined && value !== '') {
        count++
      }
    }
    return count
  }

  private countTotalValues(data: any): number {
    if (!data || typeof data !== 'object') return 0
    return Object.keys(data).length
  }

  private checkFormatAccuracy(data: any): string[] {
    const issues: string[] = []
    
    // Check URL formats
    if (data.url && typeof data.url === 'string') {
      if (!/^https?:\/\/.+/.test(data.url)) {
        issues.push('Invalid URL format')
      }
    }
    
    // Check email formats
    if (data.email && typeof data.email === 'string') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        issues.push('Invalid email format')
      }
    }
    
    return issues
  }

  private checkRangeAccuracy(data: any): string[] {
    const issues: string[] = []
    
    // Check score ranges
    if (data.score !== undefined) {
      const score = parseFloat(data.score)
      if (isNaN(score) || score < 0 || score > 100) {
        issues.push('Score out of valid range (0-100)')
      }
    }
    
    return issues
  }

  private checkBusinessRules(data: any, metadata?: any): string[] {
    const issues: string[] = []
    
    // Example business rules
    if (data.agentName === 'crawl_agent' && !data.url) {
      issues.push('Crawl agent output must include URL')
    }
    
    return issues
  }

  private checkInternalConsistency(data: any): string[] {
    const issues: string[] = []
    
    // Check for contradictory values
    if (data.status === 'completed' && (!data.results || data.results.length === 0)) {
      issues.push('Status is completed but no results provided')
    }
    
    return issues
  }

  private checkCrossReferenceConsistency(data: any, metadata?: any): string[] {
    // This would check against reference data
    return []
  }

  private extractTimestamp(data: any, metadata?: any): number | null {
    if (data.timestamp) return data.timestamp
    if (data.createdAt) return new Date(data.createdAt).getTime()
    if (metadata?.timestamp) return metadata.timestamp
    return null
  }

  private assessUpdateFrequency(data: any, metadata?: any): {
    score: number
    evidence: any
    issues: string[]
  } {
    // Simplified update frequency assessment
    return {
      score: 80,
      evidence: { frequency: 'regular' },
      issues: []
    }
  }

  private checkSchemaValidity(data: any): string[] {
    const issues: string[] = []
    
    // Basic schema checks
    if (data && typeof data !== 'object') {
      issues.push('Data should be an object')
    }
    
    return issues
  }

  private checkDataTypeValidity(data: any): string[] {
    const issues: string[] = []
    
    // Check expected data types
    if (data.score !== undefined && typeof data.score !== 'number') {
      issues.push('Score should be a number')
    }
    
    return issues
  }

  private checkConstraintValidity(data: any): string[] {
    const issues: string[] = []
    
    // Check constraints like uniqueness, length, etc.
    if (data.id && typeof data.id === 'string' && data.id.length < 3) {
      issues.push('ID should be at least 3 characters')
    }
    
    return issues
  }

  private getRecordCount(data: any): number {
    if (Array.isArray(data)) return data.length
    if (data && typeof data === 'object') return 1
    return 0
  }

  private getQualityGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private generateRecommendations(dimensions: QualityDimension[]): string[] {
    const recommendations: string[] = []
    
    for (const dimension of dimensions) {
      if (dimension.score < 70) {
        recommendations.push(`Improve ${dimension.name}: currently ${dimension.score}/100`)
      }
      
      for (const factor of dimension.factors) {
        if (factor.issues.length > 0) {
          recommendations.push(`Address ${factor.name} issues: ${factor.issues.join(', ')}`)
        }
      }
    }
    
    return recommendations.slice(0, 5) // Top 5 recommendations
  }

  private storeQualityScore(dataSource: string, score: DataQualityScore): void {
    if (!this.qualityHistory.has(dataSource)) {
      this.qualityHistory.set(dataSource, [])
    }
    
    const history = this.qualityHistory.get(dataSource)!
    history.push(score)
    
    // Keep only recent scores
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize)
    }
  }

  private getQualityHistory(dataSource: string, timeWindow: number): DataQualityScore[] {
    const history = this.qualityHistory.get(dataSource) || []
    const cutoff = Date.now() - timeWindow
    
    return history.filter(score => score.metadata.timestamp >= cutoff)
  }

  private getLatestQualityScore(dataSource: string): DataQualityScore | null {
    const history = this.qualityHistory.get(dataSource) || []
    return history.length > 0 ? history[history.length - 1] : null
  }

  private calculateTrend(dataPoints: Array<{ timestamp: number, score: number }>): 'improving' | 'stable' | 'degrading' {
    if (dataPoints.length < 3) return 'stable'
    
    const recent = dataPoints.slice(-3)
    const older = dataPoints.slice(-6, -3)
    
    if (older.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, p) => sum + p.score, 0) / recent.length
    const olderAvg = older.reduce((sum, p) => sum + p.score, 0) / older.length
    
    const change = recentAvg - olderAvg
    
    if (Math.abs(change) < 5) return 'stable'
    return change > 0 ? 'improving' : 'degrading'
  }

  private calculateVelocity(dataPoints: Array<{ timestamp: number, score: number }>): number {
    if (dataPoints.length < 2) return 0
    
    const first = dataPoints[0]
    const last = dataPoints[dataPoints.length - 1]
    
    const timeDiff = last.timestamp - first.timestamp
    const scoreDiff = last.score - first.score
    
    // Return change per day
    return timeDiff > 0 ? (scoreDiff / timeDiff) * (24 * 60 * 60 * 1000) : 0
  }

  private predictScore(dataPoints: Array<{ timestamp: number, score: number }>, futureDays: number): number {
    if (dataPoints.length < 2) return dataPoints[0]?.score || 0
    
    const velocity = this.calculateVelocity(dataPoints)
    const currentScore = dataPoints[dataPoints.length - 1].score
    
    return Math.max(0, Math.min(100, currentScore + (velocity * futureDays / (24 * 60 * 60 * 1000))))
  }

  private calculateBenchmarkPriority(gap: number): 'low' | 'medium' | 'high' | 'critical' {
    const absGap = Math.abs(gap)
    if (absGap > 30) return 'critical'
    if (absGap > 20) return 'high'
    if (absGap > 10) return 'medium'
    return 'low'
  }

  private initializeBenchmarks(): void {
    const benchmarks: QualityBenchmark[] = [
      { dimension: 'completeness', target: 95, current: 0, trend: 'stable', gap: 0, priority: 'medium' },
      { dimension: 'accuracy', target: 90, current: 0, trend: 'stable', gap: 0, priority: 'medium' },
      { dimension: 'consistency', target: 85, current: 0, trend: 'stable', gap: 0, priority: 'medium' },
      { dimension: 'freshness', target: 80, current: 0, trend: 'stable', gap: 0, priority: 'medium' },
      { dimension: 'validity', target: 95, current: 0, trend: 'stable', gap: 0, priority: 'medium' }
    ]
    
    for (const benchmark of benchmarks) {
      this.benchmarks.set(benchmark.dimension, benchmark)
    }
  }
}

// Global data quality scorer instance
export const dataQualityScorer = new DataQualityScorer()

/**
 * Utility function to calculate quality score
 */
export function calculateDataQuality(dataSource: string, data: any, metadata?: any): DataQualityScore {
  return dataQualityScorer.calculateQualityScore(dataSource, data, metadata)
}

/**
 * Decorator for automatic quality scoring
 */
export function scoreDataQuality(dataSource: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      // Calculate quality score
      const qualityScore = dataQualityScorer.calculateQualityScore(
        dataSource, 
        result, 
        { method: propertyName, timestamp: Date.now() }
      )
      
      // Attach quality metadata
      if (result && typeof result === 'object') {
        result._qualityScore = qualityScore
      }
      
      return result
    }

    return descriptor
  }
}
