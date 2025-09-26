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
    
    // ✅ Single statement, schema-qualified
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
    console.log(`[STATUS_DEBUG] CENTRALIZED CONNECTION - Evaluation ${evaluationId} found:`, {
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      updatedAt: evaluation.updated_at
    })

    // Return the evaluation data with no-cache headers
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
