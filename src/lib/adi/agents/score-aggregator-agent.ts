import { BaseADIAgent } from './base-agent'
import { ADIScoringEngine } from '../scoring'
import type {
  ADIAgentConfig,
  ADIAgentInput,
  ADIAgentOutput,
  ADIDimensionName,
  ADIScore,
  ADIDimensionScore,
  ADIPillarScore,
  ADIOrchestrationResult
} from '../../../types/adi'
import {
  ADI_DIMENSION_WEIGHTS,
  ADI_PILLAR_WEIGHTS,
  ADI_DIMENSION_PILLARS,
  ADI_DIMENSION_NAMES
} from '../../../types/adi'

/**
 * Score Aggregator Agent - Combines all agent results into final ADI score
 * Final agent in the pipeline that produces the comprehensive ADI evaluation
 */
export class ScoreAggregatorAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'score_aggregator',
      version: 'v1.0',
      description: 'Aggregates all agent results into final ADI score with confidence intervals',
      dependencies: [
        'crawl_agent', 'schema_agent', 'semantic_agent', 'knowledge_graph_agent',
        'conversational_copy_agent', 'llm_test_agent', 'citation_agent', 
        'sentiment_agent', 'commerce_agent'
      ],
      timeout: 15000, // 15 seconds
      retryLimit: 2,
      parallelizable: false // Must run after all other agents
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Score Aggregator for evaluation ${input.context.evaluationId}`)

      // Get all previous agent results
      const agentResults = input.previousResults || []
      
      if (agentResults.length === 0) {
        return this.createOutput('failed', [], 0, 'No agent results available for aggregation')
      }

      const results = []

      // Use ADIScoringEngine for consistent scoring logic (eliminates code duplication)
      const mockOrchestrationResult: ADIOrchestrationResult = {
        evaluationId: input.context.evaluationId,
        overallStatus: 'completed',
        agentResults: this.convertToAgentResults(agentResults),
        totalExecutionTime: 0,
        errors: [],
        warnings: []
      }

      // Calculate ADI score using the main scoring engine
      const adiScore = ADIScoringEngine.calculateADIScore(mockOrchestrationResult)
      
      // Create aggregated result
      const finalResult = this.createResult(
        'final_adi_score',
        adiScore.overall,
        adiScore.overall,
        adiScore.reliabilityScore || 0.8,
        {
          adiScore,
          aggregationMetadata: {
            totalAgentsProcessed: agentResults.length,
            dimensionsEvaluated: adiScore.pillars.flatMap((p: ADIPillarScore) => p.dimensions).length,
            methodologyVersion: adiScore.methodologyVersion,
            aggregationTimestamp: new Date().toISOString(),
            optimizedAggregation: true
          }
        }
      )
      results.push(finalResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        finalADIScore: adiScore,
        dimensionCount: adiScore.pillars.flatMap((p: ADIPillarScore) => p.dimensions).length,
        pillarCount: adiScore.pillars.length,
        overallScore: adiScore.overall,
        grade: adiScore.grade
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Score Aggregator execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown aggregation error'
      )
    }
  }

  /**
   * Convert agent results to the format expected by ADIOrchestrationResult
   */
  private convertToAgentResults(agentResults: any[]): Record<string, ADIAgentOutput> {
    const converted: Record<string, ADIAgentOutput> = {}
    
    agentResults.forEach(result => {
      if (result.result_type && result.evidence) {
        // Create a mock ADIAgentOutput from the agent result
        converted[result.result_type] = {
          agentName: result.result_type,
          status: 'completed',
          results: [{
            resultType: result.result_type,
            rawValue: result.raw_value || 0,
            normalizedScore: result.normalized_score || 0,
            confidenceLevel: result.confidence_level || 0.8,
            evidence: result.evidence
          }],
          executionTime: 100,
          metadata: {
            timestamp: result.created_at || new Date().toISOString(),
            optimizedAggregation: true
          }
        }
      }
    })
    
    return converted
  }

  private extractDimensionScores(agentResults: any[]): ADIDimensionScore[] {
    const dimensionScores: ADIDimensionScore[] = []

    // Map agent results to dimensions
    const agentToDimensionMap: Record<string, ADIDimensionName> = {
      'schema_agent': 'schema_structured_data',
      'semantic_agent': 'semantic_clarity_ontology',
      'knowledge_graph_agent': 'knowledge_graphs_entity_linking',
      'conversational_copy_agent': 'llm_readability_conversational',
      'llm_test_agent': 'ai_answer_quality_presence',
      'citation_agent': 'citation_authority_freshness',
      'sentiment_agent': 'reputation_signals',
      'commerce_agent': 'hero_products_use_case'
    }

    // Process each agent result
    for (const agentResult of agentResults) {
      const agentName = this.extractAgentName(agentResult)
      const dimensionName = agentToDimensionMap[agentName]
      
      if (!dimensionName) continue

      // Extract scores from agent result
      const scores = this.extractScoresFromAgentResult(agentResult)
      if (scores.length === 0) continue

      // Calculate aggregated score for this dimension
      const aggregatedScore = this.aggregateScores(scores)
      
      dimensionScores.push({
        dimension: dimensionName,
        score: aggregatedScore.score,
        confidenceInterval: aggregatedScore.confidence,
        evidence: {
          agentName,
          rawScores: scores,
          aggregationMethod: 'weighted_average',
          dataQuality: aggregatedScore.dataQuality
        },
        agentContributions: { [agentName]: aggregatedScore.score }
      })
    }

    // Handle special case: policies_logistics_clarity from commerce_agent
    const commerceAgent = agentResults.find(r => this.extractAgentName(r) === 'commerce_agent')
    if (commerceAgent) {
      const logisticsScores = this.extractLogisticsScores(commerceAgent)
      if (logisticsScores.length > 0) {
        const aggregatedLogistics = this.aggregateScores(logisticsScores)
        
        dimensionScores.push({
          dimension: 'policies_logistics_clarity',
          score: aggregatedLogistics.score,
          confidenceInterval: aggregatedLogistics.confidence,
          evidence: {
            agentName: 'commerce_agent',
            rawScores: logisticsScores,
            aggregationMethod: 'logistics_subset',
            dataQuality: aggregatedLogistics.dataQuality
          },
          agentContributions: { 'commerce_agent': aggregatedLogistics.score }
        })
      }
    }

    return dimensionScores
  }

  private validateDimensionScores(dimensionScores: ADIDimensionScore[]): any {
    const expectedDimensions = Object.keys(ADI_DIMENSION_WEIGHTS) as ADIDimensionName[]
    const foundDimensions = dimensionScores.map(ds => ds.dimension)
    const missingDimensions = expectedDimensions.filter(dim => !foundDimensions.includes(dim))
    
    const validationScore = ((expectedDimensions.length - missingDimensions.length) / expectedDimensions.length) * 100
    
    return this.createResult(
      'dimension_validation',
      validationScore,
      validationScore,
      missingDimensions.length === 0 ? 1.0 : 0.7,
      {
        expectedDimensions: expectedDimensions.length,
        foundDimensions: foundDimensions.length,
        missingDimensions,
        validationScore,
        completeness: validationScore / 100
      }
    )
  }

  private calculatePillarScores(dimensionScores: ADIDimensionScore[]): ADIPillarScore[] {
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

  private createPillarResult(pillarScores: ADIPillarScore[]): any {
    const pillarSummary = pillarScores.map(p => ({
      pillar: p.pillar,
      score: p.score,
      weight: p.weight,
      dimensionCount: p.dimensions.length
    }))

    const avgPillarScore = pillarScores.reduce((sum, p) => sum + p.score, 0) / pillarScores.length

    return this.createResult(
      'pillar_scores',
      avgPillarScore,
      avgPillarScore,
      0.9,
      {
        pillars: pillarSummary,
        totalPillars: pillarScores.length,
        avgScore: avgPillarScore
      }
    )
  }

  private calculateOverallScore(pillarScores: ADIPillarScore[]): number {
    let totalWeightedScore = 0
    let totalWeight = 0

    for (const pillar of pillarScores) {
      totalWeightedScore += pillar.score * pillar.weight
      totalWeight += pillar.weight
    }

    return totalWeight > 0 ? Math.round(totalWeightedScore) : 0
  }

  private createOverallResult(overallScore: number, dimensionScores: ADIDimensionScore[]): any {
    const grade = this.getGradeFromScore(overallScore)
    
    return this.createResult(
      'overall_adi_score',
      overallScore,
      overallScore,
      0.95,
      {
        score: overallScore,
        grade,
        dimensionsUsed: dimensionScores.length,
        scoreBreakdown: {
          infrastructure: this.getPillarScore(dimensionScores, 'infrastructure'),
          perception: this.getPillarScore(dimensionScores, 'perception'),
          commerce: this.getPillarScore(dimensionScores, 'commerce')
        }
      }
    )
  }

  private calculateConfidenceInterval(dimensionScores: ADIDimensionScore[], agentResults: any[]): number {
    if (dimensionScores.length === 0) return 5.0 // Default high uncertainty

    // Calculate confidence based on dimension confidence intervals
    const confidences = dimensionScores.map(d => d.confidenceInterval)
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    
    // Factor in data completeness
    const completenessRatio = dimensionScores.length / 9 // Expected 9 dimensions
    const completenessAdjustment = completenessRatio * 0.5
    
    // Factor in agent success rate
    const successfulAgents = agentResults.filter(r => 
      this.extractAgentStatus(r) === 'completed'
    ).length
    const successRate = successfulAgents / Math.max(agentResults.length, 1)
    const successAdjustment = successRate * 0.3
    
    // Calculate final confidence interval
    const baseInterval = 5.0 // Base ±5 points
    const confidenceMultiplier = 1 - (avgConfidence + completenessAdjustment + successAdjustment)
    
    return Math.round((baseInterval * Math.max(0.2, confidenceMultiplier)) * 10) / 10
  }

  private createConfidenceResult(confidenceInterval: number): any {
    return this.createResult(
      'confidence_interval',
      100 - (confidenceInterval * 10), // Convert interval to score (lower interval = higher score)
      100 - (confidenceInterval * 10),
      0.9,
      {
        confidenceInterval,
        interpretation: this.interpretConfidenceInterval(confidenceInterval),
        dataQuality: confidenceInterval < 3 ? 'high' : confidenceInterval < 5 ? 'medium' : 'low'
      }
    )
  }

  private calculateReliabilityScore(agentResults: any[]): number {
    const totalAgents = agentResults.length
    const successfulAgents = agentResults.filter(r => 
      this.extractAgentStatus(r) === 'completed'
    ).length
    
    if (totalAgents === 0) return 0.5

    // Base reliability on success rate
    const successRate = successfulAgents / totalAgents
    
    // Calculate inter-agent agreement (simplified)
    const scores = agentResults
      .filter(r => this.extractAgentStatus(r) === 'completed')
      .map(r => this.extractAverageScore(r))
      .filter(score => score !== null) as number[]
    
    if (scores.length < 2) return successRate * 0.7 // Penalty for insufficient data
    
    // Calculate coefficient of variation (lower = more reliable)
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1
    
    // Convert to reliability score (0-1)
    const agreementScore = Math.max(0, 1 - coefficientOfVariation)
    
    // Combine success rate and agreement
    return Math.round((successRate * 0.6 + agreementScore * 0.4) * 100) / 100
  }

  private createReliabilityResult(reliabilityScore: number): any {
    return this.createResult(
      'reliability_score',
      reliabilityScore * 100,
      reliabilityScore * 100,
      0.9,
      {
        reliabilityScore,
        interpretation: this.interpretReliabilityScore(reliabilityScore),
        dataQuality: reliabilityScore > 0.8 ? 'high' : reliabilityScore > 0.6 ? 'medium' : 'low'
      }
    )
  }

  private generateFinalADIScore(
    overallScore: number,
    pillarScores: ADIPillarScore[],
    dimensionScores: ADIDimensionScore[],
    confidenceInterval: number,
    reliabilityScore: number
  ): ADIScore {
    return {
      overall: overallScore,
      grade: this.getGradeFromScore(overallScore),
      confidenceInterval,
      reliabilityScore,
      pillars: pillarScores,
      methodologyVersion: 'ADI-v1.0'
    }
  }

  // Helper methods
  private extractAgentName(agentResult: any): string {
    return agentResult.result_type?.split('_')[0] || 'unknown'
  }

  private extractAgentStatus(agentResult: any): string {
    return agentResult.evidence?.status || 'unknown'
  }

  private extractScoresFromAgentResult(agentResult: any): number[] {
    const scores: number[] = []
    
    if (agentResult.normalized_score !== undefined) {
      scores.push(agentResult.normalized_score)
    }
    
    if (agentResult.raw_value !== undefined) {
      scores.push(agentResult.raw_value)
    }
    
    // Extract scores from evidence if available
    const evidence = agentResult.evidence || {}
    if (evidence.results && Array.isArray(evidence.results)) {
      for (const result of evidence.results) {
        if (result.score !== undefined) {
          scores.push(result.score)
        }
        if (result.normalizedScore !== undefined) {
          scores.push(result.normalizedScore)
        }
      }
    }
    
    return scores.filter(score => typeof score === 'number' && score >= 0 && score <= 100)
  }

  private extractLogisticsScores(commerceAgentResult: any): number[] {
    const evidence = commerceAgentResult.evidence || {}
    const results = evidence.results || []
    
    return results
      .filter((result: any) => 
        result.type?.includes('logistics') || 
        result.type?.includes('policy') ||
        result.type?.includes('shipping')
      )
      .map((result: any) => result.score || result.normalizedScore)
      .filter((score: any) => typeof score === 'number' && score >= 0 && score <= 100)
  }

  private extractAverageScore(agentResult: any): number | null {
    const scores = this.extractScoresFromAgentResult(agentResult)
    if (scores.length === 0) return null
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private aggregateScores(scores: number[]): {
    score: number
    confidence: number
    dataQuality: string
  } {
    if (scores.length === 0) {
      return { score: 0, confidence: 0, dataQuality: 'none' }
    }

    // Calculate weighted average (could be enhanced with actual weights)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    // Calculate confidence based on score consistency
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
    const consistency = Math.max(0, 1 - (variance / 1000)) // Normalize variance
    
    // Data quality assessment
    let dataQuality = 'low'
    if (scores.length >= 3 && consistency > 0.7) dataQuality = 'high'
    else if (scores.length >= 2 && consistency > 0.5) dataQuality = 'medium'
    
    return {
      score: Math.round(avgScore),
      confidence: consistency,
      dataQuality
    }
  }

  private getPillarScore(dimensionScores: ADIDimensionScore[], pillarName: string): number {
    const pillarDimensions = dimensionScores.filter(ds => 
      ADI_DIMENSION_PILLARS[ds.dimension] === pillarName
    )
    
    if (pillarDimensions.length === 0) return 0
    
    let totalWeightedScore = 0
    let totalWeight = 0
    
    for (const dimension of pillarDimensions) {
      const weight = ADI_DIMENSION_WEIGHTS[dimension.dimension]
      totalWeightedScore += dimension.score * weight
      totalWeight += weight
    }
    
    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0
  }

  private getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  private interpretConfidenceInterval(interval: number): string {
    if (interval <= 2) return 'Very High Confidence'
    if (interval <= 3) return 'High Confidence'
    if (interval <= 4) return 'Medium Confidence'
    if (interval <= 5) return 'Low Confidence'
    return 'Very Low Confidence'
  }

  private interpretReliabilityScore(score: number): string {
    if (score >= 0.9) return 'Excellent Reliability'
    if (score >= 0.8) return 'High Reliability'
    if (score >= 0.7) return 'Good Reliability'
    if (score >= 0.6) return 'Fair Reliability'
    return 'Low Reliability'
  }
}