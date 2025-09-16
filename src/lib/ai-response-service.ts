import { OpenAI } from 'openai'

export interface AIResponseRequest {
  brandName: string
  websiteUrl: string
  dimensionName: string
  brandCategory?: {
    sector: string
    industry: string
    niche: string
    emoji: string
  }
  userTier: 'free' | 'index_pro' | 'enterprise'
}

export interface AIResponseResult {
  current: string
  improved: string
  isRealAI: boolean
  provider: string
  timestamp: Date
}

class AIResponseService {
  private openai: OpenAI | null = null

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Generate real AI responses for current vs improved brand visibility
   */
  async generateRealAIResponses(request: AIResponseRequest): Promise<AIResponseResult> {
    // Only provide real AI for paid tiers
    if (request.userTier === 'free') {
      return this.getFallbackResponse(request)
    }

    if (!this.openai) {
      console.warn('OpenAI not configured, falling back to simulated responses')
      return this.getFallbackResponse(request)
    }

    try {
      const [currentResponse, improvedResponse] = await Promise.all([
        this.queryCurrentAIKnowledge(request),
        this.queryImprovedAIKnowledge(request)
      ])

      return {
        current: currentResponse,
        improved: improvedResponse,
        isRealAI: true,
        provider: 'OpenAI GPT-4',
        timestamp: new Date()
      }
    } catch (error) {
      console.error('AI response generation failed:', error)
      return this.getFallbackResponse(request)
    }
  }

  /**
   * Query AI with current brand knowledge (simulating limited visibility)
   */
  private async queryCurrentAIKnowledge(request: AIResponseRequest): Promise<string> {
    const prompt = this.buildCurrentKnowledgePrompt(request)
    
    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant with limited knowledge about brands. Respond as if you have basic, incomplete information about the brand. Be honest about limitations and uncertainty. Keep responses concise and realistic.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || 'I have limited information about this brand.'
  }

  /**
   * Query AI with improved brand knowledge (simulating enhanced visibility)
   */
  private async queryImprovedAIKnowledge(request: AIResponseRequest): Promise<string> {
    const prompt = this.buildImprovedKnowledgePrompt(request)
    
    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant with comprehensive, well-structured knowledge about brands. Provide detailed, accurate, and helpful responses. You have access to complete brand information including products, locations, policies, and competitive positioning.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    })

    return completion.choices[0]?.message?.content || 'With improved data, I can provide comprehensive information about this brand.'
  }

  /**
   * Build prompt for current (limited) AI knowledge
   */
  private buildCurrentKnowledgePrompt(request: AIResponseRequest): string {
    const dimensionQueries: Record<string, string> = {
      'Geographic Visibility': `Someone asks you: "Where can I find ${request.brandName} stores near me?" Respond as if you have limited location data.`,
      'Citation Strength': `Someone asks you: "What do you know about ${request.brandName}'s reputation?" Respond as if you have minimal citation data.`,
      'AI Response Quality': `Someone asks you: "Tell me about ${request.brandName}." Respond as if you have basic, incomplete information.`,
      'Schema & Structured Data': `Someone asks you: "What products does ${request.brandName} sell and what are the prices?" Respond as if you have limited product data.`,
      'Product Identification': `Someone asks you: "What is ${request.brandName} known for?" Respond as if you have vague product knowledge.`,
      'Semantic Clarity': `Someone asks you: "How would you describe ${request.brandName}?" Respond as if the information you have is scattered and unclear.`,
      'Recommendation Accuracy': `Someone asks you: "What would you recommend from ${request.brandName}?" Respond as if you're uncertain about recommendations.`,
      'Brand Heritage': `Someone asks you: "What's the history of ${request.brandName}?" Respond as if you have limited background information.`,
      'Transaction Clarity': `Someone asks you: "What are ${request.brandName}'s shipping and return policies?" Respond as if you're unsure about policies.`,
      'Knowledge Graph Presence': `Someone asks you: "What can you tell me about ${request.brandName}?" Respond as if you have outdated or incomplete knowledge.`,
      'LLM Readability': `Someone asks you about ${request.brandName}. Respond as if their website content is hard for you to understand.`,
      'Competitive Positioning': `Someone asks you: "How does ${request.brandName} compare to competitors?" Respond as if you're uncertain about positioning.`
    }

    return dimensionQueries[request.dimensionName] || 
           `Someone asks you about ${request.brandName}. Respond as if you have limited information.`
  }

  /**
   * Build prompt for improved AI knowledge
   */
  private buildImprovedKnowledgePrompt(request: AIResponseRequest): string {
    const brandContext = request.brandCategory ? 
      `${request.brandName} is a ${request.brandCategory.industry} brand in the ${request.brandCategory.sector} sector, specifically in ${request.brandCategory.niche}.` : 
      `${request.brandName} from ${request.websiteUrl}.`

    const dimensionQueries: Record<string, string> = {
      'Geographic Visibility': `${brandContext} Someone asks you: "Where can I find ${request.brandName} stores near me?" Provide specific, helpful location information.`,
      'Citation Strength': `${brandContext} Someone asks you: "What do you know about ${request.brandName}'s reputation?" Provide detailed reputation and citation information.`,
      'AI Response Quality': `${brandContext} Someone asks you: "Tell me about ${request.brandName}." Provide comprehensive, detailed information.`,
      'Schema & Structured Data': `${brandContext} Someone asks you: "What products does ${request.brandName} sell and what are the prices?" Provide specific product and pricing information.`,
      'Product Identification': `${brandContext} Someone asks you: "What is ${request.brandName} known for?" Provide detailed product knowledge and specialties.`,
      'Semantic Clarity': `${brandContext} Someone asks you: "How would you describe ${request.brandName}?" Provide clear, well-organized information.`,
      'Recommendation Accuracy': `${brandContext} Someone asks you: "What would you recommend from ${request.brandName}?" Provide specific, personalized recommendations.`,
      'Brand Heritage': `${brandContext} Someone asks you: "What's the history of ${request.brandName}?" Provide detailed background and heritage information.`,
      'Transaction Clarity': `${brandContext} Someone asks you: "What are ${request.brandName}'s shipping and return policies?" Provide clear policy information.`,
      'Knowledge Graph Presence': `${brandContext} Someone asks you: "What can you tell me about ${request.brandName}?" Provide current, comprehensive knowledge.`,
      'LLM Readability': `${brandContext} Someone asks you about ${request.brandName}. Respond as if their content is perfectly structured and easy to understand.`,
      'Competitive Positioning': `${brandContext} Someone asks you: "How does ${request.brandName} compare to competitors?" Provide detailed competitive analysis.`
    }

    return dimensionQueries[request.dimensionName] || 
           `${brandContext} Someone asks you about ${request.brandName}. Provide comprehensive, helpful information.`
  }

  /**
   * Fallback to simulated responses for free tier or when AI unavailable
   */
  private getFallbackResponse(request: AIResponseRequest): AIResponseResult {
    // Import the existing simulated responses
    const examples: Record<string, { before: string; after: string }> = {
      'Geographic Visibility': {
        before: "I can find some stores but I'm not sure about current hours or exact locations.",
        after: "There are 3 stores near you. The Regent Street location is open until 8pm and has parking available."
      },
      'Citation Strength': {
        before: "I've heard of this brand but don't know much about their reputation.",
        after: "This brand has been featured in Vogue and Business Insider for their sustainable practices and quality."
      },
      'AI Response Quality': {
        before: "I can find basic information but details are limited.",
        after: "This London-based brand specializes in minimalist design, launched in 2007, and focuses on sustainable materials."
      },
      'Schema & Structured Data': {
        before: "I can see they sell clothing but I'm not sure about prices or availability.",
        after: "The quilted bag is £89, available in black and brown, and in stock for next-day delivery."
      },
      'Product Identification': {
        before: "They have various products but I'm not sure what they're known for.",
        after: "They're famous for their quilted bags, minimalist outerwear, and sustainable basics - especially the fisherman sweater."
      },
      'Semantic Clarity': {
        before: "I can find information but it's scattered and hard to understand.",
        after: "Their content is well-organized with clear sections for products, sustainability, and brand story."
      },
      'Recommendation Accuracy': {
        before: "I can suggest some products but I'm not sure they're the best fit.",
        after: "Based on your style preferences, I'd recommend their signature quilted bag - it's versatile, sustainable, and perfect for everyday use."
      },
      'Brand Heritage': {
        before: "I know it's a fashion brand but not much about their background.",
        after: "Founded in London in 2007, this H&M Group brand focuses on minimalist design and sustainable materials with Scandinavian influences."
      },
      'Transaction Clarity': {
        before: "I'm not sure about their shipping policies or return process.",
        after: "They offer free shipping over £50, 30-day returns, and next-day delivery in major cities."
      },
      'Knowledge Graph Presence': {
        before: "I have basic information but it might not be current.",
        after: "According to Google's knowledge base, they have 200+ stores globally and are known for sustainable fashion."
      },
      'LLM Readability': {
        before: "The website content is hard for me to parse and understand.",
        after: "The website uses clear, structured content that I can easily understand and reference."
      },
      'Competitive Positioning': {
        before: "I'm not sure how they compare to other fashion brands.",
        after: "They're positioned as a premium sustainable alternative to fast fashion, competing with COS and Arket in the conscious luxury space."
      }
    }

    const example = examples[request.dimensionName] || {
      before: "Limited information available about this aspect of your brand.",
      after: "Comprehensive, accurate information helps AI give better recommendations."
    }

    return {
      current: example.before,
      improved: example.after,
      isRealAI: false,
      provider: 'Simulated',
      timestamp: new Date()
    }
  }
}

export const aiResponseService = new AIResponseService()