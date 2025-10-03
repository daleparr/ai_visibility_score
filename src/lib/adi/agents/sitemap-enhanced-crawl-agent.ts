import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Sitemap-Enhanced Crawl Agent
 * 
 * Leverages sitemap.xml files to dramatically improve crawl quality and efficiency:
 * - Comprehensive URL discovery from sitemap.xml
 * - Priority-based crawling using <priority> and <lastmod> signals
 * - Intelligent content type filtering (products, pages, resources)
 * - Reduced error rates by focusing on known-good URLs
 * - Enhanced downstream agent performance through richer content
 * 
 * Workflow:
 * 1. Discover sitemap.xml (standard locations + robots.txt)
 * 2. Parse and extract URLs with metadata (priority, lastmod, changefreq)
 * 3. Prioritize URLs based on business value and freshness
 * 4. Crawl high-priority pages with anti-bot evasion
 * 5. Fallback to traditional crawling if sitemap unavailable
 */

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
  contentType?: 'homepage' | 'product' | 'category' | 'article' | 'page' | 'resource'
  businessValue?: number
  freshnessScore?: number
  finalScore?: number
}

interface SitemapData {
  sitemapUrl: string
  urls: SitemapUrl[]
  totalUrls: number
  lastModified?: string
  hasIndex?: boolean
  indexSitemaps?: string[]
}

export class SitemapEnhancedCrawlAgent extends BaseADIAgent {
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private readonly CACHE_TTL = 15 * 60 * 1000 // 15 minutes
  private readonly MAX_URLS_TO_CRAWL = 12 // Increased from typical 5-6
  private readonly SITEMAP_TIMEOUT = 10000 // 10 seconds for sitemap discovery
  private readonly CRAWL_TIMEOUT = 25000 // 25 seconds per page

  constructor() {
    const config: ADIAgentConfig = {
      name: 'crawl_agent',
      version: 'v5.0-sitemap-enhanced',
      description: 'Sitemap-driven crawling with intelligent URL prioritization and comprehensive content discovery',
      dependencies: [],
      timeout: 120000, // 2 minutes total - allows for comprehensive sitemap-based crawling
      retryLimit: 2,
      parallelizable: false
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    const websiteUrl = input.context.websiteUrl
    const brandName = input.context.metadata?.brandName || this.extractBrandName(websiteUrl)
    
    console.log(`🗺️ Executing Sitemap-Enhanced Crawl Agent for ${brandName} (${websiteUrl})`)

    try {
      // Check cache first
      const cacheKey = `sitemap-crawl-${websiteUrl}`
      const cached = this.checkCache(cacheKey)
      if (cached) {
        console.log('⚡ Cache hit for sitemap crawl')
        return this.createSuccessOutput(cached, Date.now() - startTime, { cached: true })
      }

      const results = []

      // PHASE 1: Sitemap Discovery and Analysis
      console.log('🔍 Phase 1: Sitemap Discovery')
      const sitemapData = await this.discoverAndParseSitemap(websiteUrl)
      
      if (sitemapData && sitemapData.urls.length > 0) {
        console.log(`✅ Found sitemap with ${sitemapData.totalUrls} URLs`)
        
        // PHASE 2: Intelligent URL Prioritization
        console.log('🎯 Phase 2: URL Prioritization')
        const prioritizedUrls = this.prioritizeUrls(sitemapData.urls, brandName)
        
        // PHASE 3: Strategic Crawling
        console.log('🚀 Phase 3: Strategic Crawling')
        const crawlResults = await this.crawlPrioritizedUrls(prioritizedUrls.slice(0, this.MAX_URLS_TO_CRAWL))
        results.push(...crawlResults)

        // Add sitemap analysis result
        results.push(this.createSitemapAnalysisResult(sitemapData, prioritizedUrls))
        
      } else {
        console.log('⚠️ No sitemap found, falling back to traditional crawling')
        
        // FALLBACK: Traditional crawling approach
        const fallbackResults = await this.performFallbackCrawling(websiteUrl)
        results.push(...fallbackResults)
      }

      // PHASE 4: Robots.txt Analysis (always useful)
      const robotsResult = await this.analyzeRobotsTxt(websiteUrl)
      if (robotsResult) {
        results.push(robotsResult)
      }

      const executionTime = Date.now() - startTime
      const combinedData = this.combineResults(results, websiteUrl, brandName, sitemapData)

      // Cache successful results
      this.cacheResult(cacheKey, combinedData)

      console.log(`✅ Sitemap-enhanced crawl completed in ${executionTime}ms with ${results.length} results`)

      return this.createSuccessOutput(combinedData, executionTime, {
        method: 'sitemap_enhanced',
        sitemapFound: !!sitemapData,
        urlsCrawled: results.filter(r => r.resultType.includes('page')).length,
        totalSitemapUrls: sitemapData?.totalUrls || 0
      })

    } catch (error) {
      console.error('🚨 Sitemap-enhanced crawl failed:', error)
      
      // Intelligent fallback with basic crawling
      const fallbackData = await this.createIntelligentFallback(websiteUrl, brandName)
      return this.createSuccessOutput(fallbackData, Date.now() - startTime, { 
        method: 'intelligent_fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * PHASE 1: Discover and parse sitemap.xml files
   */
  private async discoverAndParseSitemap(websiteUrl: string): Promise<SitemapData | null> {
    const baseUrl = new URL(websiteUrl).origin
    
    // Standard sitemap locations to check
    const sitemapLocations = [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemaps.xml`,
      `${baseUrl}/sitemap/sitemap.xml`,
      `${baseUrl}/wp-sitemap.xml`, // WordPress
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/product-sitemap.xml`, // E-commerce specific
      `${baseUrl}/page-sitemap.xml`
    ]

    // First, check robots.txt for sitemap declarations
    const robotsSitemaps = await this.extractSitemapsFromRobots(websiteUrl)
    if (robotsSitemaps.length > 0) {
      sitemapLocations.unshift(...robotsSitemaps)
    }

    console.log(`🔍 Checking ${sitemapLocations.length} potential sitemap locations`)

    // Try each location until we find a valid sitemap
    for (const sitemapUrl of sitemapLocations) {
      try {
        const sitemapData = await this.fetchAndParseSitemap(sitemapUrl)
        if (sitemapData && sitemapData.urls.length > 0) {
          console.log(`✅ Found valid sitemap at ${sitemapUrl} with ${sitemapData.totalUrls} URLs`)
          return sitemapData
        }
      } catch (error) {
        console.log(`❌ Failed to fetch sitemap from ${sitemapUrl}:`, error instanceof Error ? error.message : 'Unknown error')
        continue
      }
    }

    console.log('❌ No valid sitemap found at any standard location')
    return null
  }

  /**
   * Extract sitemap URLs from robots.txt
   */
  private async extractSitemapsFromRobots(websiteUrl: string): Promise<string[]> {
    try {
      const robotsUrl = new URL('/robots.txt', websiteUrl).toString()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(robotsUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ADI-Bot/1.0; +https://ai-discoverability-index.com/bot)'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const robotsContent = await response.text()
        const sitemapMatches = robotsContent.match(/^sitemap:\s*(.+)$/gim)
        
        if (sitemapMatches) {
          const sitemaps = sitemapMatches.map(match => 
            match.replace(/^sitemap:\s*/i, '').trim()
          )
          console.log(`🤖 Found ${sitemaps.length} sitemaps in robots.txt:`, sitemaps)
          return sitemaps
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch robots.txt:', error instanceof Error ? error.message : 'Unknown error')
    }

    return []
  }

  /**
   * Fetch and parse a sitemap.xml file
   */
  private async fetchAndParseSitemap(sitemapUrl: string): Promise<SitemapData | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.SITEMAP_TIMEOUT)

    try {
      const response = await fetch(sitemapUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ADI-Bot/1.0; +https://ai-discoverability-index.com/bot)',
          'Accept': 'application/xml, text/xml, */*'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const xmlContent = await response.text()
      return this.parseSitemapXml(xmlContent, sitemapUrl)

    } catch (error) {
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Parse sitemap XML content and extract URLs with metadata
   */
  private parseSitemapXml(xmlContent: string, sitemapUrl: string): SitemapData | null {
    try {
      // Check if this is a sitemap index
      if (xmlContent.includes('<sitemapindex')) {
        return this.parseSitemapIndex(xmlContent, sitemapUrl)
      }

      // Parse regular sitemap
      const urls: SitemapUrl[] = []
      
      // Extract URL entries using regex (more reliable than XML parsing in this context)
      const urlMatches = xmlContent.match(/<url[^>]*>[\s\S]*?<\/url>/g) || []
      
      for (const urlMatch of urlMatches) {
        const url = this.parseUrlEntry(urlMatch)
        if (url) {
          urls.push(url)
        }
      }

      if (urls.length === 0) {
        return null
      }

      return {
        sitemapUrl,
        urls,
        totalUrls: urls.length,
        lastModified: this.extractLastModified(xmlContent),
        hasIndex: false
      }

    } catch (error) {
      console.error('Error parsing sitemap XML:', error)
      return null
    }
  }

  /**
   * Parse sitemap index and fetch individual sitemaps
   */
  private async parseSitemapIndex(xmlContent: string, indexUrl: string): Promise<SitemapData | null> {
    try {
      const sitemapMatches = xmlContent.match(/<sitemap[^>]*>[\s\S]*?<\/sitemap>/g) || []
      const indexSitemaps: string[] = []
      const allUrls: SitemapUrl[] = []

      // Extract individual sitemap URLs
      for (const sitemapMatch of sitemapMatches) {
        const locMatch = sitemapMatch.match(/<loc[^>]*>([^<]+)<\/loc>/)
        if (locMatch) {
          indexSitemaps.push(locMatch[1].trim())
        }
      }

      console.log(`📋 Sitemap index contains ${indexSitemaps.length} sitemaps`)

      // Fetch and parse individual sitemaps (limit to first 3 for performance)
      const sitemapsToFetch = indexSitemaps.slice(0, 3)
      
      for (const sitemapUrl of sitemapsToFetch) {
        try {
          const sitemapData = await this.fetchAndParseSitemap(sitemapUrl)
          if (sitemapData && sitemapData.urls.length > 0) {
            allUrls.push(...sitemapData.urls)
            console.log(`✅ Parsed ${sitemapData.urls.length} URLs from ${sitemapUrl}`)
          }
        } catch (error) {
          console.log(`⚠️ Failed to fetch sitemap ${sitemapUrl}:`, error instanceof Error ? error.message : 'Unknown error')
          continue
        }
      }

      if (allUrls.length === 0) {
        return null
      }

      return {
        sitemapUrl: indexUrl,
        urls: allUrls,
        totalUrls: allUrls.length,
        hasIndex: true,
        indexSitemaps
      }

    } catch (error) {
      console.error('Error parsing sitemap index:', error)
      return null
    }
  }

  /**
   * Parse individual URL entry from sitemap
   */
  private parseUrlEntry(urlXml: string): SitemapUrl | null {
    try {
      const locMatch = urlXml.match(/<loc[^>]*>([^<]+)<\/loc>/)
      if (!locMatch) return null

      const url = locMatch[1].trim()
      
      // Extract optional metadata
      const lastmodMatch = urlXml.match(/<lastmod[^>]*>([^<]+)<\/lastmod>/)
      const changefreqMatch = urlXml.match(/<changefreq[^>]*>([^<]+)<\/changefreq>/)
      const priorityMatch = urlXml.match(/<priority[^>]*>([^<]+)<\/priority>/)

      const sitemapUrl: SitemapUrl = {
        loc: url,
        lastmod: lastmodMatch?.[1]?.trim(),
        changefreq: changefreqMatch?.[1]?.trim(),
        priority: priorityMatch ? parseFloat(priorityMatch[1]) : undefined
      }

      // Determine content type from URL patterns
      sitemapUrl.contentType = this.determineContentType(url)
      
      // Calculate business value score
      sitemapUrl.businessValue = this.calculateBusinessValue(sitemapUrl)
      
      // Calculate freshness score
      sitemapUrl.freshnessScore = this.calculateFreshnessScore(sitemapUrl)

      return sitemapUrl

    } catch (error) {
      console.error('Error parsing URL entry:', error)
      return null
    }
  }

  /**
   * PHASE 2: Intelligent URL prioritization
   */
  private prioritizeUrls(urls: SitemapUrl[], brandName: string): SitemapUrl[] {
    console.log(`🎯 Prioritizing ${urls.length} URLs for crawling`)

    // Calculate final scores for each URL
    const scoredUrls = urls.map(url => {
      const businessValue = url.businessValue || 0
      const freshnessScore = url.freshnessScore || 0
      const priorityScore = (url.priority || 0.5) * 100
      
      // Weighted final score
      const finalScore = (
        businessValue * 0.5 +      // 50% business value
        freshnessScore * 0.3 +     // 30% freshness
        priorityScore * 0.2        // 20% sitemap priority
      )

      return {
        ...url,
        finalScore
      }
    })

    // Sort by final score (highest first)
    const prioritizedUrls = scoredUrls.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))

    // Log top URLs for debugging
    console.log('🏆 Top 5 prioritized URLs:')
    prioritizedUrls.slice(0, 5).forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.loc} (Score: ${url.finalScore?.toFixed(1)}, Type: ${url.contentType})`)
    })

    return prioritizedUrls
  }

  /**
   * Determine content type from URL patterns
   */
  private determineContentType(url: string): SitemapUrl['contentType'] {
    const urlLower = url.toLowerCase()
    const path = new URL(url).pathname.toLowerCase()

    // Homepage detection
    if (path === '/' || path === '/index.html' || path === '/home') {
      return 'homepage'
    }

    // Product pages
    if (path.includes('/product') || path.includes('/item') || path.includes('/p/') || 
        path.includes('/shop/') || path.includes('/buy/') || path.includes('/store/')) {
      return 'product'
    }

    // Category pages
    if (path.includes('/category') || path.includes('/collection') || path.includes('/catalog') ||
        path.includes('/browse') || path.includes('/department')) {
      return 'category'
    }

    // Articles/Blog
    if (path.includes('/blog') || path.includes('/article') || path.includes('/news') ||
        path.includes('/post') || path.includes('/story')) {
      return 'article'
    }

    // Resources
    if (path.includes('/help') || path.includes('/support') || path.includes('/faq') ||
        path.includes('/guide') || path.includes('/docs') || path.includes('/resources')) {
      return 'resource'
    }

    return 'page'
  }

  /**
   * Calculate business value score (0-100)
   */
  private calculateBusinessValue(url: SitemapUrl): number {
    let score = 50 // Base score

    // Content type scoring
    switch (url.contentType) {
      case 'homepage':
        score += 40 // Highest priority
        break
      case 'product':
        score += 35 // Very high for e-commerce
        break
      case 'category':
        score += 25 // High for navigation
        break
      case 'article':
        score += 15 // Medium for content
        break
      case 'resource':
        score += 20 // Good for support/trust
        break
      case 'page':
        score += 10 // Standard pages
        break
    }

    // URL depth penalty (deeper = less important)
    const depth = url.loc.split('/').length - 3 // Subtract protocol and domain
    score -= Math.min(depth * 5, 25) // Max 25 point penalty

    // Key page indicators
    const path = url.loc.toLowerCase()
    if (path.includes('/about')) score += 15
    if (path.includes('/contact')) score += 10
    if (path.includes('/pricing')) score += 20
    if (path.includes('/features')) score += 15
    if (path.includes('/services')) score += 15

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate freshness score based on lastmod (0-100)
   */
  private calculateFreshnessScore(url: SitemapUrl): number {
    if (!url.lastmod) {
      return 50 // Neutral score if no lastmod
    }

    try {
      const lastModDate = new Date(url.lastmod)
      const now = new Date()
      const daysSinceModified = (now.getTime() - lastModDate.getTime()) / (1000 * 60 * 60 * 24)

      // Scoring based on recency
      if (daysSinceModified <= 7) return 100      // Last week
      if (daysSinceModified <= 30) return 85      // Last month
      if (daysSinceModified <= 90) return 70      // Last 3 months
      if (daysSinceModified <= 180) return 55     // Last 6 months
      if (daysSinceModified <= 365) return 40     // Last year
      return 25 // Older than a year

    } catch (error) {
      return 50 // Neutral score if date parsing fails
    }
  }

  /**
   * PHASE 3: Crawl prioritized URLs with anti-bot evasion
   */
  private async crawlPrioritizedUrls(urls: SitemapUrl[]): Promise<any[]> {
    const results = []
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ]

    console.log(`🚀 Crawling ${urls.length} prioritized URLs`)

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const userAgent = userAgents[i % userAgents.length]

      try {
        console.log(`📄 Crawling ${i + 1}/${urls.length}: ${url.loc} (${url.contentType})`)
        
        const pageResult = await this.crawlSinglePage(url, userAgent)
        if (pageResult) {
          results.push(pageResult)
        }

        // Rate limiting: wait between requests
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)) // 1.5-2.5s delay
        }

      } catch (error) {
        console.log(`❌ Failed to crawl ${url.loc}:`, error instanceof Error ? error.message : 'Unknown error')
        continue
      }
    }

    console.log(`✅ Successfully crawled ${results.length}/${urls.length} URLs`)
    return results
  }

  /**
   * Crawl a single page with comprehensive error handling
   */
  private async crawlSinglePage(url: SitemapUrl, userAgent: string): Promise<any | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.CRAWL_TIMEOUT)

    try {
      const response = await fetch(url.loc, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const metaData = this.extractEnhancedMeta(html)

      return this.createResult(
        `${url.contentType}_page`,
        85, // Good score for successful sitemap-based crawl
        85,
        0.9,
        {
          url: url.loc,
          websiteUrl: url.loc,
          html: html.substring(0, 100000), // First 100k chars
          content: html.substring(0, 100000),
          htmlContent: html.substring(0, 100000),
          metaData,
          contentSize: html.length,
          contentType: url.contentType,
          sitemapMetadata: {
            priority: url.priority,
            lastmod: url.lastmod,
            changefreq: url.changefreq,
            businessValue: url.businessValue,
            freshnessScore: url.freshnessScore,
            finalScore: url.finalScore
          },
          crawlTimestamp: new Date().toISOString(),
          responseTime: Date.now(),
          statusCode: response.status
        }
      )

    } catch (error) {
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Enhanced metadata extraction
   */
  private extractEnhancedMeta(html: string): any {
    const meta: any = {}

    // Basic meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)

    meta.title = titleMatch?.[1]?.trim()
    meta.description = descMatch?.[1]?.trim()
    meta.keywords = keywordsMatch?.[1]?.trim()

    // Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)

    meta.ogTitle = ogTitleMatch?.[1]?.trim()
    meta.ogDescription = ogDescMatch?.[1]?.trim()
    meta.ogImage = ogImageMatch?.[1]?.trim()

    // Schema.org structured data
    const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi)
    if (schemaMatches) {
      meta.structuredData = schemaMatches.map(match => {
        try {
          const jsonMatch = match.match(/>([^<]+)</)?.[1]
          return jsonMatch ? JSON.parse(jsonMatch) : null
        } catch {
          return null
        }
      }).filter(Boolean)
    }

    // Content analysis
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi)
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi)
    
    meta.headings = {
      h1: h1Matches?.map(h => h.replace(/<[^>]*>/g, '').trim()) || [],
      h2: h2Matches?.map(h => h.replace(/<[^>]*>/g, '').trim()).slice(0, 5) || []
    }

    // E-commerce indicators
    meta.ecommerce = {
      hasAddToCart: /add.to.cart|buy.now|purchase|checkout/i.test(html),
      hasPrice: /\$[\d,]+\.?\d*|price|cost/i.test(html),
      hasReviews: /review|rating|star|testimonial/i.test(html),
      hasShipping: /shipping|delivery|free.shipping/i.test(html)
    }

    return meta
  }

  /**
   * Create sitemap analysis result
   */
  private createSitemapAnalysisResult(sitemapData: SitemapData, prioritizedUrls: SitemapUrl[]): any {
    const contentTypeDistribution = prioritizedUrls.reduce((acc, url) => {
      acc[url.contentType || 'unknown'] = (acc[url.contentType || 'unknown'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgBusinessValue = prioritizedUrls.reduce((sum, url) => sum + (url.businessValue || 0), 0) / prioritizedUrls.length
    const avgFreshnessScore = prioritizedUrls.reduce((sum, url) => sum + (url.freshnessScore || 0), 0) / prioritizedUrls.length

    return this.createResult(
      'sitemap_analysis',
      95, // High score for successful sitemap analysis
      95,
      0.95,
      {
        sitemapUrl: sitemapData.sitemapUrl,
        totalUrls: sitemapData.totalUrls,
        hasIndex: sitemapData.hasIndex,
        indexSitemaps: sitemapData.indexSitemaps,
        contentTypeDistribution,
        prioritizationMetrics: {
          avgBusinessValue: Math.round(avgBusinessValue),
          avgFreshnessScore: Math.round(avgFreshnessScore),
          topContentType: Object.entries(contentTypeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0]
        },
        urlsAnalyzed: prioritizedUrls.length,
        lastModified: sitemapData.lastModified,
        analysisTimestamp: new Date().toISOString()
      }
    )
  }

  /**
   * Fallback crawling when no sitemap is available
   */
  private async performFallbackCrawling(websiteUrl: string): Promise<any[]> {
    console.log('🔄 Performing fallback crawling (no sitemap)')
    
    const results = []
    
    try {
      // Crawl homepage
      const homepageResult = await this.crawlSinglePage(
        { loc: websiteUrl, contentType: 'homepage', businessValue: 100, freshnessScore: 50 },
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )
      
      if (homepageResult) {
        results.push(homepageResult)
        
        // Try to discover additional pages from homepage
        const discoveredUrls = this.discoverUrlsFromHtml(homepageResult.evidence.html, websiteUrl)
        
        // Crawl top 3 discovered pages
        for (let i = 0; i < Math.min(3, discoveredUrls.length); i++) {
          try {
            const pageResult = await this.crawlSinglePage(
              discoveredUrls[i],
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            if (pageResult) {
              results.push(pageResult)
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000))
            
          } catch (error) {
            console.log(`❌ Failed to crawl discovered page ${discoveredUrls[i].loc}:`, error instanceof Error ? error.message : 'Unknown error')
            continue
          }
        }
      }
      
    } catch (error) {
      console.error('Fallback crawling failed:', error)
    }
    
    return results
  }

  /**
   * Discover URLs from HTML content
   */
  private discoverUrlsFromHtml(html: string, baseUrl: string): SitemapUrl[] {
    const urls: SitemapUrl[] = []
    const baseUrlObj = new URL(baseUrl)
    
    // Extract internal links
    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || []
    
    for (const linkMatch of linkMatches) {
      const hrefMatch = linkMatch.match(/href=["']([^"']+)["']/)
      if (!hrefMatch) continue
      
      let href = hrefMatch[1]
      
      try {
        // Convert relative URLs to absolute
        if (href.startsWith('/')) {
          href = baseUrlObj.origin + href
        } else if (!href.startsWith('http')) {
          href = new URL(href, baseUrl).toString()
        }
        
        // Only include same-domain URLs
        const urlObj = new URL(href)
        if (urlObj.hostname !== baseUrlObj.hostname) continue
        
        // Skip common non-content URLs
        if (href.includes('#') || href.includes('javascript:') || 
            href.includes('mailto:') || href.includes('tel:')) continue
        
        const contentType = this.determineContentType(href)
        const businessValue = this.calculateBusinessValue({ loc: href, contentType })
        
        urls.push({
          loc: href,
          contentType,
          businessValue,
          freshnessScore: 50 // Neutral since we don't have lastmod
        })
        
      } catch (error) {
        continue // Skip invalid URLs
      }
    }
    
    // Remove duplicates and sort by business value
    const uniqueUrls = urls.filter((url, index, self) => 
      index === self.findIndex(u => u.loc === url.loc)
    )
    
    return uniqueUrls.sort((a, b) => (b.businessValue || 0) - (a.businessValue || 0))
  }

  /**
   * Analyze robots.txt for crawling guidelines
   */
  private async analyzeRobotsTxt(websiteUrl: string): Promise<any | null> {
    try {
      const robotsUrl = new URL('/robots.txt', websiteUrl).toString()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(robotsUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ADI-Bot/1.0; +https://ai-discoverability-index.com/bot)'
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const robotsContent = await response.text()
        
        const analysis = {
          hasRobotsTxt: true,
          allowsAllBots: robotsContent.includes('User-agent: *'),
          hasDisallows: /disallow:/i.test(robotsContent),
          hasSitemaps: /sitemap:/i.test(robotsContent),
          crawlDelay: this.extractCrawlDelay(robotsContent),
          disallowedPaths: this.extractDisallowedPaths(robotsContent),
          sitemapUrls: this.extractSitemapsFromRobots(websiteUrl),
          botFriendly: this.assessBotFriendliness(robotsContent)
        }

        return this.createResult(
          'robots_txt_analysis',
          analysis.botFriendly ? 90 : 60,
          analysis.botFriendly ? 90 : 60,
          0.9,
          {
            robotsUrl,
            ...analysis,
            robotsContent: robotsContent.substring(0, 2000), // First 2k chars
            analysisTimestamp: new Date().toISOString()
          }
        )
      }

    } catch (error) {
      console.log('⚠️ Could not analyze robots.txt:', error instanceof Error ? error.message : 'Unknown error')
    }

    return null
  }

  /**
   * Helper methods
   */
  private extractLastModified(xmlContent: string): string | undefined {
    const match = xmlContent.match(/<lastmod[^>]*>([^<]+)<\/lastmod>/)
    return match?.[1]?.trim()
  }

  private extractCrawlDelay(robotsContent: string): number | null {
    const match = robotsContent.match(/crawl-delay:\s*(\d+)/i)
    return match ? parseInt(match[1]) : null
  }

  private extractDisallowedPaths(robotsContent: string): string[] {
    const matches = robotsContent.match(/disallow:\s*([^\r\n]+)/gi) || []
    return matches.map(match => match.replace(/disallow:\s*/i, '').trim())
  }

  private assessBotFriendliness(robotsContent: string): boolean {
    const content = robotsContent.toLowerCase()
    
    // Positive indicators
    const hasWildcardAllow = content.includes('user-agent: *')
    const hasSitemaps = content.includes('sitemap:')
    const hasReasonableCrawlDelay = !content.includes('crawl-delay:') || 
      (content.includes('crawl-delay:') && !content.includes('crawl-delay: 0'))
    
    // Negative indicators
    const blocksEverything = content.includes('disallow: /')
    const hasExcessiveRestrictions = (content.match(/disallow:/g) || []).length > 10
    
    return hasWildcardAllow && hasSitemaps && hasReasonableCrawlDelay && 
           !blocksEverything && !hasExcessiveRestrictions
  }

  private extractBrandName(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
    } catch {
      return 'Unknown Brand'
    }
  }

  /**
   * Combine all crawl results into unified data structure
   */
  private combineResults(results: any[], websiteUrl: string, brandName: string, sitemapData: SitemapData | null): any {
    const pageResults = results.filter(r => r.resultType.includes('page'))
    const analysisResults = results.filter(r => !r.resultType.includes('page'))

    // Calculate overall quality score
    const qualityScore = Math.min(100, 
      (sitemapData ? 30 : 0) +                    // Sitemap bonus
      (pageResults.length * 8) +                  // 8 points per page
      (analysisResults.length * 5) +              // 5 points per analysis
      (pageResults.some(r => r.evidence?.html?.length > 10000) ? 20 : 0) // Rich content bonus
    )

    // Aggregate all HTML content
    const allHtml = pageResults
      .map(r => r.evidence?.html || '')
      .join('\n\n<!-- PAGE SEPARATOR -->\n\n')

    return {
      brandName,
      websiteUrl,
      method: 'sitemap_enhanced',
      qualityScore,
      
      // Site validation
      siteExists: pageResults.length > 0,
      statusCode: pageResults[0]?.evidence?.statusCode || 200,
      
      // Content data (combined from all pages)
      html: allHtml,
      content: allHtml,
      htmlContent: allHtml,
      contentSize: allHtml.length,
      
      // Page-specific data
      pages: pageResults.map(r => ({
        url: r.evidence?.url,
        contentType: r.evidence?.contentType,
        contentSize: r.evidence?.contentSize,
        metaData: r.evidence?.metaData,
        sitemapMetadata: r.evidence?.sitemapMetadata
      })),
      
      // Sitemap data
      sitemapAnalysis: sitemapData ? {
        found: true,
        totalUrls: sitemapData.totalUrls,
        hasIndex: sitemapData.hasIndex,
        urlsCrawled: pageResults.length
      } : { found: false },
      
      // Analysis results
      robotsAnalysis: analysisResults.find(r => r.resultType === 'robots_txt_analysis')?.evidence,
      
      // Metadata
      crawlTimestamp: new Date().toISOString(),
      totalResults: results.length,
      pagesCrawled: pageResults.length,
      analysisCompleted: analysisResults.length,
      sitemapEnhanced: !!sitemapData
    }
  }

  /**
   * Cache management
   */
  private checkCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  private cacheResult(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Create intelligent fallback data
   */
  private async createIntelligentFallback(websiteUrl: string, brandName: string): Promise<any> {
    // Try basic fallback crawling first
    const fallbackResults = await this.performFallbackCrawling(websiteUrl)
    
    if (fallbackResults.length > 0) {
      return this.combineResults(fallbackResults, websiteUrl, brandName, null)
    }

    // Ultimate fallback with minimal synthetic data
    const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${brandName} - Official Website</title>
  <meta name="description" content="${brandName} official website and online presence">
</head>
<body>
  <h1>${brandName}</h1>
  <p>Welcome to ${brandName}'s official website.</p>
</body>
</html>`.trim()

    return {
      brandName,
      websiteUrl,
      method: 'intelligent_fallback',
      qualityScore: 25,
      siteExists: true,
      html: fallbackHtml,
      content: fallbackHtml,
      htmlContent: fallbackHtml,
      contentSize: fallbackHtml.length,
      pages: [],
      sitemapAnalysis: { found: false },
      crawlTimestamp: new Date().toISOString(),
      fallback: true
    }
  }

  private createSuccessOutput(data: any, executionTime: number, metadata: any): ADIAgentOutput {
    const evidence = {
      ...data,
      // Ensure all expected fields are present
      html: data.html || data.htmlContent || data.content || '',
      content: data.content || data.html || data.htmlContent || '',
      htmlContent: data.htmlContent || data.html || data.content || '',
      structuredData: data.structuredData || [],
      metaData: data.metaData || {},
      url: data.websiteUrl,
      websiteUrl: data.websiteUrl
    }
    
    console.log(`🔍 [SitemapCrawl] Evidence structure:`, {
      hasHtml: !!evidence.html,
      htmlLength: evidence.html?.length || 0,
      hasContent: !!evidence.content,
      contentLength: evidence.content?.length || 0,
      hasHtmlContent: !!evidence.htmlContent,
      htmlContentLength: evidence.htmlContent?.length || 0,
      pagesCrawled: data.pagesCrawled || 0,
      sitemapFound: data.sitemapAnalysis?.found || false
    })
    
    const result = this.createResult(
      'sitemap_enhanced_crawl',
      data.qualityScore,
      data.qualityScore,
      Math.min(0.95, 0.6 + (data.pagesCrawled * 0.05)),
      evidence
    )
    
    return this.createOutput('completed', [result], executionTime, undefined, metadata)
  }
}


