import { BrandCategoryDetectionAgent, BrandCategoryAnalysis } from './adi/agents/brand-category-detection-agent'
import { BRAND_TAXONOMY, CategoryDetectionResult, BrandCategory } from './brand-taxonomy'
import type { ADIAgentInput, ADIEvaluationContext, ADICrawlArtifact } from '@/types/adi'

export interface BrandCategorizationRequest {
  brandName: string
  websiteUrl: string
  content?: string
  crawlArtifacts?: ADICrawlArtifact[]
}

export interface BrandCategorizationResult {
  brandName: string
  category: CategoryDetectionResult
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
  confidence: number
  lastUpdated: string
}

export interface LeaderboardCategoryFilter {
  sector?: string
  industry?: string
  niche?: string
  priceRange?: string
  businessModel?: string
}

export class BrandCategorizationService {
  private static instance: BrandCategorizationService
  private categoryAgent: BrandCategoryDetectionAgent
  private categoryCache: Map<string, BrandCategorizationResult> = new Map()
  private cacheExpiry: number = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.categoryAgent = new BrandCategoryDetectionAgent()
  }

  static getInstance(): BrandCategorizationService {
    if (!BrandCategorizationService.instance) {
      BrandCategorizationService.instance = new BrandCategorizationService()
    }
    return BrandCategorizationService.instance
  }

  /**
   * Categorize a brand and determine its peer group
   */
  async categorizeBrand(request: BrandCategorizationRequest): Promise<BrandCategorizationResult> {
    const cacheKey = `${request.brandName}-${request.websiteUrl}`
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Create ADI agent input
      const agentInput: ADIAgentInput = {
        context: {
          evaluationId: `brand-cat-${Date.now()}`,
          brandId: request.brandName.toLowerCase().replace(/\s+/g, '-'),
          websiteUrl: request.websiteUrl,
          evaluationType: 'standard',
          queryCanon: [],
          crawlArtifacts: request.crawlArtifacts || this.createMockCrawlArtifacts(request.content || ''),
          metadata: { brandName: request.brandName }
        },
        config: {}
      }

      // Execute brand categorization
      const agentOutput = await this.categoryAgent.execute(agentInput)
      
      if (agentOutput.status !== 'completed' || !agentOutput.metadata?.brandCategoryAnalysis) {
        throw new Error('Brand categorization failed')
      }

      const analysis: BrandCategoryAnalysis = agentOutput.metadata.brandCategoryAnalysis

      // Create result
      const result: BrandCategorizationResult = {
        brandName: request.brandName,
        category: analysis.detectedCategory,
        peerBrands: analysis.peerBrands,
        marketPosition: analysis.marketPosition,
        competitiveContext: analysis.competitiveContext,
        confidence: analysis.confidenceScore,
        lastUpdated: new Date().toISOString()
      }

      // Cache result
      this.cacheResult(cacheKey, result)

      return result
    } catch (error) {
      console.error('Brand categorization failed:', error)
      return this.getDefaultCategorization(request.brandName, request.websiteUrl)
    }
  }

  /**
   * Get brands in the same category for leaderboard filtering
   */
  async getBrandsByCategory(filter: LeaderboardCategoryFilter): Promise<string[]> {
    const matchingCategories = Object.values(BRAND_TAXONOMY).filter(category => {
      if (filter.sector && category.sector !== filter.sector) return false
      if (filter.industry && category.industry !== filter.industry) return false
      if (filter.niche && category.niche !== filter.niche) return false
      if (filter.priceRange && category.priceRange !== filter.priceRange) return false
      if (filter.businessModel && category.businessModel !== filter.businessModel) return false
      return true
    })

    // Return all competitor brands from matching categories
    const brands = new Set<string>()
    matchingCategories.forEach(category => {
      category.competitorBrands.forEach(brand => brands.add(brand))
    })

    return Array.from(brands)
  }

  /**
   * Get category hierarchy for a brand
   */
  getCategoryHierarchy(brandName: string): { sector: string; industry: string; niche: string } | null {
    // Check if brand exists in any category
    for (const category of Object.values(BRAND_TAXONOMY)) {
      if (category.competitorBrands.some(brand => 
        brand.toLowerCase() === brandName.toLowerCase()
      )) {
        return {
          sector: category.sector,
          industry: category.industry,
          niche: category.niche
        }
      }
    }
    return null
  }

  /**
   * Get all available categories for filtering
   */
  getAvailableCategories(): {
    sectors: string[]
    industries: string[]
    niches: string[]
    priceRanges: string[]
    businessModels: string[]
  } {
    const categories = Object.values(BRAND_TAXONOMY)
    
    return {
      sectors: [...new Set(categories.map(c => c.sector))],
      industries: [...new Set(categories.map(c => c.industry))],
      niches: [...new Set(categories.map(c => c.niche))],
      priceRanges: [...new Set(categories.map(c => c.priceRange))],
      businessModels: [...new Set(categories.map(c => c.businessModel))]
    }
  }

  /**
   * Find peer brands for a given brand
   */
  async findPeerBrands(brandName: string, websiteUrl?: string): Promise<string[]> {
    // First check if brand is in taxonomy
    const hierarchy = this.getCategoryHierarchy(brandName)
    if (hierarchy) {
      const category = Object.values(BRAND_TAXONOMY).find(cat => 
        cat.sector === hierarchy.sector && 
        cat.industry === hierarchy.industry && 
        cat.niche === hierarchy.niche
      )
      return category?.competitorBrands.filter(brand => 
        brand.toLowerCase() !== brandName.toLowerCase()
      ) || []
    }

    // If not in taxonomy and we have a URL, categorize dynamically
    if (websiteUrl) {
      try {
        const categorization = await this.categorizeBrand({
          brandName,
          websiteUrl
        })
        return categorization.peerBrands.filter(brand => 
          brand.toLowerCase() !== brandName.toLowerCase()
        )
      } catch (error) {
        console.error('Dynamic peer brand detection failed:', error)
      }
    }

    return []
  }

  /**
   * Batch categorize multiple brands
   */
  async categorizeBrands(requests: BrandCategorizationRequest[]): Promise<BrandCategorizationResult[]> {
    const results: BrandCategorizationResult[] = []
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 5
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)
      const batchPromises = batch.map(request => this.categorizeBrand(request))
      
      try {
        const batchResults = await Promise.allSettled(batchPromises)
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            console.error(`Batch categorization failed for ${batch[index].brandName}:`, result.reason)
            results.push(this.getDefaultCategorization(batch[index].brandName, batch[index].websiteUrl))
          }
        })
      } catch (error) {
        console.error('Batch processing failed:', error)
        // Add default categorizations for failed batch
        batch.forEach(request => {
          results.push(this.getDefaultCategorization(request.brandName, request.websiteUrl))
        })
      }
    }

    return results
  }

  /**
   * Get category statistics for leaderboard insights
   */
  getCategoryStatistics(): {
    totalCategories: number
    categoriesBySector: Record<string, number>
    averageBrandsPerCategory: number
    mostPopularSector: string
  } {
    const categories = Object.values(BRAND_TAXONOMY)
    const sectorCounts: Record<string, number> = {}
    
    categories.forEach(category => {
      sectorCounts[category.sector] = (sectorCounts[category.sector] || 0) + 1
    })

    const totalBrands = categories.reduce((sum, cat) => sum + cat.competitorBrands.length, 0)
    const mostPopularSector = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Fashion & Apparel'

    return {
      totalCategories: categories.length,
      categoriesBySector: sectorCounts,
      averageBrandsPerCategory: Math.round(totalBrands / categories.length),
      mostPopularSector
    }
  }

  private getCachedResult(cacheKey: string): BrandCategorizationResult | null {
    const cached = this.categoryCache.get(cacheKey)
    if (!cached) return null

    // Check if cache is expired
    const cacheAge = Date.now() - new Date(cached.lastUpdated).getTime()
    if (cacheAge > this.cacheExpiry) {
      this.categoryCache.delete(cacheKey)
      return null
    }

    return cached
  }

  private cacheResult(cacheKey: string, result: BrandCategorizationResult): void {
    this.categoryCache.set(cacheKey, result)
    
    // Clean up old cache entries periodically
    if (this.categoryCache.size > 1000) {
      const oldestEntries = Array.from(this.categoryCache.entries())
        .sort(([,a], [,b]) => new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime())
        .slice(0, 200)
      
      oldestEntries.forEach(([key]) => this.categoryCache.delete(key))
    }
  }

  private createMockCrawlArtifacts(content: string): ADICrawlArtifact[] {
    return [{
      id: `artifact-${Date.now()}`,
      evaluation_id: `eval-${Date.now()}`,
      artifact_type: 'html_content',
      content_hash: 'mock-hash',
      content_size: content.length,
      extracted_data: {
        text: content,
        title: 'Brand Website',
        description: 'Brand website content'
      },
      crawl_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    }]
  }

  private getDefaultCategorization(brandName: string, websiteUrl: string): BrandCategorizationResult {
    return {
      brandName,
      category: {
        confidence: 30,
        sector: 'Multi-Brand Retail',
        industry: 'E-commerce Platforms',
        niche: 'Category Specialists',
        reasoning: 'Default categorization - insufficient data for accurate classification',
        suggestedPeers: ['General Retailers'],
        alternativeCategories: []
      },
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
      },
      confidence: 30,
      lastUpdated: new Date().toISOString()
    }
  }
}

/**
 * Utility functions for brand categorization
 */
export class BrandCategorizationUtils {
  /**
   * Extract brand name from URL
   */
  static extractBrandFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname
      const parts = domain.split('.')
      const brandPart = parts.length > 2 ? parts[0] : parts[0]
      return brandPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    } catch {
      return 'unknown-brand'
    }
  }

  /**
   * Normalize brand name for comparison
   */
  static normalizeBrandName(brandName: string): string {
    return brandName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Calculate category similarity between two brands
   */
  static calculateCategorySimilarity(
    category1: CategoryDetectionResult,
    category2: CategoryDetectionResult
  ): number {
    let similarity = 0
    
    // Exact sector match
    if (category1.sector === category2.sector) similarity += 0.4
    
    // Exact industry match
    if (category1.industry === category2.industry) similarity += 0.3
    
    // Exact niche match
    if (category1.niche === category2.niche) similarity += 0.3
    
    return similarity
  }

  /**
   * Get category breadcrumb for UI display
   */
  static getCategoryBreadcrumb(category: CategoryDetectionResult): string {
    return `${category.sector} > ${category.industry} > ${category.niche}`
  }

  /**
   * Get category emoji for UI display
   */
  static getCategoryEmoji(niche: string): string {
    const category = Object.values(BRAND_TAXONOMY).find(cat => cat.niche === niche)
    return category?.emoji || '🏢'
  }

  /**
   * Validate categorization result
   */
  static validateCategorization(result: BrandCategorizationResult): boolean {
    return (
      result.brandName.length > 0 &&
      result.category.confidence >= 0 &&
      result.category.confidence <= 100 &&
      result.confidence >= 0 &&
      result.confidence <= 100 &&
      result.peerBrands.length >= 0 &&
      result.competitiveContext.directCompetitors.length >= 0
    )
  }

  /**
   * Get recommended minimum confidence threshold for category
   */
  static getConfidenceThreshold(marketSize: string): number {
    switch (marketSize) {
      case 'mega': return 60 // Higher threshold for large markets
      case 'large': return 50
      case 'mid-size': return 40
      case 'niche': return 30 // Lower threshold for niche markets
      default: return 40
    }
  }
}

/**
 * Brand categorization cache manager
 */
export class BrandCategorizationCache {
  private static readonly CACHE_KEY = 'brand-categorization-cache'
  private static readonly MAX_CACHE_SIZE = 500
  private static readonly CACHE_EXPIRY_HOURS = 24

  /**
   * Save categorization to persistent cache
   */
  static async saveCategorization(brandName: string, result: BrandCategorizationResult): Promise<void> {
    try {
      const cache = this.loadCache()
      const key = this.generateCacheKey(brandName, result.category.sector)
      
      cache[key] = {
        ...result,
        cachedAt: new Date().toISOString()
      }

      // Cleanup old entries if cache is too large
      if (Object.keys(cache).length > this.MAX_CACHE_SIZE) {
        this.cleanupCache(cache)
      }

      // In a real implementation, this would save to a database or Redis
      // For now, we'll use in-memory storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
      }
    } catch (error) {
      console.error('Failed to save categorization cache:', error)
    }
  }

  /**
   * Load categorization from persistent cache
   */
  static loadCategorization(brandName: string, sector?: string): BrandCategorizationResult | null {
    try {
      const cache = this.loadCache()
      const key = this.generateCacheKey(brandName, sector || '')
      const cached = cache[key]

      if (!cached) return null

      // Check if cache is expired
      const cacheAge = Date.now() - new Date(cached.cachedAt).getTime()
      const maxAge = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000
      
      if (cacheAge > maxAge) {
        delete cache[key]
        this.saveCache(cache)
        return null
      }

      return cached
    } catch (error) {
      console.error('Failed to load categorization cache:', error)
      return null
    }
  }

  private static loadCache(): Record<string, any> {
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(this.CACHE_KEY)
        return cached ? JSON.parse(cached) : {}
      }
      return {}
    } catch {
      return {}
    }
  }

  private static saveCache(cache: Record<string, any>): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
      }
    } catch (error) {
      console.error('Failed to save cache:', error)
    }
  }

  private static generateCacheKey(brandName: string, sector: string): string {
    return `${BrandCategorizationUtils.normalizeBrandName(brandName)}-${sector.toLowerCase().replace(/\s+/g, '-')}`
  }

  private static cleanupCache(cache: Record<string, any>): void {
    // Remove oldest 20% of entries
    const entries = Object.entries(cache)
    const sortedEntries = entries.sort(([,a], [,b]) => 
      new Date(a.cachedAt).getTime() - new Date(b.cachedAt).getTime()
    )
    
    const toRemove = Math.floor(entries.length * 0.2)
    sortedEntries.slice(0, toRemove).forEach(([key]) => {
      delete cache[key]
    })
  }
}