import { BaseADIAgent } from './base-agent'
import { perplexityClient } from '@/lib/perplexity-client'
import { TIER_FEATURES, type UserTier } from '@/lib/tier-based-models'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

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
        
        return this.createOutput('completed', {
          ...baseResults.data,
          perplexityEnhancement: {
            currentMentions: perplexityData.currentMentions,
            competitorAnalysis: perplexityData.competitorAnalysis,
            enhancedScore: this.calculateEnhancedScore(baseResults.data, perplexityData)
          }
        })
      } catch (error) {
        console.error(`❌ [${this.config.name}] Perplexity enhancement failed:`, error)
        return baseResults
      }
    }
    
    return baseResults
  }

  private async executeBaseCitationAnalysis(input: ADIAgentInput): Promise<ADIAgentOutput> {
    // Your existing citation agent logic here
    return this.createOutput('completed', {
      score: 65,
      citations: [],
      analysis: 'Basic citation analysis'
    })
  }

  private calculateEnhancedScore(baseResults: any, perplexityData: any): number {
    // Boost score based on real-time mentions and reputation
    let enhancementBoost = 0
    
    // Check if mentions content is substantial (string length, not array length)
    if (perplexityData.currentMentions && perplexityData.currentMentions.length > 500) {
      enhancementBoost += 10
    }
    
    // Check for positive sentiment in reputation signals
    if (perplexityData.reputationSignals && perplexityData.reputationSignals.toLowerCase().includes('positive')) {
      enhancementBoost += 5
    }
    
    return Math.min(100, (baseResults.score || 0) + enhancementBoost)
  }

  private extractBrandName(websiteUrl: string): string {
    try {
      const domain = new URL(websiteUrl).hostname.replace('www.', '')
      return domain.split('.')[0]
    } catch {
      return 'unknown'
    }
  }
}
