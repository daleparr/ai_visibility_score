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
 * Bulletproof Score Aggregator Agent - NEVER FAILS
 * 
 * This agent is designed to ALWAYS produce a result, even with:
 * - Zero agent results
 * - Corrupted data
 * - Database failures
 * - Any other error scenario
 * 
 * Fallback hierarchy:
 * 1. Full aggregation (all agents successful)
 * 2. Partial aggregation (some agents successful)
 * 3. Emergency fallback (no agents successful)
 */
export class BulletproofScoreAggregatorAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'score_aggregator',
      version: 'v2.0-bulletproof',
      description: 'Bulletproof score aggregation that never fails - always produces results',
      dependencies: [
        'crawl_agent', 'schema_agent', 'semantic_agent', 'knowledge_graph_agent',
        'conversational_copy_agent', 'llm_test_agent', 'citation_agent', 
        'sentiment_agent', 'commerce_agent', 'brand_heritage_agent'
      ],
      timeout: 15000, // 15 seconds
      retryLimit: 0, // No retries - handle all failures internally
      parallelizable: false // Must run after all other agents
    }
    super(config)
  }

  /**
   * BULLETPROOF EXECUTION - This method NEVER throws errors
   */
  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`🛡️ Executing Bulletproof Score Aggregator for evaluation ${input.context.evaluationId}`)

      // Try full aggregation first
      const fullResult = await this.attemptFullAggregation(input)
      if (fullResult) {
        console.log(`✅ Full aggregation successful`)
        return fullResult
      }

      console.log(`⚠️ Full aggregation failed, attempting partial aggregation`)
      
      // Fallback to partial aggregation
      const partialResult = await this.attemptPartialAggregation(input)
      if (partialResult) {
        console.log(`✅ Partial aggregation successful`)
        return partialResult
      }

      console.log(`🚨 Partial aggregation failed, using emergency fallback`)
      
      // Ultimate fallback - always succeeds
      return this.createEmergencyFallback(input, Date.now() - startTime)

    } catch (error) {
      // This should never happen, but if it does, we still return a result
      console.error('🚨 CRITICAL: Bulletproof aggregator caught unexpected error:', error)
      return this.createEmergencyFallback(input, Date.now() - startTime, error)
    }
  }

  /**
   * Attempt full aggregation using existing ADIScoringEngine
   */
  private async attemptFullAggregation(input: ADIAgentInput): Promise<ADIAgentOutput | null> {
    try {
      const agentResults = input.previousResults || []
      
      if (agentResults.length === 0) {
        return null // No data for full aggregation
      }

      // Use existing scoring engine logic
      const mockOrchestrationResult: ADIOrchestrationResult = {
        evaluationId: input.context.evaluationId,
        overallStatus: 'completed',
        agentResults: this.convertToAgentResults(agentResults),
        totalExecutionTime: 0,
        errors: [],
        warnings: []
      }

      const adiScore = ADIScoringEngine.calculateADIScore(mockOrchestrationResult)
      
      // Validate the score is reasonable
      if (!adiScore || typeof adiScore.overall !== 'number' || adiScore.overall < 0 || adiScore.overall > 100) {
        return null // Invalid score, fallback to partial
      }

      const finalResult = this.createResult(
        'final_adi_score_full',
        adiScore.overall,
        adiScore.overall,
        adiScore.reliabilityScore || 0.8,
        {
          adiScore,
          aggregationType: 'full',
          dataCompleteness: '100%',
          agentsProcessed: agentResults.length,
          methodologyVersion: adiScore.methodologyVersion,
          aggregationTimestamp: new Date().toISOString()
        }
      )

      return this.createOutput('completed', [finalResult], 0, undefined, {
        finalADIScore: adiScore,
        aggregationType: 'full',
        dataQuality: 'high',
        confidence: adiScore.reliabilityScore || 0.8
      })

    } catch (error) {
      console.warn('Full aggregation failed:', error)
      return null
    }
  }

  /**
   * Attempt partial aggregation with available data
   */
  private async attemptPartialAggregation(input: ADIAgentInput): Promise<ADIAgentOutput | null> {
    try {
      const agentResults = input.previousResults || []
      const validResults = agentResults.filter(r => 
        r.normalized_score !== undefined && 
        r.normalized_score >= 0 && 
        r.normalized_score <= 100
      )

      if (validResults.length === 0) {
        return null // No valid data for partial aggregation
      }

      console.log(`📊 Partial aggregation with ${validResults.length}/${agentResults.length} valid results`)

      // Calculate weighted average from available results
      const partialScore = this.calculatePartialScore(validResults)
      const confidence = this.calculatePartialConfidence(validResults, agentResults.length)
      
      const finalResult = this.createResult(
        'final_adi_score_partial',
        partialScore.score,
        partialScore.score,
        confidence,
        {
          aggregationType: 'partial',
          dataCompleteness: `${validResults.length}/${agentResults.length} agents`,
          availableAgents: validResults.map(r => r.agent_id || r.result_type),
          partialScore: partialScore.score,
          confidence,
          methodologyVersion: 'ADI-v1.0-partial',
          aggregationTimestamp: new Date().toISOString(),
          warning: 'Score calculated from partial data - full analysis may differ'
        }
      )

      return this.createOutput('completed', [finalResult], 0, undefined, {
        finalADIScore: {
          overall: partialScore.score,
          grade: this.getGradeFromScore(partialScore.score),
          confidenceInterval: 5.0, // Higher uncertainty for partial data
          reliabilityScore: confidence,
          methodologyVersion: 'ADI-v1.0-partial'
        },
        aggregationType: 'partial',
        dataQuality: confidence > 0.6 ? 'medium' : 'low',
        confidence
      })

    } catch (error) {
      console.warn('Partial aggregation failed:', error)
      return null
    }
  }

  /**
   * Emergency fallback - ALWAYS succeeds
   */
  private createEmergencyFallback(
    input: ADIAgentInput, 
    executionTime: number, 
    error?: any
  ): ADIAgentOutput {
    console.log(`🚨 Creating emergency fallback for evaluation ${input.context.evaluationId}`)

    // Conservative emergency score based on basic website existence
    const emergencyScore = 25 // Assumes basic website functionality
    const confidence = 0.1 // Very low confidence

    const finalResult = this.createResult(
      'final_adi_score_emergency',
      emergencyScore,
      emergencyScore,
      confidence,
      {
        aggregationType: 'emergency_fallback',
        dataCompleteness: '0% - emergency fallback',
        emergencyReason: error ? error.message : 'No agent data available',
        websiteUrl: input.context.websiteUrl,
        fallbackScore: emergencyScore,
        confidence,
        methodologyVersion: 'ADI-v1.0-emergency',
        aggregationTimestamp: new Date().toISOString(),
        warning: 'Emergency fallback score - please retry evaluation for full analysis'
      }
    )

    return this.createOutput('completed', [finalResult], executionTime, undefined, {
      finalADIScore: {
        overall: emergencyScore,
        grade: 'F',
        confidenceInterval: 10.0, // High uncertainty
        reliabilityScore: confidence,
        methodologyVersion: 'ADI-v1.0-emergency'
      },
      aggregationType: 'emergency',
      dataQuality: 'emergency',
      confidence,
      emergencyFallback: true
    })
  }

  /**
   * Calculate score from partial agent results
   */
  private calculatePartialScore(validResults: any[]): { score: number, breakdown: any } {
    if (validResults.length === 0) {
      return { score: 25, breakdown: { emergency: true } }
    }

    // Simple weighted average of available scores
    const totalScore = validResults.reduce((sum, result) => sum + result.normalized_score, 0)
    const averageScore = totalScore / validResults.length

    // Apply conservative adjustment for missing data
    const dataCompletenessRatio = validResults.length / 12 // Assuming 12 total agents
    const adjustedScore = Math.round(averageScore * (0.7 + (dataCompletenessRatio * 0.3)))

    return {
      score: Math.max(15, Math.min(85, adjustedScore)), // Clamp between 15-85 for partial data
      breakdown: {
        rawAverage: averageScore,
        dataCompleteness: dataCompletenessRatio,
        adjustment: adjustedScore - averageScore,
        agentCount: validResults.length
      }
    }
  }

  /**
   * Calculate confidence based on data availability
   */
  private calculatePartialConfidence(validResults: any[], totalExpected: number): number {
    const dataRatio = validResults.length / Math.max(totalExpected, 12)
    const baseConfidence = Math.min(0.8, dataRatio)
    
    // Reduce confidence if we have very few results
    if (validResults.length < 3) {
      return Math.max(0.2, baseConfidence * 0.5)
    }
    
    return baseConfidence
  }

  /**
   * Convert agent results to the format expected by ADIOrchestrationResult
   */
  private convertToAgentResults(agentResults: any[]): Record<string, ADIAgentOutput> {
    const converted: Record<string, ADIAgentOutput> = {}
    
    agentResults.forEach(result => {
      if (result.result_type && result.evidence) {
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
            bulletproofAggregation: true
          }
        }
      }
    })
    
    return converted
  }

  /**
   * Get grade from score
   */
  private getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
}
