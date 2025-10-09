import { createLogger } from '../utils/logger'
import { AgentContext } from '../types'

const logger = createLogger('real-llm-test-agent')

/**
 * Real LLM Test Agent - Makes actual LLM API calls to test brand visibility
 * Tests brand discovery and understanding across multiple AI models
 */
export class RealLLMTestAgent {
  private openaiApiKey: string | undefined
  private tier: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.tier = process.env.NODE_ENV || 'production'
    
    if (!this.openaiApiKey) {
      logger.warn('OpenAI API key not configured - LLM tests will use simulated data')
    }
  }

  async execute(context: AgentContext): Promise<any> {
    const startTime = Date.now()
    
    logger.info('Executing real LLM test agent', {
      evaluationId: context.evaluationId,
      websiteUrl: context.websiteUrl,
      tier: context.tier,
      hasApiKey: !!this.openaiApiKey
    })

    try {
      // Extract brand name from URL
      const brandName = this.extractBrandName(context.websiteUrl)
      
      // If no API key, return placeholder data
      if (!this.openaiApiKey) {
        return this.generatePlaceholderResult(brandName, context.websiteUrl, Date.now() - startTime)
      }

      // Run real LLM tests
      const results = []

      // Test 1: Brand Recognition
      const recognitionTest = await this.testBrandRecognition(brandName, context.websiteUrl)
      results.push(recognitionTest)

      // Test 2: Product/Service Understanding
      const understandingTest = await this.testProductUnderstanding(brandName, context.websiteUrl)
      results.push(understandingTest)

      // Test 3: Recommendation Quality
      const recommendationTest = await this.testRecommendationQuality(brandName, context.websiteUrl)
      results.push(recommendationTest)

      const executionTime = Date.now() - startTime

      return {
        agentName: 'llm_test_agent',
        status: 'completed',
        results,
        executionTime,
        metadata: {
          timestamp: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          brandName,
          testsRun: results.length,
          placeholder: false, // Real LLM data!
          railwayExecution: true,
          apiProvider: 'openai'
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      logger.error('LLM test agent failed', {
        error: error instanceof Error ? error.message : String(error),
        executionTime
      })

      throw error
    }
  }

  private extractBrandName(url: string): string {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
      const parts = hostname.replace('www.', '').split('.')
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    } catch {
      return 'Unknown Brand'
    }
  }

  private async testBrandRecognition(brandName: string, websiteUrl: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are evaluating AI brand visibility. Respond with JSON only.'
            },
            {
              role: 'user',
              content: `Evaluate: Do you recognize the brand "${brandName}" (${websiteUrl})? Provide a score 0-100 based on:
- Brand recognition (0-40 points)
- Information accuracy (0-30 points)
- Detail completeness (0-30 points)

Response format: {"recognized": true/false, "score": 0-100, "confidence": 0-1, "details": "brief explanation"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || '{}'
      
      // Parse JSON response
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch {
        // Fallback if response isn't valid JSON
        evaluation = {
          recognized: content.toLowerCase().includes('yes'),
          score: 50,
          confidence: 0.5,
          details: 'Unable to parse LLM response'
        }
      }

      return {
        resultType: 'brand_recognition',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          recognized: evaluation.recognized,
          details: evaluation.details,
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Brand recognition test failed', { error })
      
      return {
        resultType: 'brand_recognition',
        rawValue: 40,
        normalizedScore: 40,
        confidenceLevel: 0.3,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private async testProductUnderstanding(brandName: string, websiteUrl: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are evaluating AI product understanding. Respond with JSON only.'
            },
            {
              role: 'user',
              content: `What products or services does ${brandName} offer? Score your understanding 0-100 based on:
- Clarity of offerings (0-50 points)
- Specificity of details (0-30 points)
- Accuracy validation (0-20 points)

Response format: {"score": 0-100, "confidence": 0-1, "products": ["list"], "understanding": "brief assessment"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || '{}'
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch {
        evaluation = {
          score: 50,
          confidence: 0.5,
          products: [],
          understanding: 'Unable to parse response'
        }
      }

      return {
        resultType: 'product_understanding',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          products: evaluation.products || [],
          understanding: evaluation.understanding,
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Product understanding test failed', { error })
      
      return {
        resultType: 'product_understanding',
        rawValue: 45,
        normalizedScore: 45,
        confidenceLevel: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private async testRecommendationQuality(brandName: string, websiteUrl: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are evaluating AI recommendation quality. Respond with JSON only.'
            },
            {
              role: 'user',
              content: `If asked "What are good alternatives to ${brandName}?", how would you respond? Score 0-100 based on:
- Accurate positioning (0-40 points)
- Helpful context (0-30 points)
- Fair comparison (0-30 points)

Response format: {"score": 0-100, "confidence": 0-1, "positioning": "brief description", "fairness": "assessment"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || '{}'
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch {
        evaluation = {
          score: 50,
          confidence: 0.5,
          positioning: 'Unable to parse response',
          fairness: 'Unknown'
        }
      }

      return {
        resultType: 'recommendation_quality',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          positioning: evaluation.positioning,
          fairness: evaluation.fairness,
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Recommendation quality test failed', { error })
      
      return {
        resultType: 'recommendation_quality',
        rawValue: 50,
        normalizedScore: 50,
        confidenceLevel: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private generatePlaceholderResult(brandName: string, websiteUrl: string, executionTime: number): any {
    logger.warn('Generating placeholder LLM test result (no API key)')
    
    return {
      agentName: 'llm_test_agent',
      status: 'completed',
      results: [
        {
          resultType: 'brand_recognition',
          rawValue: 60,
          normalizedScore: 60,
          confidenceLevel: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        },
        {
          resultType: 'product_understanding',
          rawValue: 55,
          normalizedScore: 55,
          confidenceLevel: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        },
        {
          resultType: 'recommendation_quality',
          rawValue: 50,
          normalizedScore: 50,
          confidenceLevel: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        }
      ],
      executionTime,
      metadata: {
        timestamp: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        placeholder: true,
        reason: 'No OpenAI API key configured',
        railwayExecution: true
      }
    }
  }
}

