import { BaseADIAgent } from './base-agent'
import type { ADIAgentConfig, ADIAgentInput, ADIAgentOutput } from '../../../types/adi'

/**
 * LLM Test Agent - Evaluates AI Answer Quality & Presence
 * Tests brand visibility across multiple AI models using standardized queries
 */
export class LLMTestAgent extends BaseADIAgent {
  constructor() {
    const config: ADIAgentConfig = {
      name: 'llm_test_agent',
      version: 'v1.0',
      description: 'Tests brand visibility and answer quality across multiple AI models',
      dependencies: ['crawl_agent'],
      timeout: 45000, // 45 seconds for multiple LLM calls
      retryLimit: 2,
      parallelizable: true
    }
    super(config)
  }

  async execute(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const startTime = Date.now()
    
    try {
      console.log(`Executing LLM Test Agent for evaluation ${input.context.evaluationId}`)

      const { brandId, websiteUrl, queryCanon, industryId } = input.context
      
      if (!queryCanon || queryCanon.length === 0) {
        return this.createOutput('skipped', [], 0, 'No query canon available for testing')
      }

      const results = []

      // 1. Brand Recognition Test
      const recognitionResult = await this.testBrandRecognition(websiteUrl, queryCanon)
      results.push(recognitionResult)

      // 2. Answer Completeness Test
      const completenessResult = await this.testAnswerCompleteness(websiteUrl, queryCanon)
      results.push(completenessResult)

      // 3. Factual Accuracy Test
      const accuracyResult = await this.testFactualAccuracy(websiteUrl, queryCanon)
      results.push(accuracyResult)

      // 4. Cross-Model Consistency Test
      const consistencyResult = await this.testCrossModelConsistency(websiteUrl, queryCanon)
      results.push(consistencyResult)

      // 5. Hallucination Detection
      const hallucinationResult = await this.testHallucinationRate(websiteUrl, queryCanon)
      results.push(hallucinationResult)

      const executionTime = Date.now() - startTime

      return this.createOutput('completed', results, executionTime, undefined, {
        totalQueries: queryCanon.length,
        modelsTestedCount: this.getAvailableModels().length,
        industryId
      })

    } catch (error) {
      const executionTime = Date.now() - startTime
      console.error('LLM Test Agent execution failed:', error)
      
      return this.createOutput(
        'failed', 
        [], 
        executionTime, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  private async testBrandRecognition(websiteUrl: string, queryCanon: any[]): Promise<any> {
    const brandName = this.extractBrandName(websiteUrl)
    const recognitionQueries = [
      `What can you tell me about ${brandName}?`,
      `Is ${brandName} a reputable brand?`,
      `What does ${brandName} sell?`,
      `How would you describe ${brandName}?`
    ]

    let totalRecognition = 0
    let totalQueries = 0
    const modelResults: Record<string, number> = {}

    for (const model of this.getAvailableModels()) {
      let modelRecognition = 0
      
      for (const query of recognitionQueries) {
        try {
          const response = await this.queryModel(model, query)
          const recognitionScore = this.scoreRecognition(response, brandName)
          modelRecognition += recognitionScore
          totalQueries++
        } catch (error) {
          console.warn(`Failed to query ${model} with: ${query}`)
        }
      }
      
      const avgModelRecognition = modelRecognition / recognitionQueries.length
      modelResults[model] = avgModelRecognition
      totalRecognition += avgModelRecognition
    }

    const avgRecognition = totalRecognition / this.getAvailableModels().length
    const confidence = this.calculateConfidence(totalQueries, 0.8, avgRecognition / 100)

    return this.createResult(
      'brand_recognition',
      avgRecognition,
      this.normalizeScore(avgRecognition, 0, 100, 10, 95),
      confidence,
      {
        brandName,
        modelResults,
        totalQueries,
        recognitionQueries
      }
    )
  }

  private async testAnswerCompleteness(websiteUrl: string, queryCanon: any[]): Promise<any> {
    const brandName = this.extractBrandName(websiteUrl)
    let totalCompleteness = 0
    let totalTests = 0
    const completenessResults: Record<string, any> = {}

    // Use industry-specific queries from canon
    const testQueries = queryCanon.slice(0, 10) // Limit to 10 queries for performance

    for (const canonQuery of testQueries) {
      const query = canonQuery.query_text.replace(/\{brand\}/g, brandName)
      
      for (const model of this.getAvailableModels()) {
        try {
          const response = await this.queryModel(model, query)
          const completenessScore = this.scoreCompleteness(response, canonQuery.expected_response_elements || [])
          
          if (!completenessResults[canonQuery.query_category]) {
            completenessResults[canonQuery.query_category] = []
          }
          
          completenessResults[canonQuery.query_category].push({
            model,
            query,
            score: completenessScore,
            response: response.substring(0, 200) // Truncate for storage
          })
          
          totalCompleteness += completenessScore
          totalTests++
        } catch (error) {
          console.warn(`Failed completeness test for ${model}: ${query}`)
        }
      }
    }

    const avgCompleteness = totalTests > 0 ? totalCompleteness / totalTests : 0
    const confidence = this.calculateConfidence(totalTests, 0.9, avgCompleteness / 100)

    return this.createResult(
      'answer_completeness',
      avgCompleteness,
      this.normalizeScore(avgCompleteness, 0, 100, 20, 90),
      confidence,
      {
        totalTests,
        avgCompleteness,
        completenessResults,
        testQueries: testQueries.length
      }
    )
  }

  private async testFactualAccuracy(websiteUrl: string, queryCanon: any[]): Promise<any> {
    const brandName = this.extractBrandName(websiteUrl)
    const factualQueries = [
      `When was ${brandName} founded?`,
      `Where is ${brandName} headquartered?`,
      `What is ${brandName}'s main product category?`,
      `Who is the CEO of ${brandName}?`
    ]

    let accuracyScore = 0
    let totalChecks = 0
    const accuracyResults: Record<string, any> = {}

    for (const query of factualQueries) {
      const modelResponses: Record<string, string> = {}
      
      // Get responses from all models
      for (const model of this.getAvailableModels()) {
        try {
          const response = await this.queryModel(model, query)
          modelResponses[model] = response
        } catch (error) {
          console.warn(`Failed accuracy test for ${model}: ${query}`)
        }
      }

      // Check consistency across models (simplified accuracy proxy)
      if (Object.keys(modelResponses).length >= 2) {
        const consistency = this.calculateResponseConsistency(Object.values(modelResponses))
        accuracyScore += consistency
        totalChecks++
        
        accuracyResults[query] = {
          responses: modelResponses,
          consistency,
          modelCount: Object.keys(modelResponses).length
        }
      }
    }

    const avgAccuracy = totalChecks > 0 ? accuracyScore / totalChecks : 50
    const confidence = this.calculateConfidence(totalChecks, 0.7, avgAccuracy / 100)

    return this.createResult(
      'factual_accuracy',
      avgAccuracy,
      this.normalizeScore(avgAccuracy, 0, 100, 30, 95),
      confidence,
      {
        totalChecks,
        avgAccuracy,
        accuracyResults,
        factualQueries
      }
    )
  }

  private async testCrossModelConsistency(websiteUrl: string, queryCanon: any[]): Promise<any> {
    const brandName = this.extractBrandName(websiteUrl)
    const consistencyQueries = [
      `Describe ${brandName} in one sentence`,
      `What makes ${brandName} unique?`,
      `Would you recommend ${brandName}? Why?`
    ]

    let totalConsistency = 0
    let totalTests = 0
    const consistencyResults: Record<string, any> = {}

    for (const query of consistencyQueries) {
      const responses: string[] = []
      
      for (const model of this.getAvailableModels()) {
        try {
          const response = await this.queryModel(model, query)
          responses.push(response)
        } catch (error) {
          console.warn(`Failed consistency test for ${model}: ${query}`)
        }
      }

      if (responses.length >= 2) {
        const consistency = this.calculateResponseConsistency(responses)
        totalConsistency += consistency
        totalTests++
        
        consistencyResults[query] = {
          responses,
          consistency,
          modelCount: responses.length
        }
      }
    }

    const avgConsistency = totalTests > 0 ? totalConsistency / totalTests : 50
    const confidence = this.calculateConfidence(totalTests, 0.8, avgConsistency / 100)

    return this.createResult(
      'cross_model_consistency',
      avgConsistency,
      this.normalizeScore(avgConsistency, 0, 100, 25, 90),
      confidence,
      {
        totalTests,
        avgConsistency,
        consistencyResults,
        consistencyQueries
      }
    )
  }

  private async testHallucinationRate(websiteUrl: string, queryCanon: any[]): Promise<any> {
    const brandName = this.extractBrandName(websiteUrl)
    const hallucinationQueries = [
      `What awards has ${brandName} won recently?`,
      `What are ${brandName}'s latest product launches?`,
      `What partnerships does ${brandName} have?`,
      `What is ${brandName}'s revenue?`
    ]

    let hallucinationCount = 0
    let totalTests = 0
    const hallucinationResults: Record<string, any> = {}

    for (const query of hallucinationQueries) {
      for (const model of this.getAvailableModels()) {
        try {
          const response = await this.queryModel(model, query)
          const hasHallucination = this.detectHallucination(response, brandName)
          
          if (hasHallucination) {
            hallucinationCount++
          }
          
          totalTests++
          
          if (!hallucinationResults[query]) {
            hallucinationResults[query] = []
          }
          
          hallucinationResults[query].push({
            model,
            response: response.substring(0, 200),
            hasHallucination
          })
        } catch (error) {
          console.warn(`Failed hallucination test for ${model}: ${query}`)
        }
      }
    }

    const hallucinationRate = totalTests > 0 ? (hallucinationCount / totalTests) * 100 : 0
    const reliabilityScore = 100 - hallucinationRate // Invert: lower hallucination = higher score
    const confidence = this.calculateConfidence(totalTests, 0.6, reliabilityScore / 100)

    return this.createResult(
      'hallucination_rate',
      reliabilityScore,
      this.normalizeScore(reliabilityScore, 0, 100, 50, 95),
      confidence,
      {
        totalTests,
        hallucinationCount,
        hallucinationRate,
        reliabilityScore,
        hallucinationResults
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

  private getAvailableModels(): string[] {
    // In production, this would check which AI providers are configured
    return ['gpt-4', 'claude-3', 'gemini-pro']
  }

  private async queryModel(model: string, query: string): Promise<string> {
    // Simulate AI model query - in production, this would use actual AI provider APIs
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    // Mock responses based on model and query
    const responses = [
      `Based on my knowledge, here's information about the query: ${query}`,
      `I can provide some insights about this topic: ${query}`,
      `Here's what I know about: ${query}`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private scoreRecognition(response: string, brandName: string): number {
    const lowerResponse = response.toLowerCase()
    const lowerBrand = brandName.toLowerCase()
    
    // Simple scoring based on brand mention and response quality
    let score = 0
    
    if (lowerResponse.includes(lowerBrand)) score += 40
    if (lowerResponse.includes('brand') || lowerResponse.includes('company')) score += 20
    if (lowerResponse.length > 50) score += 20 // Substantial response
    if (lowerResponse.includes('product') || lowerResponse.includes('service')) score += 20
    
    return Math.min(100, score)
  }

  private scoreCompleteness(response: string, expectedElements: string[]): number {
    if (expectedElements.length === 0) return 70 // Default if no expectations
    
    const lowerResponse = response.toLowerCase()
    let foundElements = 0
    
    for (const element of expectedElements) {
      if (lowerResponse.includes(element.toLowerCase())) {
        foundElements++
      }
    }
    
    const completeness = (foundElements / expectedElements.length) * 100
    const lengthBonus = Math.min(20, response.length / 10) // Bonus for detailed responses
    
    return Math.min(100, completeness + lengthBonus)
  }

  private calculateResponseConsistency(responses: string[]): number {
    if (responses.length < 2) return 50
    
    // Simple consistency calculation based on common words
    const wordSets = responses.map(r => new Set(r.toLowerCase().split(/\s+/)))
    
    let totalSimilarity = 0
    let comparisons = 0
    
    for (let i = 0; i < wordSets.length; i++) {
      for (let j = i + 1; j < wordSets.length; j++) {
        const intersection = new Set([...wordSets[i]].filter(x => wordSets[j].has(x)))
        const union = new Set([...wordSets[i], ...wordSets[j]])
        const similarity = union.size > 0 ? (intersection.size / union.size) * 100 : 0
        
        totalSimilarity += similarity
        comparisons++
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 50
  }

  private detectHallucination(response: string, brandName: string): boolean {
    // Simple hallucination detection heuristics
    const suspiciousPatterns = [
      /\$[\d,]+\s*(million|billion)/i, // Specific revenue claims
      /founded in \d{4}/i, // Specific founding dates
      /won.*award/i, // Award claims
      /partnership with/i, // Partnership claims
      /recently launched/i // Recent launch claims
    ]
    
    // If response contains specific claims without qualification, flag as potential hallucination
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(response) && !response.toLowerCase().includes('approximately') && 
          !response.toLowerCase().includes('reportedly') && !response.toLowerCase().includes('according to')) {
        return true
      }
    }
    
    return false
  }
}