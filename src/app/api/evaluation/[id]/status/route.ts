import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const evaluationId = params.id
    console.log(`[STATUS_DEBUG] Checking evaluation ${evaluationId}`)

    // Use the SAME connection type as writes (pooled) for consistency
    const { sql } = await import('@/lib/db')
    
    // Add cache-busting with explicit transaction
    const result = await sql`
      BEGIN;
      SELECT 
        id, 
        status, 
        overall_score, 
        grade, 
        created_at, 
        updated_at,
        brand_id
      FROM production.evaluations 
      WHERE id = ${evaluationId}
      ORDER BY updated_at DESC
      LIMIT 1;
      COMMIT;
    `

    if (!result || result.length === 0) {
      console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} not found`)
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    const evaluation = result[0]
    console.log(`[STATUS_DEBUG] POOLED CONNECTION - Evaluation ${evaluationId} found:`, {
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      updatedAt: evaluation.updated_at
    })

    // If still running, return status only
    if (evaluation.status !== 'completed') {
      return NextResponse.json({
        id: evaluation.id,
        status: evaluation.status,
        overallScore: evaluation.overall_score,
        grade: evaluation.grade,
        createdAt: evaluation.created_at,
        updatedAt: evaluation.updated_at
      })
    }

    // If completed, return full results
    console.log(`[STATUS_DEBUG] POOLED CONNECTION - Evaluation ${evaluationId} is completed, returning results`)
    
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      grade: evaluation.grade,
      createdAt: evaluation.created_at,
      updatedAt: evaluation.updated_at,
      // Add mock data for now
      url: 'https://schuh.co.uk',
      tier: 'free',
      isDemo: false,
      pillarScores: [
        { name: 'Infrastructure', score: Math.round(evaluation.overall_score * 0.4), color: 'blue', icon: '🏗️', description: 'Technical foundation' },
        { name: 'Perception', score: Math.round(evaluation.overall_score * 0.3), color: 'green', icon: '👁️', description: 'Brand awareness' },
        { name: 'Commerce', score: Math.round(evaluation.overall_score * 0.3), color: 'purple', icon: '🛒', description: 'Commercial signals' }
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
