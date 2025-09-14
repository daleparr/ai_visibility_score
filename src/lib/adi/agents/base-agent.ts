import type {
  IADIAgent,
  ADIAgentConfig,
  ADIAgentInput,
  ADIAgentOutput,
  AgentStatus
} from '@/types/adi'

import {
  ADIError,
  ADIAgentError
} from '@/types/adi'

/**
 * Base class for all ADI agents
 * Provides common functionality for execution, validation, and error handling
 */
export abstract class BaseADIAgent implements IADIAgent {
  public readonly config: ADIAgentConfig

  constructor(config: ADIAgentConfig) {
    this.config = config
  }

  /**
   * Main execution method - must be implemented by each agent
   */
  abstract execute(input: ADIAgentInput): Promise<ADIAgentOutput>

  /**
   * Validate agent output for consistency and completeness
   */
  validate(output: ADIAgentOutput): boolean {
    try {
      // Basic validation checks
      if (!output.agentName || output.agentName !== this.config.name) {
        return false
      }

      if (!output.status || !['completed', 'failed', 'skipped'].includes(output.status)) {
        return false
      }

      if (output.status === 'completed' && (!output.results || output.results.length === 0)) {
        return false
      }

      // Validate each result
      for (const result of output.results || []) {
        if (!result.resultType || typeof result.normalizedScore !== 'number') {
          return false
        }

        if (result.normalizedScore < 0 || result.normalizedScore > 100) {
          return false
        }

        if (typeof result.confidenceLevel !== 'number' || 
            result.confidenceLevel < 0 || result.confidenceLevel > 1) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error(`Validation error for agent ${this.config.name}:`, error)
      return false
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async retry(input: ADIAgentInput, attempt: number): Promise<ADIAgentOutput> {
    if (attempt > this.config.retryLimit) {
      throw new ADIAgentError(
        this.config.name,
        `Maximum retry attempts (${this.config.retryLimit}) exceeded`,
        this.config,
        { attempt, input: input.context.evaluationId }
      )
    }

    // Exponential backoff: 1s, 2s, 4s, 8s...
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      console.log(`Retrying agent ${this.config.name}, attempt ${attempt}/${this.config.retryLimit}`)
      return await this.execute(input)
    } catch (error) {
      if (attempt === this.config.retryLimit) {
        throw new ADIAgentError(
          this.config.name,
          `Final retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          this.config,
          { attempt, originalError: error }
        )
      }
      return this.retry(input, attempt + 1)
    }
  }

  /**
   * Execute with timeout protection
   */
  async executeWithTimeout(input: ADIAgentInput): Promise<ADIAgentOutput> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ADIAgentError(
          this.config.name,
          `Agent execution timed out after ${this.config.timeout}ms`,
          this.config
        ))
      }, this.config.timeout)
    })

    try {
      const result = await Promise.race([
        this.execute(input),
        timeoutPromise
      ])

      if (!this.validate(result)) {
        throw new ADIAgentError(
          this.config.name,
          'Agent output failed validation',
          this.config,
          { output: result }
        )
      }

      return result
    } catch (error) {
      if (error instanceof ADIAgentError) {
        throw error
      }
      
      throw new ADIAgentError(
        this.config.name,
        `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config,
        { originalError: error }
      )
    }
  }

  /**
   * Helper method to create standardized output
   */
  protected createOutput(
    status: AgentStatus,
    results: ADIAgentOutput['results'] = [],
    executionTime: number = 0,
    errorMessage?: string,
    metadata: Record<string, any> = {}
  ): ADIAgentOutput {
    return {
      agentName: this.config.name,
      status,
      results,
      executionTime,
      errorMessage,
      metadata: {
        ...metadata,
        agentVersion: this.config.version,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Helper method to create standardized result
   */
  protected createResult(
    resultType: string,
    rawValue: number,
    normalizedScore: number,
    confidenceLevel: number,
    evidence: Record<string, any> = {}
  ) {
    return {
      resultType,
      rawValue,
      normalizedScore: Math.round(Math.max(0, Math.min(100, normalizedScore))),
      confidenceLevel: Math.max(0, Math.min(1, confidenceLevel)),
      evidence
    }
  }

  /**
   * Helper method to normalize scores using min-max with winsorization
   */
  protected normalizeScore(
    value: number,
    min: number,
    max: number,
    winsorizeP5: number,
    winsorizeP95: number
  ): number {
    // Apply winsorization to reduce outlier impact
    const winsorizedValue = Math.max(winsorizeP5, Math.min(winsorizeP95, value))
    
    // Min-max normalization to 0-100 scale
    if (max === min) return 50 // Default to middle if no variance
    
    const normalized = ((winsorizedValue - min) / (max - min)) * 100
    return Math.round(Math.max(0, Math.min(100, normalized)))
  }

  /**
   * Helper method to calculate confidence based on data quality
   */
  protected calculateConfidence(
    dataPoints: number,
    consistency: number,
    completeness: number
  ): number {
    // Confidence based on multiple factors
    const dataConfidence = Math.min(1, dataPoints / 10) // More data = higher confidence
    const consistencyConfidence = consistency // How consistent the data is
    const completenessConfidence = completeness // How complete the data is
    
    // Weighted average
    return (dataConfidence * 0.3 + consistencyConfidence * 0.4 + completenessConfidence * 0.3)
  }
}

/**
 * Agent registry for managing all available agents
 */
export class ADIAgentRegistry {
  private static agents: Map<string, new () => IADIAgent> = new Map()

  static register(name: string, agentClass: new () => IADIAgent) {
    this.agents.set(name, agentClass)
  }

  static create(name: string): IADIAgent {
    const AgentClass = this.agents.get(name)
    if (!AgentClass) {
      throw new ADIError(`Agent ${name} not found in registry`, 'AGENT_NOT_FOUND')
    }
    return new AgentClass()
  }

  static getAvailableAgents(): string[] {
    return Array.from(this.agents.keys())
  }

  static isRegistered(name: string): boolean {
    return this.agents.has(name)
  }
}

/**
 * Utility functions for agent development
 */
export class ADIAgentUtils {
  /**
   * Extract text content from HTML
   */
  static extractTextFromHTML(html: string): string {
    // Simple HTML tag removal - in production, use a proper HTML parser
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  /**
   * Calculate text similarity using simple word overlap
   */
  static calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  /**
   * Parse structured data from HTML
   */
  static parseStructuredData(html: string): Record<string, any>[] {
    const structuredData: Record<string, any>[] = []
    
    // Extract JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
          const parsed = JSON.parse(jsonContent)
          structuredData.push(parsed)
        } catch (error) {
          console.warn('Failed to parse JSON-LD:', error)
        }
      }
    }

    // Extract microdata (simplified)
    const microdataMatches = html.match(/itemscope[^>]*>/gi)
    if (microdataMatches) {
      structuredData.push({
        type: 'microdata',
        count: microdataMatches.length
      })
    }

    return structuredData
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Generate content hash for audit trails
   */
  static generateContentHash(content: string): string {
    // Simple hash function - in production, use crypto.subtle.digest
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Rate limit helper for API calls
   */
  static async rateLimit(calls: number, windowMs: number): Promise<void> {
    const delay = windowMs / calls
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}