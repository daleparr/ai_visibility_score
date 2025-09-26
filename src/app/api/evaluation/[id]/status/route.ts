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
    
    // ✅ Get evaluation with brand data
    const evaluationResult = await sql`
      SELECT 
        e.id, 
        e.status, 
        e.overall_score, 
        e.grade, 
        e.created_at, 
        e.updated_at,
        e.brand_id,
        e.strongest_dimension,
        e.weakest_dimension,
        e.biggest_opportunity,
        e.verdict,
        b.name as brand_name,
        b.website_url,
        b.industry
      FROM production.evaluations e
      LEFT JOIN production.brands b ON e.brand_id = b.id
      WHERE e.id = ${evaluationId}
      ORDER BY e.updated_at DESC
      LIMIT 1
    `

    if (!evaluationResult || evaluationResult.length === 0) {
      console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} not found`)
      return NextResponse.json(
        { error: 'Evaluation not found' }, 
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-store' }
        }
      )
    }

    const evaluation = evaluationResult[0]
    
    console.log(`[STATUS_QUERY] Raw DB row for ${evaluationId}:`, {
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      brandName: evaluation.brand_name,
      websiteUrl: evaluation.website_url,
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

    // ✅ Get dimension scores and agent findings
    const dimensionScores = await sql`
      SELECT 
        dimension_name,
        score,
        explanation,
        recommendations
      FROM production.dimension_scores
      WHERE evaluation_id = ${evaluationId}
      ORDER BY score DESC
    `

    // ✅ Get website snapshot data with CORRECT column names
    const websiteData = await sql`
      SELECT 
        has_structured_data,
        structured_data_types_count,
        quality_score,
        has_title,
        has_meta_description,
        title,
        meta_description
      FROM production.website_snapshots
      WHERE evaluation_id = ${evaluationId}
      AND page_type = 'homepage'
      LIMIT 1
    `

    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} completed, building comprehensive report`)
    
    // ✅ Build real insights from agent data
    const buildInsights = () => {
      const scores = dimensionScores || []
      const strongest = scores[0]
      const weakest = scores[scores.length - 1]
      const website = websiteData[0] || {}
      
      const overallScore = evaluation.overall_score || 0
      const brandName = evaluation.brand_name || 'Unknown Brand'
      const websiteUrl = evaluation.website_url || 'unknown'
      
      // Calculate pillar scores from dimension data
      const infrastructureScores = scores.filter((s: any) => 
        ['crawl_agent', 'schema_agent'].includes(s.dimension_name)
      )
      const perceptionScores = scores.filter((s: any) => 
        ['citation_agent', 'sentiment_agent', 'brand_heritage_agent'].includes(s.dimension_name)
      )
      const commerceScores = scores.filter((s: any) => 
        ['commerce_agent', 'conversational_copy_agent'].includes(s.dimension_name)
      )
      
      // ✅ Fixed: Added type annotation
      const avgScore = (scores: any[]) => scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : Math.round(overallScore * 0.33)
      
      const pillarScores = {
        infrastructure: avgScore(infrastructureScores),
        perception: avgScore(perceptionScores), 
        commerce: avgScore(commerceScores)
      }
      
      // ✅ Fixed: Added type annotation
      const recommendations: Array<{
        priority: string
        title: string
        score: number
        description: string
        timeframe: string
        impact: number
      }> = []
      
      if (website.has_structured_data === false || (website.structured_data_types_count || 0) < 3) {
        recommendations.push({
          priority: 'high',
          title: 'Add Structured Data Schema',
          score: pillarScores.infrastructure,
          description: `Fix: Add structured schema to product pages, FAQs, and shipping info. Impact: +6-8 pts`,
          timeframe: '2 weeks',
          impact: 8
        })
      }
      
      if (pillarScores.perception < 40) {
        recommendations.push({
          priority: 'medium', 
          title: 'Enhance Brand Citations',
          score: pillarScores.perception,
          description: `Fix: Secure structured citations in industry press and review sites. Impact: +10-12 pts`,
          timeframe: '90 days',
          impact: 12
        })
      }
      
      if (pillarScores.commerce < 50) {
        recommendations.push({
          priority: 'medium',
          title: 'Improve Commerce Signals', 
          score: pillarScores.commerce,
          description: `Fix: Add product schema, pricing data, and availability signals. Impact: +7-9 pts`,
          timeframe: '30 days',
          impact: 9
        })
      }
      
      // Generate executive summary
      const getGradeDescription = (score: number) => {
        if (score >= 80) return 'strong AI visibility'
        if (score >= 60) return 'moderate AI visibility' 
        if (score >= 40) return 'weak AI visibility'
        return 'poor AI visibility'
      }
      
      const executiveSummary = `${brandName} scores ${overallScore}/100, indicating ${getGradeDescription(overallScore)}. ${
        strongest ? `Strongest area: ${strongest.dimension_name} (${strongest.score}/100).` : ''
      } ${
        weakest ? `Weakest area: ${weakest.dimension_name} (${weakest.score}/100).` : ''
      } ${
        recommendations.length > 0 
          ? `Priority fix: ${recommendations[0].title} for +${recommendations[0].impact} point improvement.`
          : 'Continue monitoring and optimizing structured data.'
      }`
      
      // ✅ Fixed: Split long ternary for readability
      const getPillarName = (dimensionName: string) => {
        if (dimensionName.includes('crawl') || dimensionName.includes('schema')) {
          return 'infrastructure'
        }
        if (dimensionName.includes('citation') || dimensionName.includes('sentiment')) {
          return 'perception'
        }
        return 'commerce'
      }
      
      return {
        pillarScores,
        dimensionScores: scores.map((s: any) => ({
          name: s.dimension_name,
          score: s.score,
          description: s.explanation || `${s.dimension_name} analysis`,
          pillar: getPillarName(s.dimension_name)
        })),
        recommendations,
        executiveSummary,
        technicalFindings: {
          hasStructuredData: website.has_structured_data || false,
          structuredDataTypes: website.structured_data_types_count || 0,
          qualityScore: website.quality_score || 0,
          hasTitle: website.has_title || false,
          hasMetaDescription: website.has_meta_description || false
        }
      }
    }
    
    const insights = buildInsights()
    
    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overall_score,
      grade: evaluation.grade,
      createdAt: evaluation.created_at,
      updatedAt: evaluation.updated_at,
      // ✅ Real, actionable results from agent findings
      results: {
        url: evaluation.website_url || 'unknown',
        brandName: evaluation.brand_name || 'Unknown Brand',
        tier: 'free',
        isDemo: false,
        overallScore: evaluation.overall_score || 0,
        pillarScores: insights.pillarScores,
        dimensionScores: insights.dimensionScores,
        recommendations: insights.recommendations,
        aiProviders: ['openai'],
        defaultModel: 'gpt-3.5-turbo',
        analysisMethod: 'ADI Framework',
        executiveSummary: insights.executiveSummary,
        technicalFindings: insights.technicalFindings,
        // Add structured insights like your example
        insights: {
          strongest: evaluation.strongest_dimension || insights.dimensionScores[0]?.name,
          weakest: evaluation.weakest_dimension || insights.dimensionScores[insights.dimensionScores.length - 1]?.name,
          opportunity: evaluation.biggest_opportunity || insights.recommendations[0]?.title,
          verdict: evaluation.verdict || insights.executiveSummary
        }
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
