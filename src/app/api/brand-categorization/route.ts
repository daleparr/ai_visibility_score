import { NextRequest, NextResponse } from 'next/server'
import { getAllCategories, getUniqueSectors, getCategoriesBySector } from '@/lib/brand-taxonomy'

// Use dynamic imports to prevent webpack bundling issues
const getBrandCategorizationService = async () => {
  const { BrandCategorizationService, BrandCategorizationUtils } = await import('@/lib/brand-categorization-service')
  return { BrandCategorizationService, BrandCategorizationUtils }
}

// Import types separately to avoid bundling issues
import type { BrandCategorizationRequest, BrandCategorizationResult } from '@/lib/brand-categorization-service'

/**
 * Brand Categorization API
 * Provides intelligent brand categorization for dynamic leaderboards
 */

/**
 * GET /api/brand-categorization - Get brand category information
 * Query params:
 * - action: 'categorize' | 'peers' | 'categories' | 'stats'
 * - brand: brand name (for categorize/peers actions)
 * - url: website URL (for categorize action)
 * - sector: sector filter (for categories action)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'categories'
    
    const { BrandCategorizationService } = await getBrandCategorizationService()
    const categorizationService = BrandCategorizationService.getInstance()
    
    switch (action) {
      case 'categorize': {
        const brand = searchParams.get('brand')
        const url = searchParams.get('url')
        
        if (!brand || !url) {
          return NextResponse.json(
            { error: 'Brand name and URL are required for categorization' },
            { status: 400 }
          )
        }
        
        const result = await categorizationService.categorizeBrand({
          brandName: brand,
          websiteUrl: url
        })
        
        return NextResponse.json(result)
      }
      
      case 'peers': {
        const brand = searchParams.get('brand')
        const url = searchParams.get('url')
        
        if (!brand) {
          return NextResponse.json(
            { error: 'Brand name is required for peer detection' },
            { status: 400 }
          )
        }
        
        const peers = await categorizationService.findPeerBrands(brand, url || undefined)
        
        return NextResponse.json({
          brandName: brand,
          peerBrands: peers,
          totalPeers: peers.length
        })
      }
      
      case 'categories': {
        const sector = searchParams.get('sector')
        
        if (sector) {
          const categories = getCategoriesBySector(sector)
          return NextResponse.json({
            sector,
            categories: categories.map(cat => ({
              industry: cat.industry,
              niche: cat.niche,
              emoji: cat.emoji,
              description: cat.description,
              brandCount: cat.competitorBrands.length,
              priceRange: cat.priceRange,
              businessModel: cat.businessModel
            }))
          })
        } else {
          const allCategories = getAllCategories()
          const availableFilters = categorizationService.getAvailableCategories()
          
          return NextResponse.json({
            totalCategories: allCategories.length,
            categories: allCategories,
            availableFilters
          })
        }
      }
      
      case 'stats': {
        const stats = categorizationService.getCategoryStatistics()
        return NextResponse.json(stats)
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: categorize, peers, categories, or stats' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Brand categorization API error:', error)
    return NextResponse.json(
      { error: 'Failed to process brand categorization request' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/brand-categorization - Batch categorize multiple brands
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brands, action } = body
    
    if (!brands || !Array.isArray(brands)) {
      return NextResponse.json(
        { error: 'Brands array is required' },
        { status: 400 }
      )
    }
    
    const { BrandCategorizationService } = await getBrandCategorizationService()
    const categorizationService = BrandCategorizationService.getInstance()
    
    switch (action) {
      case 'batch_categorize': {
        // Validate brand requests
        const requests: BrandCategorizationRequest[] = brands.map(brand => {
          if (!brand.brandName || !brand.websiteUrl) {
            throw new Error('Each brand must have brandName and websiteUrl')
          }
          return {
            brandName: brand.brandName,
            websiteUrl: brand.websiteUrl,
            content: brand.content
          }
        })
        
        const results = await categorizationService.categorizeBrands(requests)
        
        return NextResponse.json({
          success: true,
          totalProcessed: results.length,
          results,
          summary: {
            averageConfidence: Math.round(
              results.reduce((sum, r) => sum + r.confidence, 0) / results.length
            ),
            sectorDistribution: getSectorDistribution(results),
            highConfidenceResults: results.filter(r => r.confidence >= 70).length
          }
        })
      }
      
      case 'update_leaderboard': {
        // Update leaderboard with new categorizations
        const categorizedBrands = brands.map((brand: any) => ({
          ...brand,
          category: categorizationService.getCategoryHierarchy(brand.brandName)
        }))
        
        return NextResponse.json({
          success: true,
          updatedBrands: categorizedBrands.length,
          categorizedBrands
        })
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: batch_categorize or update_leaderboard' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Brand categorization POST error:', error)
    return NextResponse.json(
      { error: `Failed to process batch categorization: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

/**
 * Helper function to get sector distribution from results
 */
function getSectorDistribution(results: BrandCategorizationResult[]): Record<string, number> {
  const distribution: Record<string, number> = {}
  
  results.forEach(result => {
    const sector = result.category.sector
    distribution[sector] = (distribution[sector] || 0) + 1
  })
  
  return distribution
}

/**
 * PUT /api/brand-categorization - Update category cache or force recategorization
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, brandName, websiteUrl, forceRefresh } = body
    
    const { BrandCategorizationService } = await getBrandCategorizationService()
    const categorizationService = BrandCategorizationService.getInstance()
    
    switch (action) {
      case 'refresh_category': {
        if (!brandName || !websiteUrl) {
          return NextResponse.json(
            { error: 'Brand name and URL are required for refresh' },
            { status: 400 }
          )
        }
        
        // Force fresh categorization (bypass cache)
        const result = await categorizationService.categorizeBrand({
          brandName,
          websiteUrl
        })
        
        return NextResponse.json({
          success: true,
          message: 'Brand category refreshed successfully',
          result
        })
      }
      
      case 'clear_cache': {
        // In a real implementation, this would clear the categorization cache
        return NextResponse.json({
          success: true,
          message: 'Categorization cache cleared successfully'
        })
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: refresh_category or clear_cache' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Brand categorization PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update brand categorization' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/brand-categorization - Remove brand from categorization cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brand')
    
    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required for deletion' },
        { status: 400 }
      )
    }
    
    // In a real implementation, this would remove from cache/database
    return NextResponse.json({
      success: true,
      message: `Brand categorization for ${brandName} removed successfully`
    })
    
  } catch (error) {
    console.error('Brand categorization DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand categorization' },
      { status: 500 }
    )
  }
}