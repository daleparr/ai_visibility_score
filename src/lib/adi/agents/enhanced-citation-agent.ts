import { BaseADIAgent } from './base-agent'
import { perplexityClient } from '@/lib/perplexity-client'
import { TIER_FEATURES } from '@/lib/tier-based-models'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

export class EnhancedCitationAgent extends BaseADIAgent {
  constructor() {
    super({
      name: 'enhanced_citation_agent',
      description: 'Citation analysis with real-time web search for Pro+ tiers',
      version: '1.0.0',
      dependencies: ['crawl_agent'],
      timeout: 30000, // 30 seconds
      retryLimit: 2,
      parallelizable: true
    })
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const { context } = input
    const { websiteUrl } = context
    const userTier = context.metadata?.tier || 'free'
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
        return baseResults // Fallback to base results
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
    
    if (perplexityData.currentMentions?.length > 100) enhancementBoost += 10
    if (perplexityData.reputationSignals?.includes('positive')) enhancementBoost += 5
    
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
