import { AIProviderClient, EVALUATION_PROMPTS, BRAND_RECOGNITION_PROMPTS, extractScoreFromResponse } from './ai-providers'
import { 
  calculateOverallScore, 
  calculatePillarScores, 
  getGradeFromScore, 
  generateVerdict, 
  identifyDimensionExtremes,
  generateRecommendations 
} from './scoring'
import { 
  createEvaluation, 
  updateEvaluation, 
  createDimensionScore, 
  createRecommendation,
  createEvaluationResult,
  getAIProviders 
} from './supabase'
import type { 
  Brand, 
  Evaluation, 
  DimensionScore, 
  EvaluationResult,
  AIProviderName 
} from '@/types/supabase'

export interface EvaluationConfig {
  brandId: string
  userId: string
  enabledProviders: AIProviderName[]
  testCompetitors: boolean
  competitorUrls?: string[]
}

export interface EvaluationProgress {
  currentStep: string
  completedSteps: number
  totalSteps: number
  percentage: number
  currentProvider?: string
  currentDimension?: string
}

export class EvaluationEngine {
  private config: EvaluationConfig
  private progressCallback?: (progress: EvaluationProgress) => void
  private aiClients: Map<AIProviderName, AIProviderClient> = new Map()

  constructor(config: EvaluationConfig, progressCallback?: (progress: EvaluationProgress) => void) {
    this.config = config
    this.progressCallback = progressCallback
  }

  async initialize(): Promise<void> {
    // Load AI provider configurations for the user
    const providers = await getAIProviders(this.config.userId)
    
    for (const provider of providers) {
      if (provider.is_active && provider.api_key_encrypted && 
          this.config.enabledProviders.includes(provider.provider_name as AIProviderName)) {
        
        // In a real implementation, you would decrypt the API key here
        const decryptedApiKey = this.decryptApiKey(provider.api_key_encrypted)
        
        const client = new AIProviderClient(
          provider.provider_name as AIProviderName, 
          decryptedApiKey
        )
        
        this.aiClients.set(provider.provider_name as AIProviderName, client)
      }
    }

    if (this.aiClients.size === 0) {
      throw new Error('No active AI providers configured. Please set up API keys in settings.')
    }
  }

  async runEvaluation(brand: Brand): Promise<Evaluation> {
    // Create initial evaluation record
    const evaluation = await createEvaluation({
      brand_id: brand.id,
      status: 'running',
      started_at: new Date().toISOString()
    })

    try {
      this.updateProgress('Initializing evaluation...', 0, 100)

      // Calculate total steps for progress tracking
      const totalDimensions = Object.keys(EVALUATION_PROMPTS.infrastructure).length +
                             Object.keys(EVALUATION_PROMPTS.perception).length +
                             Object.keys(EVALUATION_PROMPTS.commerce).length
      const totalSteps = totalDimensions * this.aiClients.size

      let completedSteps = 0
      const dimensionResults: DimensionScore[] = []
      const evaluationResults: EvaluationResult[] = []

      // Run infrastructure tests
      for (const [dimensionName, promptTemplate] of Object.entries(EVALUATION_PROMPTS.infrastructure)) {
        const dimensionScore = await this.evaluateDimension(
          evaluation.id,
          dimensionName,
          promptTemplate,
          brand,
          'infrastructure'
        )
        dimensionResults.push(dimensionScore)
        
        completedSteps += this.aiClients.size
        this.updateProgress(
          `Completed ${dimensionName.replace(/_/g, ' ')}`,
          completedSteps,
          totalSteps
        )
      }

      // Run perception tests
      for (const [dimensionName, promptTemplate] of Object.entries(EVALUATION_PROMPTS.perception)) {
        const dimensionScore = await this.evaluateDimension(
          evaluation.id,
          dimensionName,
          promptTemplate,
          brand,
          'perception'
        )
        dimensionResults.push(dimensionScore)
        
        completedSteps += this.aiClients.size
        this.updateProgress(
          `Completed ${dimensionName.replace(/_/g, ' ')}`,
          completedSteps,
          totalSteps
        )
      }

      // Run commerce tests
      for (const [dimensionName, promptTemplate] of Object.entries(EVALUATION_PROMPTS.commerce)) {
        const dimensionScore = await this.evaluateDimension(
          evaluation.id,
          dimensionName,
          promptTemplate,
          brand,
          'commerce'
        )
        dimensionResults.push(dimensionScore)
        
        completedSteps += this.aiClients.size
        this.updateProgress(
          `Completed ${dimensionName.replace(/_/g, ' ')}`,
          completedSteps,
          totalSteps
        )
      }

      // Calculate final scores
      this.updateProgress('Calculating final scores...', completedSteps, totalSteps)
      
      const overallScore = calculateOverallScore(dimensionResults)
      const grade = getGradeFromScore(overallScore)
      const verdict = generateVerdict(overallScore, brand.name)
      const { strongest, weakest, biggestOpportunity } = identifyDimensionExtremes(dimensionResults)

      // Generate recommendations
      this.updateProgress('Generating recommendations...', completedSteps, totalSteps)
      const recommendations = generateRecommendations(dimensionResults, brand.name)
      
      // Save recommendations to database
      for (const rec of recommendations) {
        await createRecommendation({
          evaluation_id: evaluation.id,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          impact_level: rec.impact,
          effort_level: rec.effort,
          category: rec.category
        })
      }

      // Update evaluation with final results
      const completedEvaluation = await updateEvaluation(evaluation.id, {
        status: 'completed',
        overall_score: overallScore,
        grade,
        verdict,
        strongest_dimension: strongest,
        weakest_dimension: weakest,
        biggest_opportunity: biggestOpportunity,
        completed_at: new Date().toISOString()
      })

      this.updateProgress('Evaluation completed!', totalSteps, totalSteps)
      
      return completedEvaluation

    } catch (error) {
      // Mark evaluation as failed
      await updateEvaluation(evaluation.id, {
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      
      throw error
    }
  }

  private async evaluateDimension(
    evaluationId: string,
    dimensionName: string,
    promptTemplate: (brandName: string, websiteUrl: string) => string,
    brand: Brand,
    pillar: string
  ): Promise<DimensionScore> {
    const prompt = promptTemplate(brand.name, brand.website_url)
    const providerScores: number[] = []
    const providerResponses: string[] = []

    // Test across all configured AI providers
    for (const [providerName, client] of this.aiClients) {
      this.updateProgress(
        `Testing ${dimensionName.replace(/_/g, ' ')} with ${providerName}`,
        0, 0, providerName, dimensionName
      )

      try {
        const response = await client.query(prompt)
        const score = extractScoreFromResponse(response.content)
        
        providerScores.push(score)
        providerResponses.push(response.content)

        // Save individual evaluation result
        await createEvaluationResult({
          evaluation_id: evaluationId,
          provider_name: providerName,
          test_type: `${pillar}_${dimensionName}`,
          prompt_used: prompt,
          response_received: response.content,
          score_contribution: score
        })

      } catch (error) {
        console.error(`Error testing ${dimensionName} with ${providerName}:`, error)
        
        // Save failed result
        await createEvaluationResult({
          evaluation_id: evaluationId,
          provider_name: providerName,
          test_type: `${pillar}_${dimensionName}`,
          prompt_used: prompt,
          response_received: `Error: ${error}`,
          score_contribution: 0
        })
      }
    }

    // Calculate average score across providers
    const averageScore = providerScores.length > 0 
      ? Math.round(providerScores.reduce((sum, score) => sum + score, 0) / providerScores.length)
      : 0

    // Generate explanation based on responses
    const explanation = this.generateDimensionExplanation(dimensionName, averageScore, providerResponses)
    
    // Generate dimension-specific recommendations
    const recommendations = this.generateDimensionRecommendations(dimensionName, averageScore)

    // Save dimension score
    const dimensionScore = await createDimensionScore({
      evaluation_id: evaluationId,
      dimension_name: dimensionName,
      score: averageScore,
      explanation,
      recommendations
    })

    return dimensionScore
  }

  private generateDimensionExplanation(
    dimensionName: string, 
    score: number, 
    responses: string[]
  ): string {
    const scoreLevel = score >= 80 ? 'excellent' : 
                     score >= 60 ? 'good' : 
                     score >= 40 ? 'fair' : 'poor'

    const dimensionDisplayName = dimensionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    let explanation = `${dimensionDisplayName} scored ${score}/100, indicating ${scoreLevel} performance. `

    // Add insights based on common patterns in responses
    if (responses.length > 0) {
      const combinedResponse = responses.join(' ').toLowerCase()
      
      if (combinedResponse.includes('missing') || combinedResponse.includes('absent')) {
        explanation += 'Key elements appear to be missing or incomplete. '
      }
      
      if (combinedResponse.includes('well-structured') || combinedResponse.includes('comprehensive')) {
        explanation += 'The implementation shows good structure and coverage. '
      }
      
      if (combinedResponse.includes('inconsistent')) {
        explanation += 'There are consistency issues that need attention. '
      }
    }

    return explanation
  }

  private generateDimensionRecommendations(dimensionName: string, score: number): string[] {
    const recommendations: string[] = []

    if (score < 70) {
      switch (dimensionName) {
        case 'schema_structured_data':
          recommendations.push('Implement comprehensive Schema.org markup across all page types')
          recommendations.push('Add product schema with pricing, availability, and review data')
          recommendations.push('Validate markup using Google\'s Structured Data Testing Tool')
          break
          
        case 'semantic_clarity':
          recommendations.push('Standardize terminology and vocabulary across all content')
          recommendations.push('Improve content hierarchy with clear headings and structure')
          recommendations.push('Ensure consistent brand and product naming conventions')
          break
          
        case 'citation_strength':
          recommendations.push('Develop relationships with industry publications and journalists')
          recommendations.push('Create newsworthy content and press releases')
          recommendations.push('Participate in industry events and thought leadership opportunities')
          break
          
        case 'hero_products':
          recommendations.push('Enhance product descriptions with clear value propositions')
          recommendations.push('Highlight best-selling products prominently on the website')
          recommendations.push('Include detailed product specifications and benefits')
          break
          
        default:
          recommendations.push(`Improve ${dimensionName.replace(/_/g, ' ')} implementation`)
          recommendations.push('Review industry best practices for this dimension')
          recommendations.push('Consider consulting with specialists in this area')
      }
    }

    return recommendations
  }

  private updateProgress(
    step: string, 
    completed: number, 
    total: number, 
    provider?: string, 
    dimension?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        currentStep: step,
        completedSteps: completed,
        totalSteps: total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        currentProvider: provider,
        currentDimension: dimension
      })
    }
  }

  private decryptApiKey(encryptedKey: string): string {
    // In a real implementation, this would decrypt the API key using the ENCRYPTION_KEY
    // For now, we'll assume the key is stored in a reversible format
    try {
      // This is a placeholder - implement actual decryption
      return Buffer.from(encryptedKey, 'base64').toString('utf-8')
    } catch (error) {
      throw new Error('Failed to decrypt API key')
    }
  }

  // Utility method to test a single AI provider
  async testProvider(providerName: AIProviderName, apiKey: string): Promise<boolean> {
    try {
      const client = new AIProviderClient(providerName, apiKey)
      const response = await client.query('Hello, please respond with "OK" if you can understand this message.')
      
      return response.content.toLowerCase().includes('ok') && !response.error
    } catch (error) {
      return false
    }
  }

  // Method to run competitor analysis
  async runCompetitorAnalysis(
    evaluation: Evaluation, 
    competitorUrls: string[]
  ): Promise<void> {
    // This would run similar evaluations for competitor brands
    // and store results in the competitor_benchmarks table
    // Implementation would be similar to runEvaluation but for competitor data
  }
}

// Utility function to encrypt API keys
export function encryptApiKey(apiKey: string): string {
  // In a real implementation, this would use proper encryption
  // For now, we'll use base64 encoding as a placeholder
  return Buffer.from(apiKey, 'utf-8').toString('base64')
}

// Factory function to create evaluation engine
export function createEvaluationEngine(
  config: EvaluationConfig,
  progressCallback?: (progress: EvaluationProgress) => void
): EvaluationEngine {
  return new EvaluationEngine(config, progressCallback)
}