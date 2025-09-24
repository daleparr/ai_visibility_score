import type { DimensionScore } from '@/lib/db/schema'
import type { EvaluationResult } from '@/lib/ai-providers'

// Define missing types locally
export type GradeType = 'A' | 'B' | 'C' | 'D' | 'F'

export interface ScoreBreakdown {
  overall: number
  infrastructure: number
  perception: number
  commerce: number
  grade: GradeType
}

export interface DimensionBreakdown {
  name: string
  score: number
  weight: number
  explanation: string
  recommendations: string[]
}

// Dimension weights as defined in the scoring methodology
export const DIMENSION_WEIGHTS = {
  // Infrastructure & Machine Readability (40% total)
  'schema_structured_data': 0.10,
  'semantic_clarity': 0.10,
  'ontologies_taxonomy': 0.10,
  'knowledge_graphs': 0.05,
  'llm_readability': 0.05,
  'conversational_copy': 0.05,
  
  // Perception & Reputation (35% total)
  'geo_visibility': 0.10,
  'citation_strength': 0.10,
  'answer_quality': 0.10,
  'sentiment_trust': 0.05,
  
  // Commerce & Customer Experience (25% total)
  'hero_products': 0.15,
  'shipping_freight': 0.10,
} as const

export const PILLAR_WEIGHTS = {
  infrastructure: 0.40,
  perception: 0.35,
  commerce: 0.25,
} as const

export const DIMENSION_PILLARS = {
  // Infrastructure & Machine Readability
  'schema_structured_data': 'infrastructure',
  'semantic_clarity': 'infrastructure',
  'ontologies_taxonomy': 'infrastructure',
  'knowledge_graphs': 'infrastructure',
  'llm_readability': 'infrastructure',
  'conversational_copy': 'infrastructure',
  
  // Perception & Reputation
  'geo_visibility': 'perception',
  'citation_strength': 'perception',
  'answer_quality': 'perception',
  'sentiment_trust': 'perception',
  
  // Commerce & Customer Experience
  'hero_products': 'commerce',
  'shipping_freight': 'commerce',
} as const

export const DIMENSION_NAMES = {
  'schema_structured_data': 'Schema & Structured Data',
  'semantic_clarity': 'Semantic Clarity',
  'ontologies_taxonomy': 'Ontologies & Taxonomy',
  'knowledge_graphs': 'Knowledge Graphs',
  'llm_readability': 'LLM Readability',
  'conversational_copy': 'Conversational Copy',
  'geo_visibility': 'Geographic Visibility',
  'citation_strength': 'Citation Strength',
  'answer_quality': 'Answer Quality',
  'sentiment_trust': 'Sentiment & Trust',
  'hero_products': 'Hero Products',
  'shipping_freight': 'Shipping & Freight',
} as const

/**
 * Calculate overall score from dimension scores
 */
export function calculateOverallScore(
  dimensionScores: DimensionScore[],
  brandPlaybook?: any
): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const dimension of dimensionScores) {
    const weight =
      DIMENSION_WEIGHTS[
        dimension.dimensionName as keyof typeof DIMENSION_WEIGHTS
      ];
    if (weight) {
      totalWeightedScore += dimension.score * weight;
      totalWeight += weight;
    }
  }

  let overallScore =
    totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

  // Apply Brand Playbook boost if available
  if (brandPlaybook && typeof brandPlaybook.scoring_boost === "number") {
    console.log(`Applying Brand Playbook boost: ${brandPlaybook.scoring_boost}`);
    overallScore += brandPlaybook.scoring_boost;
  }

  // Ensure score is within 0-100 range
  const finalScore = Math.max(0, Math.min(100, overallScore));

  return Math.round(finalScore);
}

/**
 * Calculate pillar scores from dimension scores
 */
export function calculatePillarScores(dimensionScores: DimensionScore[]): {
  infrastructure: number
  perception: number
  commerce: number
} {
  const pillarScores = {
    infrastructure: { totalScore: 0, totalWeight: 0 },
    perception: { totalScore: 0, totalWeight: 0 },
    commerce: { totalScore: 0, totalWeight: 0 },
  }

  for (const dimension of dimensionScores) {
    const pillar = DIMENSION_PILLARS[dimension.dimensionName as keyof typeof DIMENSION_PILLARS]
    const weight = DIMENSION_WEIGHTS[dimension.dimensionName as keyof typeof DIMENSION_WEIGHTS]
    
    if (pillar && weight) {
      pillarScores[pillar].totalScore += dimension.score * weight
      pillarScores[pillar].totalWeight += weight
    }
  }

  return {
    infrastructure: pillarScores.infrastructure.totalWeight > 0 
      ? Math.round((pillarScores.infrastructure.totalScore / pillarScores.infrastructure.totalWeight) * 100)
      : 0,
    perception: pillarScores.perception.totalWeight > 0
      ? Math.round((pillarScores.perception.totalScore / pillarScores.perception.totalWeight) * 100)
      : 0,
    commerce: pillarScores.commerce.totalWeight > 0
      ? Math.round((pillarScores.commerce.totalScore / pillarScores.commerce.totalWeight) * 100)
      : 0,
  }
}

/**
 * Get grade from overall score
 */
export function getGradeFromScore(score: number): GradeType {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Generate verdict based on score and brand name
 */
export function generateVerdict(score: number, brandName: string): string {
  if (score >= 90) {
    return `${brandName} has excellent AI visibility with competitive advantage`
  } else if (score >= 80) {
    return `${brandName} has good AI visibility with minor optimization opportunities`
  } else if (score >= 70) {
    return `${brandName} has average AI visibility with significant improvement potential`
  } else if (score >= 60) {
    return `${brandName} has poor AI visibility with major gaps in discoverability`
  } else {
    return `${brandName} has critical AI visibility issues requiring immediate attention`
  }
}

/**
 * Identify strongest and weakest dimensions
 */
export function identifyDimensionExtremes(dimensionScores: DimensionScore[]): {
  strongest: string
  weakest: string
  biggestOpportunity: string
} {
  if (dimensionScores.length === 0) {
    return {
      strongest: 'N/A',
      weakest: 'N/A',
      biggestOpportunity: 'N/A'
    }
  }

  // Sort by score to find strongest and weakest
  const sortedByScore = [...dimensionScores].sort((a, b) => b.score - a.score)
  const strongest = DIMENSION_NAMES[sortedByScore[0].dimensionName as keyof typeof DIMENSION_NAMES]
  const weakest = DIMENSION_NAMES[sortedByScore[sortedByScore.length - 1].dimensionName as keyof typeof DIMENSION_NAMES]

  // Find biggest opportunity (lowest score with highest weight)
  const opportunityScores = dimensionScores.map(d => ({
    dimension: d.dimensionName,
    score: d.score,
    weight: DIMENSION_WEIGHTS[d.dimensionName as keyof typeof DIMENSION_WEIGHTS] || 0,
    opportunity: (100 - d.score) * (DIMENSION_WEIGHTS[d.dimensionName as keyof typeof DIMENSION_WEIGHTS] || 0)
  }))

  const biggestOpportunityDimension = opportunityScores.reduce((max, current) => 
    current.opportunity > max.opportunity ? current : max
  )

  const biggestOpportunity = DIMENSION_NAMES[biggestOpportunityDimension.dimension as keyof typeof DIMENSION_NAMES]

  return {
    strongest,
    weakest,
    biggestOpportunity
  }
}

/**
 * Create complete score breakdown
 */
export function createScoreBreakdown(
  dimensionScores: DimensionScore[],
  overallScore?: number
): ScoreBreakdown {
  const pillarScores = calculatePillarScores(dimensionScores)
  const finalOverallScore = overallScore ?? calculateOverallScore(dimensionScores)
  const grade = getGradeFromScore(finalOverallScore)

  return {
    infrastructure: pillarScores.infrastructure,
    perception: pillarScores.perception,
    commerce: pillarScores.commerce,
    overall: finalOverallScore,
    grade
  }
}

/**
 * Create dimension breakdowns with detailed information
 */
export function createDimensionBreakdowns(dimensionScores: DimensionScore[]): DimensionBreakdown[] {
  return dimensionScores.map(dimension => ({
    name: DIMENSION_NAMES[dimension.dimensionName as keyof typeof DIMENSION_NAMES] || dimension.dimensionName,
    dimension: dimension.dimensionName,
    score: dimension.score,
    weight: DIMENSION_WEIGHTS[dimension.dimensionName as keyof typeof DIMENSION_WEIGHTS] || 0,
    description: dimension.explanation || '',
    explanation: dimension.explanation || '',
    recommendations: dimension.recommendations || []
  }))
}

/**
 * Analyze evaluation results to extract insights
 */
export function analyzeEvaluationResults(results: EvaluationResult[]): {
  modelConsistency: number
  averageResponseTime: number
  successRate: number
  topPerformingModel: string
} {
  if (results.length === 0) {
    return {
      modelConsistency: 0,
      averageResponseTime: 0,
      successRate: 0,
      topPerformingModel: 'N/A'
    }
  }

  // Calculate model consistency (how similar scores are across models)
  const scoresByModel = results.reduce((acc, result) => {
    if (!acc[result.provider_name]) {
      acc[result.provider_name] = []
    }
    if (result.score_contribution !== null) {
      acc[result.provider_name].push(result.score_contribution)
    }
    return acc
  }, {} as Record<string, number[]>)

  const modelAverages = Object.entries(scoresByModel).map(([model, scores]) => ({
    model,
    average: scores.reduce((sum, score) => sum + score, 0) / scores.length
  }))

  const overallAverage = modelAverages.reduce((sum, model) => sum + model.average, 0) / modelAverages.length
  const variance = modelAverages.reduce((sum, model) => sum + Math.pow(model.average - overallAverage, 2), 0) / modelAverages.length
  const standardDeviation = Math.sqrt(variance)
  const modelConsistency = Math.max(0, 100 - (standardDeviation * 10)) // Convert to 0-100 scale

  // Calculate success rate (percentage of successful responses)
  const successfulResults = results.filter(r => r.response_received && r.response_received.trim().length > 0)
  const successRate = (successfulResults.length / results.length) * 100

  // Find top performing model
  const topPerformingModel = modelAverages.length > 0 
    ? modelAverages.reduce((max, current) => current.average > max.average ? current : max).model
    : 'N/A'

  return {
    modelConsistency: Math.round(modelConsistency),
    averageResponseTime: 0, // Would need timing data from actual API calls
    successRate: Math.round(successRate),
    topPerformingModel
  }
}

/**
 * Generate recommendations based on dimension scores
 */
export function generateRecommendations(
  dimensionScores: DimensionScore[],
  brandName: string
): Array<{
  priority: '1' | '2' | '3'
  title: string
  description: string
  category: string
  impact: 'high' | 'medium' | 'low'
  effort: 'high' | 'medium' | 'low'
}> {
  const recommendations: Array<{
    priority: '1' | '2' | '3'
    title: string
    description: string
    category: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
  }> = []

  // Sort dimensions by score to prioritize improvements
  const sortedDimensions = [...dimensionScores].sort((a, b) => a.score - b.score)

  for (const dimension of sortedDimensions.slice(0, 6)) { // Top 6 improvement areas
    const dimensionName = dimension.dimensionName
    const score = dimension.score

    if (score < 70) { // Only recommend improvements for scores below 70
      switch (dimensionName) {
        case 'schema_structured_data':
          recommendations.push({
            priority: score < 40 ? '1' : '2',
            title: 'Implement Schema.org Markup',
            description: 'Add structured data markup to your website to help AI models understand your content better.',
            category: 'technical',
            impact: 'high',
            effort: 'medium'
          })
          break

        case 'semantic_clarity':
          recommendations.push({
            priority: score < 50 ? '1' : '2',
            title: 'Improve Content Clarity',
            description: 'Standardize terminology and improve content hierarchy for better AI comprehension.',
            category: 'content',
            impact: 'high',
            effort: 'medium'
          })
          break

        case 'citation_strength':
          recommendations.push({
            priority: '3',
            title: 'Build Authority Citations',
            description: 'Increase mentions in premium media and industry publications to strengthen AI recognition.',
            category: 'reputation',
            impact: 'high',
            effort: 'high'
          })
          break

        case 'hero_products':
          recommendations.push({
            priority: score < 60 ? '2' : '3',
            title: 'Optimize Product Information',
            description: 'Enhance product descriptions and ensure clear value propositions for AI recommendation systems.',
            category: 'content',
            impact: 'medium',
            effort: 'low'
          })
          break

        default:
          recommendations.push({
            priority: score < 50 ? '2' : '3',
            title: `Improve ${DIMENSION_NAMES[dimensionName as keyof typeof DIMENSION_NAMES]}`,
            description: `Focus on enhancing ${dimensionName.replace(/_/g, ' ')} to boost AI visibility.`,
            category: 'general',
            impact: 'medium',
            effort: 'medium'
          })
      }
    }
  }

  return recommendations.slice(0, 10) // Limit to top 10 recommendations
}

/**
 * Calculate competitive positioning
 */
export function calculateCompetitivePosition(
  brandScore: number,
  competitorScores: number[]
): {
  position: number
  percentile: number
  betterThan: number
  totalCompetitors: number
} {
  if (competitorScores.length === 0) {
    return {
      position: 1,
      percentile: 100,
      betterThan: 0,
      totalCompetitors: 0
    }
  }

  const allScores = [brandScore, ...competitorScores].sort((a, b) => b - a)
  const position = allScores.indexOf(brandScore) + 1
  const percentile = Math.round(((allScores.length - position + 1) / allScores.length) * 100)
  const betterThan = competitorScores.filter(score => brandScore > score).length

  return {
    position,
    percentile,
    betterThan,
    totalCompetitors: competitorScores.length
  }
}