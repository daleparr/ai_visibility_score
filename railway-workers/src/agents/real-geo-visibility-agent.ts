import { createLogger } from '../utils/logger'
import { AgentContext } from '../types'

const logger = createLogger('real-geo-visibility-agent')

/**
 * Real Geo Visibility Agent - Analyzes geographic visibility using real LLM calls
 * Tests brand presence across different geographic regions
 */
export class RealGeoVisibilityAgent {
  private openaiApiKey: string | undefined

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!this.openaiApiKey) {
      logger.warn('OpenAI API key not configured - Geo visibility analysis will use simulated data')
    }
  }

  async execute(context: AgentContext): Promise<any> {
    const startTime = Date.now()
    
    logger.info('Executing real geo visibility agent', {
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

      // Test 1: Geographic Reach
      const reachTest = await this.analyzeGeographicReach(brandName, context.websiteUrl)
      results.push(reachTest)

      // Test 2: Local Presence
      const localTest = await this.analyzeLocalPresence(brandName, context.websiteUrl)
      results.push(localTest)

      // Test 3: International Availability
      const internationalTest = await this.analyzeInternationalAvailability(brandName)
      results.push(internationalTest)

      const executionTime = Date.now() - startTime

      return {
        agentName: 'geo_visibility_agent',
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
      logger.error('Geo visibility agent failed', { error })
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

  private async analyzeGeographicReach(brandName: string, websiteUrl: string): Promise<any> {
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
              content: 'You are a geographic market analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `What is the geographic reach of "${brandName}"? Score 0-100 based on:
- Global recognition (0-40)
- Regional presence (0-30)
- Market coverage (0-30)

Respond with ONLY this JSON structure (no markdown):
{"score": 90, "confidence": 0.95, "reach": "global", "regions": ["North America", "Europe"], "insights": "Brief market coverage analysis"}`
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
      
      // Strip markdown if present
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch (parseError) {
        logger.warn('Failed to parse geographic reach response', {
          rawContent: content.substring(0, 200),
          error: parseError instanceof Error ? parseError.message : String(parseError)
        })
        
        const scoreMatch = content.match(/score["\s:]+(\d+)/i)
        const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 50
        
        evaluation = {
          score: extractedScore,
          confidence: 0.5,
          reach: 'regional',
          regions: [],
          insights: 'LLM response was not in expected JSON format'
        }
      }

      return {
        type: 'geographic_reach',
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          reach: evaluation.reach,
          regions: evaluation.regions || [],
          insights: evaluation.insights,
          llmProvider: 'openai',
          model: 'gpt-4-turbo',
          llmResponse: content.substring(0, 500),
          parsedSuccessfully: true
        }
      }

    } catch (error) {
      logger.error('Geographic reach analysis failed', { error })
      
      return {
        type: 'geographic_reach',
        score: 50,
        confidence: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'API call failed - network or authentication issue',
          llmProvider: 'openai',
          model: 'gpt-4-turbo',
          parsedSuccessfully: false,
          errorType: 'api_error'
        }
      }
    }
  }

  private async analyzeLocalPresence(brandName: string, websiteUrl: string): Promise<any> {
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
              content: 'You are a local market analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `Does "${brandName}" have a strong local presence or physical locations? Score 0-100 based on:
- Physical location visibility (0-40)
- Local search optimization (0-30)
- Community presence (0-30)

Respond with ONLY this JSON structure:
{"score": 85, "confidence": 0.9, "has_locations": true, "location_types": ["Retail stores"], "assessment": "Brief summary"}`
            }
          ],
          temperature: 0.3,
          max_tokens: 350,
          response_format: { type: "json_object" }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content || '{}'
      
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch (parseError) {
        logger.warn('Failed to parse local presence response', { rawContent: content.substring(0, 200) })
        const scoreMatch = content.match(/score["\s:]+(\d+)/i)
        evaluation = {
          score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
          confidence: 0.5,
          has_locations: false,
          location_types: [],
          assessment: 'LLM response was not in expected JSON format'
        }
      }

      return {
        type: 'local_presence',
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          websiteUrl,
          hasLocations: evaluation.has_locations,
          locationTypes: evaluation.location_types || [],
          assessment: evaluation.assessment,
          llmProvider: 'openai',
          model: 'gpt-4-turbo',
          llmResponse: content.substring(0, 500),
          parsedSuccessfully: true
        }
      }

    } catch (error) {
      logger.error('Local presence analysis failed', { error })
      
      return {
        type: 'local_presence',
        score: 45,
        confidence: 0.4,
        evidence: {
          brandName,
          websiteUrl,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: 'API call failed',
          llmProvider: 'openai',
          parsedSuccessfully: false
        }
      }
    }
  }

  private async analyzeInternationalAvailability(brandName: string): Promise<any> {
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
              content: 'You are an international commerce analyst. Respond ONLY with valid JSON.'
            },
            {
              role: 'user',
              content: `Is "${brandName}" available internationally? Score 0-100 based on:
- International shipping/availability (0-40)
- Multi-region support (0-30)
- Global brand recognition (0-30)

Respond with ONLY this JSON structure:
{"score": 95, "confidence": 0.95, "ships_internationally": true, "available_regions": ["North America", "Europe"]}`
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
      let content = data.choices[0]?.message?.content || '{}'
      
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      
      let evaluation
      try {
        evaluation = JSON.parse(content)
      } catch (parseError) {
        logger.warn('Failed to parse international availability response', { rawContent: content.substring(0, 200) })
        const scoreMatch = content.match(/score["\s:]+(\d+)/i)
        evaluation = {
          score: scoreMatch ? parseInt(scoreMatch[1]) : 55,
          confidence: 0.5,
          ships_internationally: false,
          available_regions: []
        }
      }

      return {
        type: 'international_availability',
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidence: {
          brandName,
          shipsInternationally: evaluation.ships_internationally,
          availableRegions: evaluation.available_regions || [],
          llmProvider: 'openai',
          model: 'gpt-4-turbo',
          llmResponse: content.substring(0, 500),
          parsedSuccessfully: true
        }
      }

    } catch (error) {
      logger.error('International availability analysis failed', { error })
      
      return {
        type: 'international_availability',
        score: 55,
        score: 55,
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
    logger.warn('Generating placeholder geo visibility result (no API keys)')
    
    return {
      agentName: 'geo_visibility_agent',
      status: 'completed',
      results: [
        {
          type: 'geographic_reach',
          score: 60,
          score: 60,
          confidence: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No API keys configured'
          }
        },
        {
          type: 'local_presence',
          score: 50,
          score: 50,
          confidence: 0.5,
          evidence: {
            brandName,
            websiteUrl,
            placeholder: true,
            reason: 'No API keys configured'
          }
        },
        {
          type: 'international_availability',
          score: 55,
          score: 55,
          confidence: 0.5,
          evidence: {
            brandName,
            placeholder: true,
            reason: 'No API keys configured'
          }
        }
      ],
      executionTime,
      metadata: {
        timestamp: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        placeholder: true,
        reason: 'No API keys configured',
        railwayExecution: true
      }
    }
  }
}

