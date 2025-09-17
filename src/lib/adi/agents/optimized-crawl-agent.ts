import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Optimized Crawl Agent - Fast website content extraction
 * Target: Complete in under 4 seconds with smart crawling strategies
 */
export class OptimizedCrawlAgent extends BaseADIAgent {
  private cache: Map<string, any> = new Map()

  constructor() {
    const config: ADIAgentConfig = {
      name: 'crawl_agent',
      version: 'v2.0-optimized',
      description: 'Fast website content extraction with smart caching and parallel processing',
      dependencies: [],
      timeout: 4000, // Reduced from 45s to 4s
      retryLimit: 1, // Reduced retries for speed
      parallelizable: false
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`🚀 Executing Optimized Crawl Agent for ${input.context.websiteUrl}`)

      const results = []
      const websiteUrl = input.context.websiteUrl

      // OPTIMIZATION 1: Check cache first
      const cacheKey = this.generateCacheKey(websiteUrl)
      if (this.cache.has(cacheKey)) {
        console.log('⚡ Cache hit for crawl data')
        const cachedResult = this.cache.get(cacheKey)
        return this.createOutput('completed', [cachedResult], Date.now() - startTime, undefined, {
          cached: true,
          websiteUrl
        })
      }

      // OPTIMIZATION 2: Parallel crawling with reduced scope
      const crawlPromises = [
        this.fastCrawlMainPage(websiteUrl),
        this.quickSitemapCheck(websiteUrl),
        this.quickRobotsCheck(websiteUrl)
      ]

      const crawlResults = await Promise.allSettled(crawlPromises)
      
      // Process successful results
      for (const result of crawlResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value)
        }
      }

      const executionTime = Date.now() - startTime

      // OPTIMIZATION 3: Cache successful results
      if (results.length > 0) {
        this.cache.set(cacheKey, results[0]) // Cache main page result
      }

      return this.createOutput('completed', results, executionTime, undefined, {
        totalPagesCrawled: results.length,
        websiteUrl,
        crawlTimestamp: new Date().toISOString(),
        optimized: true,
        cacheSize: this.cache.size
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Optimized Crawl Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown crawling error'
      )
    }
  }

  /**
   * Fast main page crawl with essential data only
   */
  private async fastCrawlMainPage(url: string): Promise<any> {
    try {
      const normalizedUrl = this.normalizeUrl(url)
      
      // OPTIMIZATION 4: Reduced timeout and essential content only
      const response = await this.fetchWithTimeout(normalizedUrl, 3000) // 3s timeout

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      console.log(`📄 Crawled content length: ${html.length} characters from ${normalizedUrl}`)
      
      // OPTIMIZATION 5: Extract only essential data
      const essentialData = this.extractEssentialData(html)
      console.log(`📊 Essential data extracted:`, {
        qualityScore: essentialData.qualityScore,
        structuredDataCount: essentialData.structuredData.length,
        hasTitle: !!essentialData.metaData.title,
        hasDescription: !!essentialData.metaData.description
      })
      
      return this.createResult(
        'homepage_crawl_optimized',
        essentialData.qualityScore,
        this.normalizeScore(essentialData.qualityScore, 0, 100, 0, 100),
        0.9,
        {
          url: normalizedUrl,
          contentSize: html.length,
          structuredData: essentialData.structuredData,
          metaData: essentialData.metaData,
          contentMetrics: essentialData.contentMetrics,
          crawlTimestamp: new Date().toISOString(),
          content: html.substring(0, 5000), // Reduced content storage
          optimized: true
        }
      )

    } catch (error) {
      console.warn(`Fast crawl failed for ${url}:`, error)
      return null
    }
  }

  /**
   * Quick sitemap check with minimal processing
   */
  private async quickSitemapCheck(baseUrl: string): Promise<any | null> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString()
      const response = await this.fetchWithTimeout(sitemapUrl, 2000) // 2s timeout
      
      if (response.ok) {
        const sitemapContent = await response.text()
        const urlCount = (sitemapContent.match(/<loc>/g) || []).length
        
        return this.createResult(
          'sitemap_analysis_fast',
          urlCount > 0 ? 100 : 0,
          urlCount > 0 ? 100 : 0,
          0.9,
          {
            sitemapUrl,
            urlCount,
            hasSitemap: true,
            optimized: true
          }
        )
      }
    } catch (error) {
      // Fail silently for speed
    }

    return this.createResult(
      'sitemap_analysis_fast',
      0,
      0,
      0.8,
      {
        hasSitemap: false,
        optimized: true
      }
    )
  }

  /**
   * Quick robots.txt check
   */
  private async quickRobotsCheck(baseUrl: string): Promise<any | null> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString()
      const response = await this.fetchWithTimeout(robotsUrl, 1500) // 1.5s timeout
      
      if (response.ok) {
        const robotsContent = await response.text()
        const hasSitemap = /sitemap:/i.test(robotsContent)
        
        return this.createResult(
          'robots_txt_analysis_fast',
          hasSitemap ? 100 : 50,
          hasSitemap ? 100 : 50,
          0.9,
          {
            robotsUrl,
            hasRobotsTxt: true,
            hasSitemap,
            optimized: true
          }
        )
      }
    } catch (error) {
      // Fail silently for speed
    }

    return this.createResult(
      'robots_txt_analysis_fast',
      25,
      25,
      0.8,
      {
        hasRobotsTxt: false,
        optimized: true
      }
    )
  }

  /**
   * Extract only essential data for speed
   */
  private extractEssentialData(html: string): {
    qualityScore: number
    structuredData: any[]
    metaData: Record<string, any>
    contentMetrics: any
  } {
    // OPTIMIZATION 6: Minimal data extraction
    const structuredData = this.extractMinimalStructuredData(html)
    const metaData = this.extractMinimalMetaData(html)
    const contentMetrics = this.calculateFastContentMetrics(html)
    
    const qualityScore = (
      (structuredData.length > 0 ? 40 : 0) +
      (metaData.title ? 30 : 0) +
      (metaData.description ? 30 : 0)
    )

    return {
      qualityScore,
      structuredData,
      metaData,
      contentMetrics
    }
  }

  /**
   * Minimal structured data extraction
   */
  private extractMinimalStructuredData(html: string): any[] {
    const structuredData: any[] = []
    
    // Only extract JSON-LD (fastest to parse)
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    if (jsonLdMatches) {
      for (const match of jsonLdMatches.slice(0, 3)) { // Limit to first 3
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          const parsed = JSON.parse(jsonContent)
          structuredData.push(parsed)
        } catch (error) {
          // Skip invalid JSON for speed
        }
      }
    }

    return structuredData
  }

  /**
   * Minimal meta data extraction
   */
  private extractMinimalMetaData(html: string): Record<string, any> {
    const metaData: Record<string, any> = {}
    
    // Extract only essential meta tags
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    if (titleMatch) {
      metaData.title = titleMatch[1].trim()
    }

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) {
      metaData.description = descMatch[1]
    }

    return metaData
  }

  /**
   * Fast content metrics calculation
   */
  private calculateFastContentMetrics(html: string): any {
    const hasTitle = /<title[^>]*>/.test(html)
    const hasMetaDescription = /name=["']description["']/i.test(html)
    const hasStructuredData = /application\/ld\+json/i.test(html)
    
    const qualityScore = [hasTitle, hasMetaDescription, hasStructuredData].filter(Boolean).length * 33.33

    return {
      qualityScore: Math.round(qualityScore),
      hasTitle,
      hasMetaDescription,
      hasStructuredData,
      optimized: true
    }
  }

  /**
   * Generate cache key for URL
   */
  private generateCacheKey(url: string): string {
    try {
      const urlObj = new URL(url)
      return `crawl-${urlObj.hostname}`
    } catch {
      return `crawl-${url.replace(/[^a-zA-Z0-9]/g, '-')}`
    }
  }

  /**
   * Normalize URL with basic validation
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      if (urlObj.protocol === 'http:' && !url.startsWith('http://localhost')) {
        urlObj.protocol = 'https:'
      }
      return urlObj.toString()
    } catch (error) {
      if (!url.startsWith('http')) {
        return `https://${url}`
      }
      return url
    }
  }

  /**
   * Fast fetch with timeout
   */
  private async fetchWithTimeout(url: string, timeout: number = 3000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ADI-Crawler/2.0-Optimized',
          'Accept': 'text/html,application/xhtml+xml'
        }
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Clear cache for memory management
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🗑️ Optimized crawl cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number, keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}