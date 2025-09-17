import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Commerce Agent - Evaluates Hero Products & Policies/Logistics Clarity
 * Analyzes product discoverability and commerce information clarity
 */
export class CommerceAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'commerce_agent',
      version: 'v1.0',
      description: 'Evaluates product discoverability and commerce policy clarity',
      dependencies: ['crawl_agent', 'llm_test_agent'],
      timeout: 35000, // 35 seconds
      retryLimit: 3,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Commerce Agent for evaluation ${input.context.evaluationId}`)

      const { websiteUrl } = input.context
      const brandName = this.extractBrandName(websiteUrl)

      // Get crawl artifacts from previousResults (updated data flow)
      const crawlResults = (input.previousResults || []).filter(
        result => result.agent_id === 'crawl_agent' && result.evidence?.htmlContent
      )

      if (crawlResults.length === 0) {
        return this.createOutput('skipped', [], 0, 'No HTML content available for analysis')
      }

      // Convert crawl results to expected format
      const crawlArtifacts = crawlResults.map(result => ({
        artifact_type: 'html_snapshot',
        content: result.evidence?.htmlContent || '',
        metadata: result.evidence?.metaData || {},
        structuredData: result.evidence?.structuredData || []
      }))

      const results = []

      // Hero Products & Use-Case Retrieval (12% of total ADI)
      const heroProductsResult = await this.analyzeHeroProducts(crawlArtifacts, brandName)
      results.push(heroProductsResult)

      const productRecommendationResult = await this.analyzeProductRecommendations(crawlArtifacts, brandName)
      results.push(productRecommendationResult)

      const useCaseArticulationResult = await this.analyzeUseCaseArticulation(crawlArtifacts)
      results.push(useCaseArticulationResult)

      // Policies & Logistics Clarity (8% of total ADI)
      const shippingClarityResult = await this.analyzeShippingClarity(crawlArtifacts)
      results.push(shippingClarityResult)

      const returnPolicyResult = await this.analyzeReturnPolicy(crawlArtifacts)
      results.push(returnPolicyResult)

      const pricingTransparencyResult = await this.analyzePricingTransparency(crawlArtifacts)
      results.push(pricingTransparencyResult)

      const availabilityInfoResult = await this.analyzeAvailabilityInfo(crawlArtifacts)
      results.push(availabilityInfoResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        brandName,
        artifactsAnalyzed: crawlArtifacts.length,
        heroProductsFound: this.countHeroProducts(crawlArtifacts),
        policyPagesFound: this.countPolicyPages(crawlArtifacts)
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Commerce Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  private async analyzeHeroProducts(artifacts: any[], brandName: string): Promise<any> {
    let productPages = 0
    let heroProductsIdentified = 0
    let bestSellerSignals = 0
    const heroProducts: any[] = []

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const url = artifact.url || ''

      // Check if this is a product page
      if (this.isProductPage(content, url)) {
        productPages++

        // Look for hero product signals
        const heroSignals = this.detectHeroProductSignals(content)
        if (heroSignals.isHero) {
          heroProductsIdentified++
          heroProducts.push({
            url,
            signals: heroSignals.signals,
            confidence: heroSignals.confidence
          })
        }

        // Look for best-seller indicators
        if (this.detectBestSellerSignals(content)) {
          bestSellerSignals++
        }
      }
    }

    const heroProductRatio = productPages > 0 ? (heroProductsIdentified / productPages) * 100 : 0
    const bestSellerRatio = productPages > 0 ? (bestSellerSignals / productPages) * 100 : 0
    
    // Score based on hero product identification and best-seller signals
    const identificationScore = Math.min(100, heroProductRatio * 2) // 50% hero products = 100 points
    const bestSellerScore = Math.min(100, bestSellerRatio * 3) // 33% best-sellers = 100 points
    const overallScore = (identificationScore * 0.6) + (bestSellerScore * 0.4)

    const confidence = this.calculateConfidence(
      productPages,
      heroProductsIdentified > 0 ? 0.8 : 0.4,
      overallScore / 100
    )

    return this.createResult(
      'hero_products_use_case',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 20, 95),
      confidence,
      {
        productPages,
        heroProductsIdentified,
        bestSellerSignals,
        heroProductRatio,
        bestSellerRatio,
        heroProducts: heroProducts.slice(0, 5) // Top 5 for storage
      }
    )
  }

  private async analyzeProductRecommendations(artifacts: any[], brandName: string): Promise<any> {
    let recommendationQuality = 0
    let totalProducts = 0
    const recommendationFeatures: Record<string, number> = {}

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      
      if (this.isProductPage(content, artifact.url)) {
        totalProducts++
        
        // Check for recommendation features
        const features = this.detectRecommendationFeatures(content)
        
        for (const [feature, present] of Object.entries(features)) {
          if (present) {
            recommendationFeatures[feature] = (recommendationFeatures[feature] || 0) + 1
            recommendationQuality += 20 // Each feature adds 20 points
          }
        }
      }
    }

    const avgRecommendationQuality = totalProducts > 0 ? recommendationQuality / totalProducts : 0
    const featureCompleteness = Object.keys(recommendationFeatures).length / 5 * 100 // 5 key features

    const overallScore = Math.min(100, (avgRecommendationQuality * 0.7) + (featureCompleteness * 0.3))
    const confidence = this.calculateConfidence(totalProducts, 0.7, overallScore / 100)

    return this.createResult(
      'product_recommendations_use_case',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 15, 90),
      confidence,
      {
        totalProducts,
        avgRecommendationQuality,
        featureCompleteness,
        recommendationFeatures
      }
    )
  }

  private async analyzeUseCaseArticulation(artifacts: any[]): Promise<any> {
    let useCaseScore = 0
    let totalAnalyzed = 0
    const useCaseTypes: Record<string, number> = {}

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      
      if (this.isProductPage(content, artifact.url) || this.isContentPage(content, artifact.url)) {
        totalAnalyzed++
        
        const useCases = this.detectUseCaseArticulation(content)
        useCaseScore += useCases.score
        
        for (const type of useCases.types) {
          useCaseTypes[type] = (useCaseTypes[type] || 0) + 1
        }
      }
    }

    const avgUseCaseScore = totalAnalyzed > 0 ? useCaseScore / totalAnalyzed : 0
    const useCaseVariety = Object.keys(useCaseTypes).length * 10 // Variety bonus
    
    const overallScore = Math.min(100, avgUseCaseScore + useCaseVariety)
    const confidence = this.calculateConfidence(totalAnalyzed, 0.8, overallScore / 100)

    return this.createResult(
      'use_case_articulation_hero_products',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 25, 95),
      confidence,
      {
        totalAnalyzed,
        avgUseCaseScore,
        useCaseVariety,
        useCaseTypes
      }
    )
  }

  private async analyzeShippingClarity(artifacts: any[]): Promise<any> {
    let shippingInfoFound = false
    let shippingClarity = 0
    const shippingFeatures: Record<string, boolean> = {}

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const url = artifact.url || ''
      
      if (this.isShippingPage(content, url) || this.isProductPage(content, url)) {
        const shippingInfo = this.extractShippingInfo(content)
        
        if (shippingInfo.found) {
          shippingInfoFound = true
          shippingClarity = Math.max(shippingClarity, shippingInfo.clarity)
          
          Object.assign(shippingFeatures, shippingInfo.features)
        }
      }
    }

    const featureCompleteness = Object.values(shippingFeatures).filter(Boolean).length / 6 * 100 // 6 key features
    const overallScore = shippingInfoFound ? (shippingClarity * 0.7) + (featureCompleteness * 0.3) : 0

    const confidence = shippingInfoFound ? 0.9 : 0.2

    return this.createResult(
      'shipping_logistics_clarity',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 30, 95),
      confidence,
      {
        shippingInfoFound,
        shippingClarity,
        featureCompleteness,
        shippingFeatures
      }
    )
  }

  private async analyzeReturnPolicy(artifacts: any[]): Promise<any> {
    let returnPolicyFound = false
    let policyClarity = 0
    const policyFeatures: Record<string, boolean> = {}

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const url = artifact.url || ''
      
      if (this.isReturnPolicyPage(content, url)) {
        const policyInfo = this.extractReturnPolicyInfo(content)
        
        if (policyInfo.found) {
          returnPolicyFound = true
          policyClarity = Math.max(policyClarity, policyInfo.clarity)
          
          Object.assign(policyFeatures, policyInfo.features)
        }
      }
    }

    const featureCompleteness = Object.values(policyFeatures).filter(Boolean).length / 5 * 100 // 5 key features
    const overallScore = returnPolicyFound ? (policyClarity * 0.8) + (featureCompleteness * 0.2) : 0

    const confidence = returnPolicyFound ? 0.9 : 0.3

    return this.createResult(
      'return_policy_logistics',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 25, 95),
      confidence,
      {
        returnPolicyFound,
        policyClarity,
        featureCompleteness,
        policyFeatures
      }
    )
  }

  private async analyzePricingTransparency(artifacts: any[]): Promise<any> {
    let productsWithPricing = 0
    let totalProducts = 0
    let pricingClarity = 0

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      
      if (this.isProductPage(content, artifact.url)) {
        totalProducts++
        
        const pricing = this.extractPricingInfo(content)
        if (pricing.found) {
          productsWithPricing++
          pricingClarity += pricing.clarity
        }
      }
    }

    const pricingCoverage = totalProducts > 0 ? (productsWithPricing / totalProducts) * 100 : 0
    const avgPricingClarity = productsWithPricing > 0 ? pricingClarity / productsWithPricing : 0
    
    const overallScore = (pricingCoverage * 0.6) + (avgPricingClarity * 0.4)
    const confidence = this.calculateConfidence(totalProducts, 0.9, overallScore / 100)

    return this.createResult(
      'pricing_policy_transparency',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 40, 95),
      confidence,
      {
        totalProducts,
        productsWithPricing,
        pricingCoverage,
        avgPricingClarity
      }
    )
  }

  private async analyzeAvailabilityInfo(artifacts: any[]): Promise<any> {
    let productsWithAvailability = 0
    let totalProducts = 0
    let availabilityClarity = 0

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      
      if (this.isProductPage(content, artifact.url)) {
        totalProducts++
        
        const availability = this.extractAvailabilityInfo(content)
        if (availability.found) {
          productsWithAvailability++
          availabilityClarity += availability.clarity
        }
      }
    }

    const availabilityCoverage = totalProducts > 0 ? (productsWithAvailability / totalProducts) * 100 : 0
    const avgAvailabilityClarity = productsWithAvailability > 0 ? availabilityClarity / productsWithAvailability : 0
    
    const overallScore = (availabilityCoverage * 0.7) + (avgAvailabilityClarity * 0.3)
    const confidence = this.calculateConfidence(totalProducts, 0.8, overallScore / 100)

    return this.createResult(
      'availability_logistics_info',
      overallScore,
      this.normalizeScore(overallScore, 0, 100, 35, 95),
      confidence,
      {
        totalProducts,
        productsWithAvailability,
        availabilityCoverage,
        avgAvailabilityClarity
      }
    )
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

  private isProductPage(content: string, url: string): boolean {
    const productIndicators = [
      /\/product\//i,
      /\/item\//i,
      /\/p\//i,
      /add.to.cart/i,
      /buy.now/i,
      /price/i,
      /\$\d+/,
      /product.description/i
    ]
    
    return productIndicators.some(pattern => pattern.test(content) || pattern.test(url))
  }

  private isContentPage(content: string, url: string): boolean {
    const contentIndicators = [
      /\/blog\//i,
      /\/article\//i,
      /\/guide\//i,
      /\/how-to\//i,
      /style.guide/i
    ]
    
    return contentIndicators.some(pattern => pattern.test(url))
  }

  private isShippingPage(content: string, url: string): boolean {
    return /shipping|delivery|fulfillment/i.test(url) || /shipping.information|delivery.policy/i.test(content)
  }

  private isReturnPolicyPage(content: string, url: string): boolean {
    return /return|refund|exchange/i.test(url) || /return.policy|refund.policy/i.test(content)
  }

  private detectHeroProductSignals(content: string): { isHero: boolean; signals: string[]; confidence: number } {
    const heroSignals = [
      { pattern: /best.seller/i, signal: 'best_seller' },
      { pattern: /featured/i, signal: 'featured' },
      { pattern: /popular/i, signal: 'popular' },
      { pattern: /top.rated/i, signal: 'top_rated' },
      { pattern: /editor.choice/i, signal: 'editor_choice' },
      { pattern: /trending/i, signal: 'trending' }
    ]

    const foundSignals = heroSignals.filter(s => s.pattern.test(content)).map(s => s.signal)
    const isHero = foundSignals.length >= 2 // Need at least 2 signals
    const confidence = Math.min(1.0, foundSignals.length / 3) // Max confidence with 3+ signals

    return { isHero, signals: foundSignals, confidence }
  }

  private detectBestSellerSignals(content: string): boolean {
    const bestSellerPatterns = [
      /best.seller/i,
      /top.selling/i,
      /most.popular/i,
      /#1.seller/i,
      /customer.favorite/i
    ]
    
    return bestSellerPatterns.some(pattern => pattern.test(content))
  }

  private detectRecommendationFeatures(content: string): Record<string, boolean> {
    return {
      relatedProducts: /related.products|you.might.like|similar.items/i.test(content),
      customerAlsoBought: /customers.also.bought|frequently.bought.together/i.test(content),
      recommendations: /recommended.for.you|personalized.recommendations/i.test(content),
      comparisons: /compare|vs\.|versus/i.test(content),
      reviews: /customer.reviews|ratings|stars/i.test(content)
    }
  }

  private detectUseCaseArticulation(content: string): { score: number; types: string[] } {
    const useCasePatterns = [
      { pattern: /perfect.for|ideal.for|great.for/i, type: 'occasion', score: 20 },
      { pattern: /wear.with|pair.with|style.with/i, type: 'styling', score: 15 },
      { pattern: /designed.for|made.for/i, type: 'purpose', score: 20 },
      { pattern: /best.used|recommended.for/i, type: 'recommendation', score: 15 },
      { pattern: /suitable.for|appropriate.for/i, type: 'suitability', score: 10 }
    ]

    let score = 0
    const types: string[] = []

    for (const pattern of useCasePatterns) {
      if (pattern.pattern.test(content)) {
        score += pattern.score
        types.push(pattern.type)
      }
    }

    return { score: Math.min(100, score), types }
  }

  private extractShippingInfo(content: string): { found: boolean; clarity: number; features: Record<string, boolean> } {
    const features = {
      shippingCosts: /shipping.cost|delivery.fee|\$\d+.shipping/i.test(content),
      freeShipping: /free.shipping|no.shipping.cost/i.test(content),
      deliveryTime: /\d+.days|business.days|delivery.time/i.test(content),
      shippingMethods: /standard|express|overnight|priority/i.test(content),
      internationalShipping: /international|worldwide|global.shipping/i.test(content),
      trackingInfo: /tracking|track.order|shipment.tracking/i.test(content)
    }

    const found = Object.values(features).some(Boolean)
    const featureCount = Object.values(features).filter(Boolean).length
    const clarity = (featureCount / 6) * 100 // 6 total features

    return { found, clarity, features }
  }

  private extractReturnPolicyInfo(content: string): { found: boolean; clarity: number; features: Record<string, boolean> } {
    const features = {
      returnWindow: /\d+.days|return.within/i.test(content),
      returnConditions: /original.condition|unworn|tags.attached/i.test(content),
      returnProcess: /how.to.return|return.process|return.instructions/i.test(content),
      refundPolicy: /refund|money.back/i.test(content),
      exchangePolicy: /exchange|swap|different.size/i.test(content)
    }

    const found = Object.values(features).some(Boolean)
    const featureCount = Object.values(features).filter(Boolean).length
    const clarity = (featureCount / 5) * 100 // 5 total features

    return { found, clarity, features }
  }

  private extractPricingInfo(content: string): { found: boolean; clarity: number } {
    const pricePatterns = [
      /\$\d+/,
      /price/i,
      /cost/i,
      /\d+\.\d{2}/
    ]

    const found = pricePatterns.some(pattern => pattern.test(content))
    
    // Check for pricing clarity indicators
    let clarity = 0
    if (found) {
      clarity += 40 // Base score for having price
      if (/sale|discount|was.\$|orig/i.test(content)) clarity += 20 // Sale pricing
      if (/free.shipping|shipping.included/i.test(content)) clarity += 20 // Shipping clarity
      if (/tax|vat|duties/i.test(content)) clarity += 20 // Tax information
    }

    return { found, clarity: Math.min(100, clarity) }
  }

  private extractAvailabilityInfo(content: string): { found: boolean; clarity: number } {
    const availabilityPatterns = [
      /in.stock/i,
      /out.of.stock/i,
      /available/i,
      /sold.out/i,
      /back.in.stock/i,
      /limited.stock/i
    ]

    const found = availabilityPatterns.some(pattern => pattern.test(content))
    
    let clarity = 0
    if (found) {
      clarity += 50 // Base score for availability info
      if (/\d+.in.stock|\d+.available/i.test(content)) clarity += 30 // Specific quantities
      if (/back.in.stock|restock.date/i.test(content)) clarity += 20 // Restock info
    }

    return { found, clarity: Math.min(100, clarity) }
  }

  private countHeroProducts(artifacts: any[]): number {
    let count = 0
    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      if (this.isProductPage(content, artifact.url)) {
        const heroSignals = this.detectHeroProductSignals(content)
        if (heroSignals.isHero) count++
      }
    }
    return count
  }

  private countPolicyPages(artifacts: any[]): number {
    let count = 0
    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const url = artifact.url || ''
      if (this.isShippingPage(content, url) || this.isReturnPolicyPage(content, url)) {
        count++
      }
    }
    return count
  }
}