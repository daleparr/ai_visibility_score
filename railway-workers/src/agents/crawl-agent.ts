import puppeteer, { Browser, Page } from 'puppeteer'
import { createLogger } from '../utils/logger'
import { AgentContext, AgentExecutionError } from '../types'

const logger = createLogger('crawl-agent')

interface CrawlResult {
  agentName: string
  status: 'completed' | 'failed'
  results: Array<{
    resultType: string
    rawValue: any
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }>
  executionTime: number
  metadata: Record<string, any>
}

export class CrawlAgent {
  private browser: Browser | null = null
  private readonly maxPages = 10
  private readonly timeout = 30000 // 30 seconds per page
  private readonly maxConcurrency = 3

  async execute(context: AgentContext): Promise<CrawlResult> {
    const startTime = Date.now()
    const { evaluationId, websiteUrl, tier } = context

    logger.info('Starting crawl agent execution', {
      evaluationId,
      websiteUrl,
      tier
    })

    try {
      // Initialize browser
      await this.initializeBrowser()

      // Determine crawl scope based on tier
      const crawlScope = this.getCrawlScope(tier)
      
      // Perform the crawl
      const crawlResults = await this.crawlWebsite(websiteUrl, crawlScope)
      
      // Process and analyze results
      const analysis = await this.analyzeContent(crawlResults, websiteUrl)
      
      const executionTime = Date.now() - startTime

      logger.info('Crawl agent execution completed', {
        evaluationId,
        websiteUrl,
        pagesAnalyzed: crawlResults.pages.length,
        executionTime
      })

      return {
        agentName: 'crawl_agent',
        status: 'completed',
        results: [
          {
            resultType: 'website_content_analysis',
            rawValue: analysis.contentScore,
            normalizedScore: analysis.contentScore,
            confidenceLevel: analysis.confidence,
            evidence: {
              websiteUrl,
              pagesAnalyzed: crawlResults.pages.length,
              totalContent: crawlResults.totalContent,
              contentTypes: crawlResults.contentTypes,
              technicalMetrics: crawlResults.technicalMetrics,
              reasoning: analysis.reasoning,
              crawlScope: crawlScope.description
            }
          }
        ],
        executionTime,
        metadata: {
          railwayExecution: true,
          tier,
          crawlScope,
          pagesAnalyzed: crawlResults.pages.length,
          completedAt: new Date().toISOString()
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      
      logger.error('Crawl agent execution failed', {
        evaluationId,
        websiteUrl,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      })

      throw new AgentExecutionError(
        'crawl_agent',
        `Website crawling failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          context,
          executionTime,
          websiteUrl,
          originalError: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      )
    } finally {
      await this.cleanup()
    }
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      })

      logger.debug('Browser initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize browser', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private getCrawlScope(tier: string) {
    switch (tier) {
      case 'enterprise':
        return {
          maxPages: 20,
          maxDepth: 3,
          includeSubdomains: true,
          analyzeImages: true,
          analyzeScripts: true,
          description: 'Comprehensive crawl with subdomain analysis'
        }
      case 'index-pro':
        return {
          maxPages: 10,
          maxDepth: 2,
          includeSubdomains: false,
          analyzeImages: true,
          analyzeScripts: false,
          description: 'Professional crawl with image analysis'
        }
      default: // free
        return {
          maxPages: 5,
          maxDepth: 1,
          includeSubdomains: false,
          analyzeImages: false,
          analyzeScripts: false,
          description: 'Basic crawl of main pages'
        }
    }
  }

  private async crawlWebsite(websiteUrl: string, scope: any) {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const results = {
      pages: [] as any[],
      totalContent: 0,
      contentTypes: new Set<string>(),
      technicalMetrics: {
        averageLoadTime: 0,
        totalRequests: 0,
        errorPages: 0,
        redirects: 0
      }
    }

    const visitedUrls = new Set<string>()
    const urlsToVisit = [websiteUrl]
    let pagesProcessed = 0

    while (urlsToVisit.length > 0 && pagesProcessed < scope.maxPages) {
      const currentUrl = urlsToVisit.shift()!
      
      if (visitedUrls.has(currentUrl)) {
        continue
      }

      try {
        const pageResult = await this.crawlPage(currentUrl)
        
        visitedUrls.add(currentUrl)
        results.pages.push(pageResult)
        results.totalContent += pageResult.contentLength
        
        // Add content types
        pageResult.contentTypes.forEach(type => results.contentTypes.add(type))
        
        // Update technical metrics
        results.technicalMetrics.averageLoadTime += pageResult.loadTime
        results.technicalMetrics.totalRequests += pageResult.requestCount
        if (pageResult.statusCode >= 400) {
          results.technicalMetrics.errorPages++
        }
        if (pageResult.statusCode >= 300 && pageResult.statusCode < 400) {
          results.technicalMetrics.redirects++
        }

        // Extract new URLs to visit (if within scope)
        if (pagesProcessed < scope.maxDepth) {
          const newUrls = this.extractUrls(pageResult.html, websiteUrl, scope.includeSubdomains)
          newUrls.forEach(url => {
            if (!visitedUrls.has(url) && !urlsToVisit.includes(url)) {
              urlsToVisit.push(url)
            }
          })
        }

        pagesProcessed++
        
      } catch (error) {
        logger.warn('Failed to crawl page', {
          url: currentUrl,
          error: error instanceof Error ? error.message : String(error)
        })
        
        results.technicalMetrics.errorPages++
        pagesProcessed++
      }
    }

    // Calculate averages
    if (results.pages.length > 0) {
      results.technicalMetrics.averageLoadTime /= results.pages.length
    }

    return results
  }

  private async crawlPage(url: string) {
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()
    const startTime = Date.now()

    try {
      // Set up request interception for metrics
      let requestCount = 0
      await page.setRequestInterception(true)
      page.on('request', (request) => {
        requestCount++
        request.continue()
      })

      // Navigate to page
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.timeout
      })

      const loadTime = Date.now() - startTime
      const statusCode = response?.status() || 0

      // Extract page content
      const content = await page.evaluate(() => {
        return {
          title: document.title,
          html: document.documentElement.outerHTML,
          text: document.body?.innerText || '',
          meta: Array.from(document.querySelectorAll('meta')).map(meta => ({
            name: meta.getAttribute('name'),
            property: meta.getAttribute('property'),
            content: meta.getAttribute('content')
          })),
          links: Array.from(document.querySelectorAll('a[href]')).map(a => 
            (a as HTMLAnchorElement).href
          ),
          images: Array.from(document.querySelectorAll('img[src]')).map(img => 
            (img as HTMLImageElement).src
          ),
          scripts: Array.from(document.querySelectorAll('script[src]')).map(script => 
            (script as HTMLScriptElement).src
          )
        }
      })

      // Analyze content types
      const contentTypes = new Set<string>()
      if (content.text.length > 0) contentTypes.add('text')
      if (content.images.length > 0) contentTypes.add('images')
      if (content.scripts.length > 0) contentTypes.add('scripts')
      if (content.links.length > 0) contentTypes.add('links')

      return {
        url,
        statusCode,
        loadTime,
        requestCount,
        title: content.title,
        html: content.html,
        text: content.text,
        contentLength: content.text.length,
        meta: content.meta,
        links: content.links,
        images: content.images,
        scripts: content.scripts,
        contentTypes: Array.from(contentTypes)
      }

    } finally {
      await page.close()
    }
  }

  private extractUrls(html: string, baseUrl: string, includeSubdomains: boolean): string[] {
    const urls: string[] = []
    const baseUrlObj = new URL(baseUrl)
    
    // Simple regex to extract href attributes
    const hrefRegex = /href=["']([^"']+)["']/gi
    let match

    while ((match = hrefRegex.exec(html)) !== null) {
      try {
        const url = new URL(match[1], baseUrl)
        
        // Filter URLs based on subdomain policy
        if (includeSubdomains) {
          if (url.hostname.endsWith(baseUrlObj.hostname)) {
            urls.push(url.href)
          }
        } else {
          if (url.hostname === baseUrlObj.hostname) {
            urls.push(url.href)
          }
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }

    return [...new Set(urls)] // Remove duplicates
  }

  private async analyzeContent(crawlResults: any, websiteUrl: string) {
    const { pages, totalContent, contentTypes, technicalMetrics } = crawlResults

    // Calculate content score based on various factors
    let contentScore = 0
    let confidence = 0.7

    // Content volume score (0-30 points)
    const avgContentPerPage = pages.length > 0 ? totalContent / pages.length : 0
    if (avgContentPerPage > 2000) {
      contentScore += 30
    } else if (avgContentPerPage > 1000) {
      contentScore += 20
    } else if (avgContentPerPage > 500) {
      contentScore += 15
    } else {
      contentScore += 5
    }

    // Content diversity score (0-25 points)
    const diversityScore = Math.min(contentTypes.size * 5, 25)
    contentScore += diversityScore

    // Technical performance score (0-25 points)
    if (technicalMetrics.averageLoadTime < 2000) {
      contentScore += 25
    } else if (technicalMetrics.averageLoadTime < 4000) {
      contentScore += 15
    } else if (technicalMetrics.averageLoadTime < 6000) {
      contentScore += 10
    } else {
      contentScore += 5
    }

    // Error rate score (0-20 points)
    const errorRate = pages.length > 0 ? technicalMetrics.errorPages / pages.length : 0
    if (errorRate === 0) {
      contentScore += 20
    } else if (errorRate < 0.1) {
      contentScore += 15
    } else if (errorRate < 0.2) {
      contentScore += 10
    } else {
      contentScore += 5
    }

    // Adjust confidence based on sample size
    if (pages.length >= 10) {
      confidence = 0.9
    } else if (pages.length >= 5) {
      confidence = 0.8
    } else {
      confidence = 0.6
    }

    const reasoning = `Analyzed ${pages.length} pages with ${totalContent} total characters. ` +
      `Average load time: ${Math.round(technicalMetrics.averageLoadTime)}ms. ` +
      `Content types found: ${Array.from(contentTypes).join(', ')}. ` +
      `Error rate: ${Math.round(errorRate * 100)}%.`

    return {
      contentScore: Math.min(contentScore, 100), // Cap at 100
      confidence,
      reasoning
    }
  }

  private async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close()
        this.browser = null
        logger.debug('Browser cleaned up successfully')
      } catch (error) {
        logger.error('Failed to cleanup browser', { error: error instanceof Error ? error.message : String(error) })
      }
    }
  }
}
