import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Semantic Agent - Analyzes vocabulary consistency and taxonomy alignment
 * Evaluates semantic clarity and ontology implementation
 */
export class SemanticAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'semantic_agent',
      version: 'v1.0',
      description: 'Analyzes vocabulary consistency, taxonomy alignment, and semantic clarity',
      dependencies: ['crawl_agent'],
      timeout: 12000, // 12 seconds (less than orchestrator's 15s)
      retryLimit: 1, // Reduced for speed
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Semantic Agent for evaluation ${input.context.evaluationId}`)

      // Get crawl artifacts
      const crawlResults = input.previousResults?.filter(
        result => result.result_type?.includes('crawl')
      ) || []

      if (crawlResults.length === 0) {
        console.log('⚠️ No HTML content available, using static fallback')
        return this.createSyntheticSemanticAnalysis(input.context.websiteUrl, input.context.metadata?.brandName)
      }

      const results = []

      // 1. Vocabulary Consistency Analysis
      const vocabularyResult = await this.analyzeVocabularyConsistency(crawlResults)
      results.push(vocabularyResult)

      // 2. Taxonomy Alignment Check
      const taxonomyResult = await this.analyzeTaxonomyAlignment(crawlResults)
      results.push(taxonomyResult)

      // 3. Semantic Disambiguation
      const disambiguationResult = await this.analyzeSemanticDisambiguation(crawlResults)
      results.push(disambiguationResult)

      // 4. Industry Ontology Alignment
      const ontologyResult = await this.analyzeOntologyAlignment(crawlResults, input.context.industryId)
      results.push(ontologyResult)

      // 5. Content Hierarchy Analysis
      const hierarchyResult = await this.analyzeContentHierarchy(crawlResults)
      results.push(hierarchyResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        totalPagesAnalyzed: crawlResults.length,
        vocabularyTermsExtracted: this.extractVocabularyTerms(crawlResults).length,
        semanticConcepts: this.extractSemanticConcepts(crawlResults).length
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Semantic Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown semantic analysis error'
      )
    }
  }

  private async analyzeVocabularyConsistency(crawlResults: any[]): Promise<any> {
    const vocabularyTerms = this.extractVocabularyTerms(crawlResults)
    const termFrequency = this.calculateTermFrequency(vocabularyTerms)
    
    // Analyze consistency across pages
    const consistencyMetrics = this.calculateVocabularyConsistency(crawlResults, termFrequency)
    
    // Score based on consistency and coverage
    const consistencyScore = (consistencyMetrics.consistency + consistencyMetrics.coverage) / 2
    
    return this.createResult(
      'vocabulary_consistency',
      consistencyScore,
      this.normalizeScore(consistencyScore, 0, 100, 20, 95),
      0.85,
      {
        totalTerms: vocabularyTerms.length,
        uniqueTerms: Object.keys(termFrequency).length,
        consistencyMetrics,
        topTerms: Object.entries(termFrequency)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 20)
      }
    )
  }

  private async analyzeTaxonomyAlignment(crawlResults: any[]): Promise<any> {
    const taxonomyElements = this.extractTaxonomyElements(crawlResults)
    const alignmentScore = this.calculateTaxonomyAlignment(taxonomyElements)
    
    return this.createResult(
      'taxonomy_alignment',
      alignmentScore.score,
      this.normalizeScore(alignmentScore.score, 0, 100, 10, 90),
      alignmentScore.confidence,
      {
        taxonomyElements: taxonomyElements.length,
        alignmentDetails: alignmentScore.details,
        standardsFound: alignmentScore.standardsFound,
        hierarchyDepth: alignmentScore.hierarchyDepth
      }
    )
  }

  private async analyzeSemanticDisambiguation(crawlResults: any[]): Promise<any> {
    const ambiguousTerms = this.findAmbiguousTerms(crawlResults)
    const disambiguationScore = this.calculateDisambiguationScore(ambiguousTerms, crawlResults)
    
    return this.createResult(
      'semantic_disambiguation',
      disambiguationScore.score,
      this.normalizeScore(disambiguationScore.score, 0, 100, 30, 95),
      disambiguationScore.confidence,
      {
        ambiguousTermsFound: ambiguousTerms.length,
        disambiguationStrategies: disambiguationScore.strategies,
        clarityMetrics: disambiguationScore.clarityMetrics
      }
    )
  }

  private async analyzeOntologyAlignment(crawlResults: any[], industryId?: string): Promise<any> {
    const ontologyElements = this.extractOntologyElements(crawlResults)
    const industryAlignment = this.calculateIndustryOntologyAlignment(ontologyElements, industryId)
    
    return this.createResult(
      'ontology_alignment',
      industryAlignment.score,
      this.normalizeScore(industryAlignment.score, 0, 100, 15, 90),
      industryAlignment.confidence,
      {
        ontologyElementsFound: ontologyElements.length,
        industryAlignment: industryAlignment.details,
        standardOntologies: industryAlignment.standardOntologies,
        customOntologies: industryAlignment.customOntologies
      }
    )
  }

  private async analyzeContentHierarchy(crawlResults: any[]): Promise<any> {
    const hierarchyMetrics = this.calculateContentHierarchy(crawlResults)
    
    return this.createResult(
      'content_hierarchy',
      hierarchyMetrics.score,
      this.normalizeScore(hierarchyMetrics.score, 0, 100, 25, 95),
      hierarchyMetrics.confidence,
      {
        hierarchyDepth: hierarchyMetrics.depth,
        logicalStructure: hierarchyMetrics.logicalStructure,
        navigationConsistency: hierarchyMetrics.navigationConsistency,
        crossLinking: hierarchyMetrics.crossLinking
      }
    )
  }

  private extractVocabularyTerms(crawlResults: any[]): string[] {
    const terms: string[] = []
    
    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const textContent = content.replace(/<[^>]+>/g, ' ')
                                .replace(/\s+/g, ' ')
                                .toLowerCase()
      
      // Extract meaningful terms (2+ chars, not common words)
      const words = textContent.match(/\b[a-z]{2,}\b/g) || []
      const meaningfulWords = words.filter((word: string) =>
        !this.isCommonWord(word) && word.length > 2
      )
      
      terms.push(...meaningfulWords)
    }
    
    return terms
  }

  private calculateTermFrequency(terms: string[]): Record<string, number> {
    const frequency: Record<string, number> = {}
    
    for (const term of terms) {
      frequency[term] = (frequency[term] || 0) + 1
    }
    
    return frequency
  }

  private calculateVocabularyConsistency(crawlResults: any[], termFrequency: Record<string, number>): {
    consistency: number
    coverage: number
  } {
    const totalTerms = Object.values(termFrequency).reduce((sum, freq) => sum + freq, 0)
    const uniqueTerms = Object.keys(termFrequency).length
    
    // Consistency: how often key terms appear across pages
    const keyTerms = Object.entries(termFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 20)
      .map(([term]) => term)
    
    let consistencyScore = 0
    for (const result of crawlResults) {
      const content = (result.evidence?.content || '').toLowerCase()
      const termsFound = keyTerms.filter(term => content.includes(term)).length
      consistencyScore += (termsFound / keyTerms.length) * 100
    }
    
    const avgConsistency = crawlResults.length > 0 ? consistencyScore / crawlResults.length : 0
    
    // Coverage: vocabulary richness
    const coverageScore = Math.min(100, (uniqueTerms / Math.max(totalTerms * 0.1, 50)) * 100)
    
    return {
      consistency: avgConsistency,
      coverage: coverageScore
    }
  }

  private extractTaxonomyElements(crawlResults: any[]): any[] {
    const taxonomyElements: any[] = []
    
    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      
      // Look for category hierarchies in navigation and breadcrumbs
      const navMatches = content.match(/<nav[^>]*>(.*?)<\/nav>/gis) || []
      const breadcrumbMatches = content.match(/breadcrumb|category|hierarchy/gi) || []
      
      // Extract structured data categories
      const structuredData = result.evidence?.structuredData || []
      
      // Ensure structuredData is an array before iterating
      const structuredDataArray = Array.isArray(structuredData) ? structuredData : []
      
      for (const data of structuredDataArray) {
        if (data.category || data.categories || data.productCategory) {
          taxonomyElements.push({
            type: 'structured_category',
            value: data.category || data.categories || data.productCategory,
            source: 'structured_data'
          })
        }
      }
      
      // Extract navigation hierarchies
      for (const nav of navMatches) {
        const navText = nav.replace(/<[^>]+>/g, ' ').trim()
        if (navText.length > 10) {
          taxonomyElements.push({
            type: 'navigation_hierarchy',
            value: navText,
            source: 'navigation'
          })
        }
      }
    }
    
    return taxonomyElements
  }

  private calculateTaxonomyAlignment(taxonomyElements: any[]): {
    score: number
    confidence: number
    details: any
    standardsFound: string[]
    hierarchyDepth: number
  } {
    const standardTaxonomies = ['schema.org', 'GoodRelations', 'UNSPSC', 'eCl@ss']
    const foundStandards: string[] = []
    
    // Check for standard taxonomy alignment
    for (const element of taxonomyElements) {
      const value = element.value.toString().toLowerCase()
      for (const standard of standardTaxonomies) {
        if (value.includes(standard.toLowerCase())) {
          foundStandards.push(standard)
        }
      }
    }
    
    // Calculate hierarchy depth
    const hierarchyDepth = Math.max(...taxonomyElements.map(el => 
      (el.value.toString().match(/[>\/\\|]/g) || []).length + 1
    ), 0)
    
    // Score based on standards found and hierarchy quality
    const standardsScore = (foundStandards.length / standardTaxonomies.length) * 60
    const hierarchyScore = Math.min(40, hierarchyDepth * 10)
    const totalScore = standardsScore + hierarchyScore
    
    return {
      score: Math.min(100, totalScore),
      confidence: taxonomyElements.length > 0 ? 0.8 : 0.3,
      details: {
        elementsAnalyzed: taxonomyElements.length,
        standardsAlignment: standardsScore,
        hierarchyQuality: hierarchyScore
      },
      standardsFound: [...new Set(foundStandards)],
      hierarchyDepth
    }
  }

  private findAmbiguousTerms(crawlResults: any[]): string[] {
    const ambiguousTerms: string[] = []
    const commonAmbiguousWords = [
      'quality', 'premium', 'best', 'top', 'leading', 'innovative', 
      'advanced', 'professional', 'expert', 'superior', 'excellent'
    ]
    
    for (const result of crawlResults) {
      const content = (result.evidence?.content || '').toLowerCase()
      
      for (const term of commonAmbiguousWords) {
        if (content.includes(term) && !ambiguousTerms.includes(term)) {
          ambiguousTerms.push(term)
        }
      }
    }
    
    return ambiguousTerms
  }

  private calculateDisambiguationScore(ambiguousTerms: string[], crawlResults: any[]): {
    score: number
    confidence: number
    strategies: string[]
    clarityMetrics: any
  } {
    const strategies: string[] = []
    let clarityScore = 100
    
    // Penalize for excessive ambiguous terms
    const ambiguityPenalty = Math.min(50, ambiguousTerms.length * 5)
    clarityScore -= ambiguityPenalty
    
    // Check for disambiguation strategies
    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      
      // Look for specific examples, use cases, or definitions
      if (/for example|such as|specifically|defined as/i.test(content)) {
        strategies.push('contextual_examples')
      }
      
      if (/use case|scenario|application/i.test(content)) {
        strategies.push('use_case_framing')
      }
      
      if (/compared to|versus|unlike|different from/i.test(content)) {
        strategies.push('comparative_clarity')
      }
    }
    
    // Bonus for disambiguation strategies
    const strategyBonus = Math.min(30, strategies.length * 10)
    clarityScore += strategyBonus
    
    return {
      score: Math.max(0, Math.min(100, clarityScore)),
      confidence: 0.75,
      strategies: [...new Set(strategies)],
      clarityMetrics: {
        ambiguousTermsCount: ambiguousTerms.length,
        ambiguityPenalty,
        strategyBonus,
        disambiguationStrategies: strategies.length
      }
    }
  }

  private extractOntologyElements(crawlResults: any[]): any[] {
    const ontologyElements: any[] = []
    
    for (const result of crawlResults) {
      const structuredData = result.evidence?.structuredData || []
      
      // Ensure structuredData is an array before iterating
      const structuredDataArray = Array.isArray(structuredData) ? structuredData : []
      
      for (const data of structuredDataArray) {
        // Look for ontology references
        if (data['@context']) {
          ontologyElements.push({
            type: 'context_reference',
            value: data['@context'],
            source: 'json_ld'
          })
        }
        
        if (data['@type']) {
          ontologyElements.push({
            type: 'type_definition',
            value: data['@type'],
            source: 'json_ld'
          })
        }
        
        // Look for property definitions
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith('@') || typeof value === 'object') continue
          
          ontologyElements.push({
            type: 'property_definition',
            property: key,
            value: value,
            source: 'structured_data'
          })
        }
      }
    }
    
    return ontologyElements
  }

  private calculateIndustryOntologyAlignment(ontologyElements: any[], industryId?: string): {
    score: number
    confidence: number
    details: any
    standardOntologies: string[]
    customOntologies: string[]
  } {
    const standardOntologies: string[] = []
    const customOntologies: string[] = []
    
    // Check for standard ontology references
    const standardOntologyPatterns = [
      'schema.org',
      'goodrelations',
      'foaf',
      'dublin core',
      'skos',
      'owl',
      'rdfs'
    ]
    
    for (const element of ontologyElements) {
      const value = element.value.toString().toLowerCase()
      
      for (const pattern of standardOntologyPatterns) {
        if (value.includes(pattern)) {
          standardOntologies.push(pattern)
        }
      }
      
      // Detect custom ontologies
      if (element.type === 'context_reference' && 
          !standardOntologyPatterns.some(p => value.includes(p))) {
        customOntologies.push(value)
      }
    }
    
    // Calculate alignment score
    const standardScore = Math.min(70, standardOntologies.length * 20)
    const customScore = Math.min(30, customOntologies.length * 15)
    const totalScore = standardScore + customScore
    
    return {
      score: Math.min(100, totalScore),
      confidence: ontologyElements.length > 0 ? 0.8 : 0.4,
      details: {
        standardOntologyScore: standardScore,
        customOntologyScore: customScore,
        totalElements: ontologyElements.length
      },
      standardOntologies: [...new Set(standardOntologies)],
      customOntologies: [...new Set(customOntologies)]
    }
  }

  private calculateContentHierarchy(crawlResults: any[]): {
    score: number
    confidence: number
    depth: number
    logicalStructure: boolean
    navigationConsistency: number
    crossLinking: number
  } {
    let totalDepth = 0
    let logicalStructureCount = 0
    let navigationConsistency = 0
    let crossLinkingScore = 0
    
    for (const result of crawlResults) {
      const content = result.evidence?.content || ''
      const headings = result.evidence?.contentSections?.headings || []
      
      // Calculate heading hierarchy depth
      const headingLevels = headings.map((h: any) => h.level)
      const depth = Math.max(...headingLevels, 0)
      totalDepth += depth
      
      // Check logical structure (h1 -> h2 -> h3, etc.)
      let isLogical = true
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] > headingLevels[i-1] + 1) {
          isLogical = false
          break
        }
      }
      if (isLogical) logicalStructureCount++
      
      // Check navigation consistency
      const navElements = content.match(/<nav[^>]*>.*?<\/nav>/gis) || []
      if (navElements.length > 0) {
        navigationConsistency += 100
      }
      
      // Check internal linking
      const internalLinks = content.match(/href=["'][^"']*["']/gi) || []
      const internalLinkCount = internalLinks.filter((link: string) =>
        !link.includes('http') || link.includes(new URL(result.evidence?.url || '').hostname)
      ).length
      
      crossLinkingScore += Math.min(100, internalLinkCount * 5)
    }
    
    const avgDepth = crawlResults.length > 0 ? totalDepth / crawlResults.length : 0
    const logicalStructureRatio = crawlResults.length > 0 ? (logicalStructureCount / crawlResults.length) * 100 : 0
    const avgNavigationConsistency = crawlResults.length > 0 ? navigationConsistency / crawlResults.length : 0
    const avgCrossLinking = crawlResults.length > 0 ? crossLinkingScore / crawlResults.length : 0
    
    const overallScore = (logicalStructureRatio * 0.4) + (avgNavigationConsistency * 0.3) + (avgCrossLinking * 0.3)
    
    return {
      score: Math.round(overallScore),
      confidence: 0.8,
      depth: Math.round(avgDepth),
      logicalStructure: logicalStructureRatio > 70,
      navigationConsistency: Math.round(avgNavigationConsistency),
      crossLinking: Math.round(avgCrossLinking)
    }
  }

  private extractSemanticConcepts(crawlResults: any[]): string[] {
    const concepts: Set<string> = new Set()
    
    for (const result of crawlResults) {
      const structuredData = result.evidence?.structuredData || []
      
      // Add safety check for structured data
      if (!Array.isArray(structuredData)) {
        console.warn('Semantic Agent: structuredData is not an array, skipping')
        continue
      }
      
      for (const data of structuredData) {
        // Extract semantic concepts from structured data
        if (data['@type']) {
          concepts.add(data['@type'])
        }
        
        if (data.category) {
          concepts.add(data.category)
        }
        
        if (data.keywords) {
          const keywords = Array.isArray(data.keywords) ? data.keywords : [data.keywords]
          keywords.forEach((keyword: string) => concepts.add(keyword))
        }
      }
    }
    
    return Array.from(concepts)
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'this', 'that', 'these', 'those', 'is', 'are', 'was',
      'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'our', 'we', 'you',
      'your', 'they', 'their', 'them', 'it', 'its', 'all', 'any', 'some', 'many',
      'much', 'more', 'most', 'other', 'another', 'such', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'here', 'there', 'now', 'then', 'today',
      'tomorrow', 'yesterday', 'very', 'really', 'quite', 'rather', 'too', 'also',
      'just', 'only', 'even', 'still', 'already', 'yet', 'again', 'back', 'away',
      'down', 'out', 'off', 'over', 'under', 'around', 'across', 'along', 'against'
    ])
    
    return commonWords.has(word)
  }

  /**
   * Create synthetic semantic analysis when no crawl data is available
   */
  private createSyntheticSemanticAnalysis(websiteUrl: string, brandName?: string): ADIAgentOutput {
    const domain = websiteUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    const brand = brandName || domain.split('.')[0]
    
    // Generate basic semantic scores based on domain and brand name
    const vocabularyScore = Math.min(80, 40 + (brand.length * 2)) // Longer brand names tend to be more descriptive
    const taxonomyScore = domain.includes('.com') ? 60 : domain.includes('.org') ? 70 : 50
    const disambiguationScore = brand.includes('-') || brand.includes('_') ? 45 : 55 // Hyphenated brands may need disambiguation
    const ontologyScore = this.inferIndustryFromDomain(domain) !== 'general_business' ? 65 : 40
    const hierarchyScore = 50 // Neutral assumption
    
    const results = [
      this.createResult('vocabulary_consistency', vocabularyScore, vocabularyScore, 0.6, {
        totalTerms: 0,
        uniqueTerms: 0,
        consistencyMetrics: { consistency: null, coverage: 0 },
        topTerms: [],
        synthetic: true,
        method: 'domain_analysis'
      }),
      this.createResult('taxonomy_alignment', taxonomyScore, taxonomyScore, 0.5, {
        taxonomyElements: 0,
        alignmentDetails: {},
        standardsFound: [],
        hierarchyDepth: 0,
        synthetic: true,
        method: 'domain_inference'
      }),
      this.createResult('semantic_disambiguation', disambiguationScore, disambiguationScore, 0.5, {
        ambiguousTermsFound: 0,
        disambiguationStrategies: [],
        clarityMetrics: {},
        synthetic: true,
        method: 'brand_analysis'
      }),
      this.createResult('ontology_alignment', ontologyScore, ontologyScore, 0.6, {
        ontologyElementsFound: 0,
        industryAlignment: {},
        standardOntologies: [],
        customOntologies: [],
        synthetic: true,
        method: 'industry_inference'
      }),
      this.createResult('content_hierarchy', hierarchyScore, hierarchyScore, 0.4, {
        hierarchyDepth: 0,
        logicalStructure: false,
        navigationConsistency: false,
        crossLinking: false,
        synthetic: true,
        method: 'neutral_assumption'
      })
    ]
    
    return this.createOutput('completed', results, 100, undefined, {
      totalPagesAnalyzed: 0,
      vocabularyTermsExtracted: 0,
      semanticConcepts: 0,
      synthetic: true,
      fallbackReason: 'no_crawl_data'
    })
  }

  /**
   * Infer industry from domain name
   */
  private inferIndustryFromDomain(domain: string): string {
    const lowerDomain = domain.toLowerCase()
    if (lowerDomain.includes('shop') || lowerDomain.includes('store') || lowerDomain.includes('buy')) return 'ecommerce'
    if (lowerDomain.includes('tech') || lowerDomain.includes('software') || lowerDomain.includes('app')) return 'technology'
    if (lowerDomain.includes('health') || lowerDomain.includes('medical') || lowerDomain.includes('care')) return 'healthcare'
    if (lowerDomain.includes('finance') || lowerDomain.includes('bank') || lowerDomain.includes('invest')) return 'finance'
    if (lowerDomain.includes('edu') || lowerDomain.includes('learn') || lowerDomain.includes('school')) return 'education'
    if (lowerDomain.includes('news') || lowerDomain.includes('media') || lowerDomain.includes('blog')) return 'media'
    return 'general_business'
  }
}