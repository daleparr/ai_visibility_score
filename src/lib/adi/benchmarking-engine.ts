import type {
  ADIScore,
  ADIBenchmark,
  ADIIndustry,
  ADIDimensionName
} from '../../types/adi'
import { ADI_DIMENSION_NAMES } from '../../types/adi'

/**
 * ADI Benchmarking Engine
 * Calculates industry benchmarks, percentiles, and competitive positioning
 */
export class ADIBenchmarkingEngine {
  
  /**
   * Calculate comprehensive industry benchmark from evaluation data
   */
  static calculateIndustryBenchmark(
    industryId: string,
    evaluations: Array<{
      brandId: string
      adiScore: ADIScore
      evaluationDate: string
    }>,
    timeWindow: number = 90 // days
  ): ADIBenchmark {
    const cutoffDate = new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
    
    // Filter evaluations within time window
    const recentEvaluations = evaluations.filter(evaluation =>
      new Date(evaluation.evaluationDate) >= cutoffDate
    )

    if (recentEvaluations.length < 5) {
      throw new Error(`Insufficient data for benchmark calculation. Need at least 5 evaluations, got ${recentEvaluations.length}`)
    }

    // Extract overall scores
    const overallScores = recentEvaluations
      .map(evaluation => evaluation.adiScore.overall)
      .sort((a, b) => a - b)

    // Calculate percentiles
    const statistics = {
      totalBrands: overallScores.length,
      median: this.calculatePercentile(overallScores, 50),
      p25: this.calculatePercentile(overallScores, 25),
      p75: this.calculatePercentile(overallScores, 75),
      p90: this.calculatePercentile(overallScores, 90),
      topPerformer: Math.max(...overallScores),
      bottomPerformer: Math.min(...overallScores),
      average: overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length
    }

    // Calculate dimension-specific benchmarks
    const dimensionBenchmarks = this.calculateDimensionBenchmarks(recentEvaluations)

    // Calculate trend analysis
    const trends = this.calculateTrends(recentEvaluations, timeWindow)

    // Generate benchmark insights
    const insights = this.generateBenchmarkInsights(statistics, dimensionBenchmarks, trends)

    return {
      id: `benchmark_${industryId}_${Date.now()}`,
      industry_id: industryId,
      benchmark_date: new Date().toISOString().split('T')[0],
      total_brands_evaluated: statistics.totalBrands,
      median_score: Math.round(statistics.median * 100) / 100,
      p25_score: Math.round(statistics.p25 * 100) / 100,
      p75_score: Math.round(statistics.p75 * 100) / 100,
      p90_score: Math.round(statistics.p90 * 100) / 100,
      top_performer_score: Math.round(statistics.topPerformer * 100) / 100,
      dimension_medians: dimensionBenchmarks,
      methodology_version: 'ADI-v1.0',
      created_at: new Date().toISOString(),
    }
  }

  /**
   * Calculate brand's position relative to industry benchmark
   */
  static calculateBrandPosition(
    brandScore: ADIScore,
    benchmark: ADIBenchmark
  ): {
    overallPercentile: number
    industryRank: number
    positionDescription: string
    dimensionPositions: Record<string, {
      percentile: number
      vsMedian: number
      position: 'above' | 'below' | 'at'
    }>
    competitiveAdvantages: string[]
    improvementAreas: string[]
  } {
    // Calculate overall percentile
    const overallPercentile = this.calculateScorePercentile(
      brandScore.overall,
      {
        p25: benchmark.p25_score,
        median: benchmark.median_score,
        p75: benchmark.p75_score,
        p90: benchmark.p90_score
      }
    )

    // Estimate industry rank
    const industryRank = Math.max(1, Math.ceil(
      (100 - overallPercentile) / 100 * benchmark.total_brands_evaluated
    ))

    // Generate position description
    const positionDescription = this.getPositionDescription(overallPercentile)

    // Calculate dimension-specific positions
    const dimensionPositions: Record<string, any> = {}
    const competitiveAdvantages: string[] = []
    const improvementAreas: string[] = []

    for (const pillar of brandScore.pillars) {
      for (const dimension of pillar.dimensions) {
        const dimensionMedian = benchmark.dimension_medians?.[dimension.dimension] || 70
        const vsMedian = dimension.score - dimensionMedian
        const percentile = this.calculateScorePercentile(dimension.score, {
          p25: dimensionMedian - 15,
          median: dimensionMedian,
          p75: dimensionMedian + 15,
          p90: dimensionMedian + 25
        })

        dimensionPositions[dimension.dimension] = {
          percentile: Math.round(percentile),
          vsMedian: Math.round(vsMedian * 100) / 100,
          position: vsMedian > 5 ? 'above' : vsMedian < -5 ? 'below' : 'at'
        }

        // Identify competitive advantages and improvement areas
        const dimensionName = ADI_DIMENSION_NAMES[dimension.dimension] || dimension.dimension
        
        if (percentile >= 75) {
          competitiveAdvantages.push(`${dimensionName} (${Math.round(percentile)}th percentile)`)
        } else if (percentile <= 25) {
          improvementAreas.push(`${dimensionName} (${Math.round(percentile)}th percentile)`)
        }
      }
    }

    return {
      overallPercentile: Math.round(overallPercentile),
      industryRank,
      positionDescription,
      dimensionPositions,
      competitiveAdvantages: competitiveAdvantages.slice(0, 3), // Top 3
      improvementAreas: improvementAreas.slice(0, 3) // Bottom 3
    }
  }

  /**
   * Generate competitive analysis report
   */
  static generateCompetitiveAnalysis(
    brandScore: ADIScore,
    industryBenchmark: ADIBenchmark,
    competitorScores: ADIScore[] = []
  ): {
    marketPosition: string
    strengthsVsCompetitors: string[]
    gapsVsCompetitors: string[]
    strategicRecommendations: string[]
    benchmarkComparison: {
      vsMedian: number
      vsTop10: number
      vsTop25: number
    }
  } {
    const position = this.calculateBrandPosition(brandScore, industryBenchmark)
    
    // Calculate benchmark comparisons
    const benchmarkComparison = {
      vsMedian: brandScore.overall - industryBenchmark.median_score,
      vsTop10: brandScore.overall - industryBenchmark.p90_score,
      vsTop25: brandScore.overall - industryBenchmark.p75_score
    }

    // Generate market position description
    const marketPosition = this.generateMarketPositionDescription(
      position.overallPercentile,
      benchmarkComparison
    )

    // Analyze against competitors if provided
    const competitorAnalysis = competitorScores.length > 0 
      ? this.analyzeVsCompetitors(brandScore, competitorScores)
      : null

    // Generate strategic recommendations
    const strategicRecommendations = this.generateStrategicRecommendations(
      brandScore,
      position,
      benchmarkComparison,
      competitorAnalysis
    )

    return {
      marketPosition,
      strengthsVsCompetitors: competitorAnalysis?.strengths || position.competitiveAdvantages,
      gapsVsCompetitors: competitorAnalysis?.gaps || position.improvementAreas,
      strategicRecommendations,
      benchmarkComparison
    }
  }

  /**
   * Calculate trend analysis for industry
   */
  static calculateIndustryTrends(
    currentBenchmark: ADIBenchmark,
    previousBenchmarks: ADIBenchmark[]
  ): {
    overallTrend: 'improving' | 'declining' | 'stable'
    trendPercentage: number
    dimensionTrends: Record<string, {
      trend: 'improving' | 'declining' | 'stable'
      change: number
    }>
    insights: string[]
  } {
    if (previousBenchmarks.length === 0) {
      return {
        overallTrend: 'stable',
        trendPercentage: 0,
        dimensionTrends: {},
        insights: ['Insufficient historical data for trend analysis']
      }
    }

    const previousBenchmark = previousBenchmarks[0] // Most recent previous
    const medianChange = currentBenchmark.median_score - previousBenchmark.median_score
    
    // Determine overall trend
    const overallTrend = medianChange > 2 ? 'improving' : 
                        medianChange < -2 ? 'declining' : 'stable'
    
    const trendPercentage = Math.round((medianChange / previousBenchmark.median_score) * 100 * 100) / 100

    // Calculate dimension trends
    const dimensionTrends: Record<string, any> = {}
    
    if (currentBenchmark.dimension_medians && previousBenchmark.dimension_medians) {
      for (const [dimension, currentMedian] of Object.entries(currentBenchmark.dimension_medians)) {
        const previousMedian = previousBenchmark.dimension_medians[dimension]
        if (typeof previousMedian === 'number') {
          const change = (currentMedian as number) - previousMedian
          dimensionTrends[dimension] = {
            trend: change > 1 ? 'improving' : change < -1 ? 'declining' : 'stable',
            change: Math.round(change * 100) / 100
          }
        }
      }
    }

    // Generate insights
    const insights = this.generateTrendInsights(
      overallTrend,
      trendPercentage,
      dimensionTrends,
      currentBenchmark,
      previousBenchmark
    )

    return {
      overallTrend,
      trendPercentage,
      dimensionTrends,
      insights
    }
  }

  // Private helper methods
  private static calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
    
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  private static calculateScorePercentile(
    score: number,
    distribution: { p25: number; median: number; p75: number; p90: number }
  ): number {
    const { p25, median, p75, p90 } = distribution

    if (score >= p90) {
      return 90 + ((score - p90) / (100 - p90)) * 10
    } else if (score >= p75) {
      return 75 + ((score - p75) / (p90 - p75)) * 15
    } else if (score >= median) {
      return 50 + ((score - median) / (p75 - median)) * 25
    } else if (score >= p25) {
      return 25 + ((score - p25) / (median - p25)) * 25
    } else {
      return (score / p25) * 25
    }
  }

  private static calculateDimensionBenchmarks(
    evaluations: Array<{ adiScore: ADIScore }>
  ): Record<string, number> {
    const dimensionScores: Record<string, number[]> = {}

    // Collect all dimension scores
    for (const evaluation of evaluations) {
      for (const pillar of evaluation.adiScore.pillars) {
        for (const dimension of pillar.dimensions) {
          if (!dimensionScores[dimension.dimension]) {
            dimensionScores[dimension.dimension] = []
          }
          dimensionScores[dimension.dimension].push(dimension.score)
        }
      }
    }

    // Calculate medians
    const dimensionMedians: Record<string, number> = {}
    for (const [dimension, scores] of Object.entries(dimensionScores)) {
      scores.sort((a, b) => a - b)
      dimensionMedians[dimension] = this.calculatePercentile(scores, 50)
    }

    return dimensionMedians
  }

  private static calculateTrends(
    evaluations: Array<{ evaluationDate: string; adiScore: ADIScore }>,
    timeWindow: number
  ): {
    monthOverMonth: number
    quarterOverQuarter: number
    improvingDimensions: string[]
    decliningDimensions: string[]
  } {
    // Simplified trend calculation
    const now = new Date()
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const recentEvals = evaluations.filter(e => new Date(e.evaluationDate) >= oneMonthAgo)
    const olderEvals = evaluations.filter(e => 
      new Date(e.evaluationDate) >= threeMonthsAgo && 
      new Date(e.evaluationDate) < oneMonthAgo
    )

    const recentAvg = recentEvals.length > 0 
      ? recentEvals.reduce((sum, e) => sum + e.adiScore.overall, 0) / recentEvals.length
      : 0

    const olderAvg = olderEvals.length > 0
      ? olderEvals.reduce((sum, e) => sum + e.adiScore.overall, 0) / olderEvals.length
      : recentAvg

    return {
      monthOverMonth: recentAvg - olderAvg,
      quarterOverQuarter: recentAvg - olderAvg, // Simplified
      improvingDimensions: [], // Would calculate from dimension trends
      decliningDimensions: []  // Would calculate from dimension trends
    }
  }

  private static generateBenchmarkInsights(
    statistics: any,
    dimensionBenchmarks: Record<string, number>,
    trends: any
  ): string[] {
    const insights: string[] = []

    // Performance distribution insights
    const spread = statistics.p75 - statistics.p25
    if (spread > 20) {
      insights.push('High performance variation in industry - significant opportunity for differentiation')
    } else if (spread < 10) {
      insights.push('Competitive industry with similar performance levels across brands')
    }

    // Top performer insights
    if (statistics.topPerformer - statistics.median > 15) {
      insights.push('Clear market leaders exist with significantly higher AI visibility')
    }

    // Dimension insights
    const sortedDimensions = Object.entries(dimensionBenchmarks)
      .sort(([,a], [,b]) => b - a)
    
    insights.push(`Industry strength: ${ADI_DIMENSION_NAMES[sortedDimensions[0][0] as ADIDimensionName]} (median: ${Math.round(sortedDimensions[0][1])})`)
    insights.push(`Industry opportunity: ${ADI_DIMENSION_NAMES[sortedDimensions[sortedDimensions.length-1][0] as ADIDimensionName]} (median: ${Math.round(sortedDimensions[sortedDimensions.length-1][1])})`)

    return insights
  }

  private static getPositionDescription(percentile: number): string {
    if (percentile >= 90) return 'Industry Leader'
    if (percentile >= 75) return 'Top Performer'
    if (percentile >= 60) return 'Above Average'
    if (percentile >= 40) return 'Average Performer'
    if (percentile >= 25) return 'Below Average'
    return 'Needs Improvement'
  }

  private static generateMarketPositionDescription(
    percentile: number,
    benchmarkComparison: any
  ): string {
    const position = this.getPositionDescription(percentile)
    const vsMedian = benchmarkComparison.vsMedian > 0 ? 'above' : 'below'
    const gap = Math.abs(benchmarkComparison.vsMedian)
    
    return `${position} (${percentile}th percentile) - ${gap.toFixed(1)} points ${vsMedian} industry median`
  }

  private static analyzeVsCompetitors(
    brandScore: ADIScore,
    competitorScores: ADIScore[]
  ): {
    strengths: string[]
    gaps: string[]
    averageGap: number
  } {
    const strengths: string[] = []
    const gaps: string[] = []
    
    const avgCompetitorScore = competitorScores.reduce((sum, score) => sum + score.overall, 0) / competitorScores.length
    const averageGap = brandScore.overall - avgCompetitorScore

    // Analyze by pillar
    for (const pillar of brandScore.pillars) {
      const competitorPillarAvg = competitorScores.reduce((sum, score) => {
        const competitorPillar = score.pillars.find(p => p.pillar === pillar.pillar)
        return sum + (competitorPillar?.score || 0)
      }, 0) / competitorScores.length

      const gap = pillar.score - competitorPillarAvg
      const pillarName = pillar.pillar.charAt(0).toUpperCase() + pillar.pillar.slice(1)

      if (gap > 5) {
        strengths.push(`${pillarName} (+${gap.toFixed(1)} vs competitors)`)
      } else if (gap < -5) {
        gaps.push(`${pillarName} (${gap.toFixed(1)} vs competitors)`)
      }
    }

    return { strengths, gaps, averageGap }
  }

  private static generateStrategicRecommendations(
    brandScore: ADIScore,
    position: any,
    benchmarkComparison: any,
    competitorAnalysis: any
  ): string[] {
    const recommendations: string[] = []

    // Position-based recommendations
    if (position.overallPercentile < 50) {
      recommendations.push('Focus on foundational improvements to reach industry median performance')
    } else if (position.overallPercentile < 75) {
      recommendations.push('Target specific dimension improvements to join top quartile performers')
    } else {
      recommendations.push('Maintain leadership position while exploring emerging AI visibility opportunities')
    }

    // Gap-based recommendations
    if (benchmarkComparison.vsTop25 < -10) {
      recommendations.push('Significant opportunity to close gap with top 25% of industry')
    }

    // Dimension-specific recommendations
    if (position.improvementAreas.length > 0) {
      recommendations.push(`Priority focus areas: ${position.improvementAreas.slice(0, 2).join(', ')}`)
    }

    return recommendations.slice(0, 4) // Limit to 4 recommendations
  }

  private static generateTrendInsights(
    overallTrend: string,
    trendPercentage: number,
    dimensionTrends: Record<string, any>,
    currentBenchmark: ADIBenchmark,
    previousBenchmark: ADIBenchmark
  ): string[] {
    const insights: string[] = []

    // Overall trend insight
    if (overallTrend === 'improving') {
      insights.push(`Industry AI visibility improving by ${trendPercentage.toFixed(1)}% quarter-over-quarter`)
    } else if (overallTrend === 'declining') {
      insights.push(`Industry AI visibility declining by ${Math.abs(trendPercentage).toFixed(1)}% quarter-over-quarter`)
    } else {
      insights.push('Industry AI visibility remains stable with minimal change')
    }

    // Dimension trend insights
    const improvingDimensions = Object.entries(dimensionTrends)
      .filter(([, trend]) => trend.trend === 'improving')
      .sort(([, a], [, b]) => b.change - a.change)
      .slice(0, 2)

    if (improvingDimensions.length > 0) {
      insights.push(`Fastest improving areas: ${improvingDimensions.map(([dim]) => ADI_DIMENSION_NAMES[dim as ADIDimensionName]).join(', ')}`)
    }

    return insights
  }
}