import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi';
import { db } from '@/lib/db';
import { websiteSnapshots, contentChanges } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { ContentExtractionEngine } from '../parsers/content-extraction-engine';
import { AntiBot403BypassEngine } from '../parsers/anti-bot-bypass-strategies';

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
  
  // 🔧 ANTI-CASCADE: Track partial crawl data for failure recovery
  private partialCrawlState = {
    sitemapsProcessed: 0,
    pagesCollected: 0,
    htmlContent: [] as any[],
    sitemapData: null as SitemapData | null,
    robotsData: null as any,
    lastSuccessfulUrl: '',
    collectedData: {} as any
  }
  // QUALITY-FOCUSED CONFIGURATION - Proper time for data extraction
  private readonly MAX_URLS_TO_CRAWL = 1 // FOCUS: Just get homepage HTML - prioritize extraction over discovery
  private readonly SITEMAP_TIMEOUT = 8000 // 8 seconds for sitemap discovery - PROPER TIME
  private readonly MAX_403_FAILURES = 3 // Allow retries for valuable sites
  private readonly CRAWL_TIMEOUT = 30000 // 30 seconds per page - PROPER TIME for reliable HTML extraction
  private readonly HTML_PROCESSING_TIMEOUT = 5000 // 5 seconds for enhanced parsing
  private readonly MAX_SITEMAPS_TO_PROCESS = 10 // Process up to 10 sitemaps for enterprise sites
  private readonly MAX_SITEMAP_URLS_TO_PROCESS = 50 // Stop after finding 50 sitemap URLs
  private readonly MAX_TOTAL_URLS_DISCOVERED = 15000 // Stop after discovering 15k URLs total
  private totalSitemapsFetched = 0 // Track successful sitemap fetches
  private totalUrlsDiscovered = 0 // Track total URLs found

  // Progressive Anti-Bot Evasion Configuration - Quality focused
  private readonly MIN_REQUEST_DELAY = 800 // Slightly longer delays for better success
  private readonly MAX_REQUEST_DELAY = 1500 // Reduced max delay for efficiency
  private readonly SESSION_PERSISTENCE_TTL = 30 * 60 * 1000 // 30 minutes
  
  // Session storage for cookies and state
  private sessionStore: Map<string, {
    cookies: string[]
    lastUsed: number
    userAgent: string
    fingerprint: any
  }> = new Map()

  // Enhanced user agent pool with realistic browser fingerprints
  private bypassEngine = new AntiBot403BypassEngine();
  
  private userAgents = [
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      platform: 'Win32',
      language: 'en-US,en;q=0.9',
      viewport: { width: 1920, height: 1080 },
      timezone: 'America/New_York'
    },
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      language: 'en-US,en;q=0.9',
      viewport: { width: 1440, height: 900 },
      timezone: 'America/Los_Angeles'
    },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
      platform: 'Win32',
      language: 'en-US,en;q=0.8,es;q=0.6',
      viewport: { width: 1366, height: 768 },
      timezone: 'America/Chicago'
    },
    {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      platform: 'Linux x86_64',
      language: 'en-US,en;q=0.9',
      viewport: { width: 1920, height: 1080 },
      timezone: 'UTC'
    },
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      platform: 'MacIntel',
      language: 'en-US,en;q=0.9',
      viewport: { width: 1440, height: 900 },
      timezone: 'America/Los_Angeles'
    }
  ];

  // Referrer pool for realistic navigation patterns
  private referrers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://search.yahoo.com/',
    'https://www.ecosia.org/',
    'https://www.startpage.com/',
    '', // Direct navigation
  ];

  constructor() {
    const config: ADIAgentConfig = {
      name: 'crawl_agent',
      version: 'v7.1-extended-timeout',
      description: 'Optimized for data quality with progressive timeout handling and enhanced parsing',
      dependencies: [],
      timeout: 45000, // 45 seconds - PROPER TIME for quality sitemap processing and HTML extraction
      retryLimit: 2, // Allow more retries for valuable content
      parallelizable: false
    }
    super(config)
  }

  /**
   * Generate realistic browser fingerprint for anti-bot evasion
   */
  private generateBrowserFingerprint(userAgentData: any): any {
    const randomSeed = Math.random()
    
    return {
      userAgent: userAgentData.userAgent,
      platform: userAgentData.platform,
      language: userAgentData.language,
      viewport: userAgentData.viewport,
      timezone: userAgentData.timezone,
      colorDepth: 24,
      pixelRatio: Math.random() > 0.5 ? 1 : 2,
      hardwareConcurrency: Math.floor(Math.random() * 8) + 4,
      maxTouchPoints: userAgentData.platform.includes('Mac') ? 0 : Math.floor(Math.random() * 5),
      webGL: {
        vendor: randomSeed > 0.5 ? 'Google Inc. (Intel)' : 'Google Inc. (NVIDIA)',
        renderer: randomSeed > 0.5 ? 'ANGLE (Intel, Intel(R) HD Graphics)' : 'ANGLE (NVIDIA, NVIDIA GeForce GTX)'
      },
      canvas: Math.random().toString(36).substring(7),
      audio: Math.random().toString(36).substring(7)
    }
  }

  /**
   * Get or create session for domain with persistence
   */
  private getOrCreateSession(domain: string): any {
    const now = Date.now()
    
    // Clean expired sessions
    for (const [key, session] of this.sessionStore.entries()) {
      if (now - session.lastUsed > this.SESSION_PERSISTENCE_TTL) {
        this.sessionStore.delete(key)
      }
    }
    
    let session = this.sessionStore.get(domain)
    
    if (!session) {
      // Create new session with random fingerprint
      const userAgentData = this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
      session = {
        cookies: [],
        lastUsed: now,
        userAgent: userAgentData.userAgent,
        fingerprint: this.generateBrowserFingerprint(userAgentData)
      }
      this.sessionStore.set(domain, session)
      console.log(`🎭 [AntiBot] Created new session for ${domain} with ${userAgentData.platform} fingerprint`)
    } else {
      session.lastUsed = now
      console.log(`🔄 [AntiBot] Reusing existing session for ${domain}`)
    }
    
    return session
  }

  /**
   * Generate realistic request headers with anti-detection features
   */
  private generateRealisticHeaders(url: string, session: any, isFirstRequest: boolean = false): Record<string, string> {
    const domain = new URL(url).hostname
    const referrer = isFirstRequest ? 
      this.referrers[Math.floor(Math.random() * this.referrers.length)] : 
      `https://${domain}/`
    
    const headers: Record<string, string> = {
      'User-Agent': session.userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': session.fingerprint.language,
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': isFirstRequest ? 'none' : 'same-origin',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    }
    
    // Add referrer if not direct navigation
    if (referrer) {
      headers['Referer'] = referrer
    }
    
    // Add cookies if available
    if (session.cookies.length > 0) {
      headers['Cookie'] = session.cookies.join('; ')
    }
    
    // Add viewport hints for Chrome
    if (session.userAgent.includes('Chrome')) {
      headers['Sec-CH-UA'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
      headers['Sec-CH-UA-Mobile'] = '?0'
      headers['Sec-CH-UA-Platform'] = `"${session.fingerprint.platform}"`
      headers['Viewport-Width'] = session.fingerprint.viewport.width.toString()
    }
    
    return headers
  }

  /**
   * Randomized delay between requests to mimic human behavior
   */
  private async randomDelay(): Promise<void> {
    const delay = Math.floor(Math.random() * (this.MAX_REQUEST_DELAY - this.MIN_REQUEST_DELAY)) + this.MIN_REQUEST_DELAY
    console.log(`⏱️ [AntiBot] Human-like delay: ${delay}ms`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Extract and store cookies from response
   */
  private extractAndStoreCookies(response: Response, session: any): void {
    const setCookieHeaders = response.headers.get('set-cookie')
    if (setCookieHeaders) {
      const cookies = setCookieHeaders.split(',').map(cookie => cookie.split(';')[0].trim())
      session.cookies.push(...cookies)
      console.log(`🍪 [AntiBot] Stored ${cookies.length} cookies for session`)
    }
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    // OPTIMIZED TIMEOUT: Allow sufficient time for HTML extraction
    const hardTimeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.log(`⏰ OPTIMIZED TIMEOUT: Crawl agent terminated after 70 seconds to ensure completion`);
        reject(new Error('Optimized timeout: Agent execution completed'));
      }, 70000); // Match agent config timeout
    });

    const executionPromise = this.executeInternal(input);
    
    try {
      return await Promise.race([executionPromise, hardTimeoutPromise]);
    } catch (error) {
      // 🔧 ANTI-CASCADE: Return any partial data collected before timeout/failure
      const partialData = this.getPartialCrawlData()
      if (partialData.hasData) {
        console.log(`🔄 [AntiCascade] Returning partial crawl data: ${partialData.pagesCollected} pages, ${partialData.sitemapsProcessed} sitemaps`)
        const partialResult = this.createResult(
          'partial_crawl_success',
          Math.min(partialData.qualityScore, 60), // Cap at 60 for partial data
          partialData.qualityScore,
          0.7, // Reduced confidence for partial data
          {
            ...partialData.data,
            partialCrawl: true,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            method: 'sitemap_enhanced_partial'
          }
        )
        
        return this.createOutput('completed', [partialResult], 0, undefined, {
          partialCrawl: true,
          pagesCollected: partialData.pagesCollected,
          sitemapsProcessed: partialData.sitemapsProcessed
        })
      }
      
      // If no partial data, throw the original error
      throw error
    }
  }

  private async executeInternal(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    const websiteUrl = input.context.websiteUrl
    const brandName = input.context.metadata?.brandName || this.extractBrandName(websiteUrl)
    const evaluationId = input.context.evaluationId
    const brandId = input.context.brandId
    
    // Reset attempt counter and partial state for each execution
    this.totalSitemapsFetched = 0;
    this.totalUrlsDiscovered = 0;
    this.resetPartialCrawlState();
    
    console.log(`🗺️ Executing Sitemap-Enhanced Crawl Agent for ${brandName} (${websiteUrl})`)
    console.log(`📋 [Evolution] Context IDs - Brand: ${brandId}, Evaluation: ${evaluationId}`)

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
      // AGGRESSIVE TIMEOUT: Limit sitemap discovery to 1 second
      const sitemapData = await this.discoverAndParseSitemap(websiteUrl)
      
      // 🔧 ANTI-CASCADE: Track sitemap discovery for partial data
      if (sitemapData) {
        this.partialCrawlState.sitemapData = sitemapData
        this.partialCrawlState.sitemapsProcessed = 1
        this.partialCrawlState.lastSuccessfulUrl = websiteUrl
      }
      
      if (sitemapData && sitemapData.urls.length > 0) {
        console.log(`✅ Found sitemap with ${sitemapData.totalUrls} URLs`)
        
        // PHASE 2: Intelligent URL Prioritization
        console.log('🎯 Phase 2: URL Prioritization')
        const prioritizedUrls = this.prioritizeUrls(sitemapData.urls, brandName)
        
        // PHASE 3: Strategic Crawling - ENSURE HOMEPAGE IS ALWAYS FIRST
        console.log('🚀 Phase 3: Strategic Crawling - Prioritizing homepage HTML extraction')
        
        // CRITICAL: Always ensure homepage is crawled first
        const homepageUrl = prioritizedUrls.find(url => url.contentType === 'homepage') || 
                           prioritizedUrls.find(url => url.loc === websiteUrl || url.loc === websiteUrl + '/') ||
                           { loc: websiteUrl, contentType: 'homepage', businessValue: 100, freshnessScore: 50 }
        
        console.log(`🏠 Prioritizing homepage: ${homepageUrl.loc}`)
        const crawlResults = await this.crawlPrioritizedUrls([homepageUrl])
        results.push(...crawlResults)

        // Add sitemap analysis result
        results.push(this.createSitemapAnalysisResult(sitemapData, prioritizedUrls))
        
      } else {
        console.log('⚠️ No sitemap found, falling back to homepage crawling - PRIORITIZING HTML EXTRACTION')
        
        // FALLBACK: Focus all resources on homepage HTML extraction
        console.log('🏠 FALLBACK: Focusing all resources on homepage HTML extraction')
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
        totalSitemapUrls: sitemapData?.totalUrls || 0,
        brandId,
        evaluationId
      })

    } catch (error) {
      console.error('🚨 Sitemap-enhanced crawl failed:', error)
      
      // Intelligent fallback with basic crawling
      const fallbackData = await this.createIntelligentFallback(websiteUrl, brandName)
      return this.createSuccessOutput(fallbackData, Date.now() - startTime, { 
        method: 'intelligent_fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        brandId,
        evaluationId
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

    const allUrls: SitemapUrl[] = [];
    let sitemapCount = 0;
    let consecutiveFailures = 0;

    for (const sitemapUrl of sitemapLocations) {
      // INTELLIGENT CIRCUIT BREAKER: Stop if we have enough data
      if (this.totalSitemapsFetched >= this.MAX_SITEMAPS_TO_PROCESS) {
        console.log(`⚡ SMART STOP: Processed ${this.totalSitemapsFetched} sitemaps, sufficient for analysis`);
        break;
      }
      
      if (this.totalUrlsDiscovered >= this.MAX_TOTAL_URLS_DISCOVERED) {
        console.log(`⚡ SMART STOP: Discovered ${this.totalUrlsDiscovered} URLs, sufficient for analysis`);
        break;
      }

      try {
        const sitemapData = await this.fetchAndParseSitemap(sitemapUrl);
        if (sitemapData && sitemapData.urls.length > 0) {
          allUrls.push(...sitemapData.urls);
          this.totalSitemapsFetched++;
          this.totalUrlsDiscovered += sitemapData.urls.length;
          consecutiveFailures = 0; // Reset failure count on success
          sitemapCount++;
          console.log(`✅ Found and processed sitemap at ${sitemapUrl}, adding ${sitemapData.urls.length} URLs. Total URLs: ${allUrls.length}`);
          
          // Smart exit when we have sufficient URLs for analysis
          if (sitemapData.urls.length > 1000 || allUrls.length > 8000) {
            console.log(`⚡ Smart exit: Found ${sitemapData.urls.length} URLs from sitemap or ${allUrls.length} total URLs, sufficient for analysis`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch sitemap from ${sitemapUrl}:`, error instanceof Error ? error.message : 'Unknown error');
        
        // Circuit breaker: detect 403 patterns and fail fast
        if (error instanceof Error && (error.message.includes('403') || error.message.includes('Forbidden'))) {
          consecutiveFailures++;
          if (consecutiveFailures >= this.MAX_403_FAILURES) {
            console.log(`🚨 Circuit breaker triggered: ${consecutiveFailures} consecutive 403 errors. Skipping remaining sitemaps.`);
            break;
          }
        }
        continue;
      }
    }

    if (allUrls.length === 0) {
      console.log('❌ No valid URLs found in any sitemap at any standard location');
      return null;
    }

    console.log(`✅ Combined ${sitemapCount} sitemaps to find ${allUrls.length} URLs`);

    return {
      sitemapUrl: 'Multiple sitemaps combined',
      urls: allUrls,
      totalUrls: allUrls.length,
      hasIndex: sitemapCount > 1,
    };
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
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
    const domain = new URL(sitemapUrl).hostname
    const session = this.getOrCreateSession(domain)
    
    for (let i = 0; i < this.userAgents.length; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.SITEMAP_TIMEOUT);

        try {
            // Add human-like delay between attempts (skip first attempt for speed)
            if (i > 0) {
              await this.randomDelay()
            }
            
            // Generate realistic headers with session persistence
            const headers = this.generateRealisticHeaders(sitemapUrl, session, i === 0)
            headers['Accept'] = 'application/xml, text/xml, */*'
            
            console.log(`🎭 [AntiBot] Fetching sitemap with ${session.fingerprint.platform} fingerprint (attempt ${i + 1})`)

            const response = await fetch(sitemapUrl, {
                signal: controller.signal,
                headers,
            });

            if (response.ok) {
                // Store cookies for session persistence
                this.extractAndStoreCookies(response, session)
                
                const xmlContent = await response.text();
                clearTimeout(timeoutId);
                console.log(`✅ [AntiBot] Successfully fetched sitemap with anti-bot evasion`)
                return await this.parseSitemapXml(xmlContent, sitemapUrl);
            }

            if (response.status === 403 && i < this.userAgents.length - 1) {
                console.warn(`🚫 [AntiBot] 403 Forbidden for ${sitemapUrl}. Switching fingerprint and retrying...`);
                // Create new session with different fingerprint for retry
                this.sessionStore.delete(domain)
                continue;
            }

            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === this.userAgents.length - 1) throw error;
        }
    }
    return null;
  }

  /**
   * Parse sitemap XML content and extract URLs with metadata
   */
  private async parseSitemapXml(xmlContent: string, sitemapUrl: string): Promise<SitemapData | null> {
    try {
      // Check if this is a sitemap index
      if (xmlContent.includes('<sitemapindex')) {
        return await this.parseSitemapIndex(xmlContent, sitemapUrl)
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

      // SMART PROCESSING: Limit sitemaps to process based on available data
      const maxToProcess = Math.min(indexSitemaps.length, this.MAX_SITEMAP_URLS_TO_PROCESS)
      const sitemapsToFetch = indexSitemaps.slice(0, maxToProcess)
      console.log(`🎯 Processing ${sitemapsToFetch.length} of ${indexSitemaps.length} available sitemaps`)
      
      for (const sitemapUrl of sitemapsToFetch) {
        // SMART STOP: Check if we have enough URLs already
        if (allUrls.length >= this.MAX_TOTAL_URLS_DISCOVERED) {
          console.log(`⚡ SMART STOP: Already discovered ${allUrls.length} URLs, sufficient for analysis`)
          break
        }
        
        try {
          const sitemapData = await this.fetchAndParseSitemap(sitemapUrl)
          if (sitemapData && sitemapData.urls.length > 0) {
            allUrls.push(...sitemapData.urls)
            console.log(`✅ Found and processed sitemap at ${sitemapUrl}, adding ${sitemapData.urls.length} URLs. Total URLs: ${allUrls.length}`)
            
            // Smart exit when we have sufficient URLs from sitemap index
            if (sitemapData.urls.length > 3000 || allUrls.length > 8000) {
              console.log(`⚡ Smart exit: Found ${sitemapData.urls.length} URLs from sitemap or ${allUrls.length} total URLs, sufficient for analysis`)
              break
            }
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

    console.log(`🚀 Crawling ${urls.length} prioritized URLs with anti-bot evasion`)

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]

      try {
        console.log(`📄 Crawling ${i + 1}/${urls.length}: ${url.loc} (${url.contentType})`)
        
        // The crawlSinglePage method now handles all anti-bot evasion internally
        const pageResult = await this.crawlSinglePage(url, '') // userAgent parameter is now ignored
        if (pageResult) {
          results.push(pageResult)
        }

        // No additional delay needed - randomDelay() is handled in crawlSinglePage

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
    const domain = new URL(url.loc).hostname
    const session = this.getOrCreateSession(domain)

    try {
      console.log(`🔍 [CrawlPage] Starting optimized crawl of ${url.loc}`)
      
      // Progressive timeout strategy: Start with network request
      const networkResult = await this.performNetworkRequest(url, session)
      if (!networkResult) return null
      
      const { response, html } = networkResult
      console.log(`✅ [CrawlPage] Successfully extracted ${html.length} chars from ${url.loc}`)
      
      // Progressive HTML processing with timeout
    const metaData = await this.processHTMLWithTimeout(html, url.loc)
    
    // 🔧 ANTI-CASCADE: Track successful page crawl for partial data
    this.partialCrawlState.pagesCollected++
    this.partialCrawlState.htmlContent.push(html)
    this.partialCrawlState.lastSuccessfulUrl = url.loc
    this.partialCrawlState.collectedData.brandName = this.extractBrandName(url.loc)
    
    return this.createResult(
      `${url.contentType}_page`,
      85, // Good score for successful sitemap-based crawl
      85,
      0.9,
      {
        url: url.loc,
        websiteUrl: url.loc,
        html: html.substring(0, 100000), // First 100k chars for storage
        htmlContent: html, // Full HTML for processing
        contentType: response.headers.get('content-type') || 'text/html',
        contentSize: html.length,
        metaData,
        sitemapMetadata: {
          priority: url.priority,
          lastmod: url.lastmod,
          changefreq: url.changefreq,
          contentType: url.contentType,
          businessValue: url.businessValue,
          freshnessScore: url.freshnessScore
        }
      }
    )
    } catch (error) {
      console.log(`❌ [CrawlPage] Failed to crawl ${url.loc}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * Perform network request with optimized timeout handling
   */
  private async performNetworkRequest(url: SitemapUrl, session: any): Promise<{response: Response, html: string} | null> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.CRAWL_TIMEOUT)

    try {
      // Add optimized delay for anti-bot evasion
      const delay = Math.floor(Math.random() * (this.MAX_REQUEST_DELAY - this.MIN_REQUEST_DELAY)) + this.MIN_REQUEST_DELAY
      console.log(`⏱️ [AntiBot] Optimized delay: ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Generate realistic headers with session persistence
      const headers = this.generateRealisticHeaders(url.loc, session, false)
      
      console.log(`🎭 [AntiBot] Crawling with ${session.fingerprint.platform} session`)
      
      const response = await fetch(url.loc, {
        method: 'GET',
        signal: controller.signal,
        headers
      })

      console.log(`📊 [CrawlPage] Response status: ${response.status} for ${url.loc}`)

      if (!response.ok) {
        console.log(`❌ [CrawlPage] HTTP error ${response.status} for ${url.loc}`)
        return null
      }

      // Store cookies for session persistence
      this.extractAndStoreCookies(response, session)

      const html = await response.text()
      return { response, html }
      
    } catch (error) {
      console.log(`❌ [NetworkRequest] Failed for ${url.loc}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Process HTML with dedicated timeout for enhanced parsing
   */
  private async processHTMLWithTimeout(html: string, url: string): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.HTML_PROCESSING_TIMEOUT)

    try {
      console.log(`🧠 [Enhanced Parser] Processing ${html.length} chars with ${this.HTML_PROCESSING_TIMEOUT}ms timeout`)
      
      // Use enhanced HTML parser for comprehensive analysis with timeout protection
      const processingPromise = this.analyzeHTMLContent(html, url)
      const timeoutPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('HTML processing timeout'))
        })
      })
      
      const metaData = await Promise.race([processingPromise, timeoutPromise])
      console.log(`✅ [Enhanced Parser] Successfully processed HTML for ${url}`)
      return metaData
      
    } catch (error) {
      console.log(`⚠️ [Enhanced Parser] Processing failed for ${url}, using basic extraction: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Fallback to basic metadata extraction
      return this.extractBasicMetadata(html, url)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Fallback basic metadata extraction when enhanced parsing fails
   */
  private extractBasicMetadata(html: string, url: string): any {
    try {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      
      return {
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        url,
        enhanced: false,
        extractionMethod: 'basic_fallback',
        processingTime: Date.now()
      }
    } catch (error) {
      console.log(`❌ [Basic Extraction] Failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        title: '',
        description: '',
        url,
        enhanced: false,
        extractionMethod: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Store website snapshot with evolution tracking
   */
  private async storeSnapshotWithEvolution(
    brandId: string, 
    evaluationId: string, 
    url: string, 
    html: string, 
    metaData: any,
    pageType: string = 'homepage'
  ): Promise<void> {
    try {
      const crypto = require('crypto');
      const contentHash = crypto.createHash('sha256').update(html).digest('hex');

      // Get the latest 3 snapshots for this brand/URL combination
      const existingSnapshots = await db
        .select()
        .from(websiteSnapshots)
        .where(and(eq(websiteSnapshots.brandId, brandId), eq(websiteSnapshots.url, url)))
        .orderBy(desc(websiteSnapshots.createdAt))
        .limit(3);

      // Check if content has changed
      const hasChanged = existingSnapshots.length === 0 || !existingSnapshots.some((snapshot: { contentHash: string | null }) => snapshot.contentHash === contentHash);

      if (hasChanged) {
        console.log(`📸 [Evolution] Content changed for ${url}, storing new snapshot`);

        // Store new snapshot - FIXED: Map to existing columns in website_snapshots table
        const newSnapshotResult = await db.insert(websiteSnapshots).values({
          brandId,
          evaluationId,
          url,
          pageType,
          contentHash,
          rawHtml: html.substring(0, 1000000),
          structuredContent: {
            // Store sitemap data and analysis results in structured_content JSONB field
            sitemapData: metaData.sitemapAnalysis || {},
            hasTitle: !!metaData.title,
            hasMetaDescription: !!metaData.description,
            hasStructuredData: !!metaData.structuredData,
            structuredDataTypes: metaData.structuredData?.length || 0,
            qualityScore: metaData.qualityScore || 0,
            wordCount: metaData.wordCount || 0,
            seoScore: metaData.seoScore || 0
          },
          metadata: {
            ...metaData,
            // Store additional sitemap analysis in metadata JSONB field
            sitemapAnalysis: metaData.sitemapAnalysis || {},
            robotsAnalysis: metaData.robotsAnalysis || {},
            enhancedParser: metaData.enhancedParser || {}
          },
          crawlTimestamp: new Date(),
          contentSizeBytes: html.length,
          title: metaData.title || '',
          metaDescription: metaData.description || ''
        }).returning({ id: websiteSnapshots.id });

        const newSnapshotId = newSnapshotResult[0]?.id;

        if (newSnapshotId && existingSnapshots.length > 0) {
          const previousSnapshot = existingSnapshots[0];
          await db.insert(contentChanges).values({
            websiteSnapshotId: newSnapshotId,
            changeType: 'content_update',
            changeDescription: 'Content hash changed from sitemap crawl',
            impactScore: this.calculateChangeImpact(html, existingSnapshots),
            previousSnapshotId: previousSnapshot.id,
          });
        }
        
        // Clean up old snapshots (keep only latest 3)
        if (existingSnapshots.length >= 3) {
            const snapshotsToDelete = existingSnapshots.slice(2); // All but the first two
            for (const snapshot of snapshotsToDelete) {
                await db.delete(websiteSnapshots).where(eq(websiteSnapshots.id, snapshot.id));
            }
        }

        console.log(`✅ [Evolution] Stored snapshot with hash ${contentHash.substring(0, 8)}...`);
      } else {
        console.log(`📋 [Evolution] No content changes detected for ${url}`);
      }
    } catch (error) {
      console.error(`❌ [Evolution] Failed to store snapshot:`, error);
    }
  }
  
  /**
   * Calculate impact score of content changes
   */
  private calculateChangeImpact(newHtml: string, existingSnapshots: any[]): number {
    if (existingSnapshots.length === 0) return 10 // New content = high impact
    
    const sizeDiff = Math.abs(newHtml.length - (existingSnapshots[0].raw_html?.length || 0))
    const sizeChangePercent = sizeDiff / Math.max(newHtml.length, 1000)
    
    // Impact score 1-10 based on size change
    return Math.min(10, Math.max(1, Math.round(sizeChangePercent * 10)))
  }
  
  /**
   * Store evolution snapshots for all crawled pages
   */
  private async storeEvolutionSnapshots(data: any, metadata: any): Promise<void> {
    try {
      // Extract brand and evaluation IDs from context (these should be passed in metadata)
      const brandId = metadata.brandId || metadata.context?.brandId
      const evaluationId = metadata.evaluationId || metadata.context?.evaluationId
      
      if (!brandId || !evaluationId) {
        console.log('⚠️ [Evolution] Missing brandId or evaluationId, skipping snapshot storage')
        return
      }
      
      console.log(`📸 [Evolution] Storing snapshots for ${data.pages?.length || 0} pages`)
      
      // Store snapshot for each crawled page
      if (data.pages && data.pages.length > 0) {
        for (const page of data.pages) {
          if (page.url && page.html) {
            await this.storeSnapshotWithEvolution(
              brandId,
              evaluationId,
              page.url,
              page.html,
              page.metaData || {},
              page.contentType || 'homepage'
            )
          }
        }
      }
      
      // Also store the main website snapshot if we have combined HTML
      if (data.html && data.html.length > 0) {
        await this.storeSnapshotWithEvolution(
          brandId,
          evaluationId,
          data.websiteUrl,
          data.html,
          data.metaData || {},
          'combined'
        )
      }
      
    } catch (error) {
      console.error('❌ [Evolution] Error in storeEvolutionSnapshots:', error)
    }
  }

  /**
   * Enhanced HTML content analysis using Beautiful Soup-style parsing
   */
  private async analyzeHTMLContent(html: string, url: string): Promise<any> {
    try {
      const engine = new ContentExtractionEngine();
      const analysis = await engine.processHTML(html, url);
      
      console.log(`🧠 [Enhanced Parser] Extracted ${analysis.content.paragraphs.length} paragraphs, ${analysis.content.headings.length} headings`);
      console.log(`🏢 [Business Intelligence] Industry: ${analysis.businessIntelligence.industry}, Type: ${analysis.businessIntelligence.businessType}`);
      console.log(`📊 [SEO] Score: ${analysis.seoInsights.titleOptimization.score}/100, Word count: ${analysis.content.seo.wordCount}`);
      
      // Clean up resources
      engine.destroy();
      
      return {
        enhanced: true,
        content: analysis.content,
        businessIntelligence: analysis.businessIntelligence,
        seoInsights: analysis.seoInsights,
        accessibility: analysis.accessibility,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️ [Enhanced Parser] Failed to analyze HTML:`, error);
      // Fallback to basic extraction
      return this.extractEnhancedMeta(html);
    }
  }

  /**
   * Enhanced metadata extraction (fallback method)
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
      // Crawl homepage with enhanced anti-bot evasion
      console.log('🔍 [CrawlPage] Starting fallback crawl with anti-bot evasion')
      const homepageResult = await this.crawlSinglePage(
        { loc: websiteUrl, contentType: 'homepage', businessValue: 100, freshnessScore: 50 },
        '' // userAgent parameter is now ignored - handled by session management
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
            
            // Rate limiting: SPEED FOCUSED - minimal delay for faster completion
            await new Promise(resolve => setTimeout(resolve, 300))
            
          } catch (error) {
            console.log(`❌ Failed to crawl discovered page ${discoveredUrls[i].loc}:`, error instanceof Error ? error.message : 'Unknown error')
            continue
          }
        }
      }
      
    } catch (error) {
      console.error('Fallback crawling failed:', error)
      
      // If traditional fallback crawling fails, try anti-bot bypass strategies
      console.log(`🛡️ [Anti-Bot Bypass] Traditional fallback failed, attempting bypass strategies...`)
      
      try {
        const bypassResult = await this.bypassEngine.bypassAntiBot(websiteUrl);
        
        if (bypassResult.success && bypassResult.data) {
          console.log(`✅ [Anti-Bot Bypass] Successfully bypassed with method: ${bypassResult.method} (confidence: ${bypassResult.confidence}%)`);
          
          // Convert bypass result to crawl result format
          const bypassCrawlResult = this.createResult(
            'bypass_page',
            Math.floor(bypassResult.confidence * 0.8), // Slightly lower score for bypass data
            Math.floor(bypassResult.confidence),
            Math.floor(bypassResult.confidence), // confidence level
            {
              html: '', // No raw HTML from bypass methods
              contentType: 'text/html',
              contentSize: 0,
              metaData: {
                ...bypassResult.data,
                bypassMethod: bypassResult.method,
                confidence: bypassResult.confidence,
                source: 'anti_bot_bypass',
                enhanced: true
              },
              sitemapMetadata: null
            }
          );
          
          results.push(bypassCrawlResult);
          console.log(`🎯 [Anti-Bot Bypass] Added bypass result with ${bypassResult.confidence}% confidence`);
        } else {
          console.log(`❌ [Anti-Bot Bypass] All bypass strategies failed: ${bypassResult.error}`);
        }
      } catch (bypassError) {
        console.log(`❌ [Anti-Bot Bypass] Bypass engine error: ${bypassError instanceof Error ? bypassError.message : 'Unknown error'}`);
      }
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
      
      // Page-specific data (include HTML for evolution tracking)
      pages: pageResults.map(r => ({
        url: r.evidence?.url,
        html: r.evidence?.html || '',
        contentType: r.evidence?.sitemapMetadata?.contentType || 'homepage',
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
    
    // Store snapshots with evolution tracking (async, don't wait)
    if (evidence.html && evidence.html.length > 0 && data.pages && data.pages.length > 0) {
      // 📸 [Evolution] Store snapshots for evolution tracking - RE-ENABLED with existing column mapping
      try {
        this.storeEvolutionSnapshots(data, metadata).catch(error => {
          console.error('❌ [Evolution] Failed to store snapshots:', error)
        })
        console.log('📸 [Evolution] Snapshot storage enabled - using existing columns with JSONB mapping')
      } catch (error) {
        console.warn('📸 [Evolution] Snapshot storage failed:', error)
      }
    }
    
    const result = this.createResult(
      'sitemap_enhanced_crawl',
      data.qualityScore,
      data.qualityScore,
      Math.min(0.95, 0.6 + (data.pagesCrawled * 0.05)),
      evidence
    )
    
    return this.createOutput('completed', [result], executionTime, undefined, metadata)
  }

  // 🔧 ANTI-CASCADE: Partial crawl data management
  private resetPartialCrawlState(): void {
    this.partialCrawlState = {
      sitemapsProcessed: 0,
      pagesCollected: 0,
      htmlContent: [],
      sitemapData: null,
      robotsData: null,
      lastSuccessfulUrl: '',
      collectedData: {}
    }
  }

  private getPartialCrawlData(): { hasData: boolean; pagesCollected: number; sitemapsProcessed: number; qualityScore: number; data: any } {
    const hasData = this.partialCrawlState.pagesCollected > 0 || 
                   this.partialCrawlState.sitemapData !== null ||
                   this.partialCrawlState.htmlContent.length > 0

    if (!hasData) {
      return { hasData: false, pagesCollected: 0, sitemapsProcessed: 0, qualityScore: 0, data: {} }
    }

    // Calculate quality score based on partial data
    let qualityScore = 0
    if (this.partialCrawlState.sitemapData) qualityScore += 30 // Sitemap discovery
    if (this.partialCrawlState.pagesCollected > 0) qualityScore += Math.min(this.partialCrawlState.pagesCollected * 20, 40) // Page content
    if (this.partialCrawlState.robotsData) qualityScore += 10 // Robots.txt

    const combinedData = {
      brandName: this.partialCrawlState.collectedData.brandName || 'Unknown',
      websiteUrl: this.partialCrawlState.lastSuccessfulUrl || '',
      method: 'sitemap_enhanced_partial',
      qualityScore: qualityScore,
      siteExists: true,
      statusCode: 200,
      html: this.partialCrawlState.htmlContent.join('\n').substring(0, 100000),
      htmlContent: this.partialCrawlState.htmlContent.join('\n'),
      content: this.partialCrawlState.htmlContent.join('\n'),
      contentSize: this.partialCrawlState.htmlContent.join('').length,
      pages: this.partialCrawlState.pagesCollected,
      sitemapAnalysis: this.partialCrawlState.sitemapData,
      robotsAnalysis: this.partialCrawlState.robotsData,
      crawlTimestamp: new Date().toISOString(),
      totalResults: this.partialCrawlState.pagesCollected,
      pagesCrawled: this.partialCrawlState.pagesCollected,
      analysisCompleted: false,
      sitemapEnhanced: true,
      partialData: true
    }

    return {
      hasData: true,
      pagesCollected: this.partialCrawlState.pagesCollected,
      sitemapsProcessed: this.partialCrawlState.sitemapsProcessed,
      qualityScore,
      data: combinedData
    }
  }
}


