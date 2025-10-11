import { createLogger } from '../utils/logger'
import { AgentContext } from '../types'

const logger = createLogger('real-sentiment-agent')

/**
 * Real Sentiment Agent - Analyzes brand sentiment using actual LLM calls
 * Evaluates emotional associations and brand perception
 */
export class RealSentimentAgent {
  private openaiApiKey: string | undefined

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!this.openaiApiKey) {
      logger.warn('OpenAI API key not configured - Sentiment analysis will use simulated data')
    }
  }

  async execute(context: AgentContext): Promise<any> {
    const startTime = Date.now()
    
    logger.info('Executing real sentiment agent', {
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

      // Test 1: Overall Sentiment Analysis
      const sentimentTest = await this.analyzeBrandSentiment(brandName, context.websiteUrl)
      results.push(sentimentTest)

      // Test 2: Emotional Associations
      const emotionalTest = await this.analyzeEmotionalAssociations(brandName)
      results.push(emotionalTest)

      // Test 3: Trust Signals
      const trustTest = await this.analyzeTrustSignals(brandName, context.websiteUrl)
      results.push(trustTest)

      const executionTime = Date.now() - startTime

      return {
        agentName: 'sentiment_agent',
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
      logger.error('Sentiment agent failed', { error })
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

  private async analyzeBrandSentiment(brandName: string, websiteUrl: string): Promise<any> {
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
              content: 'You are a brand sentiment analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `Analyze the sentiment and perception of "${brandName}" brand. Score 0-100 where:
- 80-100: Highly positive sentiment, strong emotional connection
- 60-79: Generally positive, good reputation
- 40-59: Neutral or mixed sentiment
- 20-39: Negative associations
- 0-19: Severely negative perception

Respond with ONLY this JSON structure (no markdown, no code blocks):
{"score": 75, "sentiment": "positive", "confidence": 0.8, "key_associations": ["quality", "innovation"], "reasoning": "Brief explanation"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 400,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content || '{}'
      
      // Strip markdown code blocks
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch (parseError) {
        logger.warn('Failed to parse sentiment response', {
          rawContent: content.substring(0, 200),
          error: parseError instanceof Error ? parseError.message : String(parseError)
        })
        
        const scoreMatch = content.match(/score["\s:]+(\d+)/i)
        const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 50
        
        evaluation = {
          score: extractedScore,
          sentiment: 'neutral',
          confidence: 0.5,
          key_associations: [],
          reasoning: 'LLM response was not in expected JSON format'
        }
      }

      return {
        resultType: 'overall_sentiment',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          sentiment: evaluation.sentiment,
          keyAssociations: evaluation.key_associations || [],
          reasoning: evaluation.reasoning,
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Sentiment analysis failed', { error })
      
      return {
        resultType: 'overall_sentiment',
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

  private async analyzeEmotionalAssociations(brandName: string): Promise<any> {
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
              content: 'You are a brand emotion analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `What emotions or feelings do people associate with the brand "${brandName}"? Score 0-100 based on:
- Positive emotional resonance (0-50)
- Authenticity of associations (0-30)
- Emotional distinctiveness (0-20)

Respond with ONLY this JSON structure (no markdown, no code blocks):
{"score": 80, "confidence": 0.85, "emotions": ["inspired", "confident"], "summary": "Brief description of emotional associations"}`
            }
          ],
          temperature: 0.4,
          max_tokens: 300,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content || '{}'
      
      // Strip markdown code blocks
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch (parseError) {
        logger.warn('Failed to parse emotional associations response', {
          rawContent: content.substring(0, 200),
          error: parseError instanceof Error ? parseError.message : String(parseError)
        })
        
        const scoreMatch = content.match(/score["\s:]+(\d+)/i)
        const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 50
        
        evaluation = {
          score: extractedScore,
          confidence: 0.5,
          emotions: [],
          summary: 'LLM response was not in expected JSON format'
        }
      }

      return {
        resultType: 'emotional_associations',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          emotions: evaluation.emotions || [],
          summary: evaluation.summary,
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Emotional associations test failed', { error })
      
      return {
        resultType: 'emotional_associations',
        rawValue: 50,
        normalizedScore: 50,
        confidenceLevel: 0.4,
        evidence: {
          brandName,
          error: error instanceof Error ? error.message : 'Unknown error',
          fallback: true
        }
      }
    }
  }

  private async analyzeTrustSignals(brandName: string, websiteUrl: string): Promise<any> {
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
              content: 'You are a brand trust analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `How trustworthy is "${brandName}" perceived to be? Score 0-100 based on:
- Reputation signals (0-40)
- Authority indicators (0-30)
- Customer confidence (0-30)

Respond with ONLY this JSON structure (no markdown, no code blocks):
{"score": 85, "confidence": 0.9, "trust_level": "high", "key_signals": ["strong reputation", "customer loyalty"]}`
            }
          ],
          temperature: 0.3,
          max_tokens: 300,
          response_format: { type: "json_object" }
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
          score: 60,
          confidence: 0.5,
          trust_level: 'medium',
          key_signals: []
        }
      }

      return {
        resultType: 'trust_signals',
        rawValue: evaluation.score,
        normalizedScore: evaluation.score,
        confidenceLevel: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          trustLevel: evaluation.trust_level,
          keySignals: evaluation.key_signals || [],
          llmProvider: 'openai',
          model: 'gpt-4-turbo'
        }
      }

    } catch (error) {
      logger.error('Trust signals analysis failed', { error })
      
      return {
        resultType: 'trust_signals',
        rawValue: 55,
        normalizedScore: 55,
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
    logger.warn('Generating placeholder sentiment result (no API key)')
    
    return {
      agentName: 'sentiment_agent',
      status: 'completed',
      results: [
        {
          resultType: 'overall_sentiment',
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
          resultType: 'emotional_associations',
          rawValue: 55,
          normalizedScore: 55,
          confidenceLevel: 0.5,
          evidence: {
            brandName,
            placeholder: true,
            reason: 'No OpenAI API key configured'
          }
        },
        {
          resultType: 'trust_signals',
          rawValue: 65,
          normalizedScore: 65,
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

