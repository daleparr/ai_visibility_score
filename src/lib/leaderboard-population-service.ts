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
}