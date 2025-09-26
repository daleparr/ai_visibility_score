import { BaseADIAgent } from './base-agent'
import { perplexityClient } from '@/lib/perplexity-client'
import { TIER_FEATURES, type UserTier } from '@/lib/tier-based-models'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'
import { safeHostname } from '@/lib/url'

export class EnhancedCitationAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'enhanced_citation_agent',
      description: 'Citation analysis with real-time web search for Pro+ tiers',
      version: '1.0.0',
      dependencies: ['crawl_agent'],
      timeout: 30000,
      retryLimit: 2,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const { context } = input
    const { websiteUrl } = context
    
    // Type the userTier properly
    const userTier: UserTier = (context.metadata?.tier as UserTier) || 'free'
    const brandName = this.extractBrandName(websiteUrl)
    
    // Run base citation analysis
    const baseResults = await this.executeBaseCitationAnalysis(input)
    
    // Enhance with Perplexity for Pro+ tiers
    if (TIER_FEATURES[userTier]?.perplexityIntegration) {
      console.log(`✨ [${this.config.name}] Enhancing with Perplexity for ${userTier} tier`)
      
      try {
        const perplexityData = await perplexityClient.enhanceBrandAnalysis(brandName, websiteUrl)
        
        // Create enhanced results by combining base results with Perplexity data
        const enhancedResults = [
          ...baseResults.results,
          {
            resultType: 'perplexity_enhancement',
            rawValue: this.calculateEnhancedScore(baseResults.results, perplexityData),
            normalizedScore: this.calculateEnhancedScore(baseResults.results, perplexityData),
            confidenceLevel: 0.8,
            evidence: {
              currentMentions: perplexityData.currentMentions,
              competitorAnalysis: perplexityData.competitorAnalysis,
              marketTrends: perplexityData.marketTrends,
              reputationSignals: perplexityData.reputationSignals
            }
          }
        ]
        
        return this.createOutput('completed', enhancedResults, baseResults.executionTime, undefined, {
          ...baseResults.metadata,
          perplexityEnhanced: true,
          tier: userTier
        })
      } catch (error) {
        console.error(`❌ [${this.config.name}] Perplexity enhancement failed:`, error)
        return baseResults // Fallback to base results
      }
    }
    
    return baseResults
  }

  private async executeBaseCitationAnalysis(input: ADIAgentInput): Promise<ADIAgentOutput> {
    // Your existing citation agent logic here
    return this.createOutput('completed', [
      {
        resultType: 'citation_analysis',
        rawValue: 65,
        normalizedScore: 65,
        confidenceLevel: 0.7,
        evidence: {
          score: 65,
          citations: [],
          analysis: 'Basic citation analysis'
        }
      }
    ])
  }

  private calculateEnhancedScore(baseResults: any[], perplexityData: any): number {
    // Get base score from results
    const baseScore = baseResults.length > 0 ? baseResults[0].normalizedScore || 65 : 65
    let enhancementBoost = 0
    
    // Check if mentions content is substantial (string length, not array length)
    if (perplexityData.currentMentions && perplexityData.currentMentions.length > 500) {
      enhancementBoost += 10
    }
    
    // Check for positive sentiment in reputation signals
    if (perplexityData.reputationSignals && perplexityData.reputationSignals.toLowerCase().includes('positive')) {
      enhancementBoost += 5
    }
    
    return Math.min(100, baseScore + enhancementBoost)
  }

  private extractBrandName(websiteUrl: string): string {
    try {
      const domain = safeHostname(websiteUrl)?.replace('www.', '') || 'unknown-domain'
      return domain.split('.')[0]
    } catch {
      return 'unknown'
    }
  }
}
