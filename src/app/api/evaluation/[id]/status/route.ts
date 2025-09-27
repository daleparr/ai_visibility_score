import { NextResponse } from 'next/server'

// ✅ Disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

// ✅ Proper TypeScript interfaces
interface DimensionScore {
  dimension_name: string
  score: number
  explanation: string | null
  recommendations: any
}

interface EvaluationData {
  has_meta_description?: boolean
  has_title?: boolean
  has_h1?: boolean
}

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
        b.industry,
        e.cached_report
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

    // ✅ USE CACHED REPORT IF AVAILABLE
    if (evaluation.cached_report) {
      console.log(`[STATUS_DEBUG] Using cached report for ${evaluationId}`)
      
      const cachedReport = JSON.parse(evaluation.cached_report)
      
      return NextResponse.json({
        id: evaluation.id,
        status: evaluation.status,
        overallScore: evaluation.overall_score,
        grade: evaluation.grade,
        createdAt: evaluation.created_at,
        updatedAt: evaluation.updated_at,
        results: {
          url: evaluation.website_url || 'unknown',
          brandName: evaluation.brand_name || 'Unknown Brand',
          tier: 'free',
          isDemo: false,
          overallScore: evaluation.overall_score || 0,
          ...cachedReport // Use pre-built report data
        }
      }, {
        headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' }
      })
    }

    // ✅ Get dimension scores with proper typing
    const dimensionScores = await sql`
      SELECT 
        dimension_name,
        score,
        explanation,
        recommendations
      FROM production.dimension_scores
      WHERE evaluation_id = ${evaluationId}
      ORDER BY score DESC
    ` as DimensionScore[]

    // ✅ Safe evaluation_results query with fallback
    let evaluationData: EvaluationData[] = []
    try {
      evaluationData = await sql`
        SELECT 
          has_meta_description,
          has_title,
          has_h1
        FROM production.evaluation_results
        WHERE evaluation_id = ${evaluationId}
        LIMIT 1
      ` as EvaluationData[]
    } catch (error) {
      console.log(`[STATUS_DEBUG] evaluation_results query failed, using defaults:`, error)
      // Use empty array if columns don't exist
      evaluationData = []
    }

    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} completed, building comprehensive report`)
    
    // ✅ Build DETAILED, ACTIONABLE insights from real agent data
    const buildInsights = () => {
      const scores = dimensionScores || []
      const strongest = scores[0]
      const weakest = scores[scores.length - 1]
      const evalData = evaluationData[0] || {}
      
      const overallScore = evaluation.overall_score || 0
      const brandName = evaluation.brand_name || 'Unknown Brand'
      const websiteUrl = evaluation.website_url || 'unknown'
      
      // ✅ MAP AGENTS TO BUSINESS-FRIENDLY DIMENSIONS
      const agentFindings = {
        crawl: scores.find((s: DimensionScore) => s.dimension_name === 'crawl_agent'),
        citation: scores.find((s: DimensionScore) => s.dimension_name === 'citation_agent'),
        sentiment: scores.find((s: DimensionScore) => s.dimension_name === 'sentiment_agent'),
        semantic: scores.find((s: DimensionScore) => s.dimension_name === 'semantic_agent'),
        commerce: scores.find((s: DimensionScore) => s.dimension_name === 'commerce_agent'),
        conversational: scores.find((s: DimensionScore) => s.dimension_name === 'conversational_copy_agent'),
        geo: scores.find((s: DimensionScore) => s.dimension_name === 'geo_visibility_agent'),
        llm: scores.find((s: DimensionScore) => s.dimension_name === 'llm_test_agent'),
        heritage: scores.find((s: DimensionScore) => s.dimension_name === 'brand_heritage_agent'),
        knowledge: scores.find((s: DimensionScore) => s.dimension_name === 'knowledge_graph_agent')
      }

      // ✅ DETAILED DIMENSION ANALYSIS (Fixed null safety)
      const dimensionAnalysis = [
        {
          name: "Technical Foundation",
          score: agentFindings.crawl?.score || 0,
          analysis: (() => {
            const crawlScore = agentFindings.crawl?.score || 0;
            if (crawlScore >= 80) {
              return `Excellent technical infrastructure (${crawlScore}/100). AI systems can easily access and parse your website content.`;
            } else if (crawlScore >= 60) {
              return `Good technical foundation (${crawlScore}/100) with some optimization opportunities.`;
            } else {
              return `Poor technical accessibility (${crawlScore}/100). Critical barriers prevent AI from effectively crawling your site.`;
            }
          })(),
          findings: agentFindings.crawl?.explanation || "Technical crawlability analysis completed",
          priority: (agentFindings.crawl?.score || 0) < 60 ? "high" : "medium"
        },
        {
          name: "AI Response Quality",
          score: agentFindings.llm?.score || 0,
          analysis: (() => {
            const llmScore = agentFindings.llm?.score || 0;
            if (llmScore >= 60) {
              return `Strong AI response quality (${llmScore}/100). AI systems provide accurate, detailed answers about your brand.`;
            } else if (llmScore >= 40) {
              return `Moderate AI response quality (${llmScore}/100). AI provides basic information but may miss key details.`;
            } else {
              return `Poor AI response quality (${llmScore}/100). AI struggles to provide comprehensive answers about your brand.`;
            }
          })(),
          findings: agentFindings.llm?.explanation || "LLM response quality analysis completed",
          priority: (agentFindings.llm?.score || 0) < 40 ? "high" : "medium"
        },
        {
          name: "Brand Authority & Citations",
          score: agentFindings.citation?.score || 0,
          analysis: (() => {
            const citationScore = agentFindings.citation?.score || 0;
            if (citationScore >= 70) {
              return `Strong citation authority (${citationScore}/100). AI recognizes your brand credibility across multiple authoritative sources.`;
            } else if (citationScore >= 50) {
              return `Moderate citation strength (${citationScore}/100). Some authoritative mentions but gaps in coverage.`;
            } else {
              return `Weak citation signals (${citationScore}/100). AI lacks sufficient authoritative sources to validate your brand.`;
            }
          })(),
          findings: agentFindings.citation?.explanation || "Citation analysis completed",
          priority: (agentFindings.citation?.score || 0) < 50 ? "high" : "low"
        },
        {
          name: "Geographic Discoverability",
          score: agentFindings.geo?.score || 0,
          analysis: (() => {
            const geoScore = agentFindings.geo?.score || 0;
            if (geoScore >= 70) {
              return `Excellent geographic visibility (${geoScore}/100). AI can effectively locate and recommend your business for location-based queries.`;
            } else if (geoScore >= 50) {
              return `Good geographic presence (${geoScore}/100) with some regional gaps.`;
            } else {
              return `Limited geographic signals (${geoScore}/100). AI struggles to surface your business in location-based searches.`;
            }
          })(),
          findings: agentFindings.geo?.explanation || "Geographic visibility analysis completed",
          priority: (agentFindings.geo?.score || 0) < 50 ? "medium" : "low"
        },
        {
          name: "Brand Sentiment & Trust",
          score: agentFindings.sentiment?.score || 0,
          analysis: (() => {
            const sentimentScore = agentFindings.sentiment?.score || 0;
            if (sentimentScore >= 60) {
              return `Positive brand sentiment (${sentimentScore}/100). AI associates your brand with quality and trustworthiness.`;
            } else if (sentimentScore >= 40) {
              return `Mixed sentiment signals (${sentimentScore}/100). Some positive indicators but areas of concern exist.`;
            } else {
              return `Weak sentiment profile (${sentimentScore}/100). AI may surface concerning information about your brand reputation.`;
            }
          })(),
          findings: agentFindings.sentiment?.explanation || "Brand sentiment analysis completed",
          priority: (agentFindings.sentiment?.score || 0) < 40 ? "high" : "medium"
        },
        {
          name: "Conversational AI Readiness",
          score: agentFindings.conversational?.score || 0,
          analysis: (() => {
            const conversationalScore = agentFindings.conversational?.score || 0;
            if (conversationalScore >= 60) {
              return `Strong conversational readiness (${conversationalScore}/100). AI can engage naturally about your brand and products.`;
            } else if (conversationalScore >= 40) {
              return `Basic conversational capability (${conversationalScore}/100). AI can discuss basics but lacks nuanced understanding.`;
            } else {
              return `Poor conversational signals (${conversationalScore}/100). AI struggles to engage meaningfully about your brand.`;
            }
          })(),
          findings: agentFindings.conversational?.explanation || "Conversational AI readiness analysis completed",
          priority: (agentFindings.conversational?.score || 0) < 40 ? "high" : "medium"
        }
      ].sort((a, b) => b.score - a.score)

      // ✅ PRIORITY ACTIONS (Fixed null safety)
      const priorityActions = []

      // Critical Infrastructure Issues
      const crawlScore = agentFindings.crawl?.score || 0;
      if (crawlScore < 60) {
        priorityActions.push({
          priority: "Critical (1 week)",
          title: "Fix Technical Infrastructure",
          description: `Your crawl agent scored only ${crawlScore}/100. AI systems cannot effectively access your content.`,
          impact: "+15-20 pts",
          specificFix: "Resolve server errors, improve page load speeds, add structured data markup",
          businessImpact: "Without this fix, AI systems cannot discover or recommend your brand effectively"
        })
      }

      // AI Response Quality Issues
      const llmScore = agentFindings.llm?.score || 0;
      if (llmScore < 40) {
        priorityActions.push({
          priority: "Critical (2 weeks)",
          title: "Improve AI Response Quality",
          description: `Your LLM test agent scored only ${llmScore}/100. AI provides poor quality answers about your brand.`,
          impact: "+12-18 pts",
          specificFix: "Enhance content structure, add FAQ sections, improve product descriptions",
          businessImpact: "Poor AI responses mean customers get inadequate information about your brand"
        })
      }

      // Citation and Authority Building
      const citationScore = agentFindings.citation?.score || 0;
      if (citationScore < 50) {
        priorityActions.push({
          priority: "High (30 days)",
          title: "Build Brand Authority",
          description: `Your citation agent scored ${citationScore}/100. AI lacks authoritative sources to validate your brand.`,
          impact: "+10-15 pts",
          specificFix: "Secure press coverage, build quality backlinks, get industry mentions",
          businessImpact: "Low authority means AI won't confidently recommend your brand over competitors"
        })
      }

      // Conversational Readiness
      const conversationalScore = agentFindings.conversational?.score || 0;
      if (conversationalScore < 40) {
        priorityActions.push({
          priority: "Medium (60 days)",
          title: "Enhance Conversational AI Readiness",
          description: `Your conversational agent scored ${conversationalScore}/100. AI struggles with natural brand discussions.`,
          impact: "+8-12 pts",
          specificFix: "Create conversational content, add brand personality elements, improve copy tone",
          businessImpact: "Poor conversational readiness limits effectiveness in voice and chat commerce"
        })
      }

      // ✅ EXECUTIVE SUMMARY (Fixed null safety)
      const getGradeDescription = (score: number): string => {
        if (score >= 80) return 'excellent AI visibility with strong competitive positioning'
        if (score >= 60) return 'good AI presence with optimization opportunities'
        if (score >= 40) return 'moderate AI visibility but significant gaps versus competitors'
        if (score >= 20) return 'weak AI presence limiting discoverability'
        return 'poor AI visibility with critical barriers to discovery'
      }

      const getSpecificVerdict = (): string => {
        const topScore = agentFindings.crawl?.score || 0;
        const bottomScore = agentFindings.llm?.score || 0;
        
        if (topScore >= 80 && bottomScore < 40) {
          return `Strong technical foundation (${topScore}/100) but poor AI response quality (${bottomScore}/100) creates a disconnect between accessibility and usability.`;
        } else if (topScore < 40) {
          return `Critical technical barriers (${topScore}/100) prevent AI systems from effectively accessing your brand content.`;
        } else {
          return `Balanced performance across dimensions with ${priorityActions.length} key optimization opportunities identified.`;
        }
      }

      const executiveSummary = {
        score: `${overallScore}/100 indicating ${getGradeDescription(overallScore)}`,
        verdict: getSpecificVerdict(),
        strongest: strongest ? `${strongest.dimension_name.replace('_agent', '').replace('_', ' ')} (${strongest.score}/100)` : 'Not determined',
        weakest: weakest ? `${weakest.dimension_name.replace('_agent', '').replace('_', ' ')} (${weakest.score}/100)` : 'Not determined',
        opportunity: priorityActions[0]?.title || 'Continue monitoring and optimization',
        keyInsight: priorityActions.length > 0 
          ? `${priorityActions.length} critical improvement${priorityActions.length > 1 ? 's' : ''} identified with potential +${priorityActions.reduce((sum, action) => sum + parseInt(action.impact.split('-')[1] || '10'), 0)} point impact.`
          : 'Strong foundation - focus on maintaining competitive positioning.'
      }
      
      return {
        dimensionAnalysis,
        priorityActions: priorityActions.slice(0, 3), // Top 3 priorities
        executiveSummary,
        technicalFindings: {
          hasMetaDescription: evalData.has_meta_description || false,
          hasTitle: evalData.has_title || false,
          hasH1: evalData.has_h1 || false,
          crawlScore: agentFindings.crawl?.score || 0,
          llmScore: agentFindings.llm?.score || 0,
          citationScore: agentFindings.citation?.score || 0
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
      // ✅ DETAILED, ACTIONABLE RESULTS
      results: {
        url: evaluation.website_url || 'unknown',
        brandName: evaluation.brand_name || 'Unknown Brand',
        tier: 'free',
        isDemo: false,
        overallScore: evaluation.overall_score || 0,
        
        // Executive Summary
        executiveSummary: insights.executiveSummary,
        
        // Detailed Dimension Analysis
        dimensionAnalysis: insights.dimensionAnalysis,
        
        // Priority Actions
        priorityActions: insights.priorityActions,
        
        // Technical Findings
        technicalFindings: insights.technicalFindings,
        
        // Legacy format for compatibility
        pillarScores: {
          infrastructure: insights.dimensionAnalysis.find(d => d.name.includes('Technical'))?.score || 0,
          perception: insights.dimensionAnalysis.find(d => d.name.includes('Authority'))?.score || 0,
          commerce: insights.dimensionAnalysis.find(d => d.name.includes('Conversational'))?.score || 0
        },
        
        dimensionScores: insights.dimensionAnalysis.map(d => ({
          name: d.name,
          score: d.score,
          description: d.analysis,
          findings: d.findings,
          priority: d.priority
        })),
        
        recommendations: insights.priorityActions.map(action => ({
          priority: action.priority.toLowerCase().includes('critical') ? 'high' : 'medium',
          title: action.title,
          description: action.description,
          impact: parseInt(action.impact.split('-')[1] || '10'),
          timeframe: action.priority.includes('week') ? '1-2 weeks' : action.priority.includes('30 days') ? '30 days' : '60-90 days',
          specificFix: action.specificFix,
          businessImpact: action.businessImpact
        })),
        
        aiProviders: ['openai'],
        defaultModel: 'gpt-3.5-turbo',
        analysisMethod: 'ADI Framework',
        
        insights: {
          strongest: insights.executiveSummary.strongest,
          weakest: insights.executiveSummary.weakest,
          opportunity: insights.executiveSummary.opportunity,
          verdict: insights.executiveSummary.verdict,
          keyInsight: insights.executiveSummary.keyInsight
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
