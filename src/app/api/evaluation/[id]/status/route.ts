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

    console.log(`[STATUS_DEBUG] Checking evaluation ${evaluationId}`)

    // Get evaluation from database
    const evaluation = await getEvaluation(evaluationId)

    if (!evaluation) {
      console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} not found`)
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} found:`, {
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      updatedAt: evaluation.updatedAt
    })

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

    // If completed, return minimal results for now to test
    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} is completed, returning results`)
    
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      results: {
        url: 'test-url',
        tier: 'free',
        isDemo: false,
        overallScore: evaluation.overallScore || 0,
        pillarScores: {
          infrastructure: 25,
          perception: 30,
          commerce: 20
        },
        dimensionScores: [
          {
            name: 'Crawl',
            score: 25,
            description: 'Website crawlability',
            pillar: 'infrastructure'
          }
        ],
        aiProviders: ['GPT-4'],
        defaultModel: 'GPT-4',
        recommendations: [
          {
            priority: 'high',
            title: 'Improve Website Crawlability',
            score: evaluation.overallScore || 0,
            description: 'Enhance your website structure for better AI discoverability'
          }
        ],
        analysisMethod: 'ADI Framework'
      }
    })

  } catch (error) {
    console.error(`[STATUS_DEBUG] Error fetching evaluation status for ${params.id}:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch evaluation status', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
