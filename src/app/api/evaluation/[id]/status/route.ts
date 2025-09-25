import { NextRequest, NextResponse } from 'next/server'
import { getEvaluation, getDimensionScoresByEvaluationId, getBrand } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluationId = params.id

    if (!evaluationId) {
      return NextResponse.json({ error: 'Evaluation ID is required' }, { status: 400 })
    }

    // Get evaluation from database
    const evaluation = await getEvaluation(evaluationId)

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    // If still running, return status only
    if (evaluation.status !== 'completed') {
      return NextResponse.json({
        id: evaluation.id,
        status: evaluation.status,
        overallScore: evaluation.overallScore,
        grade: evaluation.grade,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt
      })
    }

    // If completed, get brand and dimension scores
    const brand = await getBrand(evaluation.brandId)
    const dimensionScores = await getDimensionScoresByEvaluationId(evaluationId)
    
    // Transform to frontend-expected format
    const evaluationData = {
      url: brand?.websiteUrl || 'Unknown',
      tier: 'free',
      isDemo: false,
      overallScore: evaluation.overallScore || 0,
      pillarScores: {
        infrastructure: Math.round((dimensionScores.filter(ds => 
          ['crawl_agent', 'schema_agent', 'semantic_agent'].includes(ds.dimensionName)
        ).reduce((sum, ds) => sum + (ds.score || 0), 0) / 3) || 0),
        perception: Math.round((dimensionScores.filter(ds => 
          ['citation_agent', 'sentiment_agent', 'brand_heritage_agent'].includes(ds.dimensionName)
        ).reduce((sum, ds) => sum + (ds.score || 0), 0) / 3) || 0),
        commerce: Math.round((dimensionScores.filter(ds => 
          ['commerce_agent', 'geo_visibility_agent'].includes(ds.dimensionName)
        ).reduce((sum, ds) => sum + (ds.score || 0), 0) / 2) || 0)
      },
      dimensionScores: dimensionScores.map(ds => ({
        name: ds.dimensionName.replace('_agent', '').replace('_', ' '),
        score: ds.score || 0,
        description: `${ds.dimensionName.replace('_agent', '').replace('_', ' ')} analysis`,
        pillar: ds.dimensionName.includes('crawl') || ds.dimensionName.includes('schema') || ds.dimensionName.includes('semantic') 
          ? 'infrastructure' as const
          : ds.dimensionName.includes('commerce') || ds.dimensionName.includes('geo')
          ? 'commerce' as const
          : 'perception' as const
      })),
      aiProviders: ['GPT-4'],
      defaultModel: 'GPT-4',
      recommendations: [],
      analysisMethod: 'ADI Framework'
    }

    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      results: evaluationData
    })

  } catch (error) {
    console.error('Error fetching evaluation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation status' },
      { status: 500 }
    )
  }
}
