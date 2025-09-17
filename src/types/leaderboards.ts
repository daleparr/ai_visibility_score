/**
 * AI Discoverability Leaderboards - Types and Interfaces
 * Provides competitive intelligence and benchmarking across sectors and niches
 */

export interface LeaderboardEntry {
  rank: number
  brand: string
  domain: string
  overallScore: number
  grade: string
  pillarScores: {
    infrastructure: number
    perception: number
    commerce: number
  }
  dimensionScores: Array<{
    name: string
    score: number
    pillar: string
  }>
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
  lastUpdated: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    change: number
    period: string
  }
}

export interface LeaderboardData {
  leaderboardType: 'global' | 'sector' | 'industry' | 'niche'
  category: string
  title: string
  description: string
  totalBrands: number
  lastUpdated: string
  entries: LeaderboardEntry[]
  sectorInsights?: {
    averageScore: number
    topPerformer: string
    commonStrengths: string[]
    commonWeaknesses: string[]
    trendingUp: string[]
    trendingDown: string[]
  }
}

export interface LeaderboardFilters {
  leaderboardType?: 'global' | 'sector' | 'industry' | 'niche'
  category?: string
  minScore?: number
  maxScore?: number
  region?: string
  sortBy?: 'rank' | 'score' | 'trend' | 'infrastructure' | 'perception' | 'commerce'
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

export interface SectorHeatmap {
  sector: string
  dimensions: Array<{
    name: string
    averageScore: number
    topBrand: string
    topScore: number
    performance: 'strong' | 'average' | 'weak'
  }>
  insights: string[]
}

export interface TrendChart {
  brand: string
  data: Array<{
    period: string
    overallScore: number
    pillarScores: {
      infrastructure: number
      perception: number
      commerce: number
    }
  }>
  trend: {
    direction: 'up' | 'down' | 'stable'
    change: number
    timeframe: string
  }
}

// Predefined categories for leaderboards
export const LEADERBOARD_CATEGORIES = {
  global: ['All Brands'],
  sector: ['Retail', 'Beauty', 'Electronics', 'Travel', 'CPG', 'Healthcare', 'Financial Services', 'Automotive'],
  industry: [
    'Fashion Retail', 'Grocery', 'Luxury', 'Fitness', 'Home & Garden', 
    'Tech Hardware', 'Software', 'Hospitality', 'Food & Beverage'
  ],
  niche: [
    'Streetwear', 'DTC Activewear', 'Skincare', 'Footwear', 'Sustainable Fashion',
    'Premium Beauty', 'Smart Home', 'Gaming', 'Pet Care', 'Outdoor Gear'
  ]
} as const

export type LeaderboardCategory = 
  | typeof LEADERBOARD_CATEGORIES.global[number]
  | typeof LEADERBOARD_CATEGORIES.sector[number] 
  | typeof LEADERBOARD_CATEGORIES.industry[number]
  | typeof LEADERBOARD_CATEGORIES.niche[number]

// Sample leaderboard data for different categories
export const SAMPLE_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  'Streetwear': [
    {
      rank: 1,
      brand: 'Supreme',
      domain: 'supremenewyork.com',
      overallScore: 84,
      grade: 'A',
      pillarScores: { infrastructure: 78, perception: 89, commerce: 77 },
      dimensionScores: [
        { name: 'Citation Strength', score: 92, pillar: 'perception' },
        { name: 'Brand Heritage', score: 95, pillar: 'perception' },
        { name: 'Transaction Clarity', score: 65, pillar: 'commerce' }
      ],
      strengthHighlight: {
        dimension: 'Brand Heritage',
        score: 95,
        description: 'Strong citations & heritage recognition'
      },
      gapHighlight: {
        dimension: 'Transaction Clarity',
        score: 65,
        description: 'Weak shipping transparency'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'up', change: 3, period: 'Q4 2024' }
    },
    {
      rank: 2,
      brand: 'Palace',
      domain: 'palaceskateboards.com',
      overallScore: 78,
      grade: 'B',
      pillarScores: { infrastructure: 74, perception: 80, commerce: 72 },
      dimensionScores: [
        { name: 'LLM Readability', score: 85, pillar: 'infrastructure' },
        { name: 'Product Identification', score: 68, pillar: 'commerce' }
      ],
      strengthHighlight: {
        dimension: 'LLM Readability',
        score: 85,
        description: 'Conversational copy strong'
      },
      gapHighlight: {
        dimension: 'Product Identification',
        score: 68,
        description: 'Hero products under-indexed'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'stable', change: 0, period: 'Q4 2024' }
    },
    {
      rank: 3,
      brand: 'Club 1984',
      domain: 'club1984.store',
      overallScore: 74,
      grade: 'B-',
      pillarScores: { infrastructure: 81, perception: 70, commerce: 68 },
      dimensionScores: [
        { name: 'Schema & Structured Data', score: 87, pillar: 'infrastructure' },
        { name: 'Semantic Clarity', score: 62, pillar: 'perception' }
      ],
      strengthHighlight: {
        dimension: 'Schema & Structured Data',
        score: 87,
        description: 'Schema & taxonomy clean'
      },
      gapHighlight: {
        dimension: 'Semantic Clarity',
        score: 62,
        description: 'Sentiment consistency issues'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'up', change: 8, period: 'Q4 2024' }
    }
  ],
  'Fashion Retail': [
    {
      rank: 1,
      brand: 'Nike',
      domain: 'nike.com',
      overallScore: 92,
      grade: 'A',
      pillarScores: { infrastructure: 94, perception: 91, commerce: 89 },
      dimensionScores: [
        { name: 'Knowledge Graph Presence', score: 98, pillar: 'infrastructure' },
        { name: 'Product Identification', score: 96, pillar: 'commerce' }
      ],
      strengthHighlight: {
        dimension: 'Knowledge Graph Presence',
        score: 98,
        description: 'Dominant search presence'
      },
      gapHighlight: {
        dimension: 'Geographic Visibility',
        score: 85,
        description: 'Regional store coverage gaps'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'up', change: 2, period: 'Q4 2024' }
    },
    {
      rank: 2,
      brand: 'Adidas',
      domain: 'adidas.com',
      overallScore: 89,
      grade: 'A-',
      pillarScores: { infrastructure: 88, perception: 92, commerce: 86 },
      dimensionScores: [
        { name: 'Citation Strength', score: 94, pillar: 'perception' },
        { name: 'Brand Heritage', score: 93, pillar: 'perception' }
      ],
      strengthHighlight: {
        dimension: 'Citation Strength',
        score: 94,
        description: 'Strong media presence'
      },
      gapHighlight: {
        dimension: 'Transaction Clarity',
        score: 78,
        description: 'Complex checkout process'
      },
      lastUpdated: '2025-01-15',
      trend: { direction: 'stable', change: 1, period: 'Q4 2024' }
    }
  ]
}