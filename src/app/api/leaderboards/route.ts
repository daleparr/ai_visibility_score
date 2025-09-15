import { NextRequest, NextResponse } from 'next/server'
import { 
  LeaderboardData, 
  LeaderboardFilters, 
  SAMPLE_LEADERBOARDS, 
  LEADERBOARD_CATEGORIES,
  SectorHeatmap 
} from '@/types/leaderboards'

/**
 * AI Discoverability Leaderboards API
 * GET /api/leaderboards - Fetch leaderboard data with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: LeaderboardFilters = {
      leaderboardType: (searchParams.get('type') as any) || 'global',
      category: searchParams.get('category') || undefined,
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
  
  // Determine which leaderboard to return
  let entries = []
  let title = ''
  let description = ''
  
  switch (leaderboardType) {
    case 'global':
      entries = generateGlobalLeaderboard()
      title = 'Global AI Discoverability Leaderboard'
      description = 'Top brands across all sectors ranked by AI visibility'
      break
      
    case 'sector':
      entries = generateSectorLeaderboard(category || 'Retail')
      title = `${category || 'Retail'} Sector Leaderboard`
      description = `Top brands in ${category || 'Retail'} ranked by AI discoverability`
      break
      
    case 'industry':
      entries = generateIndustryLeaderboard(category || 'Fashion Retail')
      title = `${category || 'Fashion Retail'} Industry Leaderboard`
      description = `Leading brands in ${category || 'Fashion Retail'} by AI visibility`
      break
      
    case 'niche':
      entries = SAMPLE_LEADERBOARDS[category || 'Streetwear'] || []
      title = `${category || 'Streetwear'} Niche Leaderboard`
      description = `Top ${category || 'Streetwear'} brands by AI discoverability`
      break
      
    default:
      entries = generateGlobalLeaderboard()
      title = 'Global AI Discoverability Leaderboard'
      description = 'Top brands across all sectors'
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
 * Generate global leaderboard with top brands across all sectors
 */
function generateGlobalLeaderboard() {
  return [
    {
      rank: 1,
      brand: 'Apple',
      domain: 'apple.com',
      overallScore: 96,
      grade: 'A+',
      pillarScores: { infrastructure: 98, perception: 95, commerce: 94 },
      dimensionScores: [],
      strengthHighlight: {
        dimension: 'Knowledge Graph Presence',
        score: 99,
        description: 'Dominant across all AI platforms'
      },
      gapHighlight: {
        dimension: 'Geographic Visibility',
        score: 88,
        description: 'Store locator optimization needed'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'stable' as const, change: 1, period: 'Q4 2024' }
    },
    {
      rank: 2,
      brand: 'Nike',
      domain: 'nike.com',
      overallScore: 92,
      grade: 'A',
      pillarScores: { infrastructure: 94, perception: 91, commerce: 89 },
      dimensionScores: [],
      strengthHighlight: {
        dimension: 'Product Identification',
        score: 96,
        description: 'Excellent product catalog clarity'
      },
      gapHighlight: {
        dimension: 'Transaction Clarity',
        score: 82,
        description: 'Checkout process complexity'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'up' as const, change: 3, period: 'Q4 2024' }
    },
    {
      rank: 3,
      brand: 'Amazon',
      domain: 'amazon.com',
      overallScore: 91,
      grade: 'A',
      pillarScores: { infrastructure: 95, perception: 87, commerce: 92 },
      dimensionScores: [],
      strengthHighlight: {
        dimension: 'Schema & Structured Data',
        score: 98,
        description: 'Best-in-class structured data'
      },
      gapHighlight: {
        dimension: 'Brand Heritage',
        score: 75,
        description: 'Brand story clarity needed'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'up' as const, change: 2, period: 'Q4 2024' }
    }
  ]
}

/**
 * Generate sector-specific leaderboard
 */
function generateSectorLeaderboard(sector: string) {
  const sectorData: Record<string, any[]> = {
    'Retail': [
      {
        rank: 1,
        brand: 'Target',
        domain: 'target.com',
        overallScore: 88,
        grade: 'A-',
        pillarScores: { infrastructure: 90, perception: 85, commerce: 89 },
        dimensionScores: [],
        strengthHighlight: { dimension: 'Product Identification', score: 94, description: 'Clear product catalog' },
        gapHighlight: { dimension: 'Brand Heritage', score: 76, description: 'Brand story needs work' },
        lastUpdated: '2025-01-15',
        trend: { direction: 'up' as const, change: 4, period: 'Q4 2024' }
      }
    ],
    'Beauty': [
      {
        rank: 1,
        brand: 'Sephora',
        domain: 'sephora.com',
        overallScore: 89,
        grade: 'A-',
        pillarScores: { infrastructure: 87, perception: 92, commerce: 88 },
        dimensionScores: [],
        strengthHighlight: { dimension: 'Citation Strength', score: 95, description: 'Strong media presence' },
        gapHighlight: { dimension: 'Geographic Visibility', score: 79, description: 'Store locator gaps' },
        lastUpdated: '2025-01-15',
        trend: { direction: 'stable' as const, change: 1, period: 'Q4 2024' }
      }
    ]
  }
  
  return sectorData[sector] || generateGlobalLeaderboard().slice(0, 10)
}

/**
 * Generate industry-specific leaderboard
 */
function generateIndustryLeaderboard(industry: string) {
  return SAMPLE_LEADERBOARDS['Fashion Retail'] || generateGlobalLeaderboard().slice(0, 5)
}

/**
 * Generate sector insights from leaderboard data
 */
function generateSectorInsights(entries: any[]) {
  if (entries.length === 0) return undefined
  
  const averageScore = entries.reduce((sum, entry) => sum + entry.overallScore, 0) / entries.length
  const topPerformer = entries[0]?.brand || 'N/A'
  
  return {
    averageScore: Math.round(averageScore),
    topPerformer,
    commonStrengths: ['Schema & Structured Data', 'Product Identification', 'Knowledge Graph Presence'],
    commonWeaknesses: ['Geographic Visibility', 'Transaction Clarity', 'Conversational Copy'],
    trendingUp: entries.filter(e => e.trend?.direction === 'up').map(e => e.brand).slice(0, 3),
    trendingDown: entries.filter(e => e.trend?.direction === 'down').map(e => e.brand).slice(0, 3)
  }
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