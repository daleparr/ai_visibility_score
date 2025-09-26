import { NextResponse } from 'next/server'

// ✅ Disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const evaluationId = params.id
    console.log(`[STATUS_DEBUG] Checking evaluation ${evaluationId}`)

    // ✅ Use SAME centralized connection as writes
    const { sql } = await import('@/lib/db')
    
    // ✅ Single statement, schema-qualified, ordered by updated_at
    const result = await sql`
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
      LIMIT 1
    `

    if (!result || result.length === 0) {
      console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} not found`)
      return NextResponse.json(
        { error: 'Evaluation not found' }, 
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-store' }
        }
      )
    }

    const evaluation = result[0]
    
    // ✅ Enhanced logging to track the exact data
    console.log(`[STATUS_QUERY] Raw DB row for ${evaluationId}:`, {
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      updatedAt: evaluation.updated_at,
      timestamp: new Date().toISOString()
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
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
      })
    }

    // ✅ If completed, return data in the structure frontend expects
    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} completed, building results structure`)
    
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      grade: evaluation.grade,
      createdAt: evaluation.created_at,
      updatedAt: evaluation.updated_at,
      // ✅ Frontend expects results nested here
      results: {
        url: 'https://nike.com', // TODO: Get from brand table
        tier: 'free',
        isDemo: false,
        overallScore: evaluation.overall_score || 0,
        pillarScores: {
          infrastructure: Math.round((evaluation.overall_score || 0) * 0.4),
          perception: Math.round((evaluation.overall_score || 0) * 0.3),
          commerce: Math.round((evaluation.overall_score || 0) * 0.3)
        },
        dimensionScores: [],
        aiProviders: ['openai'],
        defaultModel: 'gpt-3.5-turbo',
        recommendations: [],
        analysisMethod: 'ADI Framework'
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
    })

  } catch (error) {
    console.error(`[STATUS_DEBUG] Error fetching evaluation status for ${params.id}:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch evaluation status', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-store' }
      }
    )
  }
}
