import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription-service'

// Use dynamic import to prevent webpack bundling issues
const getFederatedLearning = async () => {
  const { federatedLearning } = await import('@/lib/federated-learning/engine')
  return federatedLearning
}

/**
 * POST /api/federated-learning/collect
 * Collect anonymized evaluation data for federated learning
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { evaluationId } = await request.json()

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'Evaluation ID is required' },
        { status: 400 }
      )
    }

    // Get user subscription to determine data sharing permissions
    const subscription = await getUserSubscription(session.user.email)
    
    // Collect federated learning data
    const federatedLearning = await getFederatedLearning()
    const dataPoint = await federatedLearning.collectEvaluationData(
      evaluationId,
      (session.user as any).id,
      subscription.tier
    )

    if (!dataPoint) {
      return NextResponse.json(
        { message: 'Data collection skipped (federated learning disabled or insufficient data)' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      dataPointId: dataPoint.id,
      message: 'Evaluation data collected for federated learning'
    })

  } catch (error) {
    console.error('Error collecting federated learning data:', error)
    return NextResponse.json(
      { error: 'Failed to collect federated learning data' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/federated-learning/collect
 * Get federated learning configuration and status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const subscription = await getUserSubscription(session.user.email)

    // Return federated learning configuration based on subscription tier
    const config = {
      enabled: true,
      privacyLevel: 'standard',
      benefits: {
        free: [
          'Industry benchmark comparisons',
          'Basic improvement recommendations',
          'Anonymous peer insights'
        ],
        professional: [
          'Enhanced benchmark analytics',
          'Predictive score forecasting',
          'Competitive intelligence',
          'Industry trend analysis',
          'Advanced peer comparisons'
        ],
        enterprise: [
          'Custom industry reports',
          'Advanced predictive modeling',
          'Proprietary benchmark creation',
          'Real-time trend alerts',
          'Custom federated learning models'
        ]
      },
      dataContributed: {
        evaluations: 0, // Would track actual contributions
        improvementOutcomes: 0,
        industryInsights: 0
      },
      benefitsReceived: {
        enhancedRecommendations: subscription.tier !== 'free',
        industryBenchmarks: true,
        predictiveInsights: subscription.tier !== 'free',
        competitiveIntelligence: subscription.tier === 'enterprise'
      }
    }

    return NextResponse.json(config)

  } catch (error) {
    console.error('Error getting federated learning config:', error)
    return NextResponse.json(
      { error: 'Failed to get federated learning configuration' },
      { status: 500 }
    )
  }
}