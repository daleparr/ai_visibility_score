import { NextRequest, NextResponse } from 'next/server'
import { withSchema, sql } from '@/lib/db'
import { BackendAgentTracker } from '@/lib/adi/backend-agent-tracker'
import { ADI_DIMENSION_PILLARS } from '@/types/adi'

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
      console.log(`📊 [Report] Found ${result.length} dimension scores in database`)
      if (result.length > 0) {
        console.log(`📊 [Report] Sample dimension score:`, {
          dimension_name: result[0].dimension_name,
          score: result[0].score,
          hasExplanation: !!result[0].explanation
        })
      }
      return result
    })

    // Get pillar scores (handle missing table gracefully)
    let pillarScores: any[] = []
    try {
      pillarScores = await withSchema(async () => {
        const result = await sql`
          SELECT * FROM production.pillar_scores
          WHERE evaluation_id = ${evaluationId}
          ORDER BY created_at ASC
        `
        return result
      })
    } catch (pillarError: any) {
      console.warn(`⚠️ [Report] pillar_scores table query failed, will derive from dimensions:`, pillarError.message)
      // This is okay - we'll derive pillar scores from dimension scores
    }

    // Get brand category (optional - handle missing table gracefully)
    let brandCategory = null
    try {
      brandCategory = await withSchema(async () => {
        const result = await sql`
          SELECT * FROM production.brand_categories
          WHERE brand_id = ${evaluation.brand_id}
          ORDER BY created_at DESC
          LIMIT 1
        `
        return result[0]
      })
    } catch (categoryError: any) {
      console.warn(`⚠️ [Report] brand_categories table query failed:`, categoryError.message)
      // This is okay - brand category is optional metadata
    }

    // Get performance profile (optional - handle missing table gracefully)
    let performanceProfile = null
    try {
      performanceProfile = await withSchema(async () => {
        const result = await sql`
          SELECT * FROM production.performance_profiles
          WHERE evaluation_id = ${evaluationId}
          ORDER BY created_at DESC
          LIMIT 1
        `
        return result[0]
      })
    } catch (profileError: any) {
      console.warn(`⚠️ [Report] performance_profiles table query failed:`, profileError.message)
      // This is okay - performance profile is optional metadata
    }

    // Get agent results and aggregate them
    const agentResults = executions
      .filter(e => e.status === 'completed' && e.result)
      .map(e => ({
        agentName: e.agentName,
        results: e.result.results || [],
        metadata: {
          ...(e.result.metadata || {}),
          executionTime: e.executionTime || e.result.executionTime || 0
        }
      }))

    // Use the score from the evaluation record
    let finalScore = evaluation.overall_score || 0

    // Process dimension scores with proper mapping
    const processedDimensionScores = dimensionScores.map((d: any) => {
      const dimensionName = d.dimension_name || d.dimensionName || d.name
      const pillar = dimensionName ? ADI_DIMENSION_PILLARS[dimensionName as keyof typeof ADI_DIMENSION_PILLARS] || 'infrastructure' : 'infrastructure'
      
      return {
        name: dimensionName,
        score: d.score || 0,
        description: d.explanation || d.description || '',
        pillar: pillar
      }
    })

    // Calculate or retrieve pillar scores
    const calculatedPillarScores = pillarScores.length > 0 
      ? pillarScores.reduce((acc: Record<string, number>, p: any) => ({
          ...acc,
          [p.pillar]: p.score
        }), {} as Record<string, number>)
      : (() => {
          // Derive pillar scores from dimension scores if pillar_scores table doesn't exist
          console.log(`📊 [Report] Deriving pillar scores from ${processedDimensionScores.length} dimension scores`)
          const derivedPillars: Record<string, number[]> = {
            infrastructure: [],
            perception: [],
            commerce: []
          }
          
          processedDimensionScores.forEach((d: any) => {
            if (d.pillar && derivedPillars[d.pillar]) {
              derivedPillars[d.pillar].push(d.score || 0)
            }
          })
          
          const result = {
            infrastructure: derivedPillars.infrastructure.length > 0 
              ? Math.round(derivedPillars.infrastructure.reduce((a, b) => a + b, 0) / derivedPillars.infrastructure.length)
              : 0,
            perception: derivedPillars.perception.length > 0
              ? Math.round(derivedPillars.perception.reduce((a, b) => a + b, 0) / derivedPillars.perception.length)
              : 0,
            commerce: derivedPillars.commerce.length > 0
              ? Math.round(derivedPillars.commerce.reduce((a, b) => a + b, 0) / derivedPillars.commerce.length)
              : 0
          }
          
          console.log(`✅ [Report] Derived pillar scores:`, result)
          return result
        })()

    // Build comprehensive report
    const report = {
      id: evaluationId,
      url: evaluation.website_url,
      brandName: evaluation.brand_name,
      tier: evaluation.tier,
      status: evaluation.status,
      overallScore: finalScore,
      pillarScores: calculatedPillarScores,
      dimensionScores: processedDimensionScores,
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

    console.log(`✅ [Report] Sending report to frontend:`, {
      dimensionCount: report.dimensionScores.length,
      pillarScores: report.pillarScores,
      agentResultsCount: report.agentResults.length,
      sampleDimension: report.dimensionScores[0]
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error generating evaluation report:', error)
    return NextResponse.json(
      { error: 'Failed to generate evaluation report' },
      { status: 500 }
    )
  }
}
