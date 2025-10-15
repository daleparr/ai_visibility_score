import { db } from './db'
import {
  leaderboardCache,
  competitiveTriggers,
  nicheBrandSelection,
  leaderboardStats,
  evaluations,
  brands
} from './db/schema'
import { eq, and, desc, asc, sql, inArray, isNull, lt, count } from 'drizzle-orm'
import { BRAND_TAXONOMY, BrandCategory } from './brand-taxonomy'
import type {
  NewLeaderboardCache,
  NewCompetitiveTrigger,
  NewNicheBrandSelection
} from './db/schema'
import { PerformanceOptimizedADIOrchestrator } from './adi/performance-optimized-orchestrator'
import { ADIScoringEngine } from './adi/scoring'
import type { ADIEvaluationContext, ADIOrchestrationResult } from '@/types/adi'
import { createBrand, createEvaluation, updateEvaluation } from './database'

// Correctly infer the type from the table schema
type LeaderboardCacheType = typeof leaderboardCache.$inferSelect;

// Define a more complete result type to satisfy the compiler
interface FullOrchestrationResult {
    evaluationId: string;
    overallStatus: 'completed' | 'failed' | 'partial';
    adiScore: {
        overall: number;
        grade: string;
    };
    highlights: {
        strengths: any[];
        gaps: any[];
    };
    dimensionScores: any[];
}


export interface LeaderboardPopulationConfig {
  batchSize: number
  intervalMinutes: number
  dailyLimit: number
  retryAttempts: number
  cacheExpiryDays: number
}

export interface BrandEvaluationRequest {
  brandName: string
  websiteUrl: string
  nicheCategory: string
  priority: number
  triggerType?: 'systematic' | 'user_triggered' | 'competitor_added'
  userId?: string
  brandId?: string
}

export interface LeaderboardRankingResult {
  brandName: string
  websiteUrl: string
  adiScore: number
  grade: string
  rankGlobal: number
  rankSector: number
  rankIndustry: number
  rankNiche: number
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
  strengthHighlight: {
    dimension: string
    score: number
    description: string
  }
  gapHighlight: {
    dimension: string
    score: number
    description: string
  }
  trendData?: {
    direction: 'up' | 'down' | 'stable'
    change: number
    period: string
  }
}

/**
 * Service for populating leaderboards with real ADI evaluation data
 * Manages systematic evaluation of brands across all niches
 */
export class LeaderboardPopulationService {
  private static instance: LeaderboardPopulationService
  private config: LeaderboardPopulationConfig
  private isProcessing = false

  constructor(config?: Partial<LeaderboardPopulationConfig>) {
    this.config = {
      batchSize: 5,
      intervalMinutes: 30,
      dailyLimit: 20,
      retryAttempts: 3,
      cacheExpiryDays: 30,
      ...config
    }
  }

  static getInstance(config?: Partial<LeaderboardPopulationConfig>): LeaderboardPopulationService {
    if (!LeaderboardPopulationService.instance) {
      LeaderboardPopulationService.instance = new LeaderboardPopulationService(config)
    }
    return LeaderboardPopulationService.instance
  }

  /**
   * Initialize systematic population of all niches
   */
  async initializeNichePopulation(): Promise<void> {
    console.log('🚀 Initializing systematic niche population...')
    
    const niches = Object.values(BRAND_TAXONOMY)
    
    for (const niche of niches) {
      await this.populateNicheBrandSelection(niche)
    }
    
    console.log(`✅ Initialized ${niches.length} niches for systematic evaluation`)
  }

  /**
   * Populate brand selection for a specific niche
   */
  private async populateNicheBrandSelection(niche: BrandCategory): Promise<void> {
    const brands = this.selectBrandsForNiche(niche)
    
    const brandSelections: NewNicheBrandSelection[] = brands.map(brand => ({
      nicheCategory: niche.niche,
      brandName: brand.name,
      websiteUrl: brand.url,
      selectionType: brand.type,
      priority: brand.priority,
      evaluationStatus: 'pending'
    }))

    try {
      for (const selection of brandSelections) {
        try {
          await db.insert(nicheBrandSelection).values(selection)
        } catch (insertError: any) {
          if (!insertError.message?.includes('duplicate key')) {
            throw insertError
          }
        }
      }
    } catch (error) {
      console.error(`Error populating niche ${niche.niche}:`, error)
    }
  }

  /**
   * Select 20 brands for systematic evaluation per niche
   */
  private selectBrandsForNiche(niche: BrandCategory): Array<{
    name: string
    url: string
    type: 'market_leader' | 'emerging' | 'geographic_mix' | 'price_coverage'
    priority: number
  }> {
    const competitors = niche.competitorBrands
    const selected: Array<{
      name: string
      url: string
      type: 'market_leader' | 'emerging' | 'geographic_mix' | 'price_coverage'
      priority: number
    }> = []

    const marketLeaders = competitors.slice(0, Math.min(10, competitors.length))
    marketLeaders.forEach((brand, index) => {
      selected.push({
        name: brand,
        url: this.generateDomainFromBrand(brand),
        type: 'market_leader',
        priority: index + 1
      })
    })

    const remaining = competitors.slice(10)
    remaining.slice(0, 10).forEach((brand, index) => {
      selected.push({
        name: brand,
        url: this.generateDomainFromBrand(brand),
        type: index % 2 === 0 ? 'emerging' : 'geographic_mix',
        priority: 10 + index + 1
      })
    })

    return selected.slice(0, 20)
  }

  /**
   * Generate domain from brand name
   */
  private generateDomainFromBrand(brand: string): string {
    return brand.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .replace(/&/g, 'and') + '.com'
  }

  /**
   * Cache evaluation result in leaderboard cache
   */
  private async cacheEvaluationResult(
    queueItem: any, // Was EvaluationQueue
    evaluationResult: FullOrchestrationResult,
    overrideScore?: number,
    overrideGrade?: string,
    overridePillarScores?: { infrastructure: number; perception: number; commerce: number }
  ): Promise<void> {
    const cacheExpiry = new Date()
    cacheExpiry.setDate(cacheExpiry.getDate() + this.config.cacheExpiryDays)

    const cacheEntry: NewLeaderboardCache = {
      nicheCategory: queueItem.nicheCategory,
      brandName: queueItem.brandName,
      websiteUrl: queueItem.websiteUrl,
      evaluationId: evaluationResult.evaluationId,
      adiScore: overrideScore ?? evaluationResult.adiScore?.overall ?? 0,
      grade: overrideGrade ?? evaluationResult.adiScore?.grade ?? 'N/A',
      pillarScores: overridePillarScores as any,
      dimensionScores: evaluationResult.dimensionScores as any,
      strengthHighlight: evaluationResult.highlights.strengths[0] as any,
      gapHighlight: evaluationResult.highlights.gaps[0] as any,
      lastEvaluated: new Date(),
      cacheExpires: cacheExpiry,
    }

    try {
        await db.insert(leaderboardCache).values(cacheEntry).onConflictDoUpdate({
            target: [leaderboardCache.nicheCategory, leaderboardCache.websiteUrl],
            set: {
                ...cacheEntry,
                updatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error caching leaderboard result:', error);
    }
  }

  /**
   * Recalculate rankings for a niche
   */
  private async updateNicheRankings(nicheCategory: string): Promise<void> {
    const rankedEntries = await db
      .select()
      .from(leaderboardCache)
      .where(eq(leaderboardCache.nicheCategory, nicheCategory))
      .orderBy(desc(leaderboardCache.adiScore))

    for (let i = 0; i < rankedEntries.length; i++) {
        await db.update(leaderboardCache)
            .set({ rankNiche: i + 1 })
            .where(eq(leaderboardCache.id, rankedEntries[i].id));
    }
  }

  // Other ranking update methods would go here (updateSectorRankings, updateGlobalRankings)

  async handleCompetitorAdded(
    userId: string,
    brandId: string,
    competitorUrl: string,
    competitorName: string
  ): Promise<void> {
    const trigger: NewCompetitiveTrigger = {
      userId,
      brandId,
      competitorUrl,
      competitorName,
      triggerType: 'user_added',
      evaluationStatus: 'pending'
    }
    await db.insert(competitiveTriggers).values(trigger);
  }

  private canonicalizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
      return (parsedUrl.hostname + parsedUrl.pathname).replace(/\/$/, '')
    } catch {
      return url
    }
  }

  private extractBrandFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname
      const parts = hostname.replace('www.', '').split('.')
      return parts.length > 2 ? parts[1] : parts[0]
    } catch {
      return 'Unknown Brand'
    }
  }

  async getLeaderboardData(nicheCategory: string): Promise<LeaderboardRankingResult[]> {
    const cacheEntries = await db
      .select()
      .from(leaderboardCache)
      .where(eq(leaderboardCache.nicheCategory, nicheCategory))
      .orderBy(asc(leaderboardCache.rankNiche))
      .limit(this.config.batchSize)

    return cacheEntries.map((entry: LeaderboardCacheType) => ({
      brandName: entry.brandName,
      websiteUrl: entry.websiteUrl,
      adiScore: entry.adiScore,
      grade: entry.grade,
      rankGlobal: entry.rankGlobal || 0,
      rankSector: entry.rankSector || 0,
      rankIndustry: entry.rankIndustry || 0,
      rankNiche: entry.rankNiche || 0,
      pillarScores: entry.pillarScores as any,
      strengthHighlight: entry.strengthHighlight as any,
      gapHighlight: entry.gapHighlight as any,
    }));
  }

  async cleanupExpiredCache(): Promise<void> {
    await db.delete(leaderboardCache).where(lt(leaderboardCache.cacheExpires, new Date()));
    console.log('🧹 Cleaned up expired leaderboard cache');
  }

  /**
   * Execute genuine ADI evaluation for a brand
   * This runs the full multi-agent orchestrator with all probes and agents
   * All results are persisted to Neon database (probe_runs, page_blobs, etc.)
   */
  async executeGenuineEvaluation(
    brandName: string,
    websiteUrl: string,
    nicheCategory: string,
    systemUserId: string = '00000000-0000-0000-0000-000000000000' // System user for automated evaluations
  ): Promise<FullOrchestrationResult> {
    console.log(`🚀 Starting genuine evaluation for ${brandName} (${websiteUrl})`)
    
    try {
      // Step 1: Create or get brand record
      let brandRecord
      try {
        const existingBrands = await db.select()
          .from(brands)
          .where(eq(brands.websiteUrl, websiteUrl))
          .limit(1)
        
        if (existingBrands.length > 0) {
          brandRecord = existingBrands[0]
          console.log(`✅ Using existing brand record: ${brandRecord.id}`)
        } else {
          brandRecord = await createBrand({
            userId: systemUserId,
            name: brandName,
            websiteUrl: websiteUrl,
            description: `Automated evaluation for ${nicheCategory} niche`,
            industry: nicheCategory,
            competitors: []
          })
          console.log(`✅ Created new brand record: ${brandRecord?.id || 'unknown'}`)
        }
      } catch (error) {
        console.error('Error creating/fetching brand:', error)
        throw new Error(`Failed to create brand record: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      if (!brandRecord) {
        throw new Error('Failed to create or retrieve brand record')
      }

      // Step 2: Create evaluation record
      const evaluation = await createEvaluation({
        brandId: brandRecord.id,
        status: 'running',
        startedAt: new Date()
      })
      console.log(`✅ Created evaluation record: ${evaluation.id}`)

      // Step 3: Initialize ADI orchestrator
      const orchestrator = new PerformanceOptimizedADIOrchestrator()
      console.log('✅ ADI Orchestrator initialized')

      // Step 4: Create evaluation context
      const context: ADIEvaluationContext = {
        evaluationId: evaluation.id,
        brandId: brandRecord.id,
        websiteUrl: websiteUrl,
        evaluationType: 'adi_premium',
        queryCanon: [],
        crawlArtifacts: [],
        metadata: {
          tier: 'pro', // Use pro tier for automated evaluations
          userId: systemUserId,
          brandName: brandName,
          industryContext: nicheCategory
        }
      }

      // Step 5: Execute full ADI evaluation
      // This runs ALL agents: crawl, schema, LLM test, semantic, etc.
      // All probe results are automatically saved to probe_runs table
      // All HTML content is automatically saved to page_blobs table
      console.log('🤖 Executing full multi-agent ADI evaluation...')
      const orchestrationResult: ADIOrchestrationResult = await orchestrator.executeEvaluation(context)
      console.log(`✅ Orchestration completed: ${orchestrationResult.overallStatus}`)

      // Step 6: Calculate ADI score
      const adiScore = ADIScoringEngine.calculateADIScore(orchestrationResult)
      console.log(`✅ ADI Score calculated: ${adiScore.overall}/100 (${adiScore.grade})`)

      // Step 7: Update evaluation record with results
      await updateEvaluation(evaluation.id, {
        status: orchestrationResult.overallStatus === 'completed' ? 'completed' : 'failed',
        overallScore: adiScore.overall,
        grade: adiScore.grade,
        adiScore: adiScore.overall,
        adiGrade: adiScore.grade,
        confidenceInterval: Math.round((adiScore.reliabilityScore || 0.8) * 100),
        reliabilityScore: Math.round((adiScore.reliabilityScore || 0.8) * 100),
        completedAt: new Date()
      })
      console.log('✅ Evaluation record updated with final scores')

      // Step 8: Extract dimension scores and highlights
      const dimensionScores = adiScore.pillars.flatMap(pillar => pillar.dimensions)
      
      // Find strongest and weakest dimensions for highlights
      const sortedDimensions = [...dimensionScores].sort((a, b) => b.score - a.score)
      const strengths = sortedDimensions.slice(0, 3).map((dim: any) => ({
        dimension: dim.dimension || dim.name,
        score: dim.score,
        description: `Strong performance in ${dim.dimension || dim.name}`
      }))
      const gaps = [...dimensionScores].sort((a, b) => a.score - b.score).slice(0, 3).map((dim: any) => ({
        dimension: dim.dimension || dim.name,
        score: dim.score,
        description: `Opportunity for improvement in ${dim.dimension || dim.name}`
      }))

      // Step 9: Return full result for caching
      const result: FullOrchestrationResult = {
        evaluationId: evaluation.id,
        overallStatus: orchestrationResult.overallStatus === 'completed' ? 'completed' : 'failed',
        adiScore: {
          overall: adiScore.overall,
          grade: adiScore.grade
        },
        highlights: {
          strengths,
          gaps
        },
        dimensionScores
      }

      console.log(`✅ Genuine evaluation completed for ${brandName}`)
      return result

    } catch (error) {
      console.error(`❌ Evaluation failed for ${brandName}:`, error)
      throw error
    }
  }

  /**
   * Process a batch of pending evaluations from the queue
   * This is called by the automated scheduler
   */
  async processBatchEvaluations(batchSize?: number): Promise<{
    processed: number
    successful: number
    failed: number
    errors: string[]
  }> {
    const size = batchSize || this.config.batchSize
    console.log(`📊 Processing batch of ${size} evaluations...`)

    const stats = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Get pending brand selections (these are the brands to evaluate)
      const pendingBrands = await db.select()
        .from(nicheBrandSelection)
        .where(isNull(nicheBrandSelection.lastEvaluated))
        .limit(size)

      if (pendingBrands.length === 0) {
        console.log('ℹ️ No pending brands to evaluate')
        return stats
      }

      console.log(`📋 Found ${pendingBrands.length} brands to evaluate`)

      // Process each brand
      for (const brand of pendingBrands) {
        stats.processed++
        
        try {
          console.log(`\n${'='.repeat(60)}`)
          console.log(`Evaluating ${stats.processed}/${pendingBrands.length}: ${brand.brandName}`)
          console.log(`${'='.repeat(60)}\n`)

          // Execute genuine evaluation
          const result = await this.executeGenuineEvaluation(
            brand.brandName,
            brand.websiteUrl,
            brand.nicheCategory
          )

          // Calculate pillar scores from dimension scores
          const infrastructureDims = result.dimensionScores.filter((d: any) => 
            ['Schema & Structured Data', 'Semantic Clarity', 'Knowledge Graph'].includes(d.name)
          )
          const perceptionDims = result.dimensionScores.filter((d: any) => 
            ['LLM Testability', 'Geo-Visibility', 'Citation Quality', 'Sentiment & Trust'].includes(d.name)
          )
          const commerceDims = result.dimensionScores.filter((d: any) => 
            ['Commerce Readiness', 'Brand Heritage'].includes(d.name)
          )

          const pillarScores = {
            infrastructure: infrastructureDims.length > 0 
              ? Math.round(infrastructureDims.reduce((sum: number, d: any) => sum + d.score, 0) / infrastructureDims.length)
              : 0,
            perception: perceptionDims.length > 0
              ? Math.round(perceptionDims.reduce((sum: number, d: any) => sum + d.score, 0) / perceptionDims.length)
              : 0,
            commerce: commerceDims.length > 0
              ? Math.round(commerceDims.reduce((sum: number, d: any) => sum + d.score, 0) / commerceDims.length)
              : 0
          }

          // Cache the result in leaderboard_cache
          await this.cacheEvaluationResult(
            {
              nicheCategory: brand.nicheCategory,
              brandName: brand.brandName,
              websiteUrl: brand.websiteUrl
            },
            result,
            result.adiScore.overall,
            result.adiScore.grade,
            pillarScores
          )

          // Update the brand selection record to mark as evaluated
          await db.update(nicheBrandSelection)
            .set({ lastEvaluated: new Date() })
            .where(eq(nicheBrandSelection.id, brand.id))

          // Update niche rankings
          await this.updateNicheRankings(brand.nicheCategory)

          stats.successful++
          console.log(`✅ Successfully evaluated ${brand.brandName}`)

        } catch (error) {
          stats.failed++
          const errorMsg = `Failed to evaluate ${brand.brandName}: ${error instanceof Error ? error.message : 'Unknown error'}`
          stats.errors.push(errorMsg)
          console.error(`❌ ${errorMsg}`)
        }

        // Add delay between evaluations to avoid rate limits
        if (stats.processed < pendingBrands.length) {
          console.log('⏱️ Waiting 10 seconds before next evaluation...')
          await new Promise(resolve => setTimeout(resolve, 10000))
        }
      }

      console.log('\n' + '='.repeat(60))
      console.log('📊 BATCH PROCESSING COMPLETE')
      console.log('='.repeat(60))
      console.log(`✅ Successful: ${stats.successful}`)
      console.log(`❌ Failed: ${stats.failed}`)
      console.log(`📈 Total processed: ${stats.processed}`)
      console.log('='.repeat(60) + '\n')

      return stats

    } catch (error) {
      console.error('❌ Batch processing failed:', error)
      throw error
    }
  }
}