import { ADIOrchestrator } from './orchestrator'
import { ADIScoringEngine } from './scoring'
import { SchemaAgent } from './agents/schema-agent'
import { LLMTestAgent } from './agents/llm-test-agent'
import { CitationAgent } from './agents/citation-agent'
import { CommerceAgent } from './agents/commerce-agent'
import type { 
  ADIEvaluationContext,
  ADIOrchestrationResult,
  ADIScore,
  ADIIndustry,
  ADISubscription,
  ADILeaderboard
} from '../../types/adi'

/**
 * ADI Service - Main service layer for AI Discoverability Index
 * Coordinates evaluation, scoring, benchmarking, and reporting
 */
export class ADIService {
  private orchestrator: ADIOrchestrator
  private initialized: boolean = false

  constructor() {
    this.orchestrator = new ADIOrchestrator()
  }

  /**
   * Initialize the ADI service with all agents
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('Initializing ADI Service...')

    // Register all agents
    this.orchestrator.registerAgent(new SchemaAgent())
    this.orchestrator.registerAgent(new LLMTestAgent())
    this.orchestrator.registerAgent(new CitationAgent())
    this.orchestrator.registerAgent(new CommerceAgent())

    // Create execution plan
    this.orchestrator.createExecutionPlan()

    this.initialized = true
    console.log('ADI Service initialized successfully')
  }

  /**
   * Run complete ADI evaluation for a brand
   */
  async evaluateBrand(
    brandId: string,
    websiteUrl: string,
    industryId?: string,
    userId?: string
  ): Promise<{
    orchestrationResult: ADIOrchestrationResult
    adiScore: ADIScore
    industryPercentile?: number
    globalRank?: number
  }> {
    await this.initialize()

    console.log(`Starting ADI evaluation for brand ${brandId}`)

    // Create evaluation context
    const context: ADIEvaluationContext = {
      evaluationId: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      brandId,
      websiteUrl,
      industryId,
      evaluationType: 'adi_premium',
      queryCanon: await this.getQueryCanon(industryId),
      crawlArtifacts: await this.getCrawlArtifacts(websiteUrl),
      metadata: {
        userId,
        startTime: new Date().toISOString(),
        version: 'ADI-v1.0'
      }
    }

    // Run orchestrated evaluation
    const orchestrationResult = await this.orchestrator.executeEvaluation(context)

    if (orchestrationResult.overallStatus === 'failed') {
      throw new Error(`ADI evaluation failed: ${orchestrationResult.errors.join(', ')}`)
    }

    // Calculate ADI score
    const adiScore = ADIScoringEngine.calculateADIScore(orchestrationResult)

    // Calculate industry percentile if industry provided
    let industryPercentile: number | undefined
    let globalRank: number | undefined

    if (industryId) {
      const benchmark = await this.getIndustryBenchmark(industryId)
      if (benchmark) {
        industryPercentile = ADIScoringEngine.calculateIndustryPercentile(
          adiScore.overall,
          benchmark
        )
      }
    }

    // Calculate global rank (simplified)
    globalRank = await this.calculateGlobalRank(adiScore.overall)

    console.log(`ADI evaluation completed for brand ${brandId}: ${adiScore.overall}/100 (${adiScore.grade})`)

    return {
      orchestrationResult,
      adiScore: {
        ...adiScore,
        industryPercentile,
        globalRank
      },
      industryPercentile,
      globalRank
    }
  }

  /**
   * Generate comprehensive ADI report
   */
  async generateReport(
    evaluationResult: {
      orchestrationResult: ADIOrchestrationResult
      adiScore: ADIScore
      industryPercentile?: number
      globalRank?: number
    },
    includeCompetitorAnalysis: boolean = false
  ): Promise<{
    executiveSummary: string
    scoreBreakdown: any
    recommendations: any[]
    competitorAnalysis?: any
    methodology: string
  }> {
    const { adiScore, industryPercentile, globalRank } = evaluationResult

    // Generate executive summary
    const scoreBreakdown = ADIScoringEngine.generateScoreBreakdown(adiScore)
    const recommendations = ADIScoringEngine.generateRecommendations(adiScore)

    const executiveSummary = this.generateExecutiveSummary(
      adiScore,
      scoreBreakdown,
      industryPercentile,
      globalRank
    )

    // Generate competitor analysis if requested
    let competitorAnalysis: any = undefined
    if (includeCompetitorAnalysis) {
      competitorAnalysis = await this.generateCompetitorAnalysis(adiScore)
    }

    return {
      executiveSummary,
      scoreBreakdown,
      recommendations,
      competitorAnalysis,
      methodology: this.getMethodologyDescription()
    }
  }

  /**
   * Update industry benchmarks
   */
  async updateIndustryBenchmarks(industryId: string): Promise<void> {
    console.log(`Updating benchmarks for industry ${industryId}`)

    // Get all recent evaluations for this industry
    const evaluations = await this.getIndustryEvaluations(industryId, 90) // Last 90 days

    if (evaluations.length < 10) {
      console.warn(`Insufficient data for industry ${industryId} benchmark update`)
      return
    }

    // Calculate benchmark statistics
    const scores = evaluations.map(e => e.adiScore).sort((a, b) => a - b)
    const benchmark = {
      industryId,
      benchmarkDate: new Date().toISOString().split('T')[0],
      totalBrands: scores.length,
      median: this.calculatePercentile(scores, 50),
      p25: this.calculatePercentile(scores, 25),
      p75: this.calculatePercentile(scores, 75),
      p90: this.calculatePercentile(scores, 90),
      topPerformer: Math.max(...scores),
      dimensionMedians: this.calculateDimensionMedians(evaluations),
      methodologyVersion: 'ADI-v1.0'
    }

    // Save benchmark to database
    await this.saveBenchmark(benchmark)

    console.log(`Benchmark updated for industry ${industryId}: median ${benchmark.median}`)
  }

  /**
   * Update leaderboards
   */
  async updateLeaderboards(): Promise<void> {
    console.log('Updating ADI leaderboards...')

    const industries = await this.getAllIndustries()

    for (const industry of industries) {
      await this.updateIndustryLeaderboard(industry.id)
    }

    await this.updateGlobalLeaderboard()

    console.log('Leaderboards updated successfully')
  }

  /**
   * Get subscription limits for user
   */
  async getSubscriptionLimits(userId: string): Promise<{
    tier: string
    monthlyEvaluations: number
    remainingEvaluations: number
    apiAccess: boolean
    benchmarkAccess: boolean
  }> {
    const subscription = await this.getUserSubscription(userId)
    const currentUsage = await this.getCurrentMonthUsage(userId)

    return {
      tier: subscription?.tier || 'free',
      monthlyEvaluations: subscription?.monthly_evaluation_limit || 3,
      remainingEvaluations: Math.max(0, (subscription?.monthly_evaluation_limit || 3) - currentUsage),
      apiAccess: subscription?.api_access_enabled || false,
      benchmarkAccess: subscription?.benchmarking_enabled || false
    }
  }

  // Private helper methods
  private async getQueryCanon(industryId?: string): Promise<any[]> {
    // Mock query canon - in production, this would fetch from database
    return [
      {
        id: '1',
        query_text: 'What are the best products from this brand?',
        query_category: 'product_discovery',
        query_type: 'recommendation',
        expected_response_elements: ['product names', 'features', 'benefits'],
        weight: 1.0
      },
      {
        id: '2',
        query_text: 'How does this brand compare to competitors?',
        query_category: 'comparison',
        query_type: 'competitive',
        expected_response_elements: ['differentiators', 'strengths', 'positioning'],
        weight: 1.0
      }
    ]
  }

  private async getCrawlArtifacts(websiteUrl: string): Promise<any[]> {
    // Mock crawl artifacts - in production, this would trigger actual crawling
    return [
      {
        id: '1',
        artifact_type: 'html_snapshot',
        url: websiteUrl,
        content_hash: 'abc123',
        extracted_data: {
          content: `Sample content for ${websiteUrl} with product information and pricing`
        },
        crawl_timestamp: new Date().toISOString()
      }
    ]
  }

  private async getIndustryBenchmark(industryId: string): Promise<any> {
    // Mock benchmark data
    return {
      median: 72,
      p25: 58,
      p75: 84,
      p90: 91
    }
  }

  private async calculateGlobalRank(score: number): Promise<number> {
    // Mock global rank calculation
    return Math.floor(Math.random() * 1000) + 1
  }

  private generateExecutiveSummary(
    adiScore: ADIScore,
    scoreBreakdown: any,
    industryPercentile?: number,
    globalRank?: number
  ): string {
    const percentileText = industryPercentile 
      ? ` (${Math.round(industryPercentile)}th percentile in industry)`
      : ''
    
    const rankText = globalRank 
      ? ` Global rank: #${globalRank}.`
      : ''

    return `
ADI Score: ${adiScore.overall}/100 (Grade ${adiScore.grade})${percentileText}
Confidence: ±${adiScore.confidenceInterval} points | Reliability: ${Math.round(adiScore.reliabilityScore * 100)}%${rankText}

${scoreBreakdown.summary}

Key Strengths: ${scoreBreakdown.strengths.join(', ')}
Priority Gaps: ${scoreBreakdown.gaps.join(', ')}

Top Opportunities:
${scoreBreakdown.opportunities.slice(0, 3).map((opp: string, i: number) => `${i + 1}. ${opp}`).join('\n')}
    `.trim()
  }

  private async generateCompetitorAnalysis(adiScore: ADIScore): Promise<any> {
    // Mock competitor analysis
    return {
      competitorCount: 5,
      averageScore: 68,
      yourPosition: 'Above Average',
      keyDifferentiators: ['Strong infrastructure', 'Excellent commerce clarity'],
      improvementAreas: ['Citation authority', 'Reputation signals']
    }
  }

  private getMethodologyDescription(): string {
    return `
ADI Methodology v1.0

The AI Discoverability Index evaluates brands across 9 dimensions in 3 pillars:

Infrastructure & Machine Readability (40%):
- Schema & Structured Data (12%)
- Semantic Clarity & Ontology (10%)
- Knowledge Graphs & Entity Linking (8%)
- LLM Readability & Conversational Copy (10%)

Perception & Reputation (40%):
- AI Answer Quality & Presence (18%)
- Citation Authority & Freshness (12%)
- Reputation Signals (10%)

Commerce & Experience (20%):
- Hero Products & Use-Case Retrieval (12%)
- Policies & Logistics Clarity (8%)

Evaluation uses 10 specialized agents with multi-model consensus requirements.
All scores include confidence intervals and reliability metrics.
    `.trim()
  }

  // Mock database methods (in production, these would use real database queries)
  private async getIndustryEvaluations(industryId: string, days: number): Promise<any[]> {
    return [] // Mock empty for now
  }

  private async getAllIndustries(): Promise<ADIIndustry[]> {
    return [] // Mock empty for now
  }

  private async updateIndustryLeaderboard(industryId: string): Promise<void> {
    // Mock implementation
  }

  private async updateGlobalLeaderboard(): Promise<void> {
    // Mock implementation
  }

  private async getUserSubscription(userId: string): Promise<ADISubscription | null> {
    return null // Mock for now
  }

  private async getCurrentMonthUsage(userId: string): Promise<number> {
    return 0 // Mock for now
  }

  private async saveBenchmark(benchmark: any): Promise<void> {
    // Mock implementation
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedArray.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  private calculateDimensionMedians(evaluations: any[]): Record<string, number> {
    // Mock implementation
    return {
      schema_structured_data: 75,
      semantic_clarity_ontology: 68,
      knowledge_graphs_entity_linking: 62,
      llm_readability_conversational: 71,
      ai_answer_quality_presence: 69,
      citation_authority_freshness: 58,
      reputation_signals: 73,
      hero_products_use_case: 77,
      policies_logistics_clarity: 65
    }
  }
}

// Export singleton instance
export const adiService = new ADIService()