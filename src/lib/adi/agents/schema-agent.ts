import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * Schema Agent - Evaluates structured data and schema implementation
 * Combines the original "Schema & Structured Data" dimension with enhanced analysis
 */
export class SchemaAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'schema_agent',
      version: 'v1.0',
      description: 'Evaluates structured data coverage, completeness, and GS1 alignment',
      dependencies: ['crawl_agent'],
      timeout: 30000, // 30 seconds
      retryLimit: 3,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing Schema Agent for evaluation ${input.context.evaluationId}`)

      // Get crawl artifacts from previousResults (updated data flow)
      const crawlResults = (input.previousResults || []).filter(
        result => result.agent_id === 'crawl_agent' && result.evidence?.htmlContent
      )

      if (crawlResults.length === 0) {
        return this.createOutput('skipped', [], 0, 'No HTML content available for analysis')
      }

      // Convert crawl results to expected format
      const htmlArtifacts = crawlResults.map(result => ({
        artifact_type: 'html_snapshot',
        content: result.evidence?.htmlContent || '',
        metadata: result.evidence?.metaData || {},
        structuredData: result.evidence?.structuredData || []
      }))

      const results = []

      // 1. Schema Coverage Analysis
      const coverageResult = await this.analyzeSchematicCoverage(htmlArtifacts)
      results.push(coverageResult)

      // 2. Product Schema Completeness
      const productSchemaResult = await this.analyzeProductSchema(htmlArtifacts)
      results.push(productSchemaResult)

      // 3. Organization Schema Analysis
      const orgSchemaResult = await this.analyzeOrganizationSchema(htmlArtifacts)
      results.push(orgSchemaResult)

      // 4. Review Schema Analysis
      const reviewSchemaResult = await this.analyzeReviewSchema(htmlArtifacts)
      results.push(reviewSchemaResult)

      // 5. FAQ Schema Analysis
      const faqSchemaResult = await this.analyzeFAQSchema(htmlArtifacts)
      results.push(faqSchemaResult)

      // 6. GS1 Alignment Check
      const gs1Result = await this.analyzeGS1Alignment(htmlArtifacts)
      results.push(gs1Result)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        totalArtifactsAnalyzed: htmlArtifacts.length,
        schemaTypesFound: this.extractSchemaTypes(htmlArtifacts)
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('Schema Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  private async analyzeSchematicCoverage(artifacts: any[]): Promise<any> {
    let totalPages = 0
    let pagesWithSchema = 0
    const schemaTypes = new Set<string>()

    for (const artifact of artifacts) {
      totalPages++
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      if (structuredData.length > 0) {
        pagesWithSchema++
        structuredData.forEach(data => {
          if (data['@type']) {
            schemaTypes.add(data['@type'])
          }
        })
      }
    }

    const coverage = totalPages > 0 ? (pagesWithSchema / totalPages) * 100 : 0
    const confidence = this.calculateConfidence(totalPages, 1.0, coverage / 100)

    return this.createResult(
      'schema_structured_data_coverage',
      coverage,
      this.normalizeScore(coverage, 0, 100, 10, 95),
      confidence,
      {
        totalPages,
        pagesWithSchema,
        coveragePercentage: coverage,
        schemaTypesFound: Array.from(schemaTypes),
        specificRecommendations: this.generateSchemaRecommendations(coverage, Array.from(schemaTypes)),
        implementationSteps: this.getSchemaImplementationSteps(coverage, Array.from(schemaTypes))
      }
    )
  }

  private async analyzeProductSchema(artifacts: any[]): Promise<any> {
    let productPages = 0
    let completeProductSchemas = 0
    const requiredFields = ['name', 'price', 'availability', 'description']
    const optionalFields = ['brand', 'sku', 'gtin', 'image', 'review']

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      const productSchemas = structuredData.filter(data => 
        data['@type'] === 'Product' || data['@type']?.includes('Product')
      )

      if (productSchemas.length > 0) {
        productPages++
        
        for (const schema of productSchemas) {
          const hasRequiredFields = requiredFields.every(field => schema[field])
          const optionalFieldCount = optionalFields.filter(field => schema[field]).length
          
          if (hasRequiredFields && optionalFieldCount >= 3) {
            completeProductSchemas++
          }
        }
      }
    }

    const completeness = productPages > 0 ? (completeProductSchemas / productPages) * 100 : 0
    const confidence = this.calculateConfidence(productPages, 1.0, completeness / 100)

    return this.createResult(
      'product_schema_structured_data',
      completeness,
      this.normalizeScore(completeness, 0, 100, 20, 95),
      confidence,
      {
        productPages,
        completeProductSchemas,
        completenessPercentage: completeness,
        requiredFields,
        optionalFields
      }
    )
  }

  private async analyzeOrganizationSchema(artifacts: any[]): Promise<any> {
    let hasOrganizationSchema = false
    let organizationCompleteness = 0
    const requiredOrgFields = ['name', 'url', 'logo']
    const optionalOrgFields = ['description', 'address', 'contactPoint', 'sameAs']

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      const orgSchemas = structuredData.filter(data => 
        data['@type'] === 'Organization' || data['@type']?.includes('Organization')
      )

      if (orgSchemas.length > 0) {
        hasOrganizationSchema = true
        
        for (const schema of orgSchemas) {
          const requiredFieldCount = requiredOrgFields.filter(field => schema[field]).length
          const optionalFieldCount = optionalOrgFields.filter(field => schema[field]).length
          
          organizationCompleteness = Math.max(
            organizationCompleteness,
            ((requiredFieldCount / requiredOrgFields.length) * 70) + 
            ((optionalFieldCount / optionalOrgFields.length) * 30)
          )
        }
        break
      }
    }

    const score = hasOrganizationSchema ? organizationCompleteness : 0
    const confidence = hasOrganizationSchema ? 0.9 : 1.0

    return this.createResult(
      'organization_schema_structured_data',
      score,
      this.normalizeScore(score, 0, 100, 0, 100),
      confidence,
      {
        hasOrganizationSchema,
        organizationCompleteness,
        requiredOrgFields,
        optionalOrgFields
      }
    )
  }

  private async analyzeReviewSchema(artifacts: any[]): Promise<any> {
    let pagesWithReviews = 0
    let pagesWithReviewSchema = 0

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      // Check if page likely has reviews (simple heuristic)
      const hasReviewContent = /review|rating|star/i.test(content)
      if (hasReviewContent) {
        pagesWithReviews++
        
        const reviewSchemas = structuredData.filter(data => 
          data['@type'] === 'Review' || 
          data['@type'] === 'AggregateRating' ||
          data['@type']?.includes('Review')
        )
        
        if (reviewSchemas.length > 0) {
          pagesWithReviewSchema++
        }
      }
    }

    const reviewSchemaRatio = pagesWithReviews > 0 ? (pagesWithReviewSchema / pagesWithReviews) * 100 : 0
    const confidence = this.calculateConfidence(pagesWithReviews, 1.0, reviewSchemaRatio / 100)

    return this.createResult(
      'review_schema_structured_data',
      reviewSchemaRatio,
      this.normalizeScore(reviewSchemaRatio, 0, 100, 0, 95),
      confidence,
      {
        pagesWithReviews,
        pagesWithReviewSchema,
        reviewSchemaRatio
      }
    )
  }

  private async analyzeFAQSchema(artifacts: any[]): Promise<any> {
    let faqPages = 0
    let faqPagesWithSchema = 0

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      // Check if page is FAQ or has FAQ content
      const isFAQPage = /faq|frequently.*asked|questions.*answers/i.test(content)
      if (isFAQPage) {
        faqPages++
        
        const faqSchemas = structuredData.filter(data => 
          data['@type'] === 'FAQPage' || 
          data['@type'] === 'Question' ||
          data['@type']?.includes('FAQ')
        )
        
        if (faqSchemas.length > 0) {
          faqPagesWithSchema++
        }
      }
    }

    const faqSchemaRatio = faqPages > 0 ? (faqPagesWithSchema / faqPages) * 100 : 50 // Default if no FAQ pages
    const confidence = faqPages > 0 ? this.calculateConfidence(faqPages, 1.0, faqSchemaRatio / 100) : 0.5

    return this.createResult(
      'faq_schema_structured_data',
      faqSchemaRatio,
      this.normalizeScore(faqSchemaRatio, 0, 100, 0, 100),
      confidence,
      {
        faqPages,
        faqPagesWithSchema,
        faqSchemaRatio
      }
    )
  }

  private async analyzeGS1Alignment(artifacts: any[]): Promise<any> {
    let productSchemas = 0
    let gs1AlignedSchemas = 0
    const gs1Fields = ['gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14', 'mpn', 'sku']

    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      const products = structuredData.filter(data => 
        data['@type'] === 'Product' || data['@type']?.includes('Product')
      )

      productSchemas += products.length

      for (const product of products) {
        const hasGS1Field = gs1Fields.some(field => product[field])
        if (hasGS1Field) {
          gs1AlignedSchemas++
        }
      }
    }

    const gs1Alignment = productSchemas > 0 ? (gs1AlignedSchemas / productSchemas) * 100 : 0
    const confidence = this.calculateConfidence(productSchemas, 1.0, gs1Alignment / 100)

    return this.createResult(
      'gs1_alignment_structured_data',
      gs1Alignment,
      this.normalizeScore(gs1Alignment, 0, 100, 10, 90),
      confidence,
      {
        productSchemas,
        gs1AlignedSchemas,
        gs1Alignment,
        gs1Fields
      }
    )
  }

  private parseStructuredData(html: string): any[] {
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

    return structuredData
  }

  private extractSchemaTypes(artifacts: any[]): string[] {
    const schemaTypes = new Set<string>()
    
    for (const artifact of artifacts) {
      const content = artifact.extracted_data?.content || ''
      const structuredData = this.parseStructuredData(content)
      
      structuredData.forEach(data => {
        if (data['@type']) {
          if (Array.isArray(data['@type'])) {
            data['@type'].forEach((type: string) => schemaTypes.add(type))
          } else {
            schemaTypes.add(data['@type'])
          }
        }
      })
    }
    
    return Array.from(schemaTypes)
  }

  /**
   * Generate specific schema recommendations based on actual findings
   */
  private generateSchemaRecommendations(coverage: number, schemaTypes: string[]): string[] {
    const recommendations: string[] = []
    
    if (coverage === 0) {
      recommendations.push("CRITICAL: No structured data found. Implement basic Schema.org markup immediately.")
      recommendations.push("Start with Organization schema on your homepage - this is essential for AI recognition.")
      recommendations.push("Add Product schema to all product pages with name, price, availability, and description.")
    } else if (coverage < 30) {
      recommendations.push("LOW COVERAGE: Expand structured data to more pages for better AI visibility.")
      recommendations.push("Focus on product pages first - these drive the most AI recommendations.")
    } else if (coverage < 70) {
      recommendations.push("MODERATE COVERAGE: Good start, but expand to achieve comprehensive AI visibility.")
    }
    
    // Specific schema type recommendations
    if (!schemaTypes.includes('Organization')) {
      recommendations.push("MISSING: Add Organization schema to establish your brand identity for AI systems.")
    }
    
    if (!schemaTypes.includes('Product')) {
      recommendations.push("MISSING: Add Product schema - critical for AI product recommendations.")
    }
    
    if (!schemaTypes.includes('Review') && !schemaTypes.includes('AggregateRating')) {
      recommendations.push("OPPORTUNITY: Add Review/Rating schema to boost credibility in AI responses.")
    }
    
    if (!schemaTypes.includes('FAQPage')) {
      recommendations.push("OPPORTUNITY: Add FAQ schema to help AI answer customer questions about your brand.")
    }
    
    return recommendations
  }

  /**
   * Get specific implementation steps based on current schema state
   */
  private getSchemaImplementationSteps(coverage: number, schemaTypes: string[]): string[] {
    const steps: string[] = []
    
    if (coverage === 0) {
      steps.push("1. Install a Schema.org plugin or add manual JSON-LD scripts")
      steps.push("2. Add Organization schema to your homepage with name, url, logo, and description")
      steps.push("3. Implement Product schema on your top 5 product pages")
      steps.push("4. Test your markup using Google's Rich Results Test tool")
      steps.push("5. Monitor Google Search Console for structured data errors")
    } else {
      if (!schemaTypes.includes('Organization')) {
        steps.push("1. Add Organization schema to establish brand identity")
      }
      if (!schemaTypes.includes('Product')) {
        steps.push("2. Implement Product schema with pricing and availability data")
      }
      if (!schemaTypes.includes('Review')) {
        steps.push("3. Add Review/Rating schema to showcase customer feedback")
      }
      if (!schemaTypes.includes('FAQPage')) {
        steps.push("4. Create FAQ schema to help AI answer customer questions")
      }
      steps.push("5. Validate all markup and fix any errors found")
    }
    
    return steps
  }
}