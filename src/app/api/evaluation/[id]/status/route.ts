import { NextRequest, NextResponse } from 'next/server'
import { getEvaluation, getDimensionScoresByEvaluationId } from '@/lib/database'

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

    // If completed, get dimension scores and transform to frontend format
    const dimensionScores = await getDimensionScoresByEvaluationId(evaluationId)
    
    // Transform to frontend-expected format
    const evaluationData = {
      url: evaluation.brand?.websiteUrl || 'Unknown',
      tier: 'free', // Default tier
      isDemo: false,
      overallScore: evaluation.overallScore || 0,
      pillarScores: {
        infrastructure: 0, // Calculate from dimension scores
        perception: 0,
        commerce: 0
      },
      dimensionScores: dimensionScores.map(ds => ({
        name: ds.dimension,
        score: ds.normalizedScore || 0,
        description: `${ds.dimension} analysis`,
        pillar: 'infrastructure' as const // Default pillar
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
      results: evaluationData // Properly formatted for frontend
    })

  } catch (error) {
    console.error('Error fetching evaluation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation status' },
      { status: 500 }
    )
  }
}
