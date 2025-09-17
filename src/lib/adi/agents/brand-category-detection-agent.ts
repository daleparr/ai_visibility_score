import { BaseAIDIAgent } from './base-agent'
import { BRAND_TAXONOMY, DETECTION_KEYWORDS, PRICE_INDICATORS, BUSINESS_MODEL_INDICATORS, CategoryDetectionResult, BrandCategory } from '../../brand-taxonomy'
import type { AIDIAgentInput, AIDIAgentOutput, AIDIAgentConfig } from '@/types/adi'

export interface BrandCategoryAnalysis {
  detectedCategory: CategoryDetectionResult
  confidenceScore: number
  peerBrands: string[]
  marketPosition: {
    priceRange: 'budget' | 'mid-market' | 'premium' | 'luxury'
    businessModel: 'b2c' | 'b2b' | 'marketplace' | 'subscription' | 'hybrid'
    targetAudience: string
  }
  competitiveContext: {
    directCompetitors: string[]
    marketSize: 'niche' | 'mid-size' | 'large' | 'mega'
    differentiators: string[]
  }
}

export class BrandCategoryDetectionAgent extends BaseAIDIAgent {
  constructor() {
    const config: AIDIAgentConfig = {
      name: 'Brand Category Detection Agent',
      version: '1.0.0',
      description: 'Intelligently categorizes brands into appropriate peer groups and market segments',
      timeout: 30000,
      retryLimit: 3,
      dependencies: ['crawl-agent'],
      parallelizable: true
    }
    super(config)
  }

  async execute(input: AIDIAgentInput): Promise<AIDIAgentOutput> {
    const startTime = Date.now()
    
    try {
      const { websiteUrl, crawlArtifacts } = input.context
      
      // Extract content from crawl artifacts
      const content = this.extractContentFromArtifacts(crawlArtifacts)
      if (!content) {
        return this.createOutput('failed', [], 0, 'No content available for brand categorization')
      }

      // Perform brand categorization analysis
      const analysis = await this.performBrandCategorization(websiteUrl, content)
      
      const executionTime = Date.now() - startTime
      
      // Create AIDI-compatible results
      const results = [
        this.createResult(
          'brand_category_confidence',
          analysis.confidenceScore,
          analysis.confidenceScore,
          0.9,
          {
            detectedCategory: analysis.detectedCategory,
            marketPosition: analysis.marketPosition,
            competitiveContext: analysis.competitiveContext
          }
        )
      ]

      return this.createOutput('completed', results, executionTime, undefined, {
        brandCategoryAnalysis: analysis,
        detectedSector: analysis.detectedCategory.sector,
        detectedNiche: analysis.detectedCategory.niche,
        peerBrands: analysis.peerBrands
      })
    } catch (error) {
      const executionTime = Date.now() - startTime
      return this.createOutput(
        'failed',
        [],
        executionTime,
        `Brand categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private async performBrandCategorization(url: string, content: string): Promise<BrandCategoryAnalysis> {
    try {
      // Extract brand signals from website content
      const brandSignals = this.extractBrandSignals(content, url)
      
      // Detect primary category
      const detectedCategory = this.detectPrimaryCategory(brandSignals)
      
      // Analyze market position
      const marketPosition = this.analyzeMarketPosition(brandSignals)
      
      // Find peer brands and competitive context
      const competitiveContext = this.analyzeCompetitiveContext(detectedCategory, marketPosition)
      
      // Calculate overall confidence
      const confidenceScore = this.calculateBrandConfidence(brandSignals, detectedCategory)

      return {
        detectedCategory,
        confidenceScore,
        peerBrands: competitiveContext.directCompetitors,
        marketPosition,
        competitiveContext
      }
    } catch (error) {
      console.error('Brand category detection failed:', error)
      return this.getDefaultCategoryAnalysis()
    }
  }

  private extractBrandSignals(content: string, url: string): BrandSignals {
    const text = content.toLowerCase()
    
    // Fix URL validation - ensure protocol is present and handle edge cases
    let domain: string
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
      domain = new URL(normalizedUrl).hostname.toLowerCase()
    } catch (error) {
      // Fallback: extract domain from URL string if URL constructor fails
      domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase()
    }
    
    return {
      // Content analysis
      productKeywords: this.extractProductKeywords(text),
      priceSignals: this.extractPriceSignals(text),
      brandLanguage: this.extractBrandLanguage(text),
      targetAudienceSignals: this.extractTargetAudience(text),
      businessModelSignals: this.extractBusinessModel(text),
      
      // Technical analysis
      domainSignals: this.analyzeDomain(domain),
      metaDescription: this.extractMetaDescription(content),
      pageStructure: this.analyzePageStructure(content),
      fullDomain: domain,
      
      // Brand positioning
      luxuryIndicators: this.detectLuxuryIndicators(text),
      technologyFocus: this.detectTechnologyFocus(text),
      sustainabilityFocus: this.detectSustainabilityFocus(text),
      
      // Market signals
      geographicScope: this.detectGeographicScope(text),
      brandHeritage: this.detectBrandHeritage(text),
      innovationFocus: this.detectInnovationFocus(text)
    }
  }

  private detectPrimaryCategory(signals: BrandSignals): CategoryDetectionResult {
    const categoryScores: Array<{ category: string; score: number; reasoning: string[] }> = []

    // Check for specific brand domain overrides first
    const domainOverride = this.checkDomainBasedCategorization(signals.domainSignals, signals.fullDomain)
    if (domainOverride) {
      return domainOverride
    }

    // Score each category based on signal matches
    for (const [categoryKey, category] of Object.entries(BRAND_TAXONOMY)) {
      const score = this.calculateCategoryScore(signals, category)
      const reasoning = this.generateCategoryReasoning(signals, category)
      
      categoryScores.push({
        category: categoryKey,
        score,
        reasoning
      })
    }

    // Sort by score and get top matches
    categoryScores.sort((a, b) => b.score - a.score)
    const topCategory = categoryScores[0]
    const category = BRAND_TAXONOMY[topCategory.category]

    // Generate alternative categories
    const alternatives = categoryScores.slice(1, 4).map(cat => ({
      category: BRAND_TAXONOMY[cat.category].niche,
      confidence: Math.round(cat.score * 100),
      reasoning: cat.reasoning.join('; ')
    }))

    return {
      confidence: Math.round(topCategory.score * 100),
      sector: category.sector,
      industry: category.industry,
      niche: category.niche,
      reasoning: topCategory.reasoning.join('; '),
      suggestedPeers: category.competitorBrands,
      alternativeCategories: alternatives
    }
  }

  private calculateCategoryScore(signals: BrandSignals, category: BrandCategory): number {
    let score = 0
    let maxScore = 0

    // Keyword matching (40% weight)
    const keywordMatches = category.keywords.filter(keyword => 
      signals.productKeywords.some(signal => signal.includes(keyword)) ||
      signals.brandLanguage.some(signal => signal.includes(keyword))
    ).length
    score += (keywordMatches / category.keywords.length) * 0.4
    maxScore += 0.4

    // Price range alignment (25% weight)
    if (this.matchesPriceRange(signals.priceSignals, category.priceRange)) {
      score += 0.25
    }
    maxScore += 0.25

    // Business model alignment (20% weight)
    if (this.matchesBusinessModel(signals.businessModelSignals, category.businessModel)) {
      score += 0.2
    }
    maxScore += 0.2

    // Sector-specific signals (15% weight)
    const sectorScore = this.calculateSectorSpecificScore(signals, category.sector)
    score += sectorScore * 0.15
    maxScore += 0.15

    return score / maxScore
  }

  private calculateSectorSpecificScore(signals: BrandSignals, sector: string): number {
    switch (sector) {
      case 'Fashion & Apparel':
        return this.scoreFashionSignals(signals)
      case 'Beauty & Personal Care':
        return this.scoreBeautySignals(signals)
      case 'Multi-Brand Retail':
        return this.scoreRetailSignals(signals)
      case 'Food, Beverage & Grocery':
        return this.scoreFoodBeverageSignals(signals)
      case 'Health, Fitness & Wellness':
        return this.scoreWellnessSignals(signals)
      case 'Home & Lifestyle':
        return this.scoreHomeLifestyleSignals(signals)
      case 'Consumer Electronics & Entertainment':
        return this.scoreTechSignals(signals)
      default:
        return 0
    }
  }

  private scoreFashionSignals(signals: BrandSignals): number {
    const fashionKeywords = ['fashion', 'style', 'clothing', 'apparel', 'wear', 'outfit', 'collection']
    const matches = signals.productKeywords.filter(keyword => 
      fashionKeywords.some(fk => keyword.includes(fk))
    ).length
    return Math.min(matches / 3, 1) // Normalize to 0-1
  }

  private scoreBeautySignals(signals: BrandSignals): number {
    const beautyKeywords = ['beauty', 'cosmetics', 'skincare', 'makeup', 'fragrance', 'personal care']
    const matches = signals.productKeywords.filter(keyword => 
      beautyKeywords.some(bk => keyword.includes(bk))
    ).length
    return Math.min(matches / 3, 1)
  }

  private scoreRetailSignals(signals: BrandSignals): number {
    const retailKeywords = ['shop', 'store', 'retail', 'marketplace', 'brands', 'selection', 'department', 'variety', 'multi-category']
    const departmentStoreKeywords = ['food', 'fashion', 'homeware', 'clothing', 'grocery', 'home', 'multi-brand', 'everything']
    
    let score = 0
    
    // Base retail signals
    const retailMatches = signals.businessModelSignals.filter(signal =>
      retailKeywords.some(rk => signal.includes(rk))
    ).length
    score += Math.min(retailMatches / 2, 0.5)
    
    // Department store multi-category bonus
    const deptMatches = signals.productKeywords.filter(keyword =>
      departmentStoreKeywords.some(dk => keyword.includes(dk))
    ).length
    
    // If we detect multiple categories (food + fashion + home), boost department store score
    const hasFood = signals.productKeywords.some(k => k.includes('food') || k.includes('grocery'))
    const hasFashion = signals.productKeywords.some(k => k.includes('fashion') || k.includes('clothing'))
    const hasHome = signals.productKeywords.some(k => k.includes('home') || k.includes('homeware'))
    
    if ((hasFood && hasFashion) || (hasFood && hasHome) || (hasFashion && hasHome)) {
      score += 0.5 // Strong department store indicator
    }
    
    return Math.min(score, 1)
  }

  private scoreFoodBeverageSignals(signals: BrandSignals): number {
    const foodKeywords = ['food', 'beverage', 'drink', 'grocery', 'nutrition', 'organic', 'coffee', 'wine']
    const matches = signals.productKeywords.filter(keyword => 
      foodKeywords.some(fk => keyword.includes(fk))
    ).length
    return Math.min(matches / 2, 1)
  }

  private scoreWellnessSignals(signals: BrandSignals): number {
    const wellnessKeywords = ['wellness', 'health', 'fitness', 'supplement', 'nutrition', 'workout']
    const matches = signals.productKeywords.filter(keyword => 
      wellnessKeywords.some(wk => keyword.includes(wk))
    ).length
    return Math.min(matches / 2, 1)
  }

  private scoreHomeLifestyleSignals(signals: BrandSignals): number {
    const homeKeywords = ['home', 'furniture', 'decor', 'interior', 'living', 'design', 'lifestyle']
    const matches = signals.productKeywords.filter(keyword => 
      homeKeywords.some(hk => keyword.includes(hk))
    ).length
    return Math.min(matches / 2, 1)
  }

  private scoreTechSignals(signals: BrandSignals): number {
    const techKeywords = ['technology', 'tech', 'electronic', 'digital', 'smart', 'device', 'gaming']
    const matches = signals.productKeywords.filter(keyword => 
      techKeywords.some(tk => keyword.includes(tk))
    ).length + (signals.technologyFocus ? 1 : 0)
    return Math.min(matches / 3, 1)
  }

  private extractProductKeywords(text: string): string[] {
    const keywords: string[] = []
    
    // Extract from common product-related sections
    const productSections = this.extractSections(text, [
      'products', 'shop', 'collection', 'catalog', 'menu', 'services'
    ])
    
    productSections.forEach(section => {
      // Extract nouns and product terms
      const words = section.split(/\s+/).filter(word => word.length > 3)
      keywords.push(...words.slice(0, 20)) // Limit to prevent noise
    })

    return [...new Set(keywords)] // Remove duplicates
  }

  private extractPriceSignals(text: string): string[] {
    const priceSignals: string[] = []
    
    // Look for price indicators
    Object.entries(PRICE_INDICATORS).forEach(([range, indicators]) => {
      indicators.forEach(indicator => {
        if (text.includes(indicator)) {
          priceSignals.push(range)
        }
      })
    })

    // Extract actual prices if present
    const priceMatches = text.match(/\$[\d,]+|\£[\d,]+|€[\d,]+/g) || []
    if (priceMatches.length > 0) {
      const avgPrice = this.calculateAveragePrice(priceMatches)
      priceSignals.push(this.categorizePriceRange(avgPrice))
    }

    return [...new Set(priceSignals)]
  }

  private extractBrandLanguage(text: string): string[] {
    const brandLanguage: string[] = []
    
    // Extract tone and messaging style
    const sentences = text.split(/[.!?]+/).slice(0, 50) // First 50 sentences
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/)
      brandLanguage.push(...words.filter(word => word.length > 4))
    })

    return [...new Set(brandLanguage)]
  }

  private extractTargetAudience(text: string): string[] {
    const audienceSignals: string[] = []
    
    const audienceKeywords = {
      'luxury': ['exclusive', 'elite', 'sophisticated', 'discerning'],
      'youth': ['young', 'gen z', 'millennial', 'trendy', 'cool'],
      'professional': ['professional', 'business', 'executive', 'corporate'],
      'family': ['family', 'kids', 'children', 'parents', 'home'],
      'fitness': ['athlete', 'fitness', 'active', 'performance', 'training'],
      'tech-savvy': ['tech', 'digital', 'smart', 'connected', 'innovation']
    }

    Object.entries(audienceKeywords).forEach(([audience, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        audienceSignals.push(audience)
      }
    })

    return audienceSignals
  }

  private extractBusinessModel(text: string): string[] {
    const modelSignals: string[] = []
    
    Object.entries(BUSINESS_MODEL_INDICATORS).forEach(([model, indicators]) => {
      indicators.forEach(indicator => {
        if (text.includes(indicator)) {
          modelSignals.push(model)
        }
      })
    })

    // Detect subscription model
    if (text.includes('subscription') || text.includes('monthly') || text.includes('plan')) {
      modelSignals.push('subscription')
    }

    // Detect marketplace model
    if (text.includes('sellers') || text.includes('vendors') || text.includes('marketplace')) {
      modelSignals.push('marketplace')
    }

    return [...new Set(modelSignals)]
  }

  private analyzeDomain(domain: string): DomainSignals {
    return {
      isEcommerce: domain.includes('shop') || domain.includes('store') || domain.includes('buy'),
      isTech: domain.includes('tech') || domain.includes('app') || domain.includes('digital'),
      isLuxury: domain.includes('luxury') || domain.includes('premium') || domain.includes('exclusive'),
      isGlobal: domain.includes('global') || domain.includes('world') || domain.includes('international'),
      tld: domain.split('.').pop() || '',
      subdomains: domain.split('.').slice(0, -2)
    }
  }

  private extractMetaDescription(content: string): string {
    const metaMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
    return metaMatch ? metaMatch[1].toLowerCase() : ''
  }

  private analyzePageStructure(content: string): PageStructure {
    return {
      hasEcommerce: /shop|cart|buy|purchase|checkout/i.test(content),
      hasProductCatalog: /products|catalog|collection|gallery/i.test(content),
      hasPricing: /price|cost|\$|£|€/i.test(content),
      hasAboutSection: /about|story|history|mission/i.test(content),
      hasContactInfo: /contact|phone|email|address/i.test(content),
      hasSocialProof: /review|testimonial|rating|customer/i.test(content)
    }
  }

  private detectLuxuryIndicators(text: string): boolean {
    const luxuryTerms = [
      'luxury', 'premium', 'exclusive', 'bespoke', 'artisanal', 'heritage',
      'craftsmanship', 'finest', 'exceptional', 'prestige', 'elite'
    ]
    return luxuryTerms.some(term => text.includes(term))
  }

  private detectTechnologyFocus(text: string): boolean {
    const techTerms = [
      'technology', 'innovation', 'digital', 'smart', 'ai', 'machine learning',
      'app', 'software', 'platform', 'algorithm', 'data', 'analytics'
    ]
    return techTerms.some(term => text.includes(term))
  }

  private detectSustainabilityFocus(text: string): boolean {
    const sustainabilityTerms = [
      'sustainable', 'eco-friendly', 'organic', 'natural', 'green', 'environment',
      'carbon neutral', 'renewable', 'ethical', 'responsible', 'clean'
    ]
    return sustainabilityTerms.some(term => text.includes(term))
  }

  private detectGeographicScope(text: string): 'local' | 'national' | 'international' | 'global' {
    if (text.includes('global') || text.includes('worldwide') || text.includes('international')) {
      return 'global'
    }
    if (text.includes('national') || text.includes('country') || text.includes('nationwide')) {
      return 'national'
    }
    if (text.includes('local') || text.includes('community') || text.includes('neighborhood')) {
      return 'local'
    }
    return 'international' // Default assumption for online brands
  }

  private detectBrandHeritage(text: string): boolean {
    const heritageTerms = [
      'founded', 'established', 'heritage', 'tradition', 'legacy', 'history',
      'generations', 'family business', 'since', 'years of experience'
    ]
    return heritageTerms.some(term => text.includes(term))
  }

  private detectInnovationFocus(text: string): boolean {
    const innovationTerms = [
      'innovation', 'innovative', 'cutting-edge', 'breakthrough', 'revolutionary',
      'pioneering', 'first-to-market', 'disruptive', 'next-generation'
    ]
    return innovationTerms.some(term => text.includes(term))
  }

  private analyzeMarketPosition(signals: BrandSignals): BrandCategoryAnalysis['marketPosition'] {
    // Determine price range
    const priceRange = this.determinePriceRange(signals)
    
    // Determine business model
    const businessModel = this.determineBusinessModel(signals)
    
    // Determine target audience
    const targetAudience = this.determineTargetAudience(signals)

    return {
      priceRange,
      businessModel,
      targetAudience
    }
  }

  private determinePriceRange(signals: BrandSignals): 'budget' | 'mid-market' | 'premium' | 'luxury' {
    if (signals.luxuryIndicators || signals.priceSignals.includes('luxury')) {
      return 'luxury'
    }
    if (signals.priceSignals.includes('premium') || signals.priceSignals.includes('high-end')) {
      return 'premium'
    }
    if (signals.priceSignals.includes('budget') || signals.priceSignals.includes('affordable')) {
      return 'budget'
    }
    return 'mid-market' // Default
  }

  private determineBusinessModel(signals: BrandSignals): 'b2c' | 'b2b' | 'marketplace' | 'subscription' | 'hybrid' {
    if (signals.businessModelSignals.includes('marketplace')) {
      return 'marketplace'
    }
    if (signals.businessModelSignals.includes('subscription')) {
      return 'subscription'
    }
    if (signals.businessModelSignals.includes('b2b')) {
      return 'b2b'
    }
    if (signals.businessModelSignals.includes('b2c') || signals.businessModelSignals.includes('consumer')) {
      return 'b2c'
    }
    return 'b2c' // Default for most brands
  }

  private determineTargetAudience(signals: BrandSignals): string {
    if (signals.targetAudienceSignals.includes('luxury')) {
      return 'Affluent consumers seeking premium experiences'
    }
    if (signals.targetAudienceSignals.includes('youth')) {
      return 'Young, trend-conscious consumers'
    }
    if (signals.targetAudienceSignals.includes('professional')) {
      return 'Business professionals and executives'
    }
    if (signals.targetAudienceSignals.includes('family')) {
      return 'Families and everyday consumers'
    }
    if (signals.targetAudienceSignals.includes('fitness')) {
      return 'Health and fitness enthusiasts'
    }
    if (signals.targetAudienceSignals.includes('tech-savvy')) {
      return 'Technology-forward early adopters'
    }
    return 'General consumers'
  }

  private analyzeCompetitiveContext(
    category: CategoryDetectionResult, 
    marketPosition: BrandCategoryAnalysis['marketPosition']
  ): BrandCategoryAnalysis['competitiveContext'] {
    const categoryData = Object.values(BRAND_TAXONOMY).find(cat => cat.niche === category.niche)
    
    return {
      directCompetitors: categoryData?.competitorBrands || [],
      marketSize: this.determineMarketSize(category.sector, category.niche),
      differentiators: this.identifyDifferentiators(marketPosition)
    }
  }

  private determineMarketSize(sector: string, niche: string): 'niche' | 'mid-size' | 'large' | 'mega' {
    const megaMarkets = ['Tech Giants', 'Online Mega-Retailers', 'Global Grocery Giants']
    const largeMarkets = ['Luxury Department Stores', 'Global Beauty Retailers', 'Activewear & Athleisure']
    const nicheMarkets = ['Luxury Fashion Houses', 'Clean & Eco Beauty', 'Premium Design & Interiors']
    
    if (megaMarkets.includes(niche)) return 'mega'
    if (largeMarkets.includes(niche)) return 'large'
    if (nicheMarkets.includes(niche)) return 'niche'
    return 'mid-size'
  }

  private identifyDifferentiators(marketPosition: BrandCategoryAnalysis['marketPosition']): string[] {
    const differentiators: string[] = []
    
    if (marketPosition.priceRange === 'luxury') {
      differentiators.push('Premium positioning', 'Exclusive access')
    }
    if (marketPosition.businessModel === 'subscription') {
      differentiators.push('Recurring relationship', 'Personalized service')
    }
    if (marketPosition.businessModel === 'marketplace') {
      differentiators.push('Multi-vendor platform', 'Extensive selection')
    }
    
    return differentiators
  }

  private calculateBrandConfidence(signals: BrandSignals, category: CategoryDetectionResult): number {
    let confidence = category.confidence
    
    // Boost confidence for strong signals
    if (signals.luxuryIndicators && category.niche.includes('Luxury')) {
      confidence += 10
    }
    if (signals.technologyFocus && category.sector === 'Consumer Electronics & Entertainment') {
      confidence += 10
    }
    if (signals.sustainabilityFocus && category.niche.includes('Clean')) {
      confidence += 10
    }
    
    return Math.min(confidence, 95) // Cap at 95% to show some uncertainty
  }

  private extractContentFromArtifacts(artifacts: any[]): string {
    if (!artifacts || artifacts.length === 0) {
      return ''
    }

    // Extract text content from crawl artifacts
    let combinedContent = ''
    for (const artifact of artifacts) {
      if (artifact.extracted_data?.text) {
        combinedContent += artifact.extracted_data.text + ' '
      }
      if (artifact.extracted_data?.title) {
        combinedContent += artifact.extracted_data.title + ' '
      }
      if (artifact.extracted_data?.description) {
        combinedContent += artifact.extracted_data.description + ' '
      }
    }

    return combinedContent.trim()
  }

  private extractSections(text: string, sectionKeywords: string[]): string[] {
    const sections: string[] = []
    
    sectionKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}[^.]*\\.`, 'gi')
      const matches = text.match(regex) || []
      sections.push(...matches)
    })
    
    return sections
  }

  private matchesPriceRange(priceSignals: string[], targetRange: string): boolean {
    return priceSignals.includes(targetRange)
  }

  private matchesBusinessModel(modelSignals: string[], targetModel: string): boolean {
    return modelSignals.includes(targetModel)
  }

  private calculateAveragePrice(priceMatches: string[]): number {
    const prices = priceMatches.map(price => {
      const numStr = price.replace(/[^\d]/g, '')
      return parseInt(numStr) || 0
    })
    return prices.reduce((sum, price) => sum + price, 0) / prices.length
  }

  private categorizePriceRange(avgPrice: number): string {
    if (avgPrice > 1000) return 'luxury'
    if (avgPrice > 200) return 'premium'
    if (avgPrice > 50) return 'mid-market'
    return 'budget'
  }

  private generateCategoryReasoning(signals: BrandSignals, category: BrandCategory): string[] {
    const reasoning: string[] = []
    
    // Check keyword matches
    const keywordMatches = category.keywords.filter(keyword => 
      signals.productKeywords.some(signal => signal.includes(keyword))
    )
    if (keywordMatches.length > 0) {
      reasoning.push(`Product keywords match: ${keywordMatches.join(', ')}`)
    }

    // Check price alignment
    if (this.matchesPriceRange(signals.priceSignals, category.priceRange)) {
      reasoning.push(`Price range aligns with ${category.priceRange} positioning`)
    }

    // Check business model
    if (this.matchesBusinessModel(signals.businessModelSignals, category.businessModel)) {
      reasoning.push(`Business model matches ${category.businessModel} approach`)
    }

    return reasoning
  }

  private checkDomainBasedCategorization(domainSignals: DomainSignals, fullDomain: string): CategoryDetectionResult | null {
    const domain = fullDomain
    
    // Known brand domain mappings
    const knownBrands: Record<string, string> = {
      'marksandspencer.com': 'mass-market-department-stores',
      'johnlewis.com': 'mass-market-department-stores',
      'target.com': 'mass-market-department-stores',
      'macys.com': 'mass-market-department-stores',
      'selfridges.com': 'luxury-department-stores',
      'harrods.com': 'luxury-department-stores',
      'supreme.com': 'streetwear',
      'palace.com': 'streetwear',
      'nike.com': 'activewear-athleisure',
      'adidas.com': 'activewear-athleisure'
    }
    
    // Check if this is a known brand domain
    for (const [brandDomain, categoryKey] of Object.entries(knownBrands)) {
      if (domain === brandDomain || domain.includes(brandDomain.replace('.com', ''))) {
        const category = BRAND_TAXONOMY[categoryKey]
        return {
          confidence: 95, // High confidence for known brands
          sector: category.sector,
          industry: category.industry,
          niche: category.niche,
          reasoning: `Known brand domain: ${brandDomain}`,
          suggestedPeers: category.competitorBrands,
          alternativeCategories: []
        }
      }
    }
    
    return null
  }

  private getDefaultCategoryAnalysis(): BrandCategoryAnalysis {
    return {
      detectedCategory: {
        confidence: 30,
        sector: 'Multi-Brand Retail',
        industry: 'E-commerce Platforms',
        niche: 'Category Specialists',
        reasoning: 'Default categorization due to insufficient data',
        suggestedPeers: ['General Retailers'],
        alternativeCategories: []
      },
      confidenceScore: 30,
      peerBrands: ['General Retailers'],
      marketPosition: {
        priceRange: 'mid-market',
        businessModel: 'b2c',
        targetAudience: 'General consumers'
      },
      competitiveContext: {
        directCompetitors: ['General Retailers'],
        marketSize: 'mid-size',
        differentiators: ['Standard retail approach']
      }
    }
  }
}

// Supporting interfaces
interface BrandSignals {
  productKeywords: string[]
  priceSignals: string[]
  brandLanguage: string[]
  targetAudienceSignals: string[]
  businessModelSignals: string[]
  domainSignals: DomainSignals
  metaDescription: string
  pageStructure: PageStructure
  fullDomain: string
  luxuryIndicators: boolean
  technologyFocus: boolean
  sustainabilityFocus: boolean
  geographicScope: 'local' | 'national' | 'international' | 'global'
  brandHeritage: boolean
  innovationFocus: boolean
}

interface DomainSignals {
  isEcommerce: boolean
  isTech: boolean
  isLuxury: boolean
  isGlobal: boolean
  tld: string
  subdomains: string[]
}

interface PageStructure {
  hasEcommerce: boolean
  hasProductCatalog: boolean
  hasPricing: boolean
  hasAboutSection: boolean
  hasContactInfo: boolean
  hasSocialProof: boolean
}