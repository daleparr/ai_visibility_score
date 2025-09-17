import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
// Define AI provider types locally since we removed Supabase dependencies
export type AIProviderName = 'openai' | 'anthropic' | 'google' | 'mistral' | 'llama'

export interface EvaluationResult {
  provider: AIProviderName
  provider_name: AIProviderName
  model: string
  score: number
  score_contribution: number | null
  confidence: number
  response: string
  response_received: string
  metadata?: Record<string, any>
}

// AI Provider configurations
export const AI_PROVIDERS: Record<AIProviderName, {
  name: string
  displayName: string
  models: string[]
  baseUrl?: string
  defaultModel: string
}> = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4'
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-sonnet-20240229'
  },
  google: {
    name: 'google',
    displayName: 'Google AI',
    models: ['gemini-pro', 'gemini-pro-vision'],
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    defaultModel: 'gemini-pro'
  },
  mistral: {
    name: 'mistral',
    displayName: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium-latest'],
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest'
  },
  llama: {
    name: 'llama',
    displayName: 'LLaMA',
    models: ['llama-2-70b-chat', 'llama-2-13b-chat'],
    baseUrl: 'https://api.together.xyz/v1', // Using Together AI as proxy
    defaultModel: 'llama-2-70b-chat'
  }
}

// Evaluation prompt templates
export const EVALUATION_PROMPTS = {
  // Infrastructure & Machine Readability Tests
  infrastructure: {
    schema_structured_data: (brandName: string, websiteUrl: string) => 
      `Analyze the website ${websiteUrl} for ${brandName}. Evaluate the presence and quality of structured data markup (Schema.org, JSON-LD, microdata). Consider: 1) Coverage across key page types, 2) Completeness of product/organization schema, 3) Accuracy of markup, 4) GS1 standard alignment. Provide a score from 0-100 and explain your reasoning.`,
    
    semantic_clarity: (brandName: string, websiteUrl: string) => 
      `Evaluate the semantic clarity of ${brandName} (${websiteUrl}). Assess: 1) Brand name disambiguation, 2) Product terminology consistency, 3) Category vocabulary alignment, 4) Content hierarchy logic, 5) Cross-page semantic consistency. Score from 0-100 with detailed explanation.`,
    
    ontologies_taxonomy: (brandName: string, websiteUrl: string) => 
      `Analyze the taxonomical structure of ${brandName} (${websiteUrl}). Evaluate: 1) Logical product/service categorization, 2) Hierarchical navigation structure, 3) Cross-linking between related concepts, 4) Taxonomy stability, 5) Industry standard alignment. Provide 0-100 score with reasoning.`,
    
    knowledge_graphs: (brandName: string, websiteUrl: string) => 
      `Assess ${brandName}'s presence in knowledge graphs. Check: 1) Google Knowledge Graph presence, 2) Wikidata entries, 3) Internal entity linking, 4) Relationship mapping between concepts, 5) Entity disambiguation quality. Score 0-100 with explanation.`,
    
    llm_readability: (brandName: string, websiteUrl: string) =>
      `Evaluate how well ${brandName} (${websiteUrl}) is structured for LLM comprehension. Consider: 1) Content chunking and structure, 2) Alt text completeness, 3) Accessibility markup (ARIA), 4) Narrative flow coherence, 5) Machine-readable formatting. Score 0-100 with details.`,
    
    conversational_copy: (brandName: string, websiteUrl: string) =>
      `Analyze the conversational copy quality of ${brandName} (${websiteUrl}). Evaluate how well their content teaches AI why the brand matters through natural language. Assess: 1) Coverage - Rich conversational copy across products vs flat descriptions (0-25 pts), 2) Quality & Use-Case Framing - Distinct, application-driven language like "Perfect under a blazer" vs generic phrasing (0-25 pts), 3) Query Alignment - Content that mirrors natural queries like "Best T-shirt for layering" vs no Q&A style (0-25 pts), 4) Semantic Enrichment - Integration of brand values, attributes, and ontologies vs no brand integration (0-25 pts). Provide detailed scoring breakdown and overall 0-100 score with specific examples from their content.`
  },

  // Perception & Reputation Tests
  perception: {
    geo_visibility: (brandName: string, websiteUrl: string) => 
      `Test ${brandName}'s geographic visibility in AI responses. Evaluate: 1) Presence in location-based queries, 2) Geographic coverage accuracy, 3) Local business information completeness, 4) Regional brand recognition. Provide 0-100 score with geographic analysis.`,
    
    citation_strength: (brandName: string, websiteUrl: string) => 
      `Analyze citation strength for ${brandName}. Assess: 1) Premium media mentions, 2) Industry publication presence, 3) Academic/research citations, 4) Authority domain backlinks, 5) Citation context quality. Score 0-100 with citation analysis.`,
    
    answer_quality: (brandName: string, websiteUrl: string) => 
      `Evaluate the quality of AI responses about ${brandName}. Test: 1) Response completeness, 2) Factual accuracy, 3) Relevance of details, 4) Consistency across queries, 5) Depth of information. Provide 0-100 score with quality assessment.`,
    
    sentiment_trust: (brandName: string, websiteUrl: string) => 
      `Assess sentiment and trust signals for ${brandName}. Analyze: 1) Overall sentiment in AI responses, 2) Trust indicators present, 3) Customer review sentiment, 4) Crisis/negative event handling, 5) Reputation consistency. Score 0-100 with sentiment analysis.`
  },

  // Commerce & Customer Experience Tests
  commerce: {
    hero_products: (brandName: string, websiteUrl: string) => 
      `Evaluate ${brandName}'s product visibility in AI recommendations. Test: 1) Best-seller identification accuracy, 2) Product recommendation quality, 3) Feature/benefit articulation, 4) Competitive positioning understanding, 5) Value proposition clarity. Score 0-100 with product analysis.`,
    
    shipping_freight: (brandName: string, websiteUrl: string) => 
      `Analyze shipping and delivery information for ${brandName}. Assess: 1) Shipping cost transparency, 2) Delivery timeframe clarity, 3) Geographic coverage accuracy, 4) Return policy accessibility, 5) Fulfillment option completeness. Provide 0-100 score with logistics evaluation.`
  }
}

// Brand recognition test prompts
export const BRAND_RECOGNITION_PROMPTS = {
  basic: (brandName: string) => 
    `What can you tell me about ${brandName}? Please provide information about what they do, their products or services, and their reputation.`,
  
  comparison: (brandName: string, competitor: string) => 
    `How does ${brandName} compare to ${competitor}? What are the key differences in their offerings and market position?`,
  
  recommendation: (brandName: string, category: string) => 
    `I'm looking for ${category}. Would you recommend ${brandName}? Why or why not?`,
  
  specific: (brandName: string, query: string) => 
    `${query} ${brandName}`,
}

// AI Provider API interfaces
export interface AIProviderResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: string
}

export class AIProviderClient {
  private apiKey: string
  private provider: AIProviderName
  private baseUrl: string
  private defaultModel: string

  constructor(provider: AIProviderName, apiKey: string) {
    this.provider = provider
    this.apiKey = apiKey
    this.baseUrl = AI_PROVIDERS[provider].baseUrl || ''
    this.defaultModel = AI_PROVIDERS[provider].defaultModel
  }

  async query(prompt: string, model?: string): Promise<AIProviderResponse> {
    const selectedModel = model || this.defaultModel

    try {
      switch (this.provider) {
        case 'openai':
          return await this.queryOpenAI(prompt, selectedModel)
        case 'anthropic':
          return await this.queryAnthropic(prompt, selectedModel)
        case 'google':
          return await this.queryGoogle(prompt, selectedModel)
        case 'mistral':
          return await this.queryMistral(prompt, selectedModel)
        case 'llama':
          return await this.queryLlama(prompt, selectedModel)
        default:
          throw new Error(`Unsupported provider: ${this.provider}`)
      }
    } catch (error: any) {
      return {
        content: '',
        model: selectedModel,
        error: error.message || 'Unknown error occurred'
      }
    }
  }

  private async queryOpenAI(prompt: string, model: string): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      model,
      usage: data.usage,
    }
  }

  private async queryAnthropic(prompt: string, model: string): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content[0]?.text || '',
      model,
      usage: data.usage,
    }
  }

  private async queryGoogle(prompt: string, model: string): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.1,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.candidates[0]?.content?.parts[0]?.text || '',
      model,
    }
  }

  private async queryMistral(prompt: string, model: string): Promise<AIProviderResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      model,
      usage: data.usage,
    }
  }

  private async queryLlama(prompt: string, model: string): Promise<AIProviderResponse> {
    // Using Together AI as a proxy for LLaMA models
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: `meta-llama/${model}`,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      throw new Error(`LLaMA API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      model,
      usage: data.usage,
    }
  }
}

// Score extraction from AI responses
export function extractScoreFromResponse(response: string): number {
  // Look for score patterns in the response
  const scorePatterns = [
    /score[:\s]*(\d+)(?:\/100)?/i,
    /(\d+)(?:\/100|\s*out\s*of\s*100)/i,
    /rating[:\s]*(\d+)/i,
    /(\d+)\s*points?/i,
  ]

  for (const pattern of scorePatterns) {
    const match = response.match(pattern)
    if (match) {
      const score = parseInt(match[1], 10)
      if (score >= 0 && score <= 100) {
        return score
      }
    }
  }

  // If no explicit score found, analyze sentiment and keywords for estimation
  return estimateScoreFromContent(response)
}

function estimateScoreFromContent(content: string): number {
  const lowerContent = content.toLowerCase()
  
  // Positive indicators
  const positiveWords = ['excellent', 'outstanding', 'strong', 'good', 'well', 'comprehensive', 'complete', 'effective']
  const negativeWords = ['poor', 'weak', 'lacking', 'missing', 'incomplete', 'limited', 'inadequate', 'problematic']
  
  let positiveCount = 0
  let negativeCount = 0
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) negativeCount++
  })
  
  // Base score calculation
  if (positiveCount > negativeCount * 2) return 80
  if (positiveCount > negativeCount) return 65
  if (negativeCount > positiveCount) return 35
  if (negativeCount > positiveCount * 2) return 20
  
  return 50 // Neutral/unclear response
}

// Utility function to validate API keys
export function validateApiKey(provider: AIProviderName, apiKey: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) return false
  
  switch (provider) {
    case 'openai':
      return apiKey.startsWith('sk-')
    case 'anthropic':
      return apiKey.startsWith('sk-ant-')
    case 'google':
      return apiKey.length > 20 // Google API keys are typically longer
    case 'mistral':
      return apiKey.length > 20
    case 'llama':
      return apiKey.length > 20
    default:
      return false
  }
}

// Website content fetcher for AI analysis
export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`
    
    // Fetch the actual website content
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'AI-Discoverability-Index-Bot/1.0 (+https://ai-discoverability-index.com/bot)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const html = await response.text()
    
    // Extract key content for AI analysis
    const content = extractKeyContent(html, fullUrl)
    
    return content
  } catch (error) {
    console.error('Error fetching website content:', error)
    // Return basic URL info if fetch fails
    return `Unable to fetch content from ${url}. Please analyze based on the URL and any publicly available information about this website.`
  }
}

// Extract key content from HTML for AI analysis
function extractKeyContent(html: string, url: string): string {
  try {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : 'No title found'
    
    // Extract meta description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : 'No meta description found'
    
    // Extract JSON-LD structured data
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    const structuredData = jsonLdMatches ? jsonLdMatches.map(match => {
      try {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
        return JSON.parse(jsonContent)
      } catch {
        return null
      }
    }).filter(Boolean) : []
    
    // Extract main content (simplified - remove scripts, styles, nav)
    let mainContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Limit content length for AI processing
    if (mainContent.length > 3000) {
      mainContent = mainContent.substring(0, 3000) + '...'
    }
    
    return `Website Analysis for: ${url}

Title: ${title}

Meta Description: ${metaDescription}

Structured Data Found: ${structuredData.length > 0 ? JSON.stringify(structuredData, null, 2).substring(0, 1000) : 'None detected'}

Main Content: ${mainContent}

Please analyze this website content and provide a detailed evaluation with a numerical score from 0-100.`
    
  } catch (error) {
    console.error('Error extracting content:', error)
    return `Basic website information for ${url}. Unable to extract detailed content for analysis.`
  }
}