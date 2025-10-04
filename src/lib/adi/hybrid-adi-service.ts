import { HybridADIOrchestrator } from './hybrid-orchestrator'
import { BackendAgentTracker } from './backend-agent-tracker'

// Import fast agents only (slow agents run in backend functions)
import { SitemapEnhancedCrawlAgent } from './agents/sitemap-enhanced-crawl-agent'
import { BulletproofSchemaAgent } from './agents/bulletproof-schema-agent'
import { SemanticAgent } from './agents/semantic-agent'
import { KnowledgeGraphAgent } from './agents/knowledge-graph-agent'
import { ConversationalCopyAgent } from './agents/conversational-copy-agent'
import { BrandHeritageAgent } from './agents/brand-heritage-agent'
import { BulletproofScoreAggregatorAgent } from './agents/bulletproof-score-aggregator-agent'

import type { ADIEvaluationContext, ADIOrchestrationResult } from '../../types/adi'

/**
 * Hybrid ADI Service
 * 
 * Orchestrates brand evaluation using hybrid architecture:
 * - Fast agents: Execute in Netlify (8-second limit)
 * - Slow agents: Execute in backend functions (60-second limit)
 * 
 * Returns partial results immediately, slow agents complete asynchronously
 */
export class HybridADIService {
  private orchestrator: HybridADIOrchestrator
  private tracker: BackendAgentTracker

  constructor() {
    console.log('🏗️ Initializing Hybrid ADI Service...')
    
    this.orchestrator = new HybridADIOrchestrator()
    this.tracker = new BackendAgentTracker()
    
    // Register fast agents only
    this.registerFastAgents()
    
    console.log('✅ Hybrid ADI Service initialized successfully')
  }

  /**
   * Register fast agents that run in Netlify
   */
  private registerFastAgents(): void {
    console.log('📦 Registering fast agents...')
    
    // Fast agents (low to medium LLM intensity)
    this.orchestrator.registerFastAgent(new SitemapEnhancedCrawlAgent())
    this.orchestrator.registerFastAgent(new BulletproofSchemaAgent())
    this.orchestrator.registerFastAgent(new SemanticAgent())
    this.orchestrator.registerFastAgent(new KnowledgeGraphAgent())
    this.orchestrator.registerFastAgent(new ConversationalCopyAgent())
    this.orchestrator.registerFastAgent(new BrandHeritageAgent())
    this.orchestrator.registerFastAgent(new BulletproofScoreAggregatorAgent())
    
    console.log('✅ Fast agents registered')
    
    // Note: Slow agents are NOT registered here - they run in backend functions:
    // - BulletproofLLMTestAgent
    // - SentimentAgent  
    // - CitationAgent
    // - GeoVisibilityAgent
    // - CommerceAgent
  }

  /**
   * Evaluate a brand using hybrid architecture
   * 
   * Returns fast results immediately (~3-5 seconds)
   * Slow agents continue running in background (~30-60 seconds)
   */
  async evaluateBrand(
    brandId: string,
    websiteUrl: string,
    tier: 'free' | 'index-pro' | 'enterprise' = 'free',
    evaluationId: string
  ): Promise<ADIOrchestrationResult> {
    
    console.log(`🚀 [Hybrid] Starting brand evaluation: ${brandId}`)
    console.log(`📊 [Hybrid] Tier: ${tier}, URL: ${websiteUrl}`)
    
    const context: ADIEvaluationContext = {
      evaluationId,
      brandId,
      websiteUrl,
      industryId: undefined, // Will be determined during evaluation
      evaluationType: 'standard', // Default evaluation type
      queryCanon: [], // Will be populated by crawl agent
      crawlArtifacts: [], // Will be populated by crawl agent
      metadata: {
        tier,
        timestamp: new Date(),
        hybridExecution: true
      }
    }

    try {
      // Execute hybrid evaluation
      const result = await this.orchestrator.executeEvaluation(context)
      
      console.log(`⚡ [Hybrid] Fast phase completed for ${brandId}`)
      console.log(`📊 [Hybrid] Fast results: ${Object.keys(result.agentResults).length} agents completed`)
      
      return result
      
    } catch (error) {
      console.error(`❌ [Hybrid] Evaluation failed for ${brandId}:`, error)
      
      return {
        evaluationId,
        overallStatus: 'failed',
        agentResults: {},
        totalExecutionTime: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      }
    }
  }

  /**
   * Check completion status of slow agents
   */
  async checkEvaluationStatus(evaluationId: string): Promise<{
    status: 'running' | 'completed' | 'failed'
    progress: number // 0-100
    fastResults: any[]
    slowResults: any[]
    completedAgents: string[]
    failedAgents: string[]
  }> {
    try {
      const slowAgentStatus = await this.orchestrator.checkSlowAgentCompletion(evaluationId)
      
      const totalSlowAgents = 5 // Number of slow agents
      const completedCount = slowAgentStatus.completedAgents.length
      const failedCount = slowAgentStatus.failedAgents.length
      const finishedCount = completedCount + failedCount
      
      // Calculate progress (fast agents are already done, so start from 50%)
      const progress = slowAgentStatus.allComplete ? 100 : Math.min(95, 50 + (finishedCount / totalSlowAgents) * 45)
      
      const status = slowAgentStatus.allComplete ? 'completed' : 'running'
      
      return {
        status,
        progress,
        fastResults: [], // Would need to store these separately
        slowResults: Object.values(slowAgentStatus.results),
        completedAgents: slowAgentStatus.completedAgents,
        failedAgents: slowAgentStatus.failedAgents
      }
      
    } catch (error) {
      console.error(`❌ [Hybrid] Failed to check evaluation status:`, error)
      
      return {
        status: 'failed',
        progress: 0,
        fastResults: [],
        slowResults: [],
        completedAgents: [],
        failedAgents: []
      }
    }
  }

  /**
   * Get final combined results when all agents complete
   */
  async getFinalResults(
    evaluationId: string,
    fastResults: any[] = []
  ): Promise<ADIOrchestrationResult> {
    return await this.orchestrator.getFinalResults(evaluationId, fastResults)
  }

  /**
   * Get evaluation summary for display
   */
  async getEvaluationSummary(evaluationId: string): Promise<{
    totalAgents: number
    completedAgents: number
    failedAgents: number
    runningAgents: number
    estimatedTimeRemaining: number // seconds
  }> {
    const status = await this.checkEvaluationStatus(evaluationId)
    
    const totalAgents = 12 // 7 fast + 5 slow
    const completedAgents = 7 + status.completedAgents.length // Fast agents + completed slow agents
    const failedAgents = status.failedAgents.length
    const runningAgents = totalAgents - completedAgents - failedAgents
    
    // Estimate remaining time based on progress
    const estimatedTimeRemaining = runningAgents > 0 ? Math.max(0, 60 - (Date.now() % 60000) / 1000) : 0
    
    return {
      totalAgents,
      completedAgents,
      failedAgents,
      runningAgents,
      estimatedTimeRemaining
    }
  }
}
