'use client'

// Perplexity API client for Pro+ tier enhancements
export interface PerplexitySearchResult {
  answer: string
  citations: string[]
  sources: Array<{
    title: string
    url: string
    snippet: string
  }>
}

export interface PerplexityResponse {
  id: string
  model: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class PerplexityClient {
  private apiKey: string
  private baseURL: string = 'https://api.perplexity.ai'

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || ''
    if (!this.apiKey) {
      console.warn('⚠️ PERPLEXITY_API_KEY not found - Perplexity features disabled')
    }
  }

  async searchWithSonar(query: string, model: string = 'llama-3.1-sonar-large-128k-online'): Promise<PerplexitySearchResult> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured')
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that provides accurate, up-to-date information with citations.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          return_citations: true,
          return_images: false
        })
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`)
      }

      const data: PerplexityResponse = await response.json()
      
      return {
        answer: data.choices[0]?.message?.content || '',
        citations: [], // Perplexity includes citations in the content
        sources: [] // Would need to parse from response if available
      }
    } catch (error) {
      console.error('❌ Perplexity API error:', error)
      throw error
    }
  }

  async enhanceBrandAnalysis(brandName: string, websiteUrl: string): Promise<{
    currentMentions: string
    competitorAnalysis: string
    marketTrends: string
    reputationSignals: string
  }> {
    if (!this.apiKey) {
      console.log('⚠️ Perplexity not available - skipping enhancement')
      return {
        currentMentions: '',
        competitorAnalysis: '',
        marketTrends: '',
        reputationSignals: ''
      }
    }

    try {
      const [mentions, competitors, trends, reputation] = await Promise.all([
        this.searchWithSonar(`Recent news and mentions of ${brandName} brand in the last 30 days`),
        this.searchWithSonar(`Who are the main competitors of ${brandName}? Compare their market position and visibility`),
        this.searchWithSonar(`Current market trends and consumer sentiment for ${brandName} industry sector`),
        this.searchWithSonar(`${brandName} brand reputation, customer reviews, and trust signals online`)
      ])

      return {
        currentMentions: mentions.answer,
        competitorAnalysis: competitors.answer,
        marketTrends: trends.answer,
        reputationSignals: reputation.answer
      }
    } catch (error) {
      console.error('❌ Perplexity brand analysis failed:', error)
      return {
        currentMentions: '',
        competitorAnalysis: '',
        marketTrends: '',
        reputationSignals: ''
      }
    }
  }
}

export const perplexityClient = new PerplexityClient()
