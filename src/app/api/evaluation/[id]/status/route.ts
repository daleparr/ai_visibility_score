import { NextRequest, NextResponse } from 'next/server'
import { getEvaluation } from '@/lib/database'

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

    // Return evaluation status and results
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      // Include full results if completed
      ...(evaluation.status === 'completed' && {
        results: evaluation // Include full evaluation data
      })
    })

  } catch (error) {
    console.error('Error fetching evaluation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation status' },
      { status: 500 }
    )
  }
}
