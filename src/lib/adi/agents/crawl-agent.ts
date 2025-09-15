import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Crawl Agent - Extracts website content and structured data
 * Foundation agent that provides data for all other agents
 */
export class CrawlAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'crawl_agent',
      version: 'v1.0',
      description: 'Extracts live website HTML, schema, policies, and content for analysis',
      dependencies: [], // No dependencies - foundation agent
      timeout: 45000, // 45 seconds for comprehensive crawling
      retryLimit: 3,
      parallelizable: false // Sequential crawling to avoid rate limiting
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Crawl Agent for ${input.context.websiteUrl}`)

      const results = []
      const websiteUrl = input.context.websiteUrl

      // 1. Main page crawl
      const mainPageResult = await this.crawlPage(websiteUrl, 'homepage')
      results.push(mainPageResult)

      // 2. Discover and crawl key pages
      const discoveredPages = await this.discoverKeyPages(websiteUrl, mainPageResult.evidence.content)
      
      for (const pageUrl of discoveredPages.slice(0, 5)) { // Limit to 5 additional pages
        const pageResult = await this.crawlPage(pageUrl, 'discovered_page')
        results.push(pageResult)
      }

      // 3. Extract sitemap if available
      const sitemapResult = await this.extractSitemap(websiteUrl)
      if (sitemapResult) {
        results.push(sitemapResult)
      }

      // 4. Check robots.txt
      const robotsResult = await this.checkRobotsTxt(websiteUrl)
      if (robotsResult) {
        results.push(robotsResult)
      }

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        totalPagesCrawled: results.filter(r => r.resultType.includes('page')).length,
        websiteUrl,
        crawlTimestamp: new Date().toISOString(),
        discoveredPages: discoveredPages.length
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Crawl Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown crawling error'
      )
    }
  }

  private async crawlPage(url: string, pageType: string): Promise<any> {
    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url)
      
      // Fetch page content with timeout
      const response = await this.fetchWithTimeout(normalizedUrl, 15000)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const contentSize = html.length

      // Extract structured data
      const structuredData = this.extractStructuredData(html)
      
      // Extract meta information
      const metaData = this.extractMetaData(html)
      
      // Extract content sections
      const contentSections = this.extractContentSections(html)
      
      // Calculate content quality metrics
      const contentMetrics = this.calculateContentMetrics(html)

      return this.createResult(
        `${pageType}_crawl`,
        contentMetrics.qualityScore,
        this.normalizeScore(contentMetrics.qualityScore, 0, 100, 0, 100),
        0.9, // High confidence for successful crawl
        {
          url: normalizedUrl,
          contentSize,
          structuredData,
          metaData,
          contentSections,
          contentMetrics,
          crawlTimestamp: new Date().toISOString(),
          content: html.substring(0, 10000) // Store first 10k chars for analysis
        }
      )

    } catch (error) {
      console.warn(`Failed to crawl ${url}:`, error)
      
      return this.createResult(
        `${pageType}_crawl_failed`,
        0,
        0,
        0.1,
        {
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          crawlTimestamp: new Date().toISOString()
        }
      )
    }
  }

  private async discoverKeyPages(baseUrl: string, html: string): Promise<string[]> {
    const discoveredPages: string[] = []
    const baseUrlObj = new URL(baseUrl)
    
    // Common important page patterns
    const importantPagePatterns = [
      /href=["']([^"']*(?:about|contact|products?|services?|faq|help|support|shipping|returns?|policy|policies)[^"']*)["']/gi,
      /href=["']([^"']*\/(?:about|contact|products?|services?|faq|help|support|shipping|returns?|policy|policies)(?:\/|$)[^"']*)["']/gi
    ]

    for (const pattern of importantPagePatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        try {
          const href = match[1]
          const fullUrl = new URL(href, baseUrl).toString()
          
          // Only include pages from same domain
          if (new URL(fullUrl).hostname === baseUrlObj.hostname) {
            discoveredPages.push(fullUrl)
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }
    }

    // Remove duplicates and limit
    return [...new Set(discoveredPages)].slice(0, 10)
  }

  private async extractSitemap(baseUrl: string): Promise<any | null> {
    try {
      const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString()
      const response = await this.fetchWithTimeout(sitemapUrl, 10000)
      
      if (response.ok) {
        const sitemapContent = await response.text()
        const urlCount = (sitemapContent.match(/<loc>/g) || []).length
        
        return this.createResult(
          'sitemap_analysis',
          urlCount > 0 ? 100 : 0,
          urlCount > 0 ? 100 : 0,
          0.9,
          {
            sitemapUrl,
            urlCount,
            sitemapSize: sitemapContent.length,
            hasSitemap: true
          }
        )
      }
    } catch (error) {
      // Sitemap not found or inaccessible
    }

    return this.createResult(
      'sitemap_analysis',
      0,
      0,
      0.8,
      {
        hasSitemap: false,
        error: 'Sitemap not found or inaccessible'
      }
    )
  }

  private async checkRobotsTxt(baseUrl: string): Promise<any | null> {
    try {
      const robotsUrl = new URL('/robots.txt', baseUrl).toString()
      const response = await this.fetchWithTimeout(robotsUrl, 5000)
      
      if (response.ok) {
        const robotsContent = await response.text()
        const hasDisallows = /disallow:/i.test(robotsContent)
        const hasSitemap = /sitemap:/i.test(robotsContent)
        
        return this.createResult(
          'robots_txt_analysis',
          hasSitemap ? 100 : 50,
          hasSitemap ? 100 : 50,
          0.9,
          {
            robotsUrl,
            hasRobotsTxt: true,
            hasDisallows,
            hasSitemap,
            content: robotsContent
          }
        )
      }
    } catch (error) {
      // robots.txt not found
    }

    return this.createResult(
      'robots_txt_analysis',
      25,
      25,
      0.8,
      {
        hasRobotsTxt: false,
        error: 'robots.txt not found'
      }
    )
  }

  private extractStructuredData(html: string): any[] {
    const structuredData: any[] = []
    
    // Extract JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          const parsed = JSON.parse(jsonContent)
          if (Array.isArray(parsed)) {
            structuredData.push(...parsed)
          } else {
            structuredData.push(parsed)
          }
        } catch (error) {
          console.warn('Failed to parse JSON-LD:', error)
        }
      }
    }

    // Extract microdata (basic implementation)
    const microdataMatches = html.match(/itemtype=["']([^"']+)["']/gi)
    if (microdataMatches) {
      const microdataTypes = microdataMatches.map(match => 
        match.replace(/itemtype=["']|["']/gi, '')
      )
      structuredData.push({
        '@type': 'MicrodataCollection',
        types: [...new Set(microdataTypes)]
      })
    }

    return structuredData
  }

  private extractMetaData(html: string): Record<string, any> {
    const metaData: Record<string, any> = {}
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    if (titleMatch) {
      metaData.title = titleMatch[1].trim()
    }

    // Extract meta tags
    const metaMatches = html.match(/<meta[^>]+>/gi) || []
    for (const metaTag of metaMatches) {
      const nameMatch = metaTag.match(/name=["']([^"']+)["']/i)
      const propertyMatch = metaTag.match(/property=["']([^"']+)["']/i)
      const contentMatch = metaTag.match(/content=["']([^"']+)["']/i)
      
      if (contentMatch) {
        const key = nameMatch?.[1] || propertyMatch?.[1]
        if (key) {
          metaData[key] = contentMatch[1]
        }
      }
    }

    return metaData
  }

  private extractContentSections(html: string): Record<string, any> {
    // Remove script and style tags
    const cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
                         .replace(/<style[^>]*>.*?<\/style>/gis, '')

    // Extract text content
    const textContent = cleanHtml.replace(/<[^>]+>/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim()

    // Extract headings
    const headings = []
    const headingMatches = cleanHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || []
    for (const heading of headingMatches) {
      const level = heading.match(/h([1-6])/i)?.[1]
      const text = heading.replace(/<[^>]+>/g, '').trim()
      if (text) {
        headings.push({ level: parseInt(level || '1'), text })
      }
    }

    // Extract navigation
    const navMatches = cleanHtml.match(/<nav[^>]*>(.*?)<\/nav>/gis) || []
    const navigation = navMatches.map(nav => 
      nav.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    )

    return {
      textContent: textContent.substring(0, 5000), // First 5k chars
      headings,
      navigation,
      wordCount: textContent.split(/\s+/).length,
      hasNavigation: navigation.length > 0
    }
  }

  private calculateContentMetrics(html: string): {
    qualityScore: number
    readabilityScore: number
    structureScore: number
    accessibilityScore: number
  } {
    // Content quality heuristics
    const hasTitle = /<title[^>]*>/.test(html)
    const hasMetaDescription = /name=["']description["']/i.test(html)
    const hasHeadings = /<h[1-6]/i.test(html)
    const hasStructuredData = /application\/ld\+json|itemtype=/i.test(html)
    const hasImages = /<img/i.test(html)
    const hasAltText = /alt=["'][^"']+["']/i.test(html)
    
    // Calculate scores
    const structureScore = [hasTitle, hasMetaDescription, hasHeadings].filter(Boolean).length * 33.33
    const accessibilityScore = [hasAltText, hasHeadings, hasTitle].filter(Boolean).length * 33.33
    const readabilityScore = this.calculateReadabilityScore(html)
    
    const qualityScore = (structureScore + accessibilityScore + readabilityScore) / 3

    return {
      qualityScore: Math.round(qualityScore),
      readabilityScore: Math.round(readabilityScore),
      structureScore: Math.round(structureScore),
      accessibilityScore: Math.round(accessibilityScore)
    }
  }

  private calculateReadabilityScore(html: string): number {
    // Extract text content
    const textContent = html.replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim()

    if (!textContent) return 0

    // Basic readability metrics
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = textContent.split(/\s+/).filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
    
    // Readability score (simplified Flesch-like calculation)
    // Optimal: 15-20 words per sentence
    let readabilityScore = 100
    if (avgWordsPerSentence > 25) {
      readabilityScore -= (avgWordsPerSentence - 25) * 2
    } else if (avgWordsPerSentence < 8) {
      readabilityScore -= (8 - avgWordsPerSentence) * 3
    }

    return Math.max(0, Math.min(100, readabilityScore))
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      // Ensure https if no protocol specified
      if (urlObj.protocol === 'http:' && !url.startsWith('http://localhost')) {
        urlObj.protocol = 'https:'
      }
      return urlObj.toString()
    } catch (error) {
      // If URL parsing fails, try adding https://
      if (!url.startsWith('http')) {
        return `https://${url}`
      }
      return url
    }
  }

  private async fetchWithTimeout(url: string, timeout: number = 15000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ADI-Crawler/1.0 (AI Discoverability Index)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}