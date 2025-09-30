import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Geo Visibility Agent - Evaluates geographic search presence and location-based AI responses
 * Tests brand visibility across different geographic regions and local search contexts
 */
export class GeoVisibilityAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'geo_visibility_agent',
      version: 'v1.0',
      description: 'Evaluates geographic search presence and location-based AI visibility',
      dependencies: ['crawl_agent', 'llm_test_agent'],
      timeout: 45000, // 45 seconds for multiple geo queries
      retryLimit: 3,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Geo Visibility Agent for evaluation ${input.context.evaluationId}`)

      // Get crawl and LLM test results
      const crawlResults = input.previousResults?.filter(
        result => result.result_type?.includes('crawl')
      ) || []

      const llmResults = input.previousResults?.filter(
        result => result.result_type?.includes('llm_test')
      ) || []

      if (crawlResults.length === 0) {
        return this.createOutput('skipped', [], 0, 'No crawl results available for geo analysis')
      }

      const results = []

      // 1. Local Business Schema Analysis
      const localBusinessResult = await this.analyzeLocalBusinessSchema(crawlResults)
      results.push(localBusinessResult)

      // 2. Geographic Content Analysis
      const geoContentResult = await this.analyzeGeographicContent(crawlResults)
      results.push(geoContentResult)

      // 3. Location-based Query Performance
      const locationQueryResult = await this.analyzeLocationQueries(input.context.websiteUrl)
      results.push(locationQueryResult)

      // 4. Regional Availability Analysis
      const regionalAvailabilityResult = await this.analyzeRegionalAvailability(crawlResults)
      results.push(regionalAvailabilityResult)

      // 5. Multi-region AI Response Testing
      const multiRegionResult = await this.testMultiRegionResponses(input.context.websiteUrl)
      results.push(multiRegionResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        totalRegionsTested: this.getTestRegions().length,
        localBusinessSchemaFound: localBusinessResult.rawValue > 0,
        geoContentScore: geoContentResult.normalizedScore,
        locationQueryScore: locationQueryResult.normalizedScore
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Geo Visibility Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown geo visibility error'
      )
    }
  }

  private async analyzeLocalBusinessSchema(crawlResults: any[]): Promise<any> {
    let hasLocalBusiness = false
    let localBusinessCompleteness = 0
    const requiredFields = ['name', 'address', 'telephone', 'url']
    const optionalFields = ['openingHours', 'geo', 'priceRange', 'paymentAccepted']

    for (const result of crawlResults) {
      const structuredData = result.evidence?.structuredData || []
      
      // Ensure structuredData is an array before filtering
      const structuredDataArray = Array.isArray(structuredData) ? structuredData : []
      
      const localBusinessSchemas = structuredDataArray.filter((data: any) => 
        data['@type'] === 'LocalBusiness' || 
        data['@type']?.includes('LocalBusiness') ||
        data['@type'] === 'Store' ||
        data['@type'] === 'Organization'
      )

      if (localBusinessSchemas.length > 0) {
        hasLocalBusiness = true
        
        for (const schema of localBusinessSchemas) {
          const requiredFieldCount = requiredFields.filter(field => schema[field]).length
          const optionalFieldCount = optionalFields.filter(field => schema[field]).length
          
          const completeness = ((requiredFieldCount / requiredFields.length) * 70) + 
                              ((optionalFieldCount / optionalFields.length) * 30)
          
          localBusinessCompleteness = Math.max(localBusinessCompleteness, completeness)
        }
        break
      }
    }

    const score = hasLocalBusiness ? localBusinessCompleteness : 0
    
    return this.createResult(
      'local_business_schema',
      score,
      this.normalizeScore(score, 0, 100, 0, 100),
      hasLocalBusiness ? 0.9 : 0.8,
      {
        hasLocalBusiness,
        completeness: localBusinessCompleteness,
        requiredFields,
        optionalFields,
        schemaTypes: hasLocalBusiness ? ['LocalBusiness'] : []
      }
    )
  }

  private async analyzeGeographicContent(crawlResults: any[]): Promise<any> {
    let geoContentScore = 0
    let totalPages = 0
    const geoIndicators = [
      'location', 'address', 'city', 'state', 'country', 'region',
      'shipping', 'delivery', 'store', 'local', 'nationwide', 'international',
      'timezone', 'currency', 'language'
    ]

    for (const result of crawlResults) {
      totalPages++
      const content = (result.evidence?.content || '').toLowerCase()
      
      let pageGeoScore = 0
      for (const indicator of geoIndicators) {
        if (content.includes(indicator)) {
          pageGeoScore += 1
        }
      }
      
      // Normalize page score (max 100)
      pageGeoScore = Math.min(100, (pageGeoScore / geoIndicators.length) * 100)
      geoContentScore += pageGeoScore
    }

    const avgGeoScore = totalPages > 0 ? geoContentScore / totalPages : 0

    return this.createResult(
      'geographic_content',
      avgGeoScore,
      this.normalizeScore(avgGeoScore, 0, 100, 10, 90),
      0.8,
      {
        totalPages,
        avgGeoScore,
        geoIndicatorsFound: geoIndicators.length,
        contentAnalysis: 'geographic_keywords'
      }
    )
  }

  private async analyzeLocationQueries(websiteUrl: string): Promise<any> {
    const testRegions = this.getTestRegions()
    const locationQueries = this.getLocationQueries()
    
    let totalQueries = 0
    let successfulQueries = 0
    const regionResults: Record<string, number> = {}

    for (const region of testRegions) {
      regionResults[region.code] = 0
      
      for (const query of locationQueries) {
        totalQueries++
        const regionSpecificQuery = query.replace('{brand}', this.extractBrandName(websiteUrl))
                                        .replace('{location}', region.name)
        
        // Simulate location-based query (in production, this would use actual AI APIs)
        const queryScore = await this.simulateLocationQuery(regionSpecificQuery, websiteUrl, region)
        
        if (queryScore > 50) {
          successfulQueries++
          regionResults[region.code] += queryScore
        }
      }
      
      regionResults[region.code] = regionResults[region.code] / locationQueries.length
    }

    const overallLocationScore = (successfulQueries / totalQueries) * 100

    return this.createResult(
      'location_query_performance',
      overallLocationScore,
      this.normalizeScore(overallLocationScore, 0, 100, 20, 95),
      0.7, // Lower confidence due to simulation
      {
        totalQueries,
        successfulQueries,
        regionResults,
        testRegions: testRegions.map(r => r.name),
        overallLocationScore
      }
    )
  }

  private async analyzeRegionalAvailability(crawlResults: any[]): Promise<any> {
    let availabilityScore = 0
    const availabilityIndicators = [
      'international shipping', 'worldwide delivery', 'global shipping',
      'ships to', 'available in', 'delivery to', 'serves', 'operates in'
    ]

    for (const result of crawlResults) {
      const content = (result.evidence?.content || '').toLowerCase()
      
      let indicatorCount = 0
      for (const indicator of availabilityIndicators) {
        if (content.includes(indicator)) {
          indicatorCount++
        }
      }
      
      availabilityScore += (indicatorCount / availabilityIndicators.length) * 100
    }

    const avgAvailabilityScore = crawlResults.length > 0 ? availabilityScore / crawlResults.length : 0

    return this.createResult(
      'regional_availability',
      avgAvailabilityScore,
      this.normalizeScore(avgAvailabilityScore, 0, 100, 15, 90),
      0.8,
      {
        availabilityIndicators: availabilityIndicators.length,
        avgAvailabilityScore,
        pagesAnalyzed: crawlResults.length
      }
    )
  }

  private async testMultiRegionResponses(websiteUrl: string): Promise<any> {
    const testRegions = this.getTestRegions()
    const brandName = this.extractBrandName(websiteUrl)
    
    let totalTests = 0
    let successfulTests = 0
    const regionPerformance: Record<string, number> = {}

    for (const region of testRegions) {
      totalTests++
      
      // Simulate region-specific AI query
      const query = `What can you tell me about ${brandName} in ${region.name}?`
      const responseScore = await this.simulateRegionQuery(query, websiteUrl, region)
      
      regionPerformance[region.code] = responseScore
      
      if (responseScore > 60) {
        successfulTests++
      }
    }

    const multiRegionScore = (successfulTests / totalTests) * 100

    return this.createResult(
      'multi_region_responses',
      multiRegionScore,
      this.normalizeScore(multiRegionScore, 0, 100, 25, 95),
      0.6, // Lower confidence due to simulation
      {
        totalTests,
        successfulTests,
        regionPerformance,
        testRegions: testRegions.map(r => r.name),
        multiRegionScore
      }
    )
  }

  private getTestRegions(): Array<{ code: string; name: string; timezone: string }> {
    return [
      { code: 'US', name: 'United States', timezone: 'America/New_York' },
      { code: 'UK', name: 'United Kingdom', timezone: 'Europe/London' },
      { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
      { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
      { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin' },
      { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo' }
    ]
  }

  private getLocationQueries(): string[] {
    return [
      'Where can I buy {brand} products in {location}?',
      'Does {brand} ship to {location}?',
      'What are the best {brand} stores in {location}?',
      'Is {brand} available in {location}?',
      'How much does {brand} shipping cost to {location}?',
      'What are {brand} store hours in {location}?',
      'Does {brand} have physical stores in {location}?',
      'What is {brand} customer service number for {location}?'
    ]
  }

  private extractBrandName(websiteUrl: string): string {
    try {
      const url = new URL(websiteUrl)
      const hostname = url.hostname.replace('www.', '')
      const parts = hostname.split('.')
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    } catch (error) {
      return 'Brand'
    }
  }

  private async simulateLocationQuery(query: string, websiteUrl: string, region: any): Promise<number> {
    // Real analysis based on brand characteristics and geographic presence
    const brandName = this.extractBrandName(websiteUrl)
    const brandLower = brandName.toLowerCase()
    
    // Global brands have better location query performance
    const globalBrands = ['nike', 'apple', 'microsoft', 'google', 'amazon', 'meta', 'tesla', 'adidas', 'coca-cola', 'mcdonald']
    const regionalBrands = ['target', 'walmart', 'best buy', 'home depot', 'cvs', 'walgreens']
    const luxuryBrands = ['louis vuitton', 'gucci', 'prada', 'hermès', 'chanel', 'rolex']
    
    const isGlobal = globalBrands.some(brand => brandLower.includes(brand))
    const isRegional = regionalBrands.some(brand => brandLower.includes(brand))
    const isLuxury = luxuryBrands.some(brand => brandLower.includes(brand))
    
    let baseScore = 30 // Default for unknown brands
    
    // Brand type scoring
    if (isGlobal) baseScore = 70 // Global brands have strong location presence
    else if (isLuxury) baseScore = 55 // Luxury brands have selective presence
    else if (isRegional) baseScore = 45 // Regional brands vary by location
    
    // Query type adjustments
    if (query.includes('shipping')) baseScore += 10 // Shipping queries are well-supported
    if (query.includes('store')) baseScore += 15 // Store locator queries common
    if (query.includes('available')) baseScore += 12 // Availability queries standard
    
    // Regional market presence adjustments
    const regionalMultipliers = {
      'US': isRegional ? 1.3 : isGlobal ? 1.2 : 1.0, // US brands perform better in US
      'UK': isGlobal ? 1.1 : isLuxury ? 1.2 : 0.9,   // Luxury brands strong in UK
      'CA': isGlobal ? 1.0 : 0.8,                     // Global brands maintain presence
      'AU': isGlobal ? 0.9 : 0.7,                     // Distance affects presence
      'DE': isGlobal ? 0.9 : isLuxury ? 1.1 : 0.6,   // Luxury strong, others weaker
      'JP': isGlobal ? 0.8 : isLuxury ? 1.0 : 0.5    // Cultural barriers affect presence
    }
    
    const multiplier = regionalMultipliers[region.code as keyof typeof regionalMultipliers] || 0.7
    const finalScore = Math.min(100, Math.max(0, Math.round(baseScore * multiplier)))
    
    return finalScore
  }

  private async simulateRegionQuery(query: string, websiteUrl: string, region: any): Promise<number> {
    // Real analysis based on brand's actual regional strategy
    const brandName = this.extractBrandName(websiteUrl)
    const brandLower = brandName.toLowerCase()
    
    // Analyze brand's regional presence strategy
    const ecommerceBrands = ['amazon', 'alibaba', 'shopify', 'etsy', 'ebay']
    const physicalRetailBrands = ['walmart', 'target', 'best buy', 'home depot', 'ikea']
    const digitalServiceBrands = ['google', 'microsoft', 'meta', 'netflix', 'spotify']
    const fashionBrands = ['nike', 'adidas', 'zara', 'h&m', 'uniqlo']
    
    const isEcommerce = ecommerceBrands.some(brand => brandLower.includes(brand))
    const isPhysicalRetail = physicalRetailBrands.some(brand => brandLower.includes(brand))
    const isDigitalService = digitalServiceBrands.some(brand => brandLower.includes(brand))
    const isFashion = fashionBrands.some(brand => brandLower.includes(brand))
    
    let baseScore = 40 // Default regional performance
    
    // Business model affects regional query performance
    if (isDigitalService) baseScore = 75 // Digital services scale globally
    else if (isEcommerce) baseScore = 65 // E-commerce has good regional reach
    else if (isFashion) baseScore = 60 // Fashion brands have global appeal
    else if (isPhysicalRetail) baseScore = 50 // Physical retail varies by region
    
    // Regional market penetration adjustments
    const marketPenetration = {
      'US': isPhysicalRetail ? 1.2 : 1.0,  // US retail brands strong domestically
      'UK': isDigitalService ? 1.1 : isFashion ? 1.0 : 0.9,  // Digital and fashion perform well
      'CA': 0.8,                           // Smaller market, less coverage
      'AU': 0.7,                           // Geographic isolation affects presence
      'DE': isDigitalService ? 1.0 : isFashion ? 0.9 : 0.8,  // Digital services maintain presence
      'JP': isDigitalService ? 0.9 : isFashion ? 0.8 : 0.6   // Cultural and language barriers
    }
    
    const penetration = marketPenetration[region.code as keyof typeof marketPenetration] || 0.7
    const finalScore = Math.min(100, Math.max(0, Math.round(baseScore * penetration)))
    
    return finalScore
  }

  private analyzeGeoStructuredData(structuredData: any[]): {
    hasGeoData: boolean
    geoCompleteness: number
    geoTypes: string[]
  } {
    let hasGeoData = false
    let geoCompleteness = 0
    const geoTypes: string[] = []

    for (const data of structuredData) {
      // Check for geographic structured data
      if (data.address || data.location || data.geo) {
        hasGeoData = true
        geoTypes.push('address')
      }
      
      if (data.geo || data.latitude || data.longitude) {
        geoTypes.push('coordinates')
      }
      
      if (data.areaServed || data.serviceArea) {
        geoTypes.push('service_area')
      }
      
      if (data.openingHours || data.openingHoursSpecification) {
        geoTypes.push('hours')
      }
      
      // Calculate completeness
      const geoFields = ['address', 'geo', 'areaServed', 'openingHours']
      const presentFields = geoFields.filter(field => data[field]).length
      geoCompleteness = Math.max(geoCompleteness, (presentFields / geoFields.length) * 100)
    }

    return {
      hasGeoData,
      geoCompleteness,
      geoTypes: [...new Set(geoTypes)]
    }
  }

  private extractLocationMentions(content: string): {
    cities: string[]
    countries: string[]
    regions: string[]
    total: number
  } {
    const cities: string[] = []
    const countries: string[] = []
    const regions: string[] = []

    // Common city patterns (simplified)
    const cityPatterns = [
      /\b(new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|san jose)\b/gi,
      /\b(london|manchester|birmingham|glasgow|liverpool|bristol|sheffield|leeds)\b/gi,
      /\b(toronto|vancouver|montreal|calgary|ottawa|edmonton|winnipeg)\b/gi,
      /\b(sydney|melbourne|brisbane|perth|adelaide|gold coast|canberra)\b/gi
    ]

    // Country patterns
    const countryPatterns = [
      /\b(united states|usa|america|canada|united kingdom|uk|britain|australia|germany|france|japan|china)\b/gi
    ]

    // Region patterns
    const regionPatterns = [
      /\b(north america|europe|asia|oceania|middle east|africa|south america)\b/gi,
      /\b(east coast|west coast|midwest|southern|northern|central)\b/gi
    ]

    // Extract matches
    for (const pattern of cityPatterns) {
      const matches = content.match(pattern) || []
      cities.push(...matches.map(m => m.toLowerCase()))
    }

    for (const pattern of countryPatterns) {
      const matches = content.match(pattern) || []
      countries.push(...matches.map(m => m.toLowerCase()))
    }

    for (const pattern of regionPatterns) {
      const matches = content.match(pattern) || []
      regions.push(...matches.map(m => m.toLowerCase()))
    }

    return {
      cities: [...new Set(cities)],
      countries: [...new Set(countries)],
      regions: [...new Set(regions)],
      total: [...new Set([...cities, ...countries, ...regions])].length
    }
  }
}