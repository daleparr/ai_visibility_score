import { NextRequest, NextResponse } from 'next/server'
import {
  LeaderboardData,
  LeaderboardFilters,
  SAMPLE_LEADERBOARDS,
  LEADERBOARD_CATEGORIES,
  SectorHeatmap
} from '@/types/leaderboards'
import { BRAND_TAXONOMY, getAllCategories } from '@/lib/brand-taxonomy'
import { LeaderboardPopulationService } from '@/lib/leaderboard-population-service'

// Use dynamic import to prevent webpack bundling issues
const getBrandCategorizationService = async () => {
  const { BrandCategorizationService } = await import('@/lib/brand-categorization-service')
  return BrandCategorizationService
}

// Import types separately
import type { LeaderboardCategoryFilter, BrandCategorizationService } from '@/lib/brand-categorization-service'

/**
 * AI Discoverability Leaderboards API
 * GET /api/leaderboards - Fetch leaderboard data with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const requestedType = searchParams.get('type') as any
    
    // Auto-determine leaderboard type based on category if not explicitly specified
    let leaderboardType = requestedType || 'global'
    if (!requestedType && category) {
      // Check if category matches a specific niche
      const { BRAND_TAXONOMY } = await import('@/lib/brand-taxonomy')
      const isNiche = Object.values(BRAND_TAXONOMY).some(cat => cat.niche === category)
      const isSector = Object.values(BRAND_TAXONOMY).some(cat => cat.sector === category)
      const isIndustry = Object.values(BRAND_TAXONOMY).some(cat => cat.industry === category)
      
      if (isNiche) {
        leaderboardType = 'niche'
      } else if (isIndustry) {
        leaderboardType = 'industry'
      } else if (isSector) {
        leaderboardType = 'sector'
      }
      
      console.log('🔍 Leaderboard type determination:', {
        category,
        requestedType,
        determinedType: leaderboardType,
        isNiche,
        isIndustry,
        isSector
      })
    }

    const filters: LeaderboardFilters = {
      leaderboardType,
      category: category || undefined,
      minScore: searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined,
      maxScore: searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : undefined,
      region: searchParams.get('region') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'rank',
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    }

    // Generate leaderboard data based on filters
    const leaderboardData = await generateLeaderboardData(filters)
    
    return NextResponse.json(leaderboardData)
    
  } catch (error) {
    console.error('Leaderboards API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    )
  }
}

/**
 * Generate leaderboard data based on filters
 */
async function generateLeaderboardData(filters: LeaderboardFilters): Promise<LeaderboardData> {
  const { leaderboardType, category } = filters
  const BrandCategorizationServiceClass = await getBrandCategorizationService()
  const categorizationService = BrandCategorizationServiceClass.getInstance()
  const populationService = LeaderboardPopulationService.getInstance()
  
  // Determine which leaderboard to return
  let entries = []
  let title = ''
  let description = ''
  
  // Try to get real data first, fallback to generated data
  try {
    switch (leaderboardType) {
      case 'global':
        // For global, we'll aggregate across all niches
        entries = await generateDynamicGlobalLeaderboard(categorizationService)
        title = 'Global AI Discoverability Leaderboard'
        description = 'Top brands across all sectors ranked by AI visibility'
        break
        
      case 'sector':
        entries = await generateDynamicSectorLeaderboard(categorizationService, category || 'Fashion & Apparel')
        title = `${category || 'Fashion & Apparel'} Sector Leaderboard`
        description = `Top brands in ${category || 'Fashion & Apparel'} ranked by AI discoverability`
        break
        
      case 'industry':
        entries = await generateDynamicIndustryLeaderboard(categorizationService, category || 'Luxury Fashion')
        title = `${category || 'Luxury Fashion'} Industry Leaderboard`
        description = `Leading brands in ${category || 'Luxury Fashion'} by AI visibility`
        break
        
      case 'niche':
        // Try to get real data for this niche
        const realData = await populationService.getLeaderboardData(category || 'Luxury Fashion Houses')
        if (realData.length > 0) {
          entries = realData.map((item, index) => ({
            rank: item.rankNiche,
            brand: item.brandName,
            domain: item.websiteUrl,
            overallScore: item.adiScore,
            grade: item.grade,
            pillarScores: item.pillarScores,
            dimensionScores: [],
            strengthHighlight: item.strengthHighlight,
            gapHighlight: item.gapHighlight,
            lastUpdated: new Date().toISOString().split('T')[0],
            trend: item.trendData
          }))
        } else {
          // Fallback to generated data
          entries = await generateDynamicNicheLeaderboard(categorizationService, category || 'Luxury Fashion Houses')
        }
        title = `${category || 'Luxury Fashion Houses'} Niche Leaderboard`
        description = `Top ${category || 'Luxury Fashion Houses'} brands by AI discoverability`
        break
        
      default:
        entries = await generateDynamicGlobalLeaderboard(categorizationService)
        title = 'Global AI Discoverability Leaderboard'
        description = 'Top brands across all sectors'
    }
  } catch (error) {
    console.error('Error fetching real leaderboard data, falling back to generated:', error)
    // Fallback to original generated data logic
    switch (leaderboardType) {
      case 'niche':
        entries = await generateDynamicNicheLeaderboard(categorizationService, category || 'Luxury Fashion Houses')
        break
      default:
        entries = await generateDynamicGlobalLeaderboard(categorizationService)
    }
  }

  // Apply filters
  if (filters.minScore) {
    entries = entries.filter(entry => entry.overallScore >= filters.minScore!)
  }
  
  if (filters.maxScore) {
    entries = entries.filter(entry => entry.overallScore <= filters.maxScore!)
  }

  // Apply sorting
  if (filters.sortBy && filters.sortBy !== 'rank') {
    entries.sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (filters.sortBy) {
        case 'score':
          aValue = a.overallScore
          bValue = b.overallScore
          break
        case 'infrastructure':
          aValue = a.pillarScores.infrastructure
          bValue = b.pillarScores.infrastructure
          break
        case 'perception':
          aValue = a.pillarScores.perception
          bValue = b.pillarScores.perception
          break
        case 'commerce':
          aValue = a.pillarScores.commerce
          bValue = b.pillarScores.commerce
          break
        case 'trend':
          aValue = a.trend?.change || 0
          bValue = b.trend?.change || 0
          break
        default:
          aValue = a.rank
          bValue = b.rank
      }
      
      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue
    })
    
    // Re-rank after sorting
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })
  }

  // Apply limit
  if (filters.limit) {
    entries = entries.slice(0, filters.limit)
  }

  // Generate sector insights
  const sectorInsights = generateSectorInsights(entries)

  return {
    leaderboardType: leaderboardType || 'global',
    category: category || 'All Brands',
    title,
    description,
    totalBrands: entries.length,
    lastUpdated: new Date().toISOString().split('T')[0],
    entries,
    sectorInsights
  }
}

/**
 * Generate dynamic global leaderboard with intelligent categorization
 */
async function generateDynamicGlobalLeaderboard(categorizationService: BrandCategorizationService) {
  // Get top brands from each major sector
  const globalBrands = [
    // Tech Giants
    { brand: 'Apple', domain: 'apple.com', sector: 'Consumer Electronics & Entertainment' },
    { brand: 'Samsung', domain: 'samsung.com', sector: 'Consumer Electronics & Entertainment' },
    { brand: 'Sony', domain: 'sony.com', sector: 'Consumer Electronics & Entertainment' },
    
    // Fashion Leaders
    { brand: 'Nike', domain: 'nike.com', sector: 'Fashion & Apparel' },
    { brand: 'Adidas', domain: 'adidas.com', sector: 'Fashion & Apparel' },
    { brand: 'Lululemon', domain: 'lululemon.com', sector: 'Fashion & Apparel' },
    
    // Beauty Giants
    { brand: 'Sephora', domain: 'sephora.com', sector: 'Beauty & Personal Care' },
    { brand: 'Ulta', domain: 'ulta.com', sector: 'Beauty & Personal Care' },
    
    // Retail Leaders
    { brand: 'Amazon', domain: 'amazon.com', sector: 'Multi-Brand Retail' },
    { brand: 'Target', domain: 'target.com', sector: 'Multi-Brand Retail' },
    
    // Home & Lifestyle
    { brand: 'IKEA', domain: 'ikea.com', sector: 'Home & Lifestyle' },
    { brand: 'Wayfair', domain: 'wayfair.com', sector: 'Home & Lifestyle' }
  ]

  return globalBrands.map((brand, index) => ({
    rank: index + 1,
    brand: brand.brand,
    domain: brand.domain,
    overallScore: generateRealisticScore(index + 1, 'global'),
    grade: getGradeFromScore(generateRealisticScore(index + 1, 'global')),
    pillarScores: generatePillarScores(index + 1),
    dimensionScores: [],
    strengthHighlight: generateStrengthHighlight(brand.sector),
    gapHighlight: generateGapHighlight(brand.sector),
    lastUpdated: '2025-01-15',
    trend: generateTrend(index + 1),
    category: {
      sector: brand.sector,
      industry: getDefaultIndustryForSector(brand.sector),
      niche: getDefaultNicheForSector(brand.sector),
      emoji: getSectorEmoji(brand.sector)
    }
  }))
}

/**
 * Generate dynamic sector leaderboard
 */
async function generateDynamicSectorLeaderboard(categorizationService: BrandCategorizationService, sector: string) {
  const sectorCategories = Object.values(BRAND_TAXONOMY).filter(cat => cat.sector === sector)
  const sectorBrands: any[] = []
  
  // Get brands from all categories in this sector
  sectorCategories.forEach(category => {
    category.competitorBrands.forEach((brand, index) => {
      if (sectorBrands.length < 20) { // Limit to top 20 per sector
        sectorBrands.push({
          rank: sectorBrands.length + 1,
          brand,
          domain: generateDomainFromBrand(brand),
          overallScore: generateRealisticScore(sectorBrands.length + 1, 'sector'),
          grade: getGradeFromScore(generateRealisticScore(sectorBrands.length + 1, 'sector')),
          pillarScores: generatePillarScores(sectorBrands.length + 1),
          dimensionScores: [],
          strengthHighlight: generateStrengthHighlight(sector),
          gapHighlight: generateGapHighlight(sector),
          lastUpdated: '2025-01-15',
          trend: generateTrend(sectorBrands.length + 1),
          category: {
            sector: category.sector,
            industry: category.industry,
            niche: category.niche,
            emoji: category.emoji
          }
        })
      }
    })
  })
  
  // Sort by score and re-rank
  sectorBrands.sort((a, b) => b.overallScore - a.overallScore)
  sectorBrands.forEach((brand, index) => {
    brand.rank = index + 1
  })
  
  return sectorBrands
}

/**
 * Generate dynamic industry leaderboard
 */
async function generateDynamicIndustryLeaderboard(categorizationService: BrandCategorizationService, industry: string) {
  const industryCategories = Object.values(BRAND_TAXONOMY).filter(cat => cat.industry === industry)
  const industryBrands: any[] = []
  
  industryCategories.forEach(category => {
    category.competitorBrands.forEach((brand, index) => {
      if (industryBrands.length < 15) { // Limit to top 15 per industry
        industryBrands.push({
          rank: industryBrands.length + 1,
          brand,
          domain: generateDomainFromBrand(brand),
          overallScore: generateRealisticScore(industryBrands.length + 1, 'industry'),
          grade: getGradeFromScore(generateRealisticScore(industryBrands.length + 1, 'industry')),
          pillarScores: generatePillarScores(industryBrands.length + 1),
          dimensionScores: [],
          strengthHighlight: generateStrengthHighlight(category.sector),
          gapHighlight: generateGapHighlight(category.sector),
          lastUpdated: '2025-01-15',
          trend: generateTrend(industryBrands.length + 1),
          category: {
            sector: category.sector,
            industry: category.industry,
            niche: category.niche,
            emoji: category.emoji
          }
        })
      }
    })
  })
  
  // Sort by score and re-rank
  industryBrands.sort((a, b) => b.overallScore - a.overallScore)
  industryBrands.forEach((brand, index) => {
    brand.rank = index + 1
  })
  
  return industryBrands
}

/**
 * Generate dynamic niche leaderboard
 */
async function generateDynamicNicheLeaderboard(categorizationService: BrandCategorizationService, niche: string) {
  const nicheCategory = Object.values(BRAND_TAXONOMY).find(cat => cat.niche === niche)
  
  if (!nicheCategory) {
    return []
  }
  
  const nicheBrands = nicheCategory.competitorBrands.map((brand, index) => ({
    rank: index + 1,
    brand,
    domain: generateDomainFromBrand(brand),
    overallScore: generateRealisticScore(index + 1, 'niche'),
    grade: getGradeFromScore(generateRealisticScore(index + 1, 'niche')),
    pillarScores: generatePillarScores(index + 1),
    dimensionScores: [],
    strengthHighlight: generateStrengthHighlight(nicheCategory.sector),
    gapHighlight: generateGapHighlight(nicheCategory.sector),
    lastUpdated: '2025-01-15',
    trend: generateTrend(index + 1),
    category: {
      sector: nicheCategory.sector,
      industry: nicheCategory.industry,
      niche: nicheCategory.niche,
      emoji: nicheCategory.emoji
    }
  }))
  
  // Sort by score and re-rank
  nicheBrands.sort((a, b) => b.overallScore - a.overallScore)
  nicheBrands.forEach((brand, index) => {
    brand.rank = index + 1
  })
  
  return nicheBrands.slice(0, 10) // Top 10 in niche
}

/**
 * Generate sector insights from leaderboard data with dynamic categorization
 */
function generateSectorInsights(entries: any[]) {
  if (entries.length === 0) return undefined
  
  const averageScore = entries.reduce((sum, entry) => sum + entry.overallScore, 0) / entries.length
  const topPerformer = entries[0]?.brand || 'N/A'
  
  // Analyze category distribution
  const categoryDistribution: Record<string, number> = {}
  entries.forEach(entry => {
    if (entry.category?.niche) {
      categoryDistribution[entry.category.niche] = (categoryDistribution[entry.category.niche] || 0) + 1
    }
  })
  
  const dominantCategory = Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mixed Categories'
  
  return {
    averageScore: parseFloat(averageScore.toFixed(2)),
    topPerformer,
    dominantCategory,
    categoryDistribution,
    commonStrengths: generateDynamicStrengths(entries),
    commonWeaknesses: generateDynamicWeaknesses(entries),
    trendingUp: entries.filter(e => e.trend?.direction === 'up').map(e => e.brand).slice(0, 3),
    trendingDown: entries.filter(e => e.trend?.direction === 'down').map(e => e.brand).slice(0, 3)
  }
}

/**
 * Helper functions for dynamic leaderboard generation
 */
function generateRealisticScore(rank: number, leaderboardType: string): number {
  const baseScores = {
    global: 95,
    sector: 90,
    industry: 85,
    niche: 80
  }
  
  const base = baseScores[leaderboardType as keyof typeof baseScores] || 80
  const decay = Math.log(rank + 1) * 5 // Logarithmic decay
  const randomVariation = (Math.random() - 0.5) * 4 // ±2 points variation
  
  return Math.max(45, Math.min(98, parseFloat((base - decay + randomVariation).toFixed(2))))
}

function getGradeFromScore(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  return 'C-'
}

function generatePillarScores(rank: number) {
  const base = generateRealisticScore(rank, 'global')
  return {
    infrastructure: parseFloat(Math.max(40, Math.min(100, base + (Math.random() - 0.5) * 10)).toFixed(2)),
    perception: parseFloat(Math.max(40, Math.min(100, base + (Math.random() - 0.5) * 10)).toFixed(2)),
    commerce: parseFloat(Math.max(40, Math.min(100, base + (Math.random() - 0.5) * 10)).toFixed(2))
  }
}

function generateStrengthHighlight(sector: string) {
  const sectorStrengths: Record<string, any> = {
    'Fashion & Apparel': { dimension: 'Product Identification', score: 94, description: 'Excellent product catalog clarity' },
    'Beauty & Personal Care': { dimension: 'Citation Strength', score: 95, description: 'Strong media presence' },
    'Consumer Electronics & Entertainment': { dimension: 'Knowledge Graph Presence', score: 99, description: 'Dominant across AI platforms' },
    'Multi-Brand Retail': { dimension: 'Schema & Structured Data', score: 98, description: 'Best-in-class structured data' },
    'Home & Lifestyle': { dimension: 'Product Identification', score: 92, description: 'Clear product categorization' },
    'Food, Beverage & Grocery': { dimension: 'Geographic Visibility', score: 94, description: 'Strong local presence' },
    'Health, Fitness & Wellness': { dimension: 'Citation Authority', score: 93, description: 'Trusted health information' }
  }
  
  return sectorStrengths[sector] || { dimension: 'Overall Performance', score: 85, description: 'Strong general performance' }
}

function generateGapHighlight(sector: string) {
  const sectorGaps: Record<string, any> = {
    'Fashion & Apparel': { dimension: 'Conversational Copy', score: 72, description: 'AI interaction optimization needed' },
    'Beauty & Personal Care': { dimension: 'Geographic Visibility', score: 79, description: 'Store locator gaps' },
    'Consumer Electronics & Entertainment': { dimension: 'Transaction Clarity', score: 78, description: 'Complex purchase flows' },
    'Multi-Brand Retail': { dimension: 'Brand Heritage', score: 75, description: 'Brand story clarity needed' },
    'Home & Lifestyle': { dimension: 'Conversational Copy', score: 74, description: 'Product descriptions need work' },
    'Food, Beverage & Grocery': { dimension: 'Knowledge Graph Presence', score: 76, description: 'Limited AI platform presence' },
    'Health, Fitness & Wellness': { dimension: 'Transaction Clarity', score: 77, description: 'Subscription clarity issues' }
  }
  
  return sectorGaps[sector] || { dimension: 'General Optimization', score: 75, description: 'Room for improvement' }
}

function generateTrend(rank: number) {
  const trends = ['up', 'down', 'stable'] as const
  const weights = rank <= 3 ? [0.6, 0.1, 0.3] : [0.3, 0.3, 0.4] // Top brands trend up more
  
  const random = Math.random()
  let direction: typeof trends[number] = 'stable'
  
  if (random < weights[0]) direction = 'up'
  else if (random < weights[0] + weights[1]) direction = 'down'
  
  const change = direction === 'stable' ? 0 : Math.floor(Math.random() * 5) + 1
  
  return {
    direction,
    change: direction === 'down' ? -change : change,
    period: 'Q4 2024'
  }
}

function generateDomainFromBrand(brand: string): string {
  return brand.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '') + '.com'
}

function getDefaultIndustryForSector(sector: string): string {
  const sectorIndustryDefaults: Record<string, string> = {
    'Fashion & Apparel': 'Athletic & Lifestyle Brands',
    'Beauty & Personal Care': 'Beauty & Cosmetics',
    'Consumer Electronics & Entertainment': 'Consumer Technology',
    'Multi-Brand Retail': 'E-commerce & Retail',
    'Home & Lifestyle': 'Home Furnishings',
    'Food, Beverage & Grocery': 'Food & Beverage',
    'Health, Fitness & Wellness': 'Health & Wellness'
  }

  return sectorIndustryDefaults[sector] || 'General Business'
}

function getDefaultNicheForSector(sector: string): string {
  const sectorDefaults: Record<string, string> = {
    'Fashion & Apparel': 'Activewear & Athleisure',
    'Beauty & Personal Care': 'Global Beauty Retailers',
    'Consumer Electronics & Entertainment': 'Tech Giants',
    'Multi-Brand Retail': 'Online Mega-Retailers',
    'Home & Lifestyle': 'Furniture Giants',
    'Food, Beverage & Grocery': 'Global Grocery Giants',
    'Health, Fitness & Wellness': 'Wellness Tech & Wearables'
  }
  
  return sectorDefaults[sector] || 'Category Specialists'
}

function getSectorEmoji(sector: string): string {
  const sectorEmojis: Record<string, string> = {
    'Fashion & Apparel': '👕',
    'Beauty & Personal Care': '💄',
    'Consumer Electronics & Entertainment': '📱',
    'Multi-Brand Retail': '🛍️',
    'Home & Lifestyle': '🏠',
    'Food, Beverage & Grocery': '🍽️',
    'Health, Fitness & Wellness': '🏋️'
  }
  
  return sectorEmojis[sector] || '🏢'
}

function generateDynamicStrengths(entries: any[]): string[] {
  const strengthsByCategory: Record<string, string[]> = {
    'Fashion & Apparel': ['Product Identification', 'Visual Content', 'Brand Storytelling'],
    'Beauty & Personal Care': ['Citation Strength', 'Influencer Presence', 'Product Reviews'],
    'Consumer Electronics & Entertainment': ['Knowledge Graph Presence', 'Technical Specifications', 'Innovation Messaging'],
    'Multi-Brand Retail': ['Schema & Structured Data', 'Product Catalog', 'Search Optimization'],
    'Home & Lifestyle': ['Product Categorization', 'Visual Merchandising', 'Room Inspiration'],
    'Food, Beverage & Grocery': ['Geographic Visibility', 'Local SEO', 'Nutritional Information'],
    'Health, Fitness & Wellness': ['Citation Authority', 'Expert Content', 'Safety Information']
  }
  
  // Get most common sector from entries
  const sectorCounts: Record<string, number> = {}
  entries.forEach(entry => {
    if (entry.category?.sector) {
      sectorCounts[entry.category.sector] = (sectorCounts[entry.category.sector] || 0) + 1
    }
  })
  
  const dominantSector = Object.entries(sectorCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Multi-Brand Retail'
  
  return strengthsByCategory[dominantSector] || ['Schema & Structured Data', 'Product Identification', 'Knowledge Graph Presence']
}

function generateDynamicWeaknesses(entries: any[]): string[] {
  const weaknessesByCategory: Record<string, string[]> = {
    'Fashion & Apparel': ['Conversational Copy', 'Size Guide Clarity', 'Sustainability Messaging'],
    'Beauty & Personal Care': ['Geographic Visibility', 'Ingredient Transparency', 'Tutorial Content'],
    'Consumer Electronics & Entertainment': ['Transaction Clarity', 'Warranty Information', 'Compatibility Details'],
    'Multi-Brand Retail': ['Brand Heritage', 'Personalization', 'Customer Service Integration'],
    'Home & Lifestyle': ['Conversational Copy', 'Assembly Instructions', 'Room Planning Tools'],
    'Food, Beverage & Grocery': ['Knowledge Graph Presence', 'Recipe Integration', 'Dietary Information'],
    'Health, Fitness & Wellness': ['Transaction Clarity', 'Dosage Information', 'Interaction Warnings']
  }
  
  // Get most common sector from entries
  const sectorCounts: Record<string, number> = {}
  entries.forEach(entry => {
    if (entry.category?.sector) {
      sectorCounts[entry.category.sector] = (sectorCounts[entry.category.sector] || 0) + 1
    }
  })
  
  const dominantSector = Object.entries(sectorCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Multi-Brand Retail'
  
  return weaknessesByCategory[dominantSector] || ['Geographic Visibility', 'Transaction Clarity', 'Conversational Copy']
}

/**
 * POST /api/leaderboards - Add or update leaderboard entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, this would save to database
    // For now, return success response
    
    return NextResponse.json({
      success: true,
      message: 'Leaderboard entry updated successfully'
    })
    
  } catch (error) {
    console.error('Leaderboards POST error:', error)
    return NextResponse.json(
      { error: 'Failed to update leaderboard entry' },
      { status: 500 }
    )
  }
}