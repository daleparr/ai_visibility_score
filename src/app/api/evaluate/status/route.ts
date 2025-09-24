export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getBrand, getLatestEvaluationForBrand, getDimensionScoresByEvaluationId, getRecommendationsByEvaluationId } from '@/lib/database'
import { calculateOverallScore, calculatePillarScores, getGradeFromScore } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandId = searchParams.get('brandId')

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Get the latest evaluation for this brand
    const evaluation = await getLatestEvaluationForBrand(brandId)
    
    if (!evaluation) {
      return NextResponse.json({ 
        status: 'not_found',
        message: 'No evaluation found for this brand'
      }, { status: 404 })
    }

    // Get dimension scores to check completion
    const dimensionScores = await getDimensionScoresByEvaluationId(evaluation.id)
    
    // Get recommendations if available
    let recommendations = []
    try {
      recommendations = await getRecommendationsByEvaluationId(evaluation.id)
    } catch (error) {
      console.warn('[STATUS] Failed to fetch recommendations:', error)
    }

    // Check if evaluation is complete based on dimension scores
    const hasInfrastructure = dimensionScores.some(d => ['schema_structured_data', 'semantic_clarity', 'knowledge_graphs', 'policies_logistics'].includes(d.dimensionName))
    const hasPerception = dimensionScores.some(d => ['geo_visibility', 'citation_strength', 'answer_quality', 'sentiment_trust'].includes(d.dimensionName))
    const hasCommerce = dimensionScores.some(d => ['hero_products', 'shipping_freight'].includes(d.dimensionName))

    let status = 'running'
    let progress = 0
    
    if (hasInfrastructure && hasPerception && hasCommerce) {
      status = 'completed'
      progress = 100
    } else if (hasInfrastructure && hasPerception) {
      status = 'running'
      progress = 80
    } else if (hasInfrastructure) {
      status = 'running'
      progress = 40
    } else if (dimensionScores.length > 0) {
      status = 'running'
      progress = 20
    }

    // If completed, calculate final scores and return full results
    if (status === 'completed') {
      const brand = await getBrand(brandId)
      const overallScore = calculateOverallScore(dimensionScores as any, null)
      const pillarScores = calculatePillarScores(dimensionScores as any)
      const grade = getGradeFromScore(overallScore)

      // Build dimension scores array for frontend
      const dimensionScoresFormatted = dimensionScores.map(d => ({
        name: d.dimensionName,
        score: d.score,
        description: d.explanation || `${d.dimensionName.replace(/_/g, ' ')} evaluation completed`,
        pillar: getPillarForDimension(d.dimensionName)
      }))

      // Build recommendations array
      const recommendationsFormatted = recommendations.map((r: any) => ({
        title: r.title,
        description: r.description,
        priority: r.priority,
        score: overallScore
      }))

      return NextResponse.json({
        status: 'completed',
        progress: 100,
        url: brand?.websiteUrl || '',
        tier: 'free',
        isDemo: false,
        overallScore,
        grade,
        pillarScores,
        dimensionScores: dimensionScoresFormatted,
        recommendations: recommendationsFormatted,
        aiProviders: ['openai'],
        defaultModel: 'gpt-4',
        analysisMethod: 'Optimized Three-Pillar Evaluation'
      })
    }

    // Return progress status
    return NextResponse.json({
      status,
      progress,
      message: getProgressMessage(progress),
      dimensionCount: dimensionScores.length,
      estimatedTimeRemaining: getEstimatedTimeRemaining(progress)
    })

  } catch (error: any) {
    console.error('❌ [STATUS_API_ERROR]:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to check evaluation status',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

function getPillarForDimension(dimensionName: string): 'infrastructure' | 'perception' | 'commerce' {
  const infrastructureDimensions = ['schema_structured_data', 'semantic_clarity', 'knowledge_graphs', 'policies_logistics', 'llm_readability', 'conversational_copy']
  const perceptionDimensions = ['geo_visibility', 'citation_strength', 'answer_quality', 'sentiment_trust']
  const commerceDimensions = ['hero_products', 'shipping_freight']
  
  if (infrastructureDimensions.includes(dimensionName)) return 'infrastructure'
  if (perceptionDimensions.includes(dimensionName)) return 'perception'
  if (commerceDimensions.includes(dimensionName)) return 'commerce'
  return 'infrastructure' // default
}

function getProgressMessage(progress: number): string {
  if (progress >= 80) return 'Finalizing commerce analysis...'
  if (progress >= 40) return 'Analyzing perception and reputation...'
  if (progress >= 20) return 'Processing infrastructure evaluation...'
  return 'Starting comprehensive brand analysis...'
}

function getEstimatedTimeRemaining(progress: number): string {
  if (progress >= 80) return '10-20 seconds'
  if (progress >= 40) return '30-40 seconds' 
  if (progress >= 20) return '50-60 seconds'
  return '60-90 seconds'
}