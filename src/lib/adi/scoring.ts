import type { 
  ADIDimensionScore,
  ADIPillarScore,
  ADIScore,
  ADIDimensionName,
  ADIAgentOutput,
  ADIOrchestrationResult
} from '../../types/adi'

import { 
  ADI_DIMENSION_WEIGHTS,
  ADI_PILLAR_WEIGHTS,
  ADI_DIMENSION_PILLARS,
  ADI_DIMENSION_NAMES
} from '../../types/adi'

/**
 * ADI Scoring Engine - Aggregates agent results into final ADI score
 * Implements the 9-dimension framework with confidence intervals and reliability metrics
 */
export class ADIScoringEngine {
  
  /**
   * Calculate ADI score from orchestration results
   */
  static calculateADIScore(orchestrationResult: ADIOrchestrationResult): ADIScore {
    const { agentResults } = orchestrationResult
    
    // Extract dimension scores from agent results
    const dimensionScores = this.extractDimensionScores(agentResults)
    
    // Calculate pillar scores
    const pillars = this.calculatePillarScores(dimensionScores)
    
    // Calculate overall score
    const overall = this.calculateOverallScore(pillars)
    
    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(dimensionScores)
    
    // Calculate reliability score (inter-agent agreement)
    const reliabilityScore = this.calculateReliabilityScore(agentResults)
    
    // Determine grade
    const grade = this.getGradeFromScore(overall)
    
    return {
      overall,
      grade,
      confidenceInterval,
      reliabilityScore,
      pillars,
      methodologyVersion: 'ADI-v1.0'
    }
  }

  /**
   * Extract dimension scores from agent results
   */
  private static extractDimensionScores(agentResults: Record<string, ADIAgentOutput>): ADIDimensionScore[] {
    const dimensionScores: ADIDimensionScore[] = []

    // Map agent results to dimensions (updated with geo visibility)
    const agentToDimensionMap: Record<string, ADIDimensionName> = {
      'schema_agent': 'schema_structured_data',
      'semantic_agent': 'semantic_clarity_ontology',
      'knowledge_graph_agent': 'knowledge_graphs_entity_linking',
      'conversational_copy_agent': 'llm_readability_conversational',
      'geo_visibility_agent': 'geo_visibility_presence',
      'llm_test_agent': 'ai_answer_quality_presence',
      'citation_agent': 'citation_authority_freshness',
      'sentiment_agent': 'reputation_signals',
      'commerce_agent': 'hero_products_use_case'
    }

    // Process each agent's results
    for (const [agentName, agentOutput] of Object.entries(agentResults)) {
      const dimensionName = agentToDimensionMap[agentName]
      
      if (!dimensionName || agentOutput.status !== 'completed') {
        continue
      }

      // Aggregate results from the agent
      const aggregatedScore = this.aggregateAgentResults(agentOutput)
      
      if (aggregatedScore) {
        dimensionScores.push({
          dimension: dimensionName,
          score: aggregatedScore.score,
          confidenceInterval: aggregatedScore.confidence,
          evidence: aggregatedScore.evidence,
          agentContributions: { [agentName]: aggregatedScore.score }
        })
      }
    }

    // Handle special case: schema_structured_data (if schema_agent has results but no dimension yet)
    const schemaAgent = agentResults['schema_agent']
    if (schemaAgent?.status === 'completed' && !dimensionScores.find(d => d.dimension === 'schema_structured_data')) {
      const schemaResults = schemaAgent.results.filter(r =>
        r.resultType.includes('schema') || r.resultType.includes('structured_data')
      )
      
      if (schemaResults.length > 0) {
        const avgScore = schemaResults.reduce((sum, r) => sum + (r.normalizedScore || 0), 0) / schemaResults.length
        const avgConfidence = schemaResults.reduce((sum, r) => sum + (r.confidenceLevel || 0), 0) / schemaResults.length
        
        dimensionScores.push({
          dimension: 'schema_structured_data',
          score: Math.round(avgScore),
          confidenceInterval: avgConfidence,
          evidence: { schemaResults },
          agentContributions: { 'schema_agent': avgScore }
        })
      }
    }

    // Handle special case: policies_logistics_clarity (derived from commerce_agent)
    const commerceAgent = agentResults['commerce_agent']
    if (commerceAgent?.status === 'completed') {
      const logisticsResults = commerceAgent.results.filter(r =>
        r.resultType.includes('logistics') || r.resultType.includes('policy')
      )
      
      if (logisticsResults.length > 0) {
        const avgScore = logisticsResults.reduce((sum, r) => sum + (r.normalizedScore || 0), 0) / logisticsResults.length
        const avgConfidence = logisticsResults.reduce((sum, r) => sum + (r.confidenceLevel || 0), 0) / logisticsResults.length
        
        dimensionScores.push({
          dimension: 'policies_logistics_clarity',
          score: Math.round(avgScore),
          confidenceInterval: avgConfidence,
          evidence: { logisticsResults },
          agentContributions: { 'commerce_agent': avgScore }
        })
      } else {
        // If no specific logistics results, create a default score for policies_logistics_clarity
        const aggregatedScore = this.aggregateAgentResults(commerceAgent)
        if (aggregatedScore) {
          dimensionScores.push({
            dimension: 'policies_logistics_clarity',
            score: Math.round(aggregatedScore.score * 0.6), // Reduced score since it's derived
            confidenceInterval: aggregatedScore.confidence * 0.8,
            evidence: { derivedFromCommerce: true },
            agentContributions: { 'commerce_agent': aggregatedScore.score * 0.6 }
          })
        }
      }

      // Ensure hero_products_use_case dimension is created if not already mapped
      if (!dimensionScores.find(d => d.dimension === 'hero_products_use_case')) {
        const heroResults = commerceAgent.results.filter(r =>
          r.resultType.includes('hero') || r.resultType.includes('product') || r.resultType.includes('use_case')
        )
        
        if (heroResults.length > 0) {
          const avgScore = heroResults.reduce((sum, r) => sum + (r.normalizedScore || 0), 0) / heroResults.length
          const avgConfidence = heroResults.reduce((sum, r) => sum + (r.confidenceLevel || 0), 0) / heroResults.length
          
          dimensionScores.push({
            dimension: 'hero_products_use_case',
            score: Math.round(avgScore),
            confidenceInterval: avgConfidence,
            evidence: { heroResults },
            agentContributions: { 'commerce_agent': avgScore }
          })
        } else {
          // Create default hero products score from commerce agent
          const aggregatedScore = this.aggregateAgentResults(commerceAgent)
          if (aggregatedScore) {
            dimensionScores.push({
              dimension: 'hero_products_use_case',
              score: Math.round(aggregatedScore.score * 0.8), // Primary commerce dimension
              confidenceInterval: aggregatedScore.confidence,
              evidence: { derivedFromCommerce: true },
              agentContributions: { 'commerce_agent': aggregatedScore.score * 0.8 }
            })
          }
        }
      }
    }

    // Ensure all 10 dimensions are represented (create defaults for missing ones)
    const allDimensions: ADIDimensionName[] = [
      'schema_structured_data',
      'semantic_clarity_ontology',
      'knowledge_graphs_entity_linking',
      'llm_readability_conversational',
      'geo_visibility_presence',
      'ai_answer_quality_presence',
      'citation_authority_freshness',
      'reputation_signals',
      'hero_products_use_case',
      'policies_logistics_clarity'
    ]

    // Add missing dimensions with default scores
    for (const dimensionName of allDimensions) {
      if (!dimensionScores.find(d => d.dimension === dimensionName)) {
        // Create a default dimension score based on available agent data
        const defaultScore = this.createDefaultDimensionScore(dimensionName, agentResults)
        if (defaultScore) {
          dimensionScores.push(defaultScore)
        }
      }
    }

    return dimensionScores
  }

  /**
   * Create default dimension score for missing dimensions
   */
  private static createDefaultDimensionScore(
    dimensionName: ADIDimensionName,
    agentResults: Record<string, ADIAgentOutput>
  ): ADIDimensionScore | null {
    // Map dimensions to their responsible agents
    const dimensionToAgentMap: Record<ADIDimensionName, string> = {
      'schema_structured_data': 'schema_agent',
      'semantic_clarity_ontology': 'semantic_agent',
      'knowledge_graphs_entity_linking': 'knowledge_graph_agent',
      'llm_readability_conversational': 'conversational_copy_agent',
      'geo_visibility_presence': 'geo_visibility_agent',
      'ai_answer_quality_presence': 'llm_test_agent',
      'citation_authority_freshness': 'citation_agent',
      'reputation_signals': 'sentiment_agent',
      'hero_products_use_case': 'commerce_agent',
      'policies_logistics_clarity': 'commerce_agent'
    }

    const responsibleAgent = dimensionToAgentMap[dimensionName]
    const agentOutput = agentResults[responsibleAgent]

    if (!agentOutput || agentOutput.status !== 'completed' || !agentOutput.results || agentOutput.results.length === 0) {
      return null
    }

    // Create dimension score from agent results
    const relevantResults = agentOutput.results.filter(r => {
      const resultType = r.resultType.toLowerCase()
      const dimension = dimensionName.toLowerCase()
      
      // Check if result type is relevant to this dimension
      return dimension.split('_').some(keyword => resultType.includes(keyword))
    })

    if (relevantResults.length === 0) {
      // If no specific results, use all results from the agent
      relevantResults.push(...agentOutput.results)
    }

    if (relevantResults.length > 0) {
      const avgScore = relevantResults.reduce((sum, r) => sum + (r.normalizedScore || 0), 0) / relevantResults.length
      const avgConfidence = relevantResults.reduce((sum, r) => sum + (r.confidenceLevel || 0), 0) / relevantResults.length

      return {
        dimension: dimensionName,
        score: Math.round(avgScore),
        confidenceInterval: avgConfidence,
        evidence: {
          defaultGenerated: true,
          relevantResults: relevantResults.length,
          sourceAgent: responsibleAgent
        },
        agentContributions: { [responsibleAgent]: avgScore }
      }
    }

    return null
  }

  /**
   * Aggregate results from a single agent
   */
  private static aggregateAgentResults(agentOutput: ADIAgentOutput): {
    score: number
    confidence: number
    evidence: Record<string, any>
  } | null {
    if (!agentOutput.results || agentOutput.results.length === 0) {
      return null
    }

    // Calculate weighted average of all results
    const totalWeight = agentOutput.results.length
    const weightedScore = agentOutput.results.reduce((sum, result) =>
      sum + (result.normalizedScore || 0), 0
    ) / totalWeight

    // Calculate average confidence
    const avgConfidence = agentOutput.results.reduce((sum, result) =>
      sum + (result.confidenceLevel || 0), 0
    ) / totalWeight

    // Collect evidence
    const evidence = {
      resultCount: agentOutput.results.length,
      executionTime: agentOutput.executionTime,
      results: agentOutput.results.map(r => ({
        type: r.resultType,
        score: r.normalizedScore || 0,
        confidence: r.confidenceLevel || 0,
        evidence: r.evidence
      })),
      metadata: agentOutput.metadata
    }

    return {
      score: Math.round(weightedScore),
      confidence: avgConfidence,
      evidence
    }
  }

  /**
   * Calculate pillar scores from dimension scores
   */
  private static calculatePillarScores(dimensionScores: ADIDimensionScore[]): ADIPillarScore[] {
    const pillars: ADIPillarScore[] = []

    // Group dimensions by pillar
    const pillarGroups: Record<string, ADIDimensionScore[]> = {
      infrastructure: [],
      perception: [],
      commerce: []
    }

    for (const dimensionScore of dimensionScores) {
      const pillar = ADI_DIMENSION_PILLARS[dimensionScore.dimension]
      if (pillar && pillarGroups[pillar]) {
        pillarGroups[pillar].push(dimensionScore)
      }
    }

    // Calculate each pillar score
    for (const [pillarName, dimensions] of Object.entries(pillarGroups)) {
      if (dimensions.length === 0) continue

      const pillarKey = pillarName as keyof typeof ADI_PILLAR_WEIGHTS
      const pillarWeight = ADI_PILLAR_WEIGHTS[pillarKey]

      // Calculate weighted average within the pillar
      let totalWeightedScore = 0
      let totalWeight = 0

      for (const dimension of dimensions) {
        const dimensionWeight = ADI_DIMENSION_WEIGHTS[dimension.dimension]
        totalWeightedScore += dimension.score * dimensionWeight
        totalWeight += dimensionWeight
      }

      const pillarScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0

      pillars.push({
        pillar: pillarKey,
        score: pillarScore,
        weight: pillarWeight,
        dimensions
      })
    }

    return pillars
  }

  /**
   * Calculate overall ADI score from pillar scores
   */
  private static calculateOverallScore(pillars: ADIPillarScore[]): number {
    let totalWeightedScore = 0
    let totalWeight = 0

    for (const pillar of pillars) {
      totalWeightedScore += pillar.score * pillar.weight
      totalWeight += pillar.weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore) : 0
  }

  /**
   * Calculate confidence interval for the overall score
   */
  private static calculateConfidenceInterval(dimensionScores: ADIDimensionScore[]): number {
    if (dimensionScores.length === 0) return 0

    // Calculate standard error based on dimension confidence intervals
    const confidences = dimensionScores.map(d => d.confidenceInterval)
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    
    // Convert confidence to interval (simplified approach)
    // Higher confidence = smaller interval
    const baseInterval = 5.0 // Base ±5 points
    const confidenceMultiplier = 1 - avgConfidence // Lower confidence = larger interval
    
    return Math.round((baseInterval * confidenceMultiplier) * 10) / 10 // Round to 1 decimal
  }

  /**
   * Calculate reliability score based on inter-agent agreement
   */
  private static calculateReliabilityScore(agentResults: Record<string, ADIAgentOutput>): number {
    const completedAgents = Object.values(agentResults).filter(r => r.status === 'completed')
    
    if (completedAgents.length < 2) return 0.5 // Default reliability for single agent

    // Calculate agreement based on execution success and result consistency
    const successRate = completedAgents.length / Object.keys(agentResults).length
    
    // Calculate result consistency (simplified)
    const scores = completedAgents.map(agent => {
      if (!agent.results || agent.results.length === 0) return 50
      return agent.results.reduce((sum, r) => sum + r.normalizedScore, 0) / agent.results.length
    })

    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length
    const consistency = Math.max(0, 1 - (variance / 1000)) // Normalize variance

    // Combine success rate and consistency
    return Math.round((successRate * 0.6 + consistency * 0.4) * 100) / 100
  }

  /**
   * Convert score to letter grade
   */
  private static getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * Generate score breakdown for reporting
   */
  static generateScoreBreakdown(adiScore: ADIScore): {
    summary: string
    strengths: string[]
    gaps: string[]
    opportunities: string[]
  } {
    const { overall, grade, pillars } = adiScore

    // Generate summary
    const summary = `ADI: ${overall}/100 (${grade}) | CI: ±${adiScore.confidenceInterval}`

    // Identify strengths (scores >= 80)
    const strengths: string[] = []
    const gaps: string[] = []
    const opportunities: string[] = []

    for (const pillar of pillars) {
      const pillarName = pillar.pillar.charAt(0).toUpperCase() + pillar.pillar.slice(1)
      
      if (pillar.score >= 80) {
        strengths.push(`${pillarName}: ${pillar.score}`)
      } else if (pillar.score < 60) {
        gaps.push(`${pillarName}: ${pillar.score}`)
      }

      // Find specific dimension opportunities
      for (const dimension of pillar.dimensions) {
        if (dimension.score < 70) {
          const dimensionName = ADI_DIMENSION_NAMES[dimension.dimension]
          opportunities.push(`${dimensionName}: ${dimension.score} → potential +${Math.min(30, 85 - dimension.score)} pts`)
        }
      }
    }

    return {
      summary,
      strengths: strengths.length > 0 ? strengths : ['Consistent performance across dimensions'],
      gaps: gaps.length > 0 ? gaps : ['No major gaps identified'],
      opportunities: opportunities.slice(0, 3) // Top 3 opportunities
    }
  }

  /**
   * Calculate industry percentile (placeholder - requires benchmark data)
   */
  static calculateIndustryPercentile(
    score: number, 
    industryBenchmark?: { median: number; p25: number; p75: number; p90: number }
  ): number {
    if (!industryBenchmark) return 50 // Default to median if no benchmark

    const { median, p25, p75, p90 } = industryBenchmark

    if (score >= p90) return 90 + ((score - p90) / (100 - p90)) * 10
    if (score >= p75) return 75 + ((score - p75) / (p90 - p75)) * 15
    if (score >= median) return 50 + ((score - median) / (p75 - median)) * 25
    if (score >= p25) return 25 + ((score - p25) / (median - p25)) * 25
    
    return (score / p25) * 25
  }

  /**
   * Generate recommendations based on score analysis
   */
  static generateRecommendations(adiScore: ADIScore): Array<{
    priority: 1 | 2 | 3
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    category: string
    estimatedImprovement: string
  }> {
    const recommendations = []
    
    // Analyze each pillar for improvement opportunities
    for (const pillar of adiScore.pillars) {
      for (const dimension of pillar.dimensions) {
        if (dimension.score < 70) {
          const dimensionName = ADI_DIMENSION_NAMES[dimension.dimension]
          const improvement = Math.min(20, 85 - dimension.score)
          
          recommendations.push({
            priority: (dimension.score < 50 ? 1 : dimension.score < 65 ? 2 : 3) as 1 | 2 | 3,
            title: `Improve ${dimensionName}`,
            description: this.getRecommendationDescription(dimension.dimension, dimension.score),
            impact: (improvement > 15 ? 'high' : improvement > 8 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
            effort: this.getEffortLevel(dimension.dimension),
            category: pillar.pillar,
            estimatedImprovement: `+${improvement} points`
          })
        }
      }
    }

    // Sort by priority and impact
    return recommendations
      .sort((a, b) => a.priority - b.priority || (b.impact === 'high' ? 1 : -1))
      .slice(0, 5) // Top 5 recommendations
  }

  private static getRecommendationDescription(dimension: ADIDimensionName, score: number): string {
    const descriptions: Record<ADIDimensionName, string> = {
      'schema_structured_data': 'Add comprehensive Schema.org markup to product pages and implement GS1 standards',
      'semantic_clarity_ontology': 'Improve vocabulary consistency and align with industry taxonomies',
      'knowledge_graphs_entity_linking': 'Establish presence in Google Knowledge Graph and improve internal entity linking',
      'llm_readability_conversational': 'Enhance content structure and add conversational copy with use-case framing',
      'geo_visibility_presence': 'Optimize for location-based AI queries and improve regional search presence',
      'ai_answer_quality_presence': 'Optimize content for AI model retrieval and improve answer completeness',
      'citation_authority_freshness': 'Increase high-authority media mentions and maintain content freshness',
      'reputation_signals': 'Improve review management and strengthen trust indicators',
      'hero_products_use_case': 'Enhance product discovery and use-case articulation for AI systems',
      'policies_logistics_clarity': 'Clarify shipping, return policies and make them easily accessible to AI'
    }

    return descriptions[dimension] || 'Improve this dimension through targeted optimization'
  }

  private static getEffortLevel(dimension: ADIDimensionName): 'high' | 'medium' | 'low' {
    const effortLevels: Record<ADIDimensionName, 'high' | 'medium' | 'low'> = {
      'schema_structured_data': 'medium',
      'semantic_clarity_ontology': 'high',
      'knowledge_graphs_entity_linking': 'high',
      'llm_readability_conversational': 'medium',
      'geo_visibility_presence': 'medium',
      'ai_answer_quality_presence': 'medium',
      'citation_authority_freshness': 'high',
      'reputation_signals': 'medium',
      'hero_products_use_case': 'low',
      'policies_logistics_clarity': 'low'
    }

    return effortLevels[dimension] || 'medium'
  }
}