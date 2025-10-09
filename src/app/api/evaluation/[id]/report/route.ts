import { NextRequest, NextResponse } from 'next/server'
import { withSchema, sql } from '@/lib/db'
import { BackendAgentTracker } from '@/lib/adi/backend-agent-tracker'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluationId = params.id
    if (!evaluationId) {
      return NextResponse.json(
        { error: 'Evaluation ID is required' },
        { status: 400 }
      )
    }

    // Get evaluation data
    const evaluation = await withSchema(async () => {
      const result = await sql`
        SELECT 
          e.*,
          b.name as brand_name,
          b.website_url,
          b.industry
        FROM production.evaluations e
        LEFT JOIN production.brands b ON e.brand_id = b.id
        WHERE e.id = ${evaluationId}
      `
      return result[0]
    })

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    // Get agent execution results
    const tracker = new BackendAgentTracker()
    const executions = await tracker.getEvaluationExecutions(evaluationId)

    // Get dimension scores
    const dimensionScores = await withSchema(async () => {
      const result = await sql`
        SELECT * FROM production.dimension_scores
        WHERE evaluation_id = ${evaluationId}
        ORDER BY created_at ASC
      `
      return result
    })

    // Get pillar scores
    const pillarScores = await withSchema(async () => {
      const result = await sql`
        SELECT * FROM production.pillar_scores
        WHERE evaluation_id = ${evaluationId}
        ORDER BY created_at ASC
      `
      return result
    })

    // Get brand category
    const brandCategory = await withSchema(async () => {
      const result = await sql`
        SELECT * FROM production.brand_categories
        WHERE brand_id = ${evaluation.brand_id}
        ORDER BY created_at DESC
        LIMIT 1
      `
      return result[0]
    })

    // Get performance profile
    const performanceProfile = await withSchema(async () => {
      const result = await sql`
        SELECT * FROM production.performance_profiles
        WHERE evaluation_id = ${evaluationId}
        ORDER BY created_at DESC
        LIMIT 1
      `
      return result[0]
    })

    // Get agent results and aggregate them
    const agentResults = executions
      .filter(e => e.status === 'completed' && e.result)
      .map(e => ({
        agentName: e.agentName,
        results: e.result.results || [],
        metadata: e.result.metadata || {}
      }))

    // Use the score from the evaluation record
    let finalScore = evaluation.overall_score || 0

    // Build comprehensive report
    const report = {
      id: evaluationId,
      url: evaluation.website_url,
      brandName: evaluation.brand_name,
      tier: evaluation.tier,
      status: evaluation.status,
      overallScore: finalScore,
      pillarScores: pillarScores.reduce((acc: Record<string, number>, p: any) => ({
        ...acc,
        [p.pillar]: p.score
      }), {} as Record<string, number>),
      dimensionScores: dimensionScores.map((d: any) => ({
        name: d.name,
        score: d.score,
        description: d.description,
        pillar: d.pillar
      })),
      brandCategory,
      performanceProfile,
      agentResults,
      executiveSummary: evaluation.executive_summary || {
        verdict: 'Analysis completed successfully.',
        strongest: evaluation.strongest_dimension,
        weakest: evaluation.weakest_dimension,
        opportunity: evaluation.biggest_opportunity
      },
      metadata: {
        createdAt: evaluation.created_at,
        updatedAt: evaluation.updated_at,
        completedAt: evaluation.completed_at,
        evaluationTime: evaluation.evaluation_time
      }
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating evaluation report:', error)
    return NextResponse.json(
      { error: 'Failed to generate evaluation report' },
      { status: 500 }
    )
  }
}
