import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription-service'
import { getUserProfile } from '@/lib/database'

// Use dynamic import to prevent webpack bundling issues
const getFederatedLearning = async () => {
  const { federatedLearning } = await import('@/lib/federated-learning/engine')
  return federatedLearning
}

/**
 * GET /api/federated-learning/insights
 * Get personalized insights based on federated learning
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

    const userId = (session.user as any).id
    const subscription = await getUserSubscription(session.user.email)
    
    // Get user profile to determine industry
    const userProfile = await getUserProfile(userId)
    const userIndustry = userProfile?.industry || 'technology'

    // Generate personalized insights
    const federatedLearning = await getFederatedLearning()
    const insights = await federatedLearning.generatePersonalizedInsights(
      userId,
      userIndustry,
      subscription.tier
    )

    // Filter insights based on subscription tier
    const filteredInsights = {
      ...insights,
      recommendations: insights.recommendations.slice(0, getMaxRecommendations(subscription.tier)),
      benchmarkComparisons: {
        ...insights.benchmarkComparisons,
        similarCompanies: insights.benchmarkComparisons.similarCompanies.slice(0, getMaxSimilarCompanies(subscription.tier))
      },
      predictiveInsights: subscription.tier === 'free' ? {
        futureScore: insights.predictiveInsights.futureScore,
        confidenceLevel: Math.min(insights.predictiveInsights.confidenceLevel, 60),
        keyDrivers: insights.predictiveInsights.keyDrivers.slice(0, 2),
        riskFactors: insights.predictiveInsights.riskFactors.slice(0, 2)
      } : insights.predictiveInsights
    }

    return NextResponse.json({
      insights: filteredInsights,
      subscriptionTier: subscription.tier,
      upgradeAvailable: subscription.tier !== 'enterprise'
    })

  } catch (error) {
    console.error('Error generating federated learning insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/federated-learning/insights
 * Record user interaction with insights (for improvement tracking)
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

    const { 
      recommendationId, 
      action, 
      implementationDate,
      outcomeScore 
    } = await request.json()

    if (!recommendationId || !action) {
      return NextResponse.json(
        { error: 'Recommendation ID and action are required' },
        { status: 400 }
      )
    }

    // Record the improvement action for federated learning
    // This would be stored and used to improve future recommendations
    const improvementAction = {
      userId: (session.user as any).id,
      recommendationId,
      actionTaken: action === 'implemented',
      implementationDate: implementationDate ? new Date(implementationDate) : undefined,
      outcomeScore: outcomeScore || undefined,
      recordedAt: new Date()
    }

    // In a production system, this would be stored in the database
    // and used to train the federated learning models
    console.log('Improvement action recorded:', improvementAction)

    return NextResponse.json({
      success: true,
      message: 'Improvement action recorded for federated learning'
    })

  } catch (error) {
    console.error('Error recording improvement action:', error)
    return NextResponse.json(
      { error: 'Failed to record improvement action' },
      { status: 500 }
    )
  }
}

function getMaxRecommendations(tier: string): number {
  switch (tier) {
    case 'free': return 3
    case 'professional': return 8
    case 'enterprise': return 20
    default: return 3
  }
}

function getMaxSimilarCompanies(tier: string): number {
  switch (tier) {
    case 'free': return 2
    case 'professional': return 5
    case 'enterprise': return 10
    default: return 2
  }
}