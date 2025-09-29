import { v4 as uuidv4 } from 'uuid'
import { PerformanceOptimizedADIOrchestrator } from './performance-optimized-orchestrator'
import { ADIScoringEngine } from './scoring'
import { ADIBenchmarkingEngine } from './benchmarking-engine'
import { OptimizedCrawlAgent } from './agents/optimized-crawl-agent'
import { OptimizedLLMTestAgent } from './agents/optimized-llm-test-agent'
import { SchemaAgent } from './agents/schema-agent'
import { SemanticAgent } from './agents/semantic-agent'
import { KnowledgeGraphAgent } from './agents/knowledge-graph-agent'
import { ConversationalCopyAgent } from './agents/conversational-copy-agent'
import { GeoVisibilityAgent } from './agents/geo-visibility-agent'
import { CitationAgent } from './agents/citation-agent'
import { SentimentAgent } from './agents/sentiment-agent'
import { BrandHeritageAgent } from './agents/brand-heritage-agent'
import { CommerceAgent } from './agents/commerce-agent'
import { ScoreAggregatorAgent } from './agents/score-aggregator-agent'
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
   * Initialize the ADI service with all agents
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    console.log('Initializing ADI Service...')

    // Register optimized agents for performance
    this.orchestrator.registerAgent(new OptimizedCrawlAgent())
    this.orchestrator.registerAgent(new OptimizedLLMTestAgent())
    this.orchestrator.registerAgent(new SchemaAgent())
    this.orchestrator.registerAgent(new SemanticAgent())
    this.orchestrator.registerAgent(new KnowledgeGraphAgent())
    this.orchestrator.registerAgent(new ConversationalCopyAgent())
    this.orchestrator.registerAgent(new GeoVisibilityAgent())
    this.orchestrator.registerAgent(new CitationAgent())
    this.orchestrator.registerAgent(new SentimentAgent())
    this.orchestrator.registerAgent(new BrandHeritageAgent())
    this.orchestrator.registerAgent(new CommerceAgent())
    this.orchestrator.registerAgent(new ScoreAggregatorAgent())

    // Create optimized execution plan
    this.orchestrator.createOptimizedExecutionPlan()

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
    userId?: string,
    options?: { 
      persistToDb?: boolean; 
      evaluationId?: string;
      userTier?: UserTier; // Add tier parameter
    }
  ): Promise<{
    orchestrationResult: ADIOrchestrationResult
    adiScore: ADIScore
    industryPercentile?: number
    globalRank?: number
    evaluationTrace?: EvaluationTrace
  }> {
    await this.initialize()

    const userTier = options?.userTier || 'free'
    const startTime = Date.now() // ✅ ADD: Capture start time
    console.log(`Starting ADI evaluation for brand ${brandId} (${userTier} tier)`)

    // Use tier-based evaluation
    const tierFeatures = TIER_FEATURES[userTier]
    
    // Enhanced orchestration for Pro/Enterprise tiers
    const orchestrationResult = tierFeatures.agentEnhancements 
      ? await this.executeEnhancedEvaluation(brandId, websiteUrl, userTier, options)
      : await this.executeStandardEvaluation(brandId, websiteUrl, userTier, options)

    // ✅ ADD: Initialize trace logging AFTER we have evaluationId
    traceLogger.startEvaluation(
      orchestrationResult.evaluationId,
      websiteUrl,
      userTier
    )

    // Conditionally persist internal agent results (disabled by default to avoid FK issues)
    // Default to persisting results unless explicitly disabled. This ensures we always try to save and will see any errors.
    const internalPersist = (options?.persistToDb !== false) && (process.env.ADI_ENABLE_INTERNAL_PERSIST !== '0')
    if (internalPersist) {
      await this.saveAgentResultsToDatabase(orchestrationResult.evaluationId, orchestrationResult)
    } else {
      console.log('🛑 [INFO] Skipping internal agent-results persistence (use options.persistToDb or ADI_ENABLE_INTERNAL_PERSIST=1 to enable)')
    }

    // Update evaluation status to completed
    if (orchestrationResult.overallStatus === 'completed') {
      try {
        console.log(`[DB_UPDATE_START] Attempting to update evaluation ${orchestrationResult.evaluationId} to completed`)
        
        const adiScore = ADIScoringEngine.calculateADIScore(orchestrationResult)
        
        // ✅ PRE-BUILD REPORT BEFORE MARKING AS COMPLETED
        console.log(`[REPORT_BUILD_START] Pre-building report for ${orchestrationResult.evaluationId}`)
        
        // Get dimension scores and evaluation data
        const { sql } = await import('@/lib/db')
        
        const dimensionScores = await sql`
          SELECT 
            dimension_name,
            score,
            explanation,
            recommendations
          FROM production.dimension_scores
          WHERE evaluation_id = ${orchestrationResult.evaluationId}
          ORDER BY score DESC
        `
        
        // Get evaluation data
        let evaluationData = []
        try {
          evaluationData = await sql`
            SELECT 
              has_meta_description,
              has_title,
              has_h1
            FROM production.evaluation_results
            WHERE evaluation_id = ${orchestrationResult.evaluationId}
            LIMIT 1
          `
        } catch (error) {
          console.log(`[REPORT_BUILD] evaluation_results query failed, using defaults:`, error)
        }
        
        // Build the comprehensive report (same logic as status endpoint)
        const reportData = this.buildComprehensiveReport(
          dimensionScores,
          evaluationData[0] || {},
          adiScore.overall,
          brandId // You'll need to pass this
        )
        
        // Cache the report in the database
        await sql`
          UPDATE production.evaluations 
          SET 
            cached_report = ${JSON.stringify(reportData)},
            report_generated_at = NOW()
          WHERE id = ${orchestrationResult.evaluationId}
        `
        
        console.log(`[REPORT_BUILD_SUCCESS] Report pre-built and cached for ${orchestrationResult.evaluationId}`)
        
        console.log(`[DB_UPDATE_DATA] Updating with:`, {
          status: 'completed',
          overallScore: adiScore.overall,
          grade: adiScore.grade
        })

        // Now mark as completed
        const updateResult = await sql`
          UPDATE production.evaluations 
          SET 
            status = 'completed',
            overall_score = ${adiScore.overall},
            grade = ${adiScore.grade},
            updated_at = NOW()
          WHERE id = ${orchestrationResult.evaluationId}
          RETURNING id, status, overall_score, updated_at
        `
        
        console.log(`✅ [DB_UPDATE_SUCCESS] Evaluation ${orchestrationResult.evaluationId} marked as completed with score ${adiScore.overall}/100`)
        console.log(`[DB_UPDATE_RESULT]`, updateResult[0])
        
      } catch (error) {
        console.error(`❌ [DB_UPDATE_ERROR] Failed to update evaluation ${orchestrationResult.evaluationId}:`, error)
        // Don't throw - let the evaluation complete even if DB update fails
      }
    }

    if (orchestrationResult.overallStatus === 'failed') {
      throw new Error(`ADI evaluation failed: ${orchestrationResult.errors.join(', ')}`)
    }

    // Calculate ADI score
    const adiScore = ADIScoringEngine.calculateADIScore(orchestrationResult)

    // Log aggregation trace
    const pillarScores = adiScore.pillars?.reduce((acc, pillar) => {
      acc[pillar.pillar] = pillar.score
      return acc
    }, {} as Record<string, number>) || {}

    traceLogger.logAggregation(
      orchestrationResult.evaluationId,
      pillarScores,
      adiScore.overall,
      'ADI Framework v1.0',
      {
        infrastructure: 0.4,
        perception: 0.35,
        commerce: 0.25
      }
    )

    // Calculate industry percentile if industry provided
    let industryPercentile: number | undefined
    let globalRank: number | undefined

    if (industryId) {
      try {
        const evaluationData = await this.getIndustryEvaluationData(industryId)
        if (evaluationData.length >= 5) {
          const benchmark = await ADIBenchmarkingEngine.calculateIndustryBenchmark(
            industryId,
            evaluationData as any
          )
          industryPercentile = ADIBenchmarkingEngine.calculateIndustryPercentile(
            adiScore.overall,
            benchmark
          )
        }
      } catch (error) {
        console.warn('Failed to calculate industry percentile:', error)
      }
    }

    // Calculate global rank using benchmarking engine
    globalRank = await this.calculateGlobalRankWithBenchmarking(adiScore.overall)

    // ✅ ADD: Complete the evaluation trace
    const evaluationTrace = traceLogger.completeEvaluation(
      orchestrationResult.evaluationId,
      Date.now() - startTime
    )

    console.log(`ADI evaluation completed for brand ${brandId}: ${adiScore.overall}/100 (${adiScore.grade})`)

    return {
      orchestrationResult,
      adiScore: {
        ...adiScore,
        industryPercentile,
        globalRank
      },
      industryPercentile,
      globalRank,
      evaluationTrace: evaluationTrace as any
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
    const { sql } = await import('@/lib/db')
    const {
      crawlSiteSignals,
      websiteSnapshots,
      evaluationResults,
      dimensionScores
    } = await import('@/lib/db/schema')

    console.log(`[DB_WRITE_START] Saving agent results for evaluation ${evaluationId}`)

    try {
      // Helper to safely convert to number
      const num = (x: any, fb = 0) => {
        const n = Number(x);
        return isNaN(n) ? fb : n;
      };

      // 1. Crawl Site Signals
      if (orchestrationResult.artifacts.crawl?.signals) {
        const signals = orchestrationResult.artifacts.crawl.signals
        await sql`
          INSERT INTO production.crawl_site_signals (
            evaluation_id, load_time_ms, is_mobile_friendly, has_https, has_robots_txt, has_sitemap_xml,
            viewport_meta, has_meta_description, has_title, has_h1
          ) VALUES (
            ${evaluationId}, ${signals.loadTimeMs || 0}, ${Boolean(signals.isMobileFriendly)}, ${Boolean(signals.hasHttps)},
            ${Boolean(signals.hasRobotsTxt)}, ${Boolean(signals.hasSitemapXml)}, ${signals.viewportMeta},
            ${Boolean(signals.hasMetaDescription)}, ${Boolean(signals.hasTitle)}, ${Boolean(signals.hasH1)}
          )
          ON CONFLICT (evaluation_id) DO NOTHING;
        `
         console.log(`[DB_WRITE] Saved crawl_site_signals for ${evaluationId}`);
      } else {
        console.log(`[DB_WRITE_SKIP] No crawl signals for ${evaluationId}`);
      }

      // 2. Website Snapshots
      if (orchestrationResult.artifacts.crawl?.snapshot) {
        const snapshot = orchestrationResult.artifacts.crawl.snapshot
        // Truncate content to fit in text column
        const truncatedContent = snapshot.content?.substring(0, 100000) ?? ''

        await sql`
          INSERT INTO production.website_snapshots (
            evaluation_id, url, html_content, screenshot_url, page_type
          ) VALUES (
            ${evaluationId}, ${snapshot.url}, ${truncatedContent}, '', 'homepage'
          )
          ON CONFLICT (evaluation_id, url) DO NOTHING;
        `
        console.log(`[DB_WRITE] Saved website_snapshots for ${evaluationId}`);
      } else {
         console.log(`[DB_WRITE_SKIP] No crawl snapshot for ${evaluationId}`);
      }

      // 3. Evaluation Results (enriched)
      if (orchestrationResult.artifacts.schema?.schemaOrg) {
        await sql`
          INSERT INTO production.evaluation_results (
              evaluation_id,
              has_schema,
              schema_type,
              schema_errors,
              has_meta_description,
              has_title,
              has_h1,
              is_mobile_friendly,
              load_time_ms
          )
          VALUES (
              ${evaluationId},
              ${orchestrationResult.artifacts.schema?.schemaOrg?.detected ?? false},
              ${orchestrationResult.artifacts.schema?.schemaOrg?.type ?? null},
              ${orchestrationResult.artifacts.schema?.schemaOrg?.errors?.join(',') ?? null},
              ${orchestrationResult.artifacts.crawl?.signals.hasMetaDescription ?? false},
              ${orchestrationResult.artifacts.crawl?.signals.hasTitle ?? false},
              ${orchestrationResult.artifacts.crawl?.signals.hasH1 ?? false},
              ${orchestrationResult.artifacts.crawl?.signals.isMobileFriendly ?? false},
              ${orchestrationResult.artifacts.crawl?.signals.loadTimeMs ?? 0}
          )
          ON CONFLICT (evaluation_id) DO NOTHING;
        `;
        console.log(`[DB_WRITE] Saved evaluation_results for ${evaluationId}`);
      } else {
         console.log(`[DB_WRITE_SKIP] No schema data for ${evaluationId}`);
      }


      // 4. Dimension Scores
      if (orchestrationResult.scores) {
        for (const score of orchestrationResult.scores) {
            await sql`
                INSERT INTO production.dimension_scores (
                    evaluation_id, dimension_name, score, explanation, recommendations
                ) VALUES (
                    ${evaluationId},
                    ${score.dimension},
                    ${num(score.score, 0)},
                    ${score.explanation},
                    ${JSON.stringify(score.recommendations)}
                )
                ON CONFLICT (evaluation_id, dimension_name) DO UPDATE SET
                    score = ${num(score.score, 0)},
                    explanation = ${score.explanation},
                    recommendations = ${JSON.stringify(score.recommendations)};
            `;
        }
        console.log(`[DB_WRITE] Saved ${orchestrationResult.scores.length} dimension_scores for ${evaluationId}`);
      } else {
         console.log(`[DB_WRITE_SKIP] No scores for ${evaluationId}`);
      }


    console.log(`[DB_WRITE_SUCCESS] Agent results saved for evaluation ${evaluationId}`)

    } catch (error) {
      console.error(`[DB_WRITE_ERROR] Failed to save agent results for ${evaluationId}:`, error)
      // Do not re-throw, as we don't want to fail the entire evaluation
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
    return this.orchestrator.executeEvaluation({ brandId, websiteUrl, ...options, metadata: { llmModel: tierModel }, evaluationId: options?.evaluationId || '', industryId: '', evaluationType: 'standard', queryCanon: [], crawlArtifacts: [] });
  }
  private async executeStandardEvaluation(
    brandId: string,
    websiteUrl: string,
    userTier: UserTier,
    options?: { evaluationId?: string }
  ): Promise<ADIOrchestrationResult> {
    console.log(`Executing STANDARD evaluation for ${brandId} (Tier: ${userTier})`);
     const tierModel = getTierBasedModel(userTier);
    return this.orchestrator.executeEvaluation({ brandId, websiteUrl, ...options, metadata: { llmModel: tierModel }, evaluationId: options?.evaluationId || '', industryId: '', evaluationType: 'standard', queryCanon: [], crawlArtifacts: [] });
  }

  private buildComprehensiveReport(
    dimensionScores: any[],
    evaluationData: any,
    overallScore: number,
    brandId: string
  ): any {
    // This is a placeholder for a more comprehensive report building logic.
    // In a real scenario, this would involve more complex data transformation and presentation.
    return {
      brandId: brandId,
      overallScore: overallScore,
      dimensionScores: dimensionScores,
      evaluationSummary: evaluationData,
      generatedAt: new Date().toISOString()
    };
  }
}