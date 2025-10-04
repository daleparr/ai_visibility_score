import { v4 as uuidv4 } from 'uuid'
import { PerformanceOptimizedADIOrchestrator } from './performance-optimized-orchestrator'
import { ADIScoringEngine } from './scoring'
import { ADIBenchmarkingEngine } from './benchmarking-engine'
import { BulletproofCrawlAgent } from './agents/bulletproof-crawl-agent'
import { SitemapEnhancedCrawlAgent } from './agents/sitemap-enhanced-crawl-agent'
import { BulletproofLLMTestAgent } from './agents/bulletproof-llm-test-agent'
import { BulletproofSchemaAgent } from './agents/bulletproof-schema-agent'
import { SemanticAgent } from './agents/semantic-agent'
import { KnowledgeGraphAgent } from './agents/knowledge-graph-agent'
import { ConversationalCopyAgent } from './agents/conversational-copy-agent'
import { GeoVisibilityAgent } from './agents/geo-visibility-agent'
import { CitationAgent } from './agents/citation-agent'
import { SentimentAgent } from './agents/sentiment-agent'
import { BrandHeritageAgent } from './agents/brand-heritage-agent'
import { CommerceAgent } from './agents/commerce-agent'
import { BulletproofScoreAggregatorAgent } from './agents/bulletproof-score-aggregator-agent'
import { traceLogger, EvaluationTrace } from './trace-logger'
import { eq } from 'drizzle-orm'
import type {
  ADIEvaluationContext,
  ADIOrchestrationResult,
  ADIScore,
  ADIIndustry,
  ADISubscription,
  ADILeaderboard
} from '../../types/adi'
import { TIER_FEATURES, getTierBasedModel, type UserTier } from '@/lib/tier-based-models'

/**
 * ADI Service - Main service layer for AI Discoverability Index
 * Coordinates evaluation, scoring, benchmarking, and reporting
 */
export class ADIService {
  private orchestrator: PerformanceOptimizedADIOrchestrator
  private initialized: boolean = false

  constructor() {
    this.orchestrator = new PerformanceOptimizedADIOrchestrator()
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
   * Update industry benchmarks using real benchmarking engine
   */
  async updateIndustryBenchmarks(industryId: string): Promise<void> {
    console.log(`Updating benchmarks for industry ${industryId}`)

    try {
      // Get all recent evaluations for this industry
      const evaluationData = await this.getIndustryEvaluationData(industryId, 90) // Last 90 days

      if (evaluationData.length < 5) {
        console.warn(`Insufficient data for industry ${industryId} benchmark update: ${evaluationData.length} evaluations`)
        return
      }

      // Calculate benchmark using real engine
      const benchmark = await ADIBenchmarkingEngine.calculateIndustryBenchmark(
        industryId,
        evaluationData as any,
        90
      )

      // Save benchmark to database
      await this.saveBenchmarkToDatabase(benchmark)

      console.log(`Benchmark updated for industry ${industryId}: median ${benchmark.scoreDistribution.median}, ${benchmark.totalBrands} brands`)
      
    } catch (error) {
      console.error(`Failed to update benchmark for industry ${industryId}:`, error)
      throw error
    }
  }

  /**
   * Update leaderboards using real benchmarking engine
   */
  async updateLeaderboards(): Promise<void> {
    console.log('Updating ADI leaderboards...')

    try {
      const industries = await this.getAllIndustries()

      for (const industry of industries) {
        await this.updateIndustryLeaderboardWithEngine(industry.id)
      }

      await this.updateGlobalLeaderboardWithEngine()

      console.log('Leaderboards updated successfully')
    } catch (error) {
      console.error('Failed to update leaderboards:', error)
      throw error
    }
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
    // Get industry-specific query canon from database
    if (!industryId) {
      return this.getDefaultQueryCanon()
    }

    try {
      // In production, this would query the adi_query_canon table
      // For now, return industry-specific queries
      return this.getIndustryQueryCanon(industryId)
    } catch (error) {
      console.warn('Failed to fetch query canon, using defaults:', error)
      return this.getDefaultQueryCanon()
    }
  }

  private getDefaultQueryCanon(): any[] {
    return [
      {
        id: 'default_1',
        query_text: 'What are the best products from this brand?',
        query_category: 'product_discovery',
        query_type: 'recommendation',
        expected_response_elements: ['product names', 'features', 'benefits'],
        weight: 1.0,
        is_active: true,
        version: 'v1.0'
      },
      {
        id: 'default_2',
        query_text: 'How does this brand compare to competitors?',
        query_category: 'comparison',
        query_type: 'competitive',
        expected_response_elements: ['differentiators', 'strengths', 'positioning'],
        weight: 1.0,
        is_active: true,
        version: 'v1.0'
      },
      {
        id: 'default_3',
        query_text: 'Where can I buy this brand in my area?',
        query_category: 'location',
        query_type: 'geographic',
        expected_response_elements: ['store locations', 'shipping info', 'availability'],
        weight: 1.0,
        is_active: true,
        version: 'v1.0'
      },
      {
        id: 'default_4',
        query_text: 'What is this brand known for?',
        query_category: 'brand_identity',
        query_type: 'reputation',
        expected_response_elements: ['brand values', 'reputation', 'specialties'],
        weight: 1.0,
        is_active: true,
        version: 'v1.0'
      }
    ]
  }

  private getIndustryQueryCanon(industryId: string): any[] {
    // Industry-specific query canons
    const industryQueries: Record<string, any[]> = {
      'apparel': [
        {
          id: 'apparel_1',
          query_text: 'What are the best sustainable clothing brands?',
          query_category: 'ethics',
          query_type: 'recommendation',
          expected_response_elements: ['sustainability', 'materials', 'certifications'],
          weight: 1.2
        },
        {
          id: 'apparel_2',
          query_text: 'How do I find clothes that fit my body type?',
          query_category: 'fit',
          query_type: 'product_discovery',
          expected_response_elements: ['sizing', 'fit guide', 'recommendations'],
          weight: 1.0
        }
      ],
      'electronics': [
        {
          id: 'electronics_1',
          query_text: 'What are the latest tech innovations from this brand?',
          query_category: 'innovation',
          query_type: 'product_discovery',
          expected_response_elements: ['features', 'technology', 'specifications'],
          weight: 1.2
        }
      ]
    }

    return industryQueries[industryId] || this.getDefaultQueryCanon()
  }

  private async getIndustryBenchmark(industryId: string): Promise<any> {
    // Mock benchmark data
    return {
      industryId,
      benchmarkVersion: 'v1.0',
      calculationDate: new Date().toISOString(),
      scoreDistribution: {
        mean: 75.5,
        median: 78.0,
        stdDev: 10.2,
        p25: 68.0,
        p75: 85.0
      },
      totalBrands: 150
    }
  }

  private async calculateGlobalRank(score: number): Promise<number> {
    // Mock global rank calculation
    return Math.floor(1000 - score * 10)
  }

  private generateExecutiveSummary(
    adiScore: ADIScore,
    scoreBreakdown: any,
    industryPercentile?: number,
    globalRank?: number
  ): string {
    return `Your ADI Score is ${adiScore.overall}/100, placing you in the ${
      industryPercentile ? `${industryPercentile}th percentile` : 'N/A'
    } for your industry and ranking ${globalRank || 'N/A'} globally.`
  }

  private async generateCompetitorAnalysis(adiScore: ADIScore): Promise<any> {
    // Mock competitor analysis
    return {
      competitors: [
        { name: 'Competitor A', score: 85 },
        { name: 'Competitor B', score: 72 }
      ],
      analysis: 'You are outperforming Competitor B but lagging behind Competitor A.'
    }
  }

  private getMethodologyDescription(): string {
    return `
      The AI Discoverability Index (ADI) is a proprietary metric that measures how easily a brand can be discovered and understood by AI systems. 
      It is calculated based on three pillars:
      1.  **Infrastructure**: Technical SEO, site structure, and content accessibility.
      2.  **Perception**: Brand reputation, sentiment, and third-party validation.
      3.  **Commerce**: Product discoverability, pricing clarity, and purchase funnels.
      Each pillar is composed of multiple dimensions, which are scored by our multi-agent system.
    `
  }


  private async getIndustryEvaluationData(industryId: string, days: number = 90): Promise<Array<{
    brandId: string;
    adiScore: number;
    evaluationDate: Date;
  }>> {
    // In production, this would query a real database.
    // For now, we return mock data, but we'll import the real DB types to align.
    const { evaluations, brands } = await import('@/lib/db/schema')
    const { sql } = await import('@/lib/db')
    const { and, gte, eq, isNotNull } = await import('drizzle-orm')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    // Simulate real query
    const realEvaluations = await sql`
        SELECT
            e.brand_id,
            e.overall_score as "adi_score",
            e.created_at as "evaluation_date"
        FROM
            production.evaluations e
        JOIN
            production.brands b ON e.brand_id = b.id
        WHERE
            b.industry_id = ${industryId}
        AND
            e.created_at >= ${cutoffDate}
        AND
            e.overall_score IS NOT NULL
        ORDER BY
            e.created_at DESC
    `

    if (realEvaluations.length > 0) {
      return realEvaluations.map((evaluation: { brandId: string; adiScore: number | null; evaluationDate: Date; }) => ({
        brandId: evaluation.brandId,
        adiScore: evaluation.adiScore || 0,
        evaluationDate: evaluation.evaluationDate
      }))
    }
    
    return []
  }

  private async calculateGlobalRankWithBenchmarking(score: number): Promise<number> {
    const allScores = await this.getAllIndustryEvaluationData()
    const rank = allScores.filter(s => s.adiScore > score).length + 1
    return rank
  }


  private async getAllIndustries(): Promise<ADIIndustry[]> {
    // In production, this would query the adi_industries table.
    // For now, we return mock data, but we'll import the real DB types to align.
    const { adiIndustries } = await import('@/lib/db/schema')
    const { sql } = await import('@/lib/db')

    try {
      const industries = await sql`SELECT id, name, category, description, created_at, updated_at FROM production.adi_industries`
      return industries.map((industry: any) => ({
        id: industry.id,
        name: industry.name,
        category: industry.category,
        description: industry.description || '',
        created_at: industry.created_at,
        updated_at: industry.updated_at,
        query_canon: industry.query_canon,
        benchmark_criteria: industry.benchmark_criteria
      }))
    } catch (error) {
      console.error('Failed to fetch industries, using mock data:', error)
      return [
        { id: 'apparel', name: 'Apparel', category: 'apparel', description: 'Clothing and fashion', query_canon: {}, benchmark_criteria: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 'electronics', name: 'Electronics', category: 'electronics', description: 'Consumer electronics', query_canon: {}, benchmark_criteria: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ]
    }
  }

  private async getAllIndustryEvaluationData(): Promise<Array<{adiScore: number}>> {
    const { sql } = await import('@/lib/db')
    const allScores = await sql`SELECT overall_score as "adiScore" FROM production.evaluations WHERE overall_score IS NOT NULL`
    return allScores.map((s: { adiScore: number; }) => ({ adiScore: s.adiScore }))
  }


  private async saveBenchmarkToDatabase(benchmark: any): Promise<void> {
    const { sql } = await import('@/lib/db')
    await sql`
      INSERT INTO production.industry_benchmarks (industry_id, benchmark_data, created_at, updated_at)
      VALUES (${benchmark.industryId}, ${JSON.stringify(benchmark)}, NOW(), NOW())
      ON CONFLICT (industry_id) DO UPDATE SET
        benchmark_data = ${JSON.stringify(benchmark)},
        updated_at = NOW()
    `
  }

  private async updateIndustryLeaderboardWithEngine(industryId: string): Promise<void> {
    const leaderboardData = await this.getIndustryLeaderboardData(industryId)
    const leaderboard = ADIBenchmarkingEngine.generateLeaderboard(industryId, leaderboardData as any, 100)
    await this.saveLeaderboardToDatabase(`industry:${industryId}`, leaderboard as any)
  }

  private async updateGlobalLeaderboardWithEngine(): Promise<void> {
    const { sql } = await import('@/lib/db')
    const allScores = await sql`
        SELECT
            b.id as "brandId",
            b.name as "brandName",
            e.overall_score as "adiScore",
            e.created_at as "evaluationDate"
        FROM
            production.evaluations e
        JOIN
            production.brands b ON e.brand_id = b.id
        WHERE
            e.overall_score IS NOT NULL
        ORDER BY
            e.overall_score DESC
        LIMIT 1000
    `
    const leaderboard = ADIBenchmarkingEngine.generateLeaderboard('global', allScores as any, 1000)
    await this.saveLeaderboardToDatabase('global', leaderboard as any)
  }

  private async getIndustryLeaderboardData(industryId: string): Promise<Array<{
    brandId: string;
    brandName: string;
    adiScore: number;
    evaluationDate: Date;
  }>> {
    // In production, this would be a more complex query, likely joining brands and evaluations.
    // For now, return mock data aligned with the types.
    const { evaluations, brands } = await import('@/lib/db/schema')
    const { sql } = await import('@/lib/db')
    const { and, gte, eq, isNotNull, desc } = await import('drizzle-orm')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    // Simulate real query
    const realEvaluations = await sql`
        SELECT
            b.id as "brandId",
            b.name as "brandName",
            e.overall_score as "adiScore",
            e.created_at as "evaluationDate"
        FROM
            production.evaluations e
        JOIN
            production.brands b ON e.brand_id = b.id
        WHERE
            b.industry_id = ${industryId}
        AND
            e.created_at >= ${cutoffDate}
        AND
            e.overall_score IS NOT NULL
        ORDER BY
            e.overall_score DESC
        LIMIT 100
    `

    if (realEvaluations.length > 0) {
      return realEvaluations.map((evaluation: {
        brandId: string;
        brandName: string;
        adiScore: number | null;
        evaluationDate: Date;
      }) => ({
        brandId: evaluation.brandId,
        brandName: evaluation.brandName,
        adiScore: evaluation.adiScore || 0,
        evaluationDate: evaluation.evaluationDate
      }))
    }
    return []
  }

  private async saveLeaderboardToDatabase(scope: string, leaderboard: any[]): Promise<void> {
    const { sql } = await import('@/lib/db')
    // Correctly reference the 'rank' property from the leaderboard entries
    const leaderboardEntries = leaderboard.map((entry, index) => ({
      scope: scope,
      rank: entry.rank, // Use entry.rank
      brand_id: entry.brandId,
      score: entry.adiScore,
      data: JSON.stringify(entry),
    }));

    // Use a transaction to delete and then insert for atomicity
    await sql.begin(async (tx: any) => {
        await tx`DELETE FROM production.leaderboard_cache WHERE scope = ${scope}`;
        for (const entry of leaderboardEntries) {
            await tx`
                INSERT INTO production.leaderboard_cache (scope, rank, brand_id, score, data)
                VALUES (${entry.scope}, ${entry.rank}, ${entry.brand_id}, ${entry.score}, ${entry.data})
            `;
        }
    });

    console.log(`Leaderboard saved for scope: ${scope}`)
}
  

  private async saveAgentResultsToDatabase(evaluationId: string, orchestrationResult: any): Promise<void> {
    const { createDimensionScore } = await import('@/lib/database');
    const { db } = await import('@/lib/db');

    console.log(`[DB_WRITE_START] Saving agent results for evaluation ${evaluationId}`);
    try {
        const allResults = Object.values(orchestrationResult.agentResults || {}).flatMap((agent: any) => agent.results || []) as any[];
        const dimensionResults = allResults.filter(r => this.mapAgentToDimension(r.agent_id || r.agentName) !== null);

        const promises = dimensionResults.map(result => {
            const agentName = result.agentName || result.agent_id;
            const dimensionName = this.mapAgentToDimension(agentName);

            if (dimensionName) {
                const scoreData = {
                    evaluationId: evaluationId,
                    dimensionName: dimensionName,
                    score: Number(result.normalized_score ?? 0),
                    explanation: result.evidence?.explanation || result.keyInsight || `Score derived from ${agentName}`,
                    recommendations: { ...result.evidence },
                };
                return createDimensionScore(scoreData);
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        console.log(`[DB_WRITE_SUCCESS] Agent results saved for evaluation ${evaluationId}`);
    } catch (error) {
        console.error(`❌ [DB_WRITE_ERROR] Unhandled error in saveAgentResultsToDatabase:`, error);
        // Do not re-throw, allow evaluation to complete
    }
  }

  /**
   * Map agent names to dimension names for database storage
   */
  private mapAgentToDimension(agentName: string): string | null {
    const agentToDimensionMap: Record<string, string> = {
      'crawl_agent': 'policies_logistics', // Maps to infrastructure pillar
      'schema_agent': 'schema_structured_data', // Infrastructure pillar
      'llm_test_agent': 'llm_readability', // Additional infrastructure
      'semantic_agent': 'semantic_clarity', // Infrastructure pillar
      'knowledge_graph_agent': 'knowledge_graphs', // Infrastructure pillar
      'conversational_copy_agent': 'conversational_copy', // Additional infrastructure
      'geo_visibility_agent': 'geo_visibility', // Perception pillar
      'citation_agent': 'citation_strength', // Perception pillar
      'sentiment_agent': 'sentiment_trust', // Perception pillar
      'brand_heritage_agent': 'answer_quality', // Perception pillar
      'commerce_agent': 'hero_products' // Commerce pillar
    }
    
    return agentToDimensionMap[agentName] || null
  }

  /**
   * Create dimension score with proper error handling and fallback
   */
  private async createDimensionScoreWithFallback(scoreData: any): Promise<void> {
    const { createDimensionScore } = await import('@/lib/database')
    
    try {
      await createDimensionScore(scoreData)
      console.log(`[DB_WRITE] Saved dimension score: ${scoreData.dimensionName} = ${scoreData.score}`)
    } catch (error) {
      console.error(`[DB_WRITE_ERROR] Failed to create dimension score for ${scoreData.dimensionName}:`, error)
      // Don't throw - we want to continue with other scores
    }
  }

  // Legacy stubs for reference during migration
  private async updateIndustryLeaderboard(industryId: string): Promise<void> {
    /* Legacy - replaced by updateIndustryLeaderboardWithEngine */
  }
  private async updateGlobalLeaderboard(): Promise<void> {
    /* Legacy - replaced by updateGlobalLeaderboardWithEngine */
  }
  private async getUserSubscription(userId: string): Promise<ADISubscription | null> {
    const { sql } = await import('@/lib/db')
    const result = await sql`SELECT * FROM production.subscriptions WHERE user_id = ${userId}`
    return result[0] as ADISubscription | null
  }
  private async getCurrentMonthUsage(userId: string): Promise<number> {
    const { sql } = await import('@/lib/db')
    const result = await sql`
        SELECT COUNT(*) as count
        FROM production.evaluations
        WHERE user_id = ${userId} AND created_at >= date_trunc('month', current_date);
    `
    return Number(result[0]?.count) || 0
  }
  private async saveBenchmark(benchmark: any): Promise<void> {
    /* Legacy - replaced by a more robust saveBenchmarkToDatabase */
  }
  private async executeEnhancedEvaluation(
    brandId: string,
    websiteUrl: string,
    userTier: UserTier,
    options?: { evaluationId?: string }
  ): Promise<ADIOrchestrationResult> {
    console.log(`Executing ENHANCED evaluation for ${brandId} (Tier: ${userTier})`);
    // Pass tier-specific models or configurations to the orchestrator
    const tierModel = getTierBasedModel(userTier);
    
    const context: ADIEvaluationContext = {
      evaluationId: options?.evaluationId || '',
      brandId,
      websiteUrl,
      industryId: '',
      evaluationType: 'standard',
      queryCanon: [],
      crawlArtifacts: [],
      metadata: { llmModel: tierModel }
    };
    
    return this.orchestrator.executeEvaluation(context);
  }
  private async executeStandardEvaluation(
    brandId: string,
    websiteUrl: string,
    userTier: UserTier,
    options?: { evaluationId?: string }
  ): Promise<ADIOrchestrationResult> {
    console.log(`Executing STANDARD evaluation for ${brandId} (Tier: ${userTier})`);
    const tierModel = getTierBasedModel(userTier);
    
    const context: ADIEvaluationContext = {
      evaluationId: options?.evaluationId || '',
      brandId,
      websiteUrl,
      industryId: '',
      evaluationType: 'standard',
      queryCanon: [],
      crawlArtifacts: [],
      metadata: { llmModel: tierModel }
    };
    
    return this.orchestrator.executeEvaluation(context);
  }

  private buildComprehensiveReport(
    dimensionScores: any[],
    evalData: any,
    overallScore: number,
    brandName: string
  ) {
    // Same logic as the status endpoint buildInsights function
    // ... (copy the buildInsights logic here)
    
    return {
      dimensionAnalysis: [], // populated with actual logic
      priorityActions: [],   // populated with actual logic
      executiveSummary: {},  // populated with actual logic
      technicalFindings: {} // populated with actual logic
    }
  }
}

// Export singleton instance
export const adiService = new ADIService()