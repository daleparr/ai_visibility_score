import { createLogger } from '../utils/logger'
import { AgentContext } from '../types'

const logger = createLogger('real-commerce-agent')

/**
 * Real Commerce Agent - Analyzes e-commerce signals and purchase intent
 * Uses real LLM calls to evaluate commerce readiness
 */
export class RealCommerceAgent {
  private openaiApiKey: string | undefined

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!this.openaiApiKey) {
      logger.warn('OpenAI API key not configured - Commerce analysis will use simulated data')
    }
  }

  async execute(context: AgentContext): Promise<any> {
    const startTime = Date.now()
    
    logger.info('Executing real commerce agent', {
      evaluationId: context.evaluationId,
      websiteUrl: context.websiteUrl,
      hasApiKey: !!this.openaiApiKey
    })

    try {
      const brandName = this.extractBrandName(context.websiteUrl)
      
      if (!this.openaiApiKey) {
        return this.generatePlaceholderResult(brandName, context.websiteUrl, Date.now() - startTime)
      }

      const results = []

      // Test 1: E-commerce Detection
      const ecommerceTest = await this.detectEcommerceSignals(brandName, context.websiteUrl)
      results.push(ecommerceTest)

      // Test 2: Purchase Intent Optimization
      const purchaseIntentTest = await this.analyzePurchaseIntent(brandName, context.websiteUrl)
      results.push(purchaseIntentTest)

      // Test 3: Product Discovery
      const productDiscoveryTest = await this.analyzeProductDiscovery(brandName)
      results.push(productDiscoveryTest)

      const executionTime = Date.now() - startTime

      return {
        agentName: 'commerce_agent',
        status: 'completed',
        results,
        executionTime,
        metadata: {
          timestamp: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          brandName,
          testsRun: results.length,
          placeholder: false,
          railwayExecution: true,
          apiProvider: 'openai'
        }
      }

    } catch (error) {
      const executionTime = Date.now() - startTime
      logger.error('Commerce agent failed', { error })
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

  private async detectEcommerceSignals(brandName: string, websiteUrl: string): Promise<any> {
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
              role: 'user',
              content: `Does "${brandName}" sell products or services online? Score 0-100 based on:
- Clear product/service offerings (0-40)
- E-commerce capability (0-30)
- Purchase facilitation (0-30)

Response format: {"score": 0-100, "confidence": 0-1, "is_ecommerce": true/false, "offerings": ["list"], "signals": ["list"]}`
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
          is_ecommerce: true,
          offerings: [],
          signals: []
        }
      }

      return {
        type: 'ecommerce_signals',
        score: evaluation.score,
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          isEcommerce: evaluation.is_ecommerce,
          offerings: evaluation.offerings || [],
          signals: evaluation.signals || [],
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('E-commerce detection failed', { error })
      
      return {
        type: 'ecommerce_signals',
        score: 50,
        score: 50,
        confidence: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private async analyzePurchaseIntent(brandName: string, websiteUrl: string): Promise<any> {
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
              role: 'user',
              content: `If someone asks "Where can I buy from ${brandName}?", how well can you help them? Score 0-100 based on:
- Clear purchase path (0-40)
- Product availability info (0-30)
- Pricing transparency (0-30)

Response format: {"score": 0-100, "confidence": 0-1, "purchase_clarity": "high/medium/low", "key_info": ["list"]}`
            }
          ],
          temperature: 0.3,
          max_tokens: 350
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
          score: 55,
          confidence: 0.5,
          purchase_clarity: 'medium',
          key_info: []
        }
      }

      return {
        type: 'purchase_intent',
        score: evaluation.score,
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          purchaseClarity: evaluation.purchase_clarity,
          keyInfo: evaluation.key_info || [],
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Purchase intent analysis failed', { error })
      
      return {
        type: 'purchase_intent',
        score: 55,
        score: 55,
        confidence: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private async analyzeProductDiscovery(brandName: string): Promise<any> {
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
              role: 'user',
              content: `How easy is it to discover products from "${brandName}"? Score 0-100 based on:
- Product catalog visibility (0-40)
- Search-friendly product names (0-30)
- Category organization (0-30)

Response format: {"score": 0-100, "confidence": 0-1, "discoverability": "excellent/good/fair/poor", "insights": ["list"]}`
            }
          ],
          temperature: 0.3,
          max_tokens: 350
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
          discoverability: 'fair',
          insights: []
        }
      }

      return {
        type: 'product_discovery',
        score: evaluation.score,
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          discoverability: evaluation.discoverability,
          insights: evaluation.insights || [],
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Product discovery analysis failed', { error })
      
      return {
        type: 'product_discovery',
        score: 50,
        score: 50,
        confidence: 0.4,
        evidence: {
          brandName,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private generatePlaceholderResult(brandName: string, websiteUrl: string, executionTime: number): any {
    logger.warn('Generating placeholder commerce result (no API key)')
    
    return {
      agentName: 'commerce_agent',
      status: 'completed',
      results: [
        {
          type: 'ecommerce_signals',
          score: 60,
          score: 60,
          confidence: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        },
        {
          type: 'purchase_intent',
          score: 55,
          score: 55,
          confidence: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        },
        {
          type: 'product_discovery',
          score: 50,
          score: 50,
          confidence: 0.5,
          evidence: {
            brandName,
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

