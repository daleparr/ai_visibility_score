import type {
  ADIDimensionScore,
  ADIPillarScore,
  ADIScore,
  ADIDimensionName,
  ADIAgentOutput,
  ADIOrchestrationResult,
  AIDIHybridScore,
  AIDIOptimizationAreaScore,
  AIDISubDimensionBreakdown,
  AIDIPrimaryDimensionName,
  AIDIOptimizationAreaName
} from '../../types/adi'

import {
  ADI_DIMENSION_WEIGHTS,
  ADI_PILLAR_WEIGHTS,
  ADI_DIMENSION_PILLARS,
  ADI_DIMENSION_NAMES,
  AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING,
  AIDI_OPTIMIZATION_TO_PRIMARY_MAPPING,
  AIDI_OPTIMIZATION_AREA_WEIGHTS,
  AIDI_OPTIMIZATION_AREA_NAMES
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
    console.log(``)
    console.log(`╔═══════════════════════════════════════════════════════════╗`)
    console.log(`║  🎯 ADI SCORING ENGINE - calculateADIScore ENTRY          ║`)
    console.log(`╚═══════════════════════════════════════════════════════════╝`)
    console.log(`🎯 [ScoringEngine] Agent results count: ${Object.keys(orchestrationResult.agentResults).length}`)
    console.log(`🎯 [ScoringEngine] Agent names:`, Object.keys(orchestrationResult.agentResults))
    console.log(``)
    
    const { agentResults } = orchestrationResult
    
    // Extract dimension scores from agent results
    console.log(`🎯 [ScoringEngine] Extracting dimension scores...`)
    const dimensionScores = this.extractDimensionScores(agentResults)
    console.log(`🎯 [ScoringEngine] Extracted ${dimensionScores.length} dimension scores`)
    
    // Calculate pillar scores
    console.log(`🎯 [ScoringEngine] Calculating pillar scores from ${dimensionScores.length} dimensions...`)
    const pillars = this.calculatePillarScores(dimensionScores)
    console.log(`🎯 [ScoringEngine] Calculated ${pillars.length} pillar scores`)
    console.log(`🎯 [ScoringEngine] Pillars:`, pillars.map(p => `${p.pillar}: ${p.score} (${p.dimensions.length} dimensions)`))
    
    // Calculate overall score
    console.log(`🎯 [ScoringEngine] Calculating overall score...`)
    const overall = this.calculateOverallScore(pillars)
    console.log(`🎯 [ScoringEngine] Overall score: ${overall}/100`)
    
    // Calculate confidence interval
    const confidenceInterval = this.calculateConfidenceInterval(dimensionScores)
    
    // Calculate reliability score (inter-agent agreement)
    const reliabilityScore = this.calculateReliabilityScore(agentResults)
    
    // Determine grade
    const grade = this.getGradeFromScore(overall)
    
    const finalScore = {
      overall,
      grade,
      confidenceInterval,
      reliabilityScore,
      pillars,
      methodologyVersion: 'ADI-v1.0'
    }
    
    console.log(``)
    console.log(`✅ [ScoringEngine] SCORE CALCULATION COMPLETE`)
    console.log(`✅ [ScoringEngine] Overall: ${overall}/100, Grade: ${grade}`)
    console.log(`✅ [ScoringEngine] Pillars: ${pillars.length}, Total dimensions across pillars: ${pillars.reduce((sum, p) => sum + p.dimensions.length, 0)}`)
    console.log(``)
    
    return finalScore
  }

  /**
   * Calculate hybrid ADI score with both primary dimensions and optimization areas
   */
  static calculateHybridADIScore(orchestrationResult: ADIOrchestrationResult): AIDIHybridScore {
    const { agentResults } = orchestrationResult
    
    // Calculate standard ADI score first
    const standardScore = this.calculateADIScore(orchestrationResult)
    
    // Extract optimization area scores
    const optimizationAreaScores = this.extractOptimizationAreaScores(agentResults)
    
    // Create sub-dimension breakdowns
    const subDimensionBreakdowns = this.createSubDimensionBreakdowns(agentResults, optimizationAreaScores)
    
    // Identify quick wins and critical areas
    const criticalAreas = optimizationAreaScores.filter(area => area.score < 50).length
    const quickWins = optimizationAreaScores
      .filter(area => area.score >= 60 && area.score < 80 && area.effort === 'low')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    
    return {
      ...standardScore,
      primaryDimensions: {
        scores: this.extractPrimaryDimensionScores(agentResults),
        pillars: standardScore.pillars.map(pillar => ({
          ...pillar,
          optimizationAreas: optimizationAreaScores.filter(area =>
            AIDI_OPTIMIZATION_TO_PRIMARY_MAPPING[area.optimizationArea] &&
            standardScore.pillars.find(p => p.dimensions.some(d => d.dimension === AIDI_OPTIMIZATION_TO_PRIMARY_MAPPING[area.optimizationArea]))
          ),
          subDimensionBreakdowns: subDimensionBreakdowns.filter(breakdown =>
            pillar.dimensions.some(d => d.dimension === breakdown.primaryDimension)
          )
        }))
      },
      optimizationAreas: {
        scores: optimizationAreaScores.reduce((acc, area) => {
          acc[area.optimizationArea] = area
          return acc
        }, {} as Record<AIDIOptimizationAreaName, AIDIOptimizationAreaScore>),
        totalAreas: optimizationAreaScores.length,
        criticalAreas,
        quickWins
      },
      subDimensionBreakdowns,
      methodologyVersion: 'ADI-Hybrid-v1.0'
    }
  }

  /**
   * Extract optimization area scores from agent results
   */
  private static extractOptimizationAreaScores(agentResults: Record<string, ADIAgentOutput>): AIDIOptimizationAreaScore[] {
    const optimizationAreaScores: AIDIOptimizationAreaScore[] = []
    
    // Enhanced agent to optimization area mapping
    const agentToOptimizationMap: Record<string, AIDIOptimizationAreaName[]> = {
      'schema_agent': ['schema_structured_data'],
      'semantic_agent': ['semantic_clarity', 'ontologies_taxonomy'],
      'knowledge_graph_agent': ['knowledge_graphs_entity_linking'],
      'conversational_copy_agent': ['conversational_copy'],
      'llm_test_agent': ['llm_readability', 'ai_answer_quality_presence'],
      'geo_visibility_agent': ['geo_visibility_presence'],
      'citation_agent': ['citation_authority_freshness'],
      'sentiment_agent': ['sentiment_trust'],
      'brand_heritage_agent': ['brand_heritage'],
      'commerce_agent': ['hero_products_use_case', 'policies_logistics_clarity']
    }
    
    // Process each agent's results
    for (const [agentName, agentOutput] of Object.entries(agentResults)) {
      const optimizationAreas = agentToOptimizationMap[agentName] || []
      
      if (agentOutput.status !== 'completed' || optimizationAreas.length === 0) {
        continue
      }
      
      // For agents that map to multiple optimization areas, split the results
      if (optimizationAreas.length === 1) {
        const optimizationArea = optimizationAreas[0]
        const aggregatedScore = this.aggregateAgentResults(agentOutput)
        
        if (aggregatedScore) {
          optimizationAreaScores.push({
            optimizationArea,
            score: aggregatedScore.score,
            confidenceInterval: aggregatedScore.confidence,
            evidence: aggregatedScore.evidence,
            agentContributions: { [agentName]: aggregatedScore.score },
            recommendations: this.generateOptimizationRecommendations(optimizationArea, aggregatedScore.score),
            priority: this.determinePriority(aggregatedScore.score),
            effort: this.determineEffort(optimizationArea),
            timeToImpact: this.determineTimeToImpact(optimizationArea, aggregatedScore.score)
          })
        }
      } else {
        // Split results for agents with multiple optimization areas
        for (const optimizationArea of optimizationAreas) {
          const relevantResults = this.filterResultsForOptimizationArea(agentOutput, optimizationArea)
          const score = this.calculateOptimizationAreaScore(relevantResults, optimizationArea)
          
          optimizationAreaScores.push({
            optimizationArea,
            score,
            confidenceInterval: 0.8, // Default confidence for derived scores
            evidence: { derivedFrom: agentName, relevantResults },
            agentContributions: { [agentName]: score },
            recommendations: this.generateOptimizationRecommendations(optimizationArea, score),
            priority: this.determinePriority(score),
            effort: this.determineEffort(optimizationArea),
            timeToImpact: this.determineTimeToImpact(optimizationArea, score)
          })
        }
      }
    }
    
    return optimizationAreaScores
  }

  /**
   * Create sub-dimension breakdowns showing how primary dimensions split into optimization areas
   */
  private static createSubDimensionBreakdowns(
    agentResults: Record<string, ADIAgentOutput>,
    optimizationAreaScores: AIDIOptimizationAreaScore[]
  ): AIDISubDimensionBreakdown[] {
    const breakdowns: AIDISubDimensionBreakdown[] = []
    
    for (const [primaryDimension, optimizationAreas] of Object.entries(AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING)) {
      const primaryDimensionName = primaryDimension as AIDIPrimaryDimensionName
      
      // Calculate primary dimension score as weighted average of optimization areas
      let totalWeightedScore = 0
      let totalWeight = 0
      const subDimensions: Record<string, any> = {}
      
      for (const optimizationArea of optimizationAreas) {
        const areaScore = optimizationAreaScores.find(score => score.optimizationArea === optimizationArea)
        const weight = AIDI_OPTIMIZATION_AREA_WEIGHTS[optimizationArea] || 0.05
        
        if (areaScore) {
          totalWeightedScore += areaScore.score * weight
          totalWeight += weight
          
          subDimensions[optimizationArea] = {
            score: areaScore.score,
            weight,
            optimizationAreas: [optimizationArea]
          }
        }
      }
      
      const primaryScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
      
      breakdowns.push({
        primaryDimension: primaryDimensionName,
        primaryScore,
        subDimensions
      })
    }
    
    return breakdowns
  }

  /**
   * Extract primary dimension scores for dashboard display
   */
  private static extractPrimaryDimensionScores(agentResults: Record<string, ADIAgentOutput>): Record<AIDIPrimaryDimensionName, number> {
    const scores: Record<AIDIPrimaryDimensionName, number> = {} as Record<AIDIPrimaryDimensionName, number>
    
    // Use existing dimension extraction logic but map to primary dimensions
    const dimensionScores = this.extractDimensionScores(agentResults)
    
    for (const dimensionScore of dimensionScores) {
      const primaryDimension = dimensionScore.dimension as AIDIPrimaryDimensionName
      scores[primaryDimension] = dimensionScore.score
    }
    
    return scores
  }

  /**
   * Extract dimension scores from agent results
   */
  private static extractDimensionScores(agentResults: Record<string, ADIAgentOutput>): ADIDimensionScore[] {
    const dimensionScores: ADIDimensionScore[] = []

    // Map agent results to dimensions (updated with all dimensions)
    const agentToDimensionMap: Record<string, ADIDimensionName[]> = {
      'schema_agent': ['schema_structured_data'],
      'semantic_agent': ['semantic_clarity_ontology'],
      'knowledge_graph_agent': ['knowledge_graphs_entity_linking'],
      'conversational_copy_agent': ['llm_readability_conversational'],
      'geo_visibility_agent': ['geo_visibility_presence'],
      'llm_test_agent': ['ai_answer_quality_presence'],
      'citation_agent': ['citation_authority_freshness'],
      'sentiment_agent': ['reputation_signals'],
      'commerce_agent': ['hero_products_use_case', 'policies_logistics_clarity'], // Commerce agent handles both
      'crawl_agent': ['policies_logistics_clarity'], // Crawl agent also evaluates policies/logistics
      'brand_heritage_agent': ['reputation_signals'] // Map to reputation signals
    }

    // Process each agent's results
    for (const [agentName, agentOutput] of Object.entries(agentResults)) {
      const dimensionNames = agentToDimensionMap[agentName]
      
      if (!dimensionNames || agentOutput.status !== 'completed') {
        continue
      }

      // Aggregate results from the agent
      const aggregatedScore = this.aggregateAgentResults(agentOutput)
      
      if (aggregatedScore) {
        // Handle agents that map to multiple dimensions
        for (const dimensionName of dimensionNames) {
          dimensionScores.push({
            dimension: dimensionName,
            score: aggregatedScore.score,
            confidenceInterval: aggregatedScore.confidence,
            evidence: aggregatedScore.evidence,
            agentContributions: { [agentName]: aggregatedScore.score }
          })
        }
      }
    }

    // Handle special case: schema_structured_data (if schema_agent has results but no dimension yet)
    const schemaAgent = agentResults['schema_agent']
    if (schemaAgent?.status === 'completed' && !dimensionScores.find(d => d.dimension === 'schema_structured_data')) {
      const schemaResults = schemaAgent.results.filter((r: any) => {
        const resultType = r.type || r.resultType || ''
        return resultType.includes('schema') || resultType.includes('structured_data')
      })
      
      if (schemaResults.length > 0) {
        const avgScore = schemaResults.reduce((sum, r: any) => sum + (r.score || r.normalizedScore || 0), 0) / schemaResults.length
        const avgConfidence = schemaResults.reduce((sum, r: any) => sum + (r.confidence || r.confidenceLevel || 0), 0) / schemaResults.length
        
        dimensionScores.push({
          dimension: 'schema_structured_data',
          score: Math.round(avgScore),
          confidenceInterval: avgConfidence,
          evidence: { schemaResults },
          agentContributions: { 'schema_agent': avgScore }
        })
      }
    }

    // NOTE: Special case handling for commerce_agent has been removed.
    // Both hero_products_use_case and policies_logistics_clarity are now
    // properly mapped in agentToDimensionMap (line 288), preventing duplicate scores.

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
    const relevantResults = agentOutput.results.filter((r: any) => {
      const resultType = (r.type || r.resultType || '').toLowerCase()
      const dimension = dimensionName.toLowerCase()
      
      // Check if result type is relevant to this dimension
      return dimension.split('_').some(keyword => resultType.includes(keyword))
    })

    if (relevantResults.length === 0) {
      // If no specific results, use all results from the agent
      relevantResults.push(...agentOutput.results)
    }

    if (relevantResults.length > 0) {
      const avgScore = relevantResults.reduce((sum, r: any) => sum + (r.score || r.normalizedScore || 0), 0) / relevantResults.length
      const avgConfidence = relevantResults.reduce((sum, r: any) => sum + (r.confidence || r.confidenceLevel || 0), 0) / relevantResults.length

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

    // Helper to extract score from result (handles both old and new formats)
    const extractScore = (result: any): number => {
      return result.score || result.normalizedScore || result.rawValue || 0
    }

    // Helper to extract confidence from result (handles both old and new formats)
    const extractConfidence = (result: any): number => {
      return result.confidence || result.confidenceLevel || 0
    }

    // Calculate weighted average of all results
    const totalWeight = agentOutput.results.length
    const weightedScore = agentOutput.results.reduce((sum, result) =>
      sum + extractScore(result), 0
    ) / totalWeight

    // Calculate average confidence
    const avgConfidence = agentOutput.results.reduce((sum, result) =>
      sum + extractConfidence(result), 0
    ) / totalWeight

    // Collect evidence
    const evidence = {
      resultCount: agentOutput.results.length,
      executionTime: agentOutput.executionTime,
      results: agentOutput.results.map((r: any) => ({
        type: r.type || r.resultType,
        score: extractScore(r),
        confidence: extractConfidence(r),
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

    // CRITICAL FIX: Normalize by actual total weight to handle missing pillars
    // When infrastructure pillar is missing (fast agents not running), we need to
    // normalize the score based on the available pillars, not penalize it to ~50/100
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
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

  /**
   * Filter agent results for specific optimization area
   */
  private static filterResultsForOptimizationArea(agentOutput: ADIAgentOutput, optimizationArea: AIDIOptimizationAreaName): any[] {
    if (!agentOutput.results) return []
    
    const areaKeywords: Record<AIDIOptimizationAreaName, string[]> = {
      'schema_structured_data': ['schema', 'structured', 'markup'],
      'semantic_clarity': ['semantic', 'clarity', 'terminology'],
      'ontologies_taxonomy': ['ontology', 'taxonomy', 'hierarchy', 'category'],
      'knowledge_graphs_entity_linking': ['knowledge', 'graph', 'entity', 'linking'],
      'llm_readability': ['readability', 'structure', 'accessibility'],
      'conversational_copy': ['conversational', 'copy', 'natural', 'tone'],
      'geo_visibility_presence': ['geo', 'geographic', 'location', 'presence'],
      'ai_answer_quality_presence': ['answer', 'quality', 'response', 'accuracy'],
      'citation_authority_freshness': ['citation', 'authority', 'freshness', 'media'],
      'sentiment_trust': ['sentiment', 'trust', 'reputation'],
      'brand_heritage': ['heritage', 'story', 'history', 'values', 'founder'],
      'hero_products_use_case': ['hero', 'products', 'use-case', 'recommendation'],
      'policies_logistics_clarity': ['policies', 'logistics', 'shipping', 'clarity']
    }
    
    const keywords = areaKeywords[optimizationArea] || []
    
    return agentOutput.results.filter((result: any) => {
      const resultType = (result.type || result.resultType || '').toLowerCase()
      return keywords.some(keyword => resultType.includes(keyword))
    })
  }

  /**
   * Calculate optimization area score from filtered results
   */
  private static calculateOptimizationAreaScore(results: any[], optimizationArea: AIDIOptimizationAreaName): number {
    if (results.length === 0) {
      // Return default score based on optimization area criticality
      const criticalAreas = ['schema_structured_data', 'ai_answer_quality_presence', 'hero_products_use_case']
      return criticalAreas.includes(optimizationArea) ? 40 : 50
    }
    
    const totalScore = results.reduce((sum, result) => sum + (result.normalizedScore || 0), 0)
    return Math.round(totalScore / results.length)
  }

  /**
   * Generate optimization recommendations based on area and score
   */
  private static generateOptimizationRecommendations(area: AIDIOptimizationAreaName, score: number): string[] {
    const recommendationMap: Partial<Record<AIDIOptimizationAreaName, Record<string, string[]>>> = {
      'schema_structured_data': {
        low: ['Implement basic Schema.org markup', 'Add Product and Organization schemas', 'Validate markup with Google tools'],
        medium: ['Enhance existing schemas with more properties', 'Add FAQ and Review schemas', 'Optimize schema for rich snippets'],
        high: ['Implement advanced schema types', 'Create automated schema generation', 'Monitor schema performance']
      },
      'semantic_clarity': {
        low: ['Standardize product terminology', 'Create clear category names', 'Improve content disambiguation'],
        medium: ['Enhance semantic consistency', 'Optimize content hierarchy', 'Implement semantic markup'],
        high: ['Develop semantic content strategy', 'Create industry-specific vocabulary', 'Maintain semantic excellence']
      },
      'conversational_copy': {
        low: ['Rewrite product descriptions naturally', 'Add conversational FAQ content', 'Use natural language patterns'],
        medium: ['Enhance conversational tone', 'Add use-case driven copy', 'Optimize for voice search'],
        high: ['Create conversational content templates', 'Implement dynamic conversational elements', 'Lead conversational AI optimization']
      },
      'brand_heritage': {
        low: ['Create brand story content', 'Add founder biography', 'Document company history'],
        medium: ['Enhance brand narrative', 'Expand heritage timeline', 'Connect values to story'],
        high: ['Optimize heritage for AI understanding', 'Create heritage-driven content', 'Leverage story for differentiation']
      }
      // Add more areas as needed
    }
    
    const scoreCategory = score < 50 ? 'low' : score < 80 ? 'medium' : 'high'
    return recommendationMap[area]?.[scoreCategory] || [
      'Analyze current performance gaps',
      'Implement industry best practices',
      'Monitor and optimize continuously'
    ]
  }

  /**
   * Determine priority based on score
   */
  private static determinePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score < 40) return 'critical'
    if (score < 60) return 'high'
    if (score < 80) return 'medium'
    return 'low'
  }

  /**
   * Determine effort level for optimization area
   */
  private static determineEffort(area: AIDIOptimizationAreaName): 'low' | 'medium' | 'high' {
    const effortMap: Record<AIDIOptimizationAreaName, 'low' | 'medium' | 'high'> = {
      'schema_structured_data': 'medium',
      'semantic_clarity': 'high',
      'ontologies_taxonomy': 'high',
      'knowledge_graphs_entity_linking': 'high',
      'llm_readability': 'medium',
      'conversational_copy': 'medium',
      'geo_visibility_presence': 'medium',
      'ai_answer_quality_presence': 'low',
      'citation_authority_freshness': 'high',
      'sentiment_trust': 'medium',
      'brand_heritage': 'medium',
      'hero_products_use_case': 'low',
      'policies_logistics_clarity': 'low'
    }
    
    return effortMap[area] || 'medium'
  }

  /**
   * Determine time to impact for optimization area
   */
  private static determineTimeToImpact(area: AIDIOptimizationAreaName, score: number): string {
    const baseTimeMap: Record<AIDIOptimizationAreaName, string> = {
      'schema_structured_data': '2-4 weeks',
      'semantic_clarity': '1-3 months',
      'ontologies_taxonomy': '2-4 months',
      'knowledge_graphs_entity_linking': '3-6 months',
      'llm_readability': '3-6 weeks',
      'conversational_copy': '4-8 weeks',
      'geo_visibility_presence': '6-12 weeks',
      'ai_answer_quality_presence': '2-4 weeks',
      'citation_authority_freshness': '3-6 months',
      'sentiment_trust': '2-4 months',
      'brand_heritage': '4-8 weeks',
      'hero_products_use_case': '2-4 weeks',
      'policies_logistics_clarity': '1-2 weeks'
    }
    
    // Adjust based on current score - lower scores may take longer
    const baseTime = baseTimeMap[area] || '4-8 weeks'
    if (score < 30) {
      return baseTime.replace(/(\d+)-(\d+)/, (match, start, end) => `${parseInt(start) + 2}-${parseInt(end) + 4}`)
    }
    
    return baseTime
  }
}