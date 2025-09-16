import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiResponseService, AIResponseRequest } from '@/lib/ai-response-service'
import { getUserSubscription } from '@/lib/subscription-service'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { brandName, websiteUrl, dimensionName, brandCategory } = body

    if (!brandName || !websiteUrl || !dimensionName) {
      return NextResponse.json(
        { error: 'Missing required fields: brandName, websiteUrl, dimensionName' },
        { status: 400 }
      )
    }

    // Get user subscription tier
    const subscription = await getUserSubscription(session.user.email)
    const userTier = subscription?.tier || 'free'

    // Build AI request
    const aiRequest: AIResponseRequest = {
      brandName,
      websiteUrl,
      dimensionName,
      brandCategory,
      userTier: userTier as 'free' | 'index_pro' | 'enterprise'
    }

    // Generate AI responses
    const result = await aiResponseService.generateRealAIResponses(aiRequest)

    // Log the request for analytics
    console.log(`AI Response Request: ${session.user.email} - ${brandName} - ${dimensionName} - Tier: ${userTier} - Real AI: ${result.isRealAI}`)

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        userTier,
        isRealAI: result.isRealAI,
        provider: result.provider,
        timestamp: result.timestamp
      }
    })

  } catch (error) {
    console.error('AI response generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Get user session for tier checking
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Get user subscription tier
  const subscription = await getUserSubscription(session.user.email)
  const userTier = subscription?.tier || 'free'

  return NextResponse.json({
    userTier,
    hasRealAI: userTier !== 'free',
    availableProviders: userTier !== 'free' ? ['OpenAI GPT-4'] : ['Simulated'],
    message: userTier === 'free' 
      ? 'Upgrade to Index Pro or Enterprise for real AI responses'
      : 'Real AI responses available'
  })
}