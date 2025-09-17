import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Brand Heritage Agent - Evaluates brand story, values, and heritage narrative
 * Separated from reputation signals to provide specific brand storytelling guidance
 */
export class BrandHeritageAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'brand_heritage_agent',
      version: 'v1.0',
      description: 'Analyzes brand heritage, storytelling, values, and founder narrative for AI optimization',
      dependencies: ['crawl_agent'],
      timeout: 25000, // 25 seconds for comprehensive heritage analysis
      retryLimit: 2,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Brand Heritage Agent for evaluation ${input.context.evaluationId}`)

      const { websiteUrl } = input.context
      const crawlResults = this.extractCrawlResults(input.previousResults || [])
      
      if (!crawlResults || crawlResults.length === 0) {
        return this.createOutput('skipped', [], 0, 'No crawl results available for heritage analysis')
      }

      const results = []

      // 1. Brand Story Analysis
      const brandStoryResult = await this.analyzeBrandStory(crawlResults, websiteUrl)
      results.push(brandStoryResult)

      // 2. Founder & Leadership Narrative
      const founderStoryResult = await this.analyzeFounderStory(crawlResults, websiteUrl)
      results.push(founderStoryResult)

      // 3. Brand Values & Mission Analysis
      const valuesResult = await this.analyzeBrandValues(crawlResults, websiteUrl)
      results.push(valuesResult)

      // 4. Heritage Timeline & Milestones
      const heritageTimelineResult = await this.analyzeHeritageTimeline(crawlResults, websiteUrl)
      results.push(heritageTimelineResult)

      // 5. Brand Differentiation Story
      const differentiationResult = await this.analyzeBrandDifferentiation(crawlResults, websiteUrl)
      results.push(differentiationResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        websiteUrl,
        totalAnalysisAreas: results.length,
        heritageElementsFound: results.filter(r => r.normalizedScore > 50).length
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Brand Heritage Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown heritage analysis error'
      )
    }
  }

  private extractCrawlResults(previousResults: any[]): any[] {
    return previousResults.filter(result => 
      result.result_type?.includes('crawl') || 
      result.result_type?.includes('page')
    )
  }

  private async analyzeBrandStory(crawlResults: any[], websiteUrl: string): Promise<any> {
    const brandStoryIndicators = [
      'about us', 'our story', 'history', 'founded', 'started', 'began',
      'journey', 'mission', 'vision', 'why we', 'our purpose'
    ]

    let storyScore = 0
    let storyElements: string[] = []
    let confidence = 0.7

    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.toLowerCase()

      // Check for story indicators
      const foundIndicators = brandStoryIndicators.filter(indicator => 
        textContent.includes(indicator)
      )
      
      if (foundIndicators.length > 0) {
        storyElements.push(...foundIndicators)
        storyScore += foundIndicators.length * 10
      }

      // Check for narrative elements
      if (this.hasNarrativeElements(textContent)) {
        storyScore += 20
        confidence = 0.85
      }

      // Check for emotional connection words
      if (this.hasEmotionalConnection(textContent)) {
        storyScore += 15
        confidence = 0.9
      }
    }

    // Normalize score
    const normalizedScore = Math.min(100, storyScore)

    return this.createResult(
      'brand_story_analysis',
      storyScore,
      normalizedScore,
      confidence,
      {
        storyElements: [...new Set(storyElements)],
        hasNarrative: normalizedScore > 40,
        hasEmotionalConnection: normalizedScore > 60,
        recommendations: this.generateStoryRecommendations(normalizedScore)
      }
    )
  }

  private async analyzeFounderStory(crawlResults: any[], websiteUrl: string): Promise<any> {
    const founderIndicators = [
      'founder', 'ceo', 'started by', 'founded by', 'created by',
      'leadership', 'team', 'our founder', 'meet the', 'leadership team'
    ]

    let founderScore = 0
    let founderElements: string[] = []
    let confidence = 0.6

    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.toLowerCase()

      // Check for founder mentions
      const foundIndicators = founderIndicators.filter(indicator => 
        textContent.includes(indicator)
      )
      
      if (foundIndicators.length > 0) {
        founderElements.push(...foundIndicators)
        founderScore += foundIndicators.length * 15
        confidence = 0.8
      }

      // Check for personal story elements
      if (this.hasPersonalStoryElements(textContent)) {
        founderScore += 25
        confidence = 0.9
      }
    }

    const normalizedScore = Math.min(100, founderScore)

    return this.createResult(
      'founder_story_analysis',
      founderScore,
      normalizedScore,
      confidence,
      {
        founderElements: [...new Set(founderElements)],
        hasFounderStory: normalizedScore > 30,
        hasPersonalNarrative: normalizedScore > 60,
        recommendations: this.generateFounderRecommendations(normalizedScore)
      }
    )
  }

  private async analyzeBrandValues(crawlResults: any[], websiteUrl: string): Promise<any> {
    const valueIndicators = [
      'values', 'mission', 'vision', 'purpose', 'believe', 'commitment',
      'sustainability', 'quality', 'innovation', 'customer', 'community'
    ]

    let valuesScore = 0
    let valueElements: string[] = []
    let confidence = 0.7

    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.toLowerCase()

      // Check for value statements
      const foundIndicators = valueIndicators.filter(indicator => 
        textContent.includes(indicator)
      )
      
      if (foundIndicators.length > 0) {
        valueElements.push(...foundIndicators)
        valuesScore += foundIndicators.length * 8
      }

      // Check for specific value articulation
      if (this.hasValueArticulation(textContent)) {
        valuesScore += 30
        confidence = 0.9
      }
    }

    const normalizedScore = Math.min(100, valuesScore)

    return this.createResult(
      'brand_values_analysis',
      valuesScore,
      normalizedScore,
      confidence,
      {
        valueElements: [...new Set(valueElements)],
        hasValueStatement: normalizedScore > 40,
        hasDetailedValues: normalizedScore > 70,
        recommendations: this.generateValuesRecommendations(normalizedScore)
      }
    )
  }

  private async analyzeHeritageTimeline(crawlResults: any[], websiteUrl: string): Promise<any> {
    const timelineIndicators = [
      'founded', 'established', 'since', 'history', 'timeline', 'milestones',
      'years', 'decades', 'anniversary', 'heritage', 'tradition'
    ]

    let timelineScore = 0
    let timelineElements: string[] = []
    let confidence = 0.6

    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.toLowerCase()

      // Check for timeline indicators
      const foundIndicators = timelineIndicators.filter(indicator => 
        textContent.includes(indicator)
      )
      
      if (foundIndicators.length > 0) {
        timelineElements.push(...foundIndicators)
        timelineScore += foundIndicators.length * 12
      }

      // Check for specific dates or years
      if (this.hasTimelineElements(textContent)) {
        timelineScore += 25
        confidence = 0.8
      }
    }

    const normalizedScore = Math.min(100, timelineScore)

    return this.createResult(
      'heritage_timeline_analysis',
      timelineScore,
      normalizedScore,
      confidence,
      {
        timelineElements: [...new Set(timelineElements)],
        hasTimeline: normalizedScore > 30,
        hasDetailedHistory: normalizedScore > 60,
        recommendations: this.generateTimelineRecommendations(normalizedScore)
      }
    )
  }

  private async analyzeBrandDifferentiation(crawlResults: any[], websiteUrl: string): Promise<any> {
    const differentiationIndicators = [
      'unique', 'different', 'unlike', 'only', 'first', 'exclusive',
      'proprietary', 'patented', 'award', 'recognized', 'leader'
    ]

    let differentiationScore = 0
    let differentiationElements: string[] = []
    let confidence = 0.7

    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.toLowerCase()

      // Check for differentiation claims
      const foundIndicators = differentiationIndicators.filter(indicator => 
        textContent.includes(indicator)
      )
      
      if (foundIndicators.length > 0) {
        differentiationElements.push(...foundIndicators)
        differentiationScore += foundIndicators.length * 10
      }

      // Check for competitive positioning
      if (this.hasCompetitivePositioning(textContent)) {
        differentiationScore += 20
        confidence = 0.85
      }
    }

    const normalizedScore = Math.min(100, differentiationScore)

    return this.createResult(
      'brand_differentiation_analysis',
      differentiationScore,
      normalizedScore,
      confidence,
      {
        differentiationElements: [...new Set(differentiationElements)],
        hasDifferentiation: normalizedScore > 40,
        hasStrongPositioning: normalizedScore > 70,
        recommendations: this.generateDifferentiationRecommendations(normalizedScore)
      }
    )
  }

  // Helper methods for content analysis
  private hasNarrativeElements(content: string): boolean {
    const narrativeWords = ['story', 'journey', 'began', 'started', 'grew', 'evolved', 'became']
    return narrativeWords.some(word => content.includes(word))
  }

  private hasEmotionalConnection(content: string): boolean {
    const emotionalWords = ['passion', 'love', 'care', 'believe', 'dream', 'inspire', 'dedicated']
    return emotionalWords.some(word => content.includes(word))
  }

  private hasPersonalStoryElements(content: string): boolean {
    const personalWords = ['i', 'my', 'personal', 'experience', 'background', 'journey']
    return personalWords.some(word => content.includes(word))
  }

  private hasValueArticulation(content: string): boolean {
    const valueWords = ['we believe', 'our mission', 'committed to', 'dedicated to', 'stands for']
    return valueWords.some(phrase => content.includes(phrase))
  }

  private hasTimelineElements(content: string): boolean {
    // Check for years (1900-2024)
    const yearPattern = /\b(19|20)\d{2}\b/
    return yearPattern.test(content)
  }

  private hasCompetitivePositioning(content: string): boolean {
    const positioningWords = ['leading', 'pioneer', 'innovator', 'first to', 'only company']
    return positioningWords.some(phrase => content.includes(phrase))
  }

  // Recommendation generators
  private generateStoryRecommendations(score: number): string[] {
    if (score < 30) {
      return [
        'Create a dedicated "Our Story" page with brand narrative',
        'Develop founder story content for About Us section',
        'Add timeline of key brand milestones',
        'Include emotional connection points in brand messaging'
      ]
    } else if (score < 70) {
      return [
        'Enhance existing story with more emotional elements',
        'Add customer impact stories to brand narrative',
        'Expand on brand mission and purpose',
        'Include visual storytelling elements'
      ]
    } else {
      return [
        'Optimize story content for AI readability',
        'Create story-driven FAQ content',
        'Develop brand story for different audiences',
        'Maintain story consistency across all pages'
      ]
    }
  }

  private generateFounderRecommendations(score: number): string[] {
    if (score < 30) {
      return [
        'Add founder biography to About Us page',
        'Include founder photo and personal story',
        'Explain founder motivation and vision',
        'Connect founder story to brand values'
      ]
    } else if (score < 70) {
      return [
        'Expand founder story with more personal details',
        'Add founder quotes and philosophy',
        'Include founder involvement in current operations',
        'Create founder-focused content pieces'
      ]
    } else {
      return [
        'Optimize founder content for search queries',
        'Create founder-led content and insights',
        'Maintain authentic founder voice',
        'Leverage founder story for brand differentiation'
      ]
    }
  }

  private generateValuesRecommendations(score: number): string[] {
    if (score < 40) {
      return [
        'Create clear brand values statement',
        'Develop mission and vision content',
        'Explain brand purpose and beliefs',
        'Connect values to customer benefits'
      ]
    } else if (score < 70) {
      return [
        'Expand on each core value with examples',
        'Show values in action through stories',
        'Connect values to product development',
        'Include values in customer communications'
      ]
    } else {
      return [
        'Optimize values content for AI understanding',
        'Create values-driven FAQ content',
        'Maintain values consistency across touchpoints',
        'Use values for competitive differentiation'
      ]
    }
  }

  private generateTimelineRecommendations(score: number): string[] {
    if (score < 30) {
      return [
        'Create brand timeline with key milestones',
        'Add founding date and early history',
        'Include major achievements and awards',
        'Document growth and evolution story'
      ]
    } else if (score < 60) {
      return [
        'Expand timeline with more detailed milestones',
        'Add context and significance to each milestone',
        'Include customer and market impact',
        'Create visual timeline representation'
      ]
    } else {
      return [
        'Optimize timeline for AI comprehension',
        'Create milestone-based FAQ content',
        'Maintain timeline accuracy and updates',
        'Use heritage for brand authority building'
      ]
    }
  }

  private generateDifferentiationRecommendations(score: number): string[] {
    if (score < 40) {
      return [
        'Clearly articulate unique value proposition',
        'Identify and highlight key differentiators',
        'Explain competitive advantages',
        'Document proprietary features or processes'
      ]
    } else if (score < 70) {
      return [
        'Strengthen differentiation messaging',
        'Provide evidence for differentiation claims',
        'Compare advantages to alternatives',
        'Create differentiation-focused content'
      ]
    } else {
      return [
        'Optimize differentiation for AI queries',
        'Create comparison-focused FAQ content',
        'Maintain competitive positioning accuracy',
        'Leverage differentiation for market leadership'
      ]
    }
  }
}