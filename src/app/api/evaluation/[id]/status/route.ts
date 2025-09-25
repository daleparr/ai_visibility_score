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

    // Get evaluation from database
    const evaluation = await getEvaluation(evaluationId)

    console.log(`[STATUS_DEBUG] Evaluation ${evaluationId} status check:`, {
      found: !!evaluation,
      status: evaluation?.status,
      overallScore: evaluation?.overallScore,
      updatedAt: evaluation?.updatedAt
    })

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

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

    // If completed, get brand and dimension scores
    const brand = await getBrand(evaluation.brandId)
    const dimensionScores = await getDimensionScoresByEvaluationId(evaluationId)
    
    // Calculate pillar scores from dimension scores
    const infrastructureAgents = ['crawl_agent', 'schema_agent', 'semantic_agent']
    const perceptionAgents = ['citation_agent', 'sentiment_agent', 'brand_heritage_agent', 'llm_test_agent']
    const commerceAgents = ['commerce_agent', 'geo_visibility_agent', 'conversational_copy_agent', 'knowledge_graph_agent']
    
    const calculatePillarScore = (agentNames: string[]) => {
      const scores = dimensionScores.filter(ds => agentNames.includes(ds.dimensionName))
      return scores.length > 0 ? Math.round(scores.reduce((sum, ds) => sum + (ds.score || 0), 0) / scores.length) : 0
    }
    
    // Transform to frontend-expected format
    const evaluationData = {
      url: brand?.websiteUrl || 'Unknown',
      tier: 'free',
      isDemo: false,
      overallScore: evaluation.overallScore || 0,
      pillarScores: {
        infrastructure: calculatePillarScore(infrastructureAgents),
        perception: calculatePillarScore(perceptionAgents),
        commerce: calculatePillarScore(commerceAgents)
      },
      dimensionScores: dimensionScores.map(ds => ({
        name: ds.dimensionName.replace('_agent', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: ds.score || 0,
        description: `${ds.dimensionName.replace('_agent', '').replace('_', ' ')} analysis`,
        pillar: infrastructureAgents.includes(ds.dimensionName) 
          ? 'infrastructure' as const
          : commerceAgents.includes(ds.dimensionName)
          ? 'commerce' as const
          : 'perception' as const
      })),
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

    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      overallScore: evaluation.overallScore,
      grade: evaluation.grade,
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt,
      results: evaluationData
    })

  } catch (error) {
    console.error('Error fetching evaluation status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evaluation status' },
      { status: 500 }
    )
  }
}
