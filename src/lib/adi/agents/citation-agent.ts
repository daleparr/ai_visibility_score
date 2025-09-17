import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Citation Agent - Evaluates Citation Authority & Freshness
 * Analyzes external mentions, media coverage, and authority signals
 */
export class CitationAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'citation_agent',
      version: 'v1.0',
      description: 'Evaluates external citations, media mentions, and authority signals',
      dependencies: [], // Can run independently
      timeout: 30000, // 30 seconds
      retryLimit: 3,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Citation Agent for evaluation ${input.context.evaluationId}`)

      const { websiteUrl } = input.context
      const brandName = this.extractBrandName(websiteUrl)

      const results = []

      // 1. Media Mention Analysis
      const mediaMentionsResult = await this.analyzeMediaMentions(brandName)
      results.push(mediaMentionsResult)

      // 2. Authority Domain Analysis
      const authorityDomainsResult = await this.analyzeAuthorityDomains(brandName)
      results.push(authorityDomainsResult)

      // 3. Industry Publication Presence
      const industryPublicationsResult = await this.analyzeIndustryPublications(brandName)
      results.push(industryPublicationsResult)

      // 4. Academic/Research Citations
      const academicCitationsResult = await this.analyzeAcademicCitations(brandName)
      results.push(academicCitationsResult)

      // 5. Citation Freshness Analysis
      const freshnessResult = await this.analyzeCitationFreshness(brandName)
      results.push(freshnessResult)

      // 6. Citation Context Quality
      const contextQualityResult = await this.analyzeCitationContext(brandName)
      results.push(contextQualityResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        brandName,
        totalCitationSources: this.getCitationSources().length,
        analysisDepth: 'comprehensive'
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Citation Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  private async analyzeMediaMentions(brandName: string): Promise<any> {
    // Simulate media mention analysis
    const mediaSources = this.getMediaSources()
    let totalMentions = 0
    let tierOneMentions = 0
    let recentMentions = 0
    const mentionsBySource: Record<string, number> = {}

    for (const source of mediaSources) {
      try {
        const mentions = await this.searchMentions(brandName, source.domain)
        totalMentions += mentions.count
        mentionsBySource[source.name] = mentions.count

        if (source.tier === 1) {
          tierOneMentions += mentions.count
        }

        if (mentions.recentCount) {
          recentMentions += mentions.recentCount
        }
      } catch (error) {
        console.warn(`Failed to analyze mentions for ${source.name}`)
      }
    }

    const tierOneRatio = totalMentions > 0 ? (tierOneMentions / totalMentions) * 100 : 0
    const recentnessRatio = totalMentions > 0 ? (recentMentions / totalMentions) * 100 : 0
    
    // Calculate weighted score based on mention quality and recency
    const qualityScore = (tierOneRatio * 0.7) + (recentnessRatio * 0.3)
    const volumeScore = Math.min(100, totalMentions * 2) // Cap at 50 mentions = 100 points
    const overallScore = (qualityScore * 0.6) + (volumeScore * 0.4)

    const confidence = this.calculateConfidence(
      mediaSources.length,
      totalMentions > 0 ? 0.8 : 0.3,
      overallScore / 100
    )

    return this.createResult(
      'media_mentions',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 10, 95),
      confidence,
      {
        totalMentions,
        tierOneMentions,
        recentMentions,
        tierOneRatio,
        recentnessRatio,
        mentionsBySource,
        mediaSources: mediaSources.length
      }
    )
  }

  private async analyzeAuthorityDomains(brandName: string): Promise<any> {
    const authorityDomains = this.getAuthorityDomains()
    let authorityScore = 0
    let totalDomains = 0
    const domainResults: Record<string, any> = {}

    for (const domain of authorityDomains) {
      try {
        const presence = await this.checkDomainPresence(brandName, domain)
        totalDomains++

        if (presence.found) {
          const domainScore = domain.authorityScore * presence.relevanceScore
          authorityScore += domainScore
          
          domainResults[domain.name] = {
            found: true,
            relevanceScore: presence.relevanceScore,
            domainScore,
            authorityLevel: domain.authorityScore
          }
        } else {
          domainResults[domain.name] = {
            found: false,
            relevanceScore: 0,
            domainScore: 0,
            authorityLevel: domain.authorityScore
          }
        }
      } catch (error) {
        console.warn(`Failed to check authority domain ${domain.name}`)
      }
    }

    const avgAuthorityScore = totalDomains > 0 ? authorityScore / totalDomains : 0
    const confidence = this.calculateConfidence(totalDomains, 0.7, avgAuthorityScore / 100)

    return this.createResult(
      'authority_domains',
      avgAuthorityScore,
      this.normalizeScore(avgAuthorityScore, 0, 100, 5, 90),
      confidence,
      {
        totalDomains,
        authorityScore,
        avgAuthorityScore,
        domainResults
      }
    )
  }

  private async analyzeIndustryPublications(brandName: string): Promise<any> {
    const industryPubs = this.getIndustryPublications()
    let publicationScore = 0
    let totalPublications = 0
    const publicationResults: Record<string, any> = {}

    for (const publication of industryPubs) {
      try {
        const coverage = await this.checkPublicationCoverage(brandName, publication)
        totalPublications++

        if (coverage.found) {
          const pubScore = publication.relevanceScore * coverage.qualityScore
          publicationScore += pubScore
          
          publicationResults[publication.name] = {
            found: true,
            articleCount: coverage.articleCount,
            qualityScore: coverage.qualityScore,
            publicationScore: pubScore
          }
        } else {
          publicationResults[publication.name] = {
            found: false,
            articleCount: 0,
            qualityScore: 0,
            publicationScore: 0
          }
        }
      } catch (error) {
        console.warn(`Failed to check industry publication ${publication.name}`)
      }
    }

    const avgPublicationScore = totalPublications > 0 ? publicationScore / totalPublications : 0
    const confidence = this.calculateConfidence(totalPublications, 0.8, avgPublicationScore / 100)

    return this.createResult(
      'industry_publications',
      avgPublicationScore,
      this.normalizeScore(avgPublicationScore, 0, 100, 15, 85),
      confidence,
      {
        totalPublications,
        publicationScore,
        avgPublicationScore,
        publicationResults
      }
    )
  }

  private async analyzeAcademicCitations(brandName: string): Promise<any> {
    // Simulate academic citation analysis
    const academicSources = ['Google Scholar', 'ResearchGate', 'Academia.edu']
    let totalCitations = 0
    let recentCitations = 0
    const citationResults: Record<string, any> = {}

    for (const source of academicSources) {
      try {
        const citations = await this.searchAcademicCitations(brandName, source)
        totalCitations += citations.count
        recentCitations += citations.recentCount

        citationResults[source] = {
          totalCitations: citations.count,
          recentCitations: citations.recentCount,
          averageQuality: citations.averageQuality
        }
      } catch (error) {
        console.warn(`Failed to analyze academic citations from ${source}`)
      }
    }

    // Academic citations are valuable but not expected for all brands
    const citationScore = Math.min(100, totalCitations * 10) // 10 citations = 100 points
    const recencyBonus = recentCitations > 0 ? 20 : 0
    const overallScore = Math.min(100, citationScore + recencyBonus)

    const confidence = totalCitations > 0 ? 0.9 : 0.5 // High confidence if citations found

    return this.createResult(
      'academic_citations',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 0, 100),
      confidence,
      {
        totalCitations,
        recentCitations,
        citationScore,
        recencyBonus,
        citationResults
      }
    )
  }

  private async analyzeCitationFreshness(brandName: string): Promise<any> {
    const timeWindows = [
      { name: '30_days', weight: 0.4 },
      { name: '90_days', weight: 0.3 },
      { name: '180_days', weight: 0.2 },
      { name: '365_days', weight: 0.1 }
    ]

    let freshnessScore = 0
    const freshnessResults: Record<string, number> = {}

    for (const window of timeWindows) {
      try {
        const mentions = await this.getCitationsInTimeWindow(brandName, window.name)
        const windowScore = Math.min(100, mentions * 5) // 20 mentions = 100 points
        freshnessScore += windowScore * window.weight
        freshnessResults[window.name] = mentions
      } catch (error) {
        console.warn(`Failed to analyze freshness for ${window.name}`)
        freshnessResults[window.name] = 0
      }
    }

    const confidence = this.calculateConfidence(
      timeWindows.length,
      0.8,
      freshnessScore / 100
    )

    return this.createResult(
      'citation_freshness',
      freshnessScore,
      this.normalizeScore(freshnessScore, 0, 100, 20, 95),
      confidence,
      {
        freshnessScore,
        freshnessResults,
        timeWindows: timeWindows.map(w => w.name)
      }
    )
  }

  private async analyzeCitationContext(brandName: string): Promise<any> {
    // Analyze the context and sentiment of citations
    const contextTypes = ['positive', 'neutral', 'negative', 'promotional']
    let contextScore = 0
    let totalAnalyzed = 0
    const contextResults: Record<string, number> = {}

    try {
      const recentCitations = await this.getRecentCitations(brandName, 50) // Analyze last 50 citations
      
      for (const citation of recentCitations) {
        const context = this.analyzeCitationContextType(citation.content)
        contextResults[context] = (contextResults[context] || 0) + 1
        totalAnalyzed++

        // Score based on context type
        switch (context) {
          case 'positive': contextScore += 100; break
          case 'neutral': contextScore += 70; break
          case 'promotional': contextScore += 50; break
          case 'negative': contextScore += 10; break
        }
      }

      const avgContextScore = totalAnalyzed > 0 ? contextScore / totalAnalyzed : 50
      const confidence = this.calculateConfidence(totalAnalyzed, 0.7, avgContextScore / 100)

      return this.createResult(
        'citation_context',
        avgContextScore,
        this.normalizeScore(avgContextScore, 0, 100, 30, 95),
        confidence,
        {
          totalAnalyzed,
          avgContextScore,
          contextResults,
          contextDistribution: this.calculateContextDistribution(contextResults, totalAnalyzed)
        }
      )
    } catch (error) {
      console.warn('Failed to analyze citation context')
      return this.createResult(
        'citation_context',
        50,
        50,
        0.3,
        { error: 'Context analysis failed' }
      )
    }
  }

  // Helper methods
  private extractBrandName(websiteUrl: string): string {
    try {
      const url = new URL(websiteUrl)
      const domain = url.hostname.replace('www.', '')
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    } catch {
      return 'Brand'
    }
  }

  private getMediaSources() {
    return [
      { name: 'TechCrunch', domain: 'techcrunch.com', tier: 1, authorityScore: 95 },
      { name: 'Forbes', domain: 'forbes.com', tier: 1, authorityScore: 90 },
      { name: 'Wall Street Journal', domain: 'wsj.com', tier: 1, authorityScore: 95 },
      { name: 'Reuters', domain: 'reuters.com', tier: 1, authorityScore: 90 },
      { name: 'Business Insider', domain: 'businessinsider.com', tier: 2, authorityScore: 80 },
      { name: 'Mashable', domain: 'mashable.com', tier: 2, authorityScore: 75 }
    ]
  }

  private getAuthorityDomains() {
    return [
      { name: 'Wikipedia', domain: 'wikipedia.org', authorityScore: 95 },
      { name: 'Crunchbase', domain: 'crunchbase.com', authorityScore: 85 },
      { name: 'LinkedIn', domain: 'linkedin.com', authorityScore: 80 },
      { name: 'Bloomberg', domain: 'bloomberg.com', authorityScore: 90 }
    ]
  }

  private getIndustryPublications() {
    return [
      { name: 'Vogue Business', domain: 'voguebusiness.com', relevanceScore: 90 },
      { name: 'WWD', domain: 'wwd.com', relevanceScore: 85 },
      { name: 'Fashionista', domain: 'fashionista.com', relevanceScore: 80 },
      { name: 'Business of Fashion', domain: 'businessoffashion.com', relevanceScore: 95 }
    ]
  }

  private getCitationSources() {
    return [...this.getMediaSources(), ...this.getAuthorityDomains(), ...this.getIndustryPublications()]
  }

  // Simulation methods (in production, these would use real APIs)
  private async searchMentions(brandName: string, domain: string) {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    
    const baseCount = Math.floor(Math.random() * 20)
    return {
      count: baseCount,
      recentCount: Math.floor(baseCount * 0.3),
      domain
    }
  }

  private async checkDomainPresence(brandName: string, domain: any) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      found: Math.random() > 0.6, // 40% chance of presence
      relevanceScore: Math.random() * 100
    }
  }

  private async checkPublicationCoverage(brandName: string, publication: any) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const found = Math.random() > 0.7 // 30% chance of coverage
    return {
      found,
      articleCount: found ? Math.floor(Math.random() * 10) + 1 : 0,
      qualityScore: found ? Math.random() * 100 : 0
    }
  }

  private async searchAcademicCitations(brandName: string, source: string) {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const count = Math.floor(Math.random() * 5) // 0-4 citations
    return {
      count,
      recentCount: Math.floor(count * 0.4),
      averageQuality: Math.random() * 100
    }
  }

  private async getCitationsInTimeWindow(brandName: string, window: string) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const multipliers = { '30_days': 0.3, '90_days': 0.6, '180_days': 0.8, '365_days': 1.0 }
    const multiplier = multipliers[window as keyof typeof multipliers] || 1.0
    
    return Math.floor(Math.random() * 20 * multiplier)
  }

  private async getRecentCitations(brandName: string, limit: number) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const citations = []
    for (let i = 0; i < Math.min(limit, 20); i++) {
      citations.push({
        content: `Sample citation content about ${brandName} in context ${i}`,
        source: `Source ${i}`,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    return citations
  }

  private analyzeCitationContextType(content: string): string {
    const positiveWords = ['excellent', 'innovative', 'leading', 'successful', 'award']
    const negativeWords = ['controversy', 'lawsuit', 'decline', 'criticism', 'problem']
    const promotionalWords = ['launch', 'announce', 'release', 'partnership', 'expansion']
    
    const lowerContent = content.toLowerCase()
    
    if (positiveWords.some(word => lowerContent.includes(word))) return 'positive'
    if (negativeWords.some(word => lowerContent.includes(word))) return 'negative'
    if (promotionalWords.some(word => lowerContent.includes(word))) return 'promotional'
    
    return 'neutral'
  }

  private calculateContextDistribution(contextResults: Record<string, number>, total: number) {
    const distribution: Record<string, number> = {}
    
    for (const [context, count] of Object.entries(contextResults)) {
      distribution[context] = total > 0 ? Math.round((count / total) * 100) : 0
    }
    
    return distribution
  }
}