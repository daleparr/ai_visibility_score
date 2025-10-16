// LLM Probe Engine - executes systematic queries across models

import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { BrandMention, ProbeResult, SectorPrompt, ModelConfig } from './types';

// Model configurations
export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    version: 'gpt-4-turbo-preview',
    enabled: true,
    costPerToken: { input: 0.00001, output: 0.00003 },
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    version: 'claude-3-5-sonnet-20241022',
    enabled: true,
    costPerToken: { input: 0.000003, output: 0.000015 },
    maxTokens: 4096,
    temperature: 0.7,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    version: 'gemini-1.5-pro',
    enabled: true,
    costPerToken: { input: 0.0000035, output: 0.0000105 },
    maxTokens: 8192,
    temperature: 0.7,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'perplexity',
    version: 'sonar-pro',
    enabled: true,
    costPerToken: { input: 0.000003, output: 0.000015 },
    maxTokens: 4096,
    temperature: 0.7,
  },
];

interface ProbeExecutionResult {
  modelId: string;
  promptId: string;
  runNumber: number;
  responseText: string;
  responseTokens: number;
  responseLatencyMs: number;
  brandsMentioned: BrandMention[];
  sentimentAnalysis: Record<string, any>;
  sourcesCited: Array<any>;
  hallucinationFlags: Array<any>;
  responseQualityScore: number;
  brandExtractionConfidence: number;
  error?: string;
}

export class ProbeEngine {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private models: ModelConfig[];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.models = MODEL_CONFIGS.filter(m => m.enabled);
  }

  /**
   * Run a complete sector probe across all models and prompts
   */
  async runSectorProbe(
    sectorId: string,
    prompts: SectorPrompt[],
    runDate: Date = new Date()
  ): Promise<ProbeExecutionResult[]> {
    console.log(`Starting sector probe for ${sectorId} with ${prompts.length} prompts`);
    
    const results: ProbeExecutionResult[] = [];
    
    // Process prompts in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      
      for (const prompt of batch) {
        for (const model of this.models) {
          // Run each prompt 3 times for statistical stability
          const runs = await Promise.all([
            this.executeProbe(model, prompt, 1),
            this.executeProbe(model, prompt, 2),
            this.executeProbe(model, prompt, 3),
          ]);
          
          results.push(...runs);
        }
      }
      
      // Rate limiting pause between batches
      if (i + batchSize < prompts.length) {
        await this.sleep(2000);
      }
    }
    
    console.log(`Completed sector probe: ${results.length} total probes`);
    return results;
  }

  /**
   * Execute a single probe against one model
   */
  private async executeProbe(
    model: ModelConfig,
    prompt: SectorPrompt,
    runNumber: number
  ): Promise<ProbeExecutionResult> {
    const startTime = Date.now();
    
    try {
      let response: string;
      let tokens: number;
      
      // Call appropriate model
      switch (model.provider) {
        case 'openai':
          ({ response, tokens } = await this.callOpenAI(model, prompt.promptText));
          break;
        case 'anthropic':
          ({ response, tokens } = await this.callAnthropic(model, prompt.promptText));
          break;
        case 'google':
          ({ response, tokens } = await this.callGemini(model, prompt.promptText));
          break;
        case 'perplexity':
          ({ response, tokens } = await this.callPerplexity(model, prompt.promptText));
          break;
        default:
          throw new Error(`Unsupported provider: ${model.provider}`);
      }
      
      const latency = Date.now() - startTime;
      
      // Extract structured data from response
      const brands = this.extractBrands(response);
      const sentiment = this.analyzeSentiment(response, brands);
      const sources = this.extractSources(response);
      const hallucinations = this.detectHallucinations(response, brands);
      const qualityScore = this.calculateQualityScore(response, brands, sources);
      const extractionConfidence = this.calculateExtractionConfidence(brands);
      
      return {
        modelId: model.id,
        promptId: prompt.id,
        runNumber,
        responseText: response,
        responseTokens: tokens,
        responseLatencyMs: latency,
        brandsMentioned: brands,
        sentimentAnalysis: sentiment,
        sourcesCited: sources,
        hallucinationFlags: hallucinations,
        responseQualityScore: qualityScore,
        brandExtractionConfidence: extractionConfidence,
      };
    } catch (error) {
      console.error(`Probe failed for ${model.id}:`, error);
      return {
        modelId: model.id,
        promptId: prompt.id,
        runNumber,
        responseText: '',
        responseTokens: 0,
        responseLatencyMs: Date.now() - startTime,
        brandsMentioned: [],
        sentimentAnalysis: {},
        sourcesCited: [],
        hallucinationFlags: [],
        responseQualityScore: 0,
        brandExtractionConfidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(model: ModelConfig, prompt: string): Promise<{ response: string; tokens: number }> {
    const completion = await this.openai.chat.completions.create({
      model: model.version,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant providing informative recommendations to consumers. Be specific about brands and products when answering questions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: model.temperature,
      max_tokens: model.maxTokens,
    });
    
    const response = completion.choices[0]?.message?.content || '';
    const tokens = completion.usage?.total_tokens || 0;
    
    return { response, tokens };
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(model: ModelConfig, prompt: string): Promise<{ response: string; tokens: number }> {
    const message = await this.anthropic.messages.create({
      model: model.version,
      max_tokens: model.maxTokens,
      temperature: model.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const response = message.content[0]?.type === 'text' ? message.content[0].text : '';
    const tokens = message.usage.input_tokens + message.usage.output_tokens;
    
    return { response, tokens };
  }

  /**
   * Call Google Gemini API (placeholder - implement with actual SDK)
   */
  private async callGemini(model: ModelConfig, prompt: string): Promise<{ response: string; tokens: number }> {
    // TODO: Implement with actual Google AI SDK
    console.log('Gemini API call - placeholder');
    return { response: 'Gemini response placeholder', tokens: 100 };
  }

  /**
   * Call Perplexity API (placeholder - implement with actual SDK)
   */
  private async callPerplexity(model: ModelConfig, prompt: string): Promise<{ response: string; tokens: number }> {
    // TODO: Implement with Perplexity API
    console.log('Perplexity API call - placeholder');
    return { response: 'Perplexity response placeholder', tokens: 100 };
  }

  /**
   * Extract brand mentions from response text
   */
  private extractBrands(text: string): BrandMention[] {
    const brands: BrandMention[] = [];
    
    // Pattern 1: Numbered lists (1., 2., etc.)
    const numberedPattern = /(\d+)\.\s*\*?\*?([A-Z][A-Za-z0-9\s&'-]+?)(?:\*?\*?:|\*?\*?\s*[-–—]|\*?\*?\s*\n)/g;
    let match;
    while ((match = numberedPattern.exec(text)) !== null) {
      const position = parseInt(match[1]);
      const brand = match[2].trim();
      brands.push({
        brand,
        position,
        contextSnippet: this.getContextSnippet(text, match.index, 100),
        confidence: 0.9,
      });
    }
    
    // Pattern 2: Bullet points with brand names in bold or at start
    const bulletPattern = /[•\-\*]\s*\*?\*?([A-Z][A-Za-z0-9\s&'-]+?)(?:\*?\*?:|\*?\*?\s*[-–—])/g;
    while ((match = bulletPattern.exec(text)) !== null) {
      const brand = match[1].trim();
      if (!brands.find(b => b.brand === brand)) {
        brands.push({
          brand,
          position: brands.length + 1,
          contextSnippet: this.getContextSnippet(text, match.index, 100),
          confidence: 0.8,
        });
      }
    }
    
    // Pattern 3: Common brand name patterns (capitalize, known brand formats)
    // This would use a more sophisticated NER approach in production
    
    return brands.slice(0, 20); // Cap at 20 mentions
  }

  /**
   * Analyze sentiment for each brand mention
   */
  private analyzeSentiment(text: string, brands: BrandMention[]): Record<string, any> {
    const sentiment: Record<string, any> = {};
    
    for (const brand of brands) {
      const context = brand.contextSnippet.toLowerCase();
      
      // Simple keyword-based sentiment (would use ML in production)
      const positiveWords = ['best', 'excellent', 'great', 'outstanding', 'top', 'leading', 'reliable', 'trusted', 'innovative'];
      const negativeWords = ['poor', 'worst', 'bad', 'expensive', 'overpriced', 'unreliable', 'disappointing'];
      
      let score = 0;
      positiveWords.forEach(word => {
        if (context.includes(word)) score += 0.15;
      });
      negativeWords.forEach(word => {
        if (context.includes(word)) score -= 0.15;
      });
      
      sentiment[brand.brand] = {
        score: Math.max(-1, Math.min(1, score)),
        context: brand.contextSnippet,
        classification: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
      };
    }
    
    return sentiment;
  }

  /**
   * Extract cited sources from response
   */
  private extractSources(text: string): Array<{ source: string; url?: string }> {
    const sources: Array<{ source: string; url?: string }> = [];
    
    // Extract URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    let match;
    while ((match = urlPattern.exec(text)) !== null) {
      sources.push({ source: 'URL', url: match[1] });
    }
    
    // Extract source citations (e.g., "according to X", "based on Y")
    const sourcePattern = /(?:according to|based on|source:|from)\s+([A-Z][A-Za-z\s]+)/g;
    while ((match = sourcePattern.exec(text)) !== null) {
      sources.push({ source: match[1].trim() });
    }
    
    return sources;
  }

  /**
   * Detect potential hallucinations (placeholder - would use more sophisticated checks)
   */
  private detectHallucinations(text: string, brands: BrandMention[]): Array<any> {
    const flags: Array<any> = [];
    
    // Check for suspiciously specific claims without sources
    const specificClaimPattern = /\b\d+%\b|\$\d+\.\d+\b/g;
    const matches = text.match(specificClaimPattern);
    if (matches && matches.length > 3) {
      flags.push({
        type: 'unsourced_statistics',
        severity: 'medium',
        description: 'Multiple specific claims without clear sources',
      });
    }
    
    return flags;
  }

  /**
   * Calculate overall response quality score
   */
  private calculateQualityScore(
    text: string,
    brands: BrandMention[],
    sources: Array<any>
  ): number {
    let score = 0.5; // Base score
    
    // Bonus for brand mentions
    if (brands.length >= 3) score += 0.2;
    if (brands.length >= 5) score += 0.1;
    
    // Bonus for sources
    if (sources.length > 0) score += 0.1;
    if (sources.length >= 3) score += 0.1;
    
    // Penalty for very short or very long responses
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 50) score -= 0.2;
    if (wordCount > 1000) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate confidence in brand extraction
   */
  private calculateExtractionConfidence(brands: BrandMention[]): number {
    if (brands.length === 0) return 0;
    
    const avgConfidence = brands.reduce((sum, b) => sum + b.confidence, 0) / brands.length;
    return avgConfidence;
  }

  /**
   * Get context snippet around a position
   */
  private getContextSnippet(text: string, position: number, length: number): string {
    const start = Math.max(0, position - length / 2);
    const end = Math.min(text.length, position + length / 2);
    return text.slice(start, end).trim();
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Calculate cost of probe run
 */
export function calculateProbeCost(results: ProbeExecutionResult[]): {
  totalCost: number;
  breakdown: Record<string, number>;
} {
  const breakdown: Record<string, number> = {};
  let totalCost = 0;
  
  for (const result of results) {
    const model = MODEL_CONFIGS.find(m => m.id === result.modelId);
    if (!model) continue;
    
    // Approximate input/output split (80/20)
    const inputTokens = result.responseTokens * 0.2;
    const outputTokens = result.responseTokens * 0.8;
    
    const cost = 
      (inputTokens * model.costPerToken.input) +
      (outputTokens * model.costPerToken.output);
    
    breakdown[model.id] = (breakdown[model.id] || 0) + cost;
    totalCost += cost;
  }
  
  return { totalCost, breakdown };
}

