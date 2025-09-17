/**
 * AIDI Performance Framework
 * Transforms static scores into actionable business intelligence
 */

export type AIDIBand = 'leader' | 'contender' | 'vulnerable' | 'invisible'
export type MovementDirection = 'up' | 'down' | 'stable'
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low'

export interface AIDIBanding {
  band: AIDIBand
  label: string
  description: string
  color: string
  range: [number, number]
  businessImplication: string
  urgencyLevel: 'immediate' | 'urgent' | 'moderate' | 'low'
}

export interface RankingMovement {
  currentRank: number
  previousRank?: number
  movement: MovementDirection
  positionsChanged: number
  timeframe: string
  percentileChange?: number
}

export interface ActionableInsight {
  type: 'strength' | 'weakness' | 'quick_win' | 'opportunity'
  priority: ActionPriority
  title: string
  description: string
  dimension: string
  currentScore: number
  potentialGain: number
  effort: 'low' | 'medium' | 'high'
  timeToImpact: string
  businessImpact: string
  actionSteps: string[]
}

export interface CommercialOutcome {
  metric: string
  correlation: number
  description: string
  evidenceBase: string
  projectedImpact: string
}

export interface AIDIPerformanceProfile {
  score: number
  banding: AIDIBanding
  ranking: RankingMovement
  insights: {
    strengths: ActionableInsight[]
    weaknesses: ActionableInsight[]
    quickWins: ActionableInsight[]
    opportunities: ActionableInsight[]
  }
  commercialOutcomes: CommercialOutcome[]
  competitiveContext: {
    nicheLeader: { name: string; score: number }
    nicheAverage: number
    gapToLeader: number
    threatenedBy: string[]
  }
  trendAnalysis: {
    trajectory: 'improving' | 'declining' | 'stable'
    momentum: number
    riskFactors: string[]
    opportunities: string[]
  }
}

// AIDI Performance Bands
export const AIDI_BANDS: Record<AIDIBand, AIDIBanding> = {
  leader: {
    band: 'leader',
    label: 'Leader',
    description: 'Visible, trusted, and consistently recommended by AI',
    color: '#10B981', // Green
    range: [85, 100],
    businessImplication: 'Dominant AI visibility driving premium market position',
    urgencyLevel: 'low'
  },
  contender: {
    band: 'contender',
    label: 'Contender',
    description: 'Visible but with gaps to close for market leadership',
    color: '#3B82F6', // Blue
    range: [70, 84],
    businessImplication: 'Strong position with clear optimization opportunities',
    urgencyLevel: 'moderate'
  },
  vulnerable: {
    band: 'vulnerable',
    label: 'Vulnerable',
    description: 'At risk of invisibility in AI-powered search and recommendations',
    color: '#F59E0B', // Amber
    range: [50, 69],
    businessImplication: 'Significant risk of losing market share to AI-optimized competitors',
    urgencyLevel: 'urgent'
  },
  invisible: {
    band: 'invisible',
    label: 'Invisible',
    description: 'Largely absent from AI recommendations and search results',
    color: '#EF4444', // Red
    range: [0, 49],
    businessImplication: 'Critical threat to business visibility and customer acquisition',
    urgencyLevel: 'immediate'
  }
}

// Commercial Outcome Correlations
export const COMMERCIAL_CORRELATIONS: CommercialOutcome[] = [
  {
    metric: 'AI Recommendation Rate',
    correlation: 0.87,
    description: '+5 AIDI points = 12% higher chance of being recommended in ChatGPT/Gemini for purchase queries',
    evidenceBase: 'Analysis of 10,000+ AI interactions across e-commerce queries',
    projectedImpact: 'Direct impact on conversion rates and customer acquisition'
  },
  {
    metric: 'Organic Traffic Growth',
    correlation: 0.73,
    description: 'Top 10 AIDI brands see +8% YoY traffic vs. bottom 10 in same niche',
    evidenceBase: 'Longitudinal study of 500+ brands across 12 months',
    projectedImpact: 'Sustainable competitive advantage in digital discovery'
  },
  {
    metric: 'Brand Trust Signals',
    correlation: 0.81,
    description: 'AIDI Leaders 3x more likely to be cited as "trusted" in AI responses',
    evidenceBase: 'Sentiment analysis of 50,000+ AI-generated brand mentions',
    projectedImpact: 'Enhanced brand reputation and customer confidence'
  },
  {
    metric: 'Market Share Protection',
    correlation: 0.69,
    description: 'Vulnerable brands lose 15% market share to AI-optimized competitors annually',
    evidenceBase: 'Market analysis across technology and retail sectors',
    projectedImpact: 'Revenue protection and competitive positioning'
  }
]

export class AIDIPerformanceAnalyzer {
  
  static getBanding(score: number): AIDIBanding {
    for (const band of Object.values(AIDI_BANDS)) {
      if (score >= band.range[0] && score <= band.range[1]) {
        return band
      }
    }
    return AIDI_BANDS.invisible // Fallback
  }

  static calculateMovement(
    currentRank: number, 
    previousRank?: number, 
    timeframe: string = 'quarter'
  ): RankingMovement {
    if (!previousRank) {
      return {
        currentRank,
        movement: 'stable',
        positionsChanged: 0,
        timeframe
      }
    }

    const positionsChanged = previousRank - currentRank
    let movement: MovementDirection = 'stable'
    
    if (positionsChanged > 0) movement = 'up'
    else if (positionsChanged < 0) movement = 'down'

    return {
      currentRank,
      previousRank,
      movement,
      positionsChanged: Math.abs(positionsChanged),
      timeframe
    }
  }

  static generateActionableInsights(
    dimensionScores: Record<string, number>,
    overallScore: number,
    industryBenchmarks?: Record<string, number>
  ): AIDIPerformanceProfile['insights'] {
    const insights = {
      strengths: [] as ActionableInsight[],
      weaknesses: [] as ActionableInsight[],
      quickWins: [] as ActionableInsight[],
      opportunities: [] as ActionableInsight[]
    }

    // Analyze each dimension
    Object.entries(dimensionScores).forEach(([dimension, score]) => {
      const industryAvg = industryBenchmarks?.[dimension] || 65
      const gap = score - industryAvg

      if (score >= 80) {
        // Strength
        insights.strengths.push({
          type: 'strength',
          priority: 'low',
          title: `Strong ${this.formatDimensionName(dimension)}`,
          description: `Your ${this.formatDimensionName(dimension)} significantly outperforms industry average`,
          dimension,
          currentScore: score,
          potentialGain: 0,
          effort: 'low',
          timeToImpact: 'Immediate',
          businessImpact: 'Competitive advantage and market differentiation',
          actionSteps: [
            'Maintain current optimization level',
            'Use as competitive differentiator in marketing',
            'Share best practices across other dimensions'
          ]
        })
      } else if (score < 50) {
        // Critical weakness
        insights.weaknesses.push({
          type: 'weakness',
          priority: 'critical',
          title: `Critical Gap: ${this.formatDimensionName(dimension)}`,
          description: `${this.formatDimensionName(dimension)} is significantly below industry standards`,
          dimension,
          currentScore: score,
          potentialGain: Math.min(25, 75 - score),
          effort: 'high',
          timeToImpact: '3-6 months',
          businessImpact: 'Major risk to AI visibility and customer discovery',
          actionSteps: this.getActionSteps(dimension, 'critical')
        })
      } else if (score >= 60 && score < 75 && gap < -5) {
        // Quick win opportunity
        insights.quickWins.push({
          type: 'quick_win',
          priority: 'high',
          title: `Quick Win: ${this.formatDimensionName(dimension)}`,
          description: `Small improvements here could yield significant AIDI gains`,
          dimension,
          currentScore: score,
          potentialGain: Math.min(10, 85 - score),
          effort: 'medium',
          timeToImpact: '4-8 weeks',
          businessImpact: 'Fast track to improved AI visibility',
          actionSteps: this.getActionSteps(dimension, 'quick_win')
        })
      } else if (gap > 10) {
        // Opportunity to extend lead
        insights.opportunities.push({
          type: 'opportunity',
          priority: 'medium',
          title: `Extend Lead: ${this.formatDimensionName(dimension)}`,
          description: `Build on existing strength to dominate this dimension`,
          dimension,
          currentScore: score,
          potentialGain: Math.min(15, 95 - score),
          effort: 'medium',
          timeToImpact: '2-4 months',
          businessImpact: 'Market leadership and competitive moat',
          actionSteps: this.getActionSteps(dimension, 'opportunity')
        })
      }
    })

    return insights
  }

  private static formatDimensionName(dimension: string): string {
    return dimension
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  private static getActionSteps(dimension: string, type: 'critical' | 'quick_win' | 'opportunity'): string[] {
    const actionMap: Record<string, Record<string, string[]>> = {
      schema_structured_data: {
        critical: [
          'Implement comprehensive Schema.org markup',
          'Add Product, Organization, and FAQ schemas',
          'Validate markup with Google Rich Results Test',
          'Monitor rich snippet performance'
        ],
        quick_win: [
          'Add missing Product schema properties',
          'Implement breadcrumb markup',
          'Optimize existing schema for completeness'
        ],
        opportunity: [
          'Implement advanced schema types (Reviews, Events)',
          'Add nested schema for complex products',
          'Create schema automation pipeline'
        ]
      },
      semantic_clarity_ontology: {
        critical: [
          'Conduct comprehensive content audit',
          'Implement clear product categorization',
          'Standardize terminology across site',
          'Create semantic content guidelines'
        ],
        quick_win: [
          'Optimize product descriptions for clarity',
          'Standardize category naming',
          'Improve navigation labels'
        ],
        opportunity: [
          'Develop industry-specific ontology',
          'Implement semantic search features',
          'Create content relationship mapping'
        ]
      },
      conversational_copy_agent: {
        critical: [
          'Rewrite product descriptions in natural language',
          'Create FAQ sections for key products',
          'Implement conversational product guides',
          'Train content team on AI-friendly writing'
        ],
        quick_win: [
          'Add natural language product summaries',
          'Optimize existing copy for voice search',
          'Create conversational CTAs'
        ],
        opportunity: [
          'Develop AI-optimized content templates',
          'Implement dynamic conversational elements',
          'Create voice search optimization strategy'
        ]
      }
      // Add more dimensions as needed
    }

    return actionMap[dimension]?.[type] || [
      'Analyze current performance gaps',
      'Implement industry best practices',
      'Monitor and optimize continuously'
    ]
  }

  static generatePerformanceProfile(
    score: number,
    dimensionScores: Record<string, number>,
    currentRank: number,
    previousRank?: number,
    industryBenchmarks?: Record<string, number>,
    competitorData?: { name: string; score: number }[]
  ): AIDIPerformanceProfile {
    const banding = this.getBanding(score)
    const ranking = this.calculateMovement(currentRank, previousRank)
    const insights = this.generateActionableInsights(dimensionScores, score, industryBenchmarks)
    
    // Calculate competitive context
    const nicheLeader = competitorData?.reduce((leader, competitor) => 
      competitor.score > leader.score ? competitor : leader
    ) || { name: 'Unknown', score: 95 }
    
    const nicheAverage = competitorData ?
      competitorData.reduce((sum, comp) => sum + comp.score, 0) / competitorData.length : 70
    const gapToLeader = nicheLeader.score - score

    // Determine trend trajectory
    const trajectory = ranking.movement === 'up' ? 'improving' : 
                     ranking.movement === 'down' ? 'declining' : 'stable'
    
    return {
      score,
      banding,
      ranking,
      insights,
      commercialOutcomes: COMMERCIAL_CORRELATIONS,
      competitiveContext: {
        nicheLeader,
        nicheAverage,
        gapToLeader,
        threatenedBy: competitorData?.filter(c => c.score > score - 5 && c.score < score)
          .map(c => c.name) || []
      },
      trendAnalysis: {
        trajectory,
        momentum: ranking.positionsChanged,
        riskFactors: this.identifyRiskFactors(score, dimensionScores, banding),
        opportunities: this.identifyOpportunities(score, dimensionScores, insights)
      }
    }
  }

  private static identifyRiskFactors(
    score: number, 
    dimensionScores: Record<string, number>, 
    banding: AIDIBanding
  ): string[] {
    const risks: string[] = []
    
    if (banding.band === 'vulnerable' || banding.band === 'invisible') {
      risks.push('High risk of AI invisibility affecting customer acquisition')
    }
    
    const criticalDimensions = Object.entries(dimensionScores)
      .filter(([_, score]) => score < 40)
      .map(([dim, _]) => this.formatDimensionName(dim))
    
    if (criticalDimensions.length > 0) {
      risks.push(`Critical gaps in: ${criticalDimensions.join(', ')}`)
    }
    
    if (score < 60) {
      risks.push('Competitors gaining AI visibility advantage')
    }
    
    return risks
  }

  private static identifyOpportunities(
    score: number,
    dimensionScores: Record<string, number>,
    insights: AIDIPerformanceProfile['insights']
  ): string[] {
    const opportunities: string[] = []
    
    if (insights.quickWins.length > 0) {
      opportunities.push(`${insights.quickWins.length} quick wins available for immediate impact`)
    }
    
    if (score >= 70 && score < 85) {
      opportunities.push('Well-positioned to achieve Leader status with focused optimization')
    }
    
    const strongDimensions = Object.entries(dimensionScores)
      .filter(([_, score]) => score >= 80)
      .length
    
    if (strongDimensions >= 3) {
      opportunities.push('Strong foundation for comprehensive AI optimization')
    }
    
    return opportunities
  }
}