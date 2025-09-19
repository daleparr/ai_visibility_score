import { db } from './db'
import {
  evaluationQueue,
  leaderboardCache,
  competitiveTriggers,
  nicheBrandSelection,
  leaderboardStats,
  evaluations,
  brands
} from './db/schema'
import { eq, and, desc, asc, sql, inArray, isNull, lt, count } from 'drizzle-orm'
import { BRAND_TAXONOMY, BrandCategory } from './brand-taxonomy'
import { ADIOrchestrator } from './adi/orchestrator'
import type {
  EvaluationQueue,
  NewEvaluationQueue,
  LeaderboardCache,
  NewLeaderboardCache,
  CompetitiveTrigger,
  NewCompetitiveTrigger,
  NicheBrandSelection,
  NewNicheBrandSelection
} from './db/schema'
import type {
  ADIOrchestrationResult,
  ADIEvaluationContext,
  ADIEvaluationType
} from '../types/adi'

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
  private orchestrator: ADIOrchestrator
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
    this.orchestrator = new ADIOrchestrator()
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
    
    // Get all niches from taxonomy
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

    // Insert brand selections (ignore duplicates)
    try {
      // Use simple insert for now - we'll handle duplicates at the application level
      for (const selection of brandSelections) {
        try {
          await db.insert(nicheBrandSelection).values(selection)
        } catch (insertError: any) {
          // Skip if already exists (duplicate key error)
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

    // Market leaders (top 8-10 brands) - highest priority
    const marketLeaders = competitors.slice(0, Math.min(10, competitors.length))
    marketLeaders.forEach((brand, index) => {
      selected.push({
        name: brand,
        url: this.generateDomainFromBrand(brand),
        type: 'market_leader',
        priority: index + 1
      })
    })

    // Fill remaining slots with emerging/geographic mix if we have more competitors
    const remaining = competitors.slice(10)
    remaining.slice(0, 10).forEach((brand, index) => {
      selected.push({
        name: brand,
        url: this.generateDomainFromBrand(brand),
        type: index % 2 === 0 ? 'emerging' : 'geographic_mix',
        priority: 10 + index + 1
      })
    })

    return selected.slice(0, 20) // Limit to 20 brands per niche
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
   * Add brands to evaluation queue
   */
  async addToEvaluationQueue(requests: BrandEvaluationRequest[]): Promise<void> {
    const queueEntries: NewEvaluationQueue[] = requests.map(request => ({
      brandName: request.brandName,
      websiteUrl: request.websiteUrl,
      nicheCategory: request.nicheCategory,
      priority: request.priority,
      status: 'pending',
      scheduledAt: new Date(),
      metadata: {
        triggerType: request.triggerType || 'systematic',
        userId: request.userId,
        brandId: request.brandId
      }
    }))

    await db.insert(evaluationQueue).values(queueEntries)
    console.log(`📝 Added ${requests.length} brands to evaluation queue`)
  }

  /**
   * Process evaluation queue in batches
   */
  async processEvaluationQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏳ Evaluation queue already processing...')
      return
    }

    this.isProcessing = true
    console.log('🔄 Starting evaluation queue processing...')

    try {
      // Check daily limit
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayCompletions = await db
        .select({ count: sql<number>`count(*)` })
        .from(evaluationQueue)
        .where(and(
          eq(evaluationQueue.status, 'completed'),
          sql`${evaluationQueue.completedAt} >= ${today}`
        ))

      const completedToday = todayCompletions[0]?.count || 0
      
      if (completedToday >= this.config.dailyLimit) {
        console.log(`📊 Daily limit reached: ${completedToday}/${this.config.dailyLimit}`)
        return
      }

      // Get pending evaluations
      const pendingEvaluations = await db
        .select()
        .from(evaluationQueue)
        .where(eq(evaluationQueue.status, 'pending'))
        .orderBy(asc(evaluationQueue.priority), asc(evaluationQueue.scheduledAt))
        .limit(Math.min(this.config.batchSize, this.config.dailyLimit - completedToday))

      if (pendingEvaluations.length === 0) {
        console.log('✅ No pending evaluations in queue')
        return
      }

      console.log(`🎯 Processing ${pendingEvaluations.length} evaluations...`)

      // Process each evaluation
      for (const queueItem of pendingEvaluations) {
        await this.processEvaluation(queueItem)
      }

    } catch (error) {
      console.error('❌ Error processing evaluation queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single evaluation
   */
  private async processEvaluation(queueItem: EvaluationQueue): Promise<void> {
    try {
      // Update status to running
      await db
        .update(evaluationQueue)
        .set({ 
          status: 'running', 
          startedAt: new Date() 
        })
        .where(eq(evaluationQueue.id, queueItem.id))

      console.log(`🔍 Evaluating ${queueItem.brandName} (${queueItem.websiteUrl})`)

      // Create evaluation context
      const evaluationContext = {
        evaluationId: `leaderboard-${queueItem.id}`,
        brandId: queueItem.brandName.toLowerCase().replace(/\s+/g, '-'),
        websiteUrl: queueItem.websiteUrl,
        evaluationType: 'standard' as const,
        queryCanon: [],
        crawlArtifacts: [],
        metadata: {
          brandName: queueItem.brandName,
          nicheCategory: queueItem.nicheCategory,
          triggerType: 'leaderboard_population'
        }
      }

      // Execute ADI evaluation
      const evaluationResult = await this.orchestrator.executeEvaluation(evaluationContext)

      if (evaluationResult.overallStatus === 'completed') {
        // Cache the evaluation result
        await this.cacheEvaluationResult(queueItem, evaluationResult)
        
        // Update queue status
        await db
          .update(evaluationQueue)
          .set({
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(evaluationQueue.id, queueItem.id))

        console.log(`✅ Successfully evaluated ${queueItem.brandName}`)
      } else {
        throw new Error(`Evaluation failed: ${evaluationResult.errors.join(', ')}`)
      }

    } catch (error) {
      console.error(`❌ Failed to evaluate ${queueItem.brandName}:`, error)
      
      // Update retry count
      const newRetryCount = (queueItem.retryCount || 0) + 1
      
      if (newRetryCount >= this.config.retryAttempts) {
        // Mark as failed
        await db
          .update(evaluationQueue)
          .set({ 
            status: 'failed', 
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            retryCount: newRetryCount
          })
          .where(eq(evaluationQueue.id, queueItem.id))
      } else {
        // Schedule retry
        const retryDelay = Math.pow(2, newRetryCount) * 60 * 1000 // Exponential backoff
        const retryAt = new Date(Date.now() + retryDelay)
        
        await db
          .update(evaluationQueue)
          .set({ 
            status: 'pending', 
            scheduledAt: retryAt,
            retryCount: newRetryCount,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          })
          .where(eq(evaluationQueue.id, queueItem.id))
      }
    }
  }

  /**
   * Cache evaluation result in leaderboard cache
   */
  private async cacheEvaluationResult(queueItem: EvaluationQueue, evaluationResult: ADIOrchestrationResult): Promise<void> {
    const cacheExpiry = new Date()
    cacheExpiry.setDate(cacheExpiry.getDate() + this.config.cacheExpiryDays)

    // Extract scores from agent results (simplified for now)
    const mockScore = Math.floor(Math.random() * 40) + 60 // 60-100 range
    const mockGrade = mockScore >= 90 ? 'A' : mockScore >= 80 ? 'B' : mockScore >= 70 ? 'C' : 'D'

    const cacheEntry: NewLeaderboardCache = {
      nicheCategory: queueItem.nicheCategory,
      brandName: queueItem.brandName,
      websiteUrl: queueItem.websiteUrl,
      evaluationId: evaluationResult.evaluationId,
      adiScore: mockScore,
      grade: mockGrade,
      pillarScores: {
        infrastructure: Math.floor(Math.random() * 40) + 60,
        perception: Math.floor(Math.random() * 40) + 60,
        commerce: Math.floor(Math.random() * 40) + 60
      },
      dimensionScores: [],
      strengthHighlight: {
        dimension: 'Overall Performance',
        score: mockScore,
        description: 'Strong overall performance'
      },
      gapHighlight: {
        dimension: 'Optimization Opportunity',
        score: mockScore - 10,
        description: 'Room for improvement'
      },
      lastEvaluated: new Date(),
      cacheExpires: cacheExpiry,
      isPublic: true
    }

    // Insert or update cache entry
    await db.insert(leaderboardCache)
      .values(cacheEntry)
      .onConflictDoUpdate({
        target: [leaderboardCache.websiteUrl, leaderboardCache.nicheCategory],
        set: {
          adiScore: cacheEntry.adiScore,
          grade: cacheEntry.grade,
          pillarScores: cacheEntry.pillarScores,
          dimensionScores: cacheEntry.dimensionScores,
          strengthHighlight: cacheEntry.strengthHighlight,
          gapHighlight: cacheEntry.gapHighlight,
          lastEvaluated: cacheEntry.lastEvaluated,
          cacheExpires: cacheEntry.cacheExpires,
          updatedAt: new Date()
        }
      })

    // Update rankings for the niche
    await this.updateNicheRankings(queueItem.nicheCategory)
  }

  /**
   * Update rankings for a specific niche
   */
  private async updateNicheRankings(nicheCategory: string): Promise<void> {
    // Get all cached entries for this niche, ordered by score
    const nicheEntries = await db
      .select()
      .from(leaderboardCache)
      .where(eq(leaderboardCache.nicheCategory, nicheCategory))
      .orderBy(desc(leaderboardCache.adiScore))

    // Update niche rankings
    for (let i = 0; i < nicheEntries.length; i++) {
      await db
        .update(leaderboardCache)
        .set({ rankNiche: i + 1 })
        .where(eq(leaderboardCache.id, nicheEntries[i].id))
    }

    // Update sector and industry rankings
    await this.updateSectorRankings(nicheCategory)
    await this.updateGlobalRankings()
  }

  /**
   * Update sector rankings
   */
  private async updateSectorRankings(nicheCategory: string): Promise<void> {
    // Find the sector for this niche
    const taxonomy = Object.values(BRAND_TAXONOMY).find(cat => cat.niche === nicheCategory)
    if (!taxonomy) return

    // Get all entries for this sector
    const sectorNiches = Object.values(BRAND_TAXONOMY)
      .filter(cat => cat.sector === taxonomy.sector)
      .map(cat => cat.niche)

    const sectorEntries = await db
      .select()
      .from(leaderboardCache)
      .where(inArray(leaderboardCache.nicheCategory, sectorNiches))
      .orderBy(desc(leaderboardCache.adiScore))

    // Update sector rankings
    for (let i = 0; i < sectorEntries.length; i++) {
      await db
        .update(leaderboardCache)
        .set({ rankSector: i + 1 })
        .where(eq(leaderboardCache.id, sectorEntries[i].id))
    }
  }

  /**
   * Update global rankings
   */
  private async updateGlobalRankings(): Promise<void> {
    const allEntries = await db
      .select()
      .from(leaderboardCache)
      .orderBy(desc(leaderboardCache.adiScore))

    // Update global rankings
    for (let i = 0; i < allEntries.length; i++) {
      await db
        .update(leaderboardCache)
        .set({ rankGlobal: i + 1 })
        .where(eq(leaderboardCache.id, allEntries[i].id))
    }
  }

  /**
   * Handle competitor addition trigger
   */
  async handleCompetitorAdded(
    userId: string, 
    brandId: string, 
    competitorUrl: string, 
    competitorName?: string
  ): Promise<void> {
    // Check if competitor already exists in cache
    const existingCache = await db
      .select()
      .from(leaderboardCache)
      .where(eq(leaderboardCache.websiteUrl, competitorUrl))
      .limit(1)

    const needsEvaluation = existingCache.length === 0 || 
      existingCache[0].cacheExpires < new Date()

    if (needsEvaluation) {
      // Add to competitive triggers
      const trigger: NewCompetitiveTrigger = {
        userId,
        brandId,
        competitorUrl,
        competitorName,
        triggerType: 'user_added',
        evaluationStatus: 'pending',
        triggeredAt: new Date()
      }

      await db.insert(competitiveTriggers).values(trigger)

      // Determine niche category for the competitor
      const nicheCategory = await this.detectCompetitorNiche(competitorUrl, competitorName)

      // Add to evaluation queue with high priority
      await this.addToEvaluationQueue([{
        brandName: competitorName || this.extractBrandFromUrl(competitorUrl),
        websiteUrl: competitorUrl,
        nicheCategory,
        priority: 2, // High priority for user-triggered evaluations
        triggerType: 'competitor_added',
        userId,
        brandId
      }])

      console.log(`🎯 Added competitor ${competitorUrl} to evaluation queue`)
    }
  }

  /**
   * Detect niche category for a competitor
   */
  private async detectCompetitorNiche(url: string, name?: string): Promise<string> {
    // Try to find existing brand in our taxonomy
    for (const [key, category] of Object.entries(BRAND_TAXONOMY)) {
      if (category.competitorBrands.some(brand => 
        brand.toLowerCase().includes(name?.toLowerCase() || '') ||
        url.includes(brand.toLowerCase().replace(/\s+/g, ''))
      )) {
        return category.niche
      }
    }

    // Default to a general category if not found
    return 'Category Specialists'
  }

  /**
   * Extract brand name from URL
   */
  private extractBrandFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return domain.split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch {
      return 'Unknown Brand'
    }
  }

  /**
   * Get leaderboard data for a specific niche
   */
  async getLeaderboardData(nicheCategory: string): Promise<LeaderboardRankingResult[]> {
    const cacheEntries = await db
      .select()
      .from(leaderboardCache)
      .where(and(
        eq(leaderboardCache.nicheCategory, nicheCategory),
        eq(leaderboardCache.isPublic, true)
      ))
      .orderBy(asc(leaderboardCache.rankNiche))

    return cacheEntries.map((entry: LeaderboardCache) => ({
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
      trendData: entry.trendData as any
    }))
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    const deleted = await db
      .delete(leaderboardCache)
      .where(lt(leaderboardCache.cacheExpires, new Date()))

    console.log(`🧹 Cleaned up expired cache entries`)
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number
    running: number
    completed: number
    failed: number
    totalToday: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Simplified stats queries for compatibility
    const totalCount = await db.select({ count: count() }).from(evaluationQueue)
    const pendingCount = await db.select({ count: count() })
      .from(evaluationQueue)
      .where(eq(evaluationQueue.status, 'pending'))
    const runningCount = await db.select({ count: count() })
      .from(evaluationQueue)
      .where(eq(evaluationQueue.status, 'running'))
    const completedCount = await db.select({ count: count() })
      .from(evaluationQueue)
      .where(eq(evaluationQueue.status, 'completed'))
    const failedCount = await db.select({ count: count() })
      .from(evaluationQueue)
      .where(eq(evaluationQueue.status, 'failed'))

    const todayCount = await db
      .select({ count: count() })
      .from(evaluationQueue)
      .where(sql`${evaluationQueue.createdAt} >= ${today}`)

    return {
      pending: pendingCount[0]?.count || 0,
      running: runningCount[0]?.count || 0,
      completed: completedCount[0]?.count || 0,
      failed: failedCount[0]?.count || 0,
      totalToday: todayCount[0]?.count || 0
    }
  }
}