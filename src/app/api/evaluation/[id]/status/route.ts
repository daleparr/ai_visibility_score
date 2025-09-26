import { NextRequest, NextResponse } from 'next/server'
import { getEvaluation, getDimensionScoresByEvaluationId, getBrand } from '@/lib/database'
import { db } from '@/lib/db'
import { evaluations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const evaluationId = params.id
    console.log(`[STATUS_DEBUG] Checking evaluation ${evaluationId}`)

    // Add cache busting with a dummy query first
    await db.execute(sql`SELECT 1 as cache_bust`)
    
    // Then fetch the actual evaluation
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

    // If completed, return full results
    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} is completed, returning results`)
    
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      // Add mock data for now
      url: 'https://nike.com',
      tier: 'free',
      isDemo: false,
      pillarScores: [
        { name: 'Infrastructure', score: 45, color: 'blue', icon: '🏗️', description: 'Technical foundation' },
        { name: 'Perception', score: 25, color: 'green', icon: '👁️', description: 'Brand awareness' },
        { name: 'Commerce', score: 30, color: 'purple', icon: '🛒', description: 'Commercial signals' }
      ],
      dimensionScores: [],
      aiProviders: ['openai'],
      defaultModel: 'gpt-3.5-turbo',
      recommendations: [],
      analysisMethod: 'ADI Framework'
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
