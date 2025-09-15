import { NextRequest, NextResponse } from 'next/server'
import { EvaluationEngine } from '@/lib/evaluation-engine'
import { isDemoMode } from '@/lib/demo-mode'
import type { AIProviderName } from '@/types/supabase'

export async function POST(request: NextRequest) {
  try {
    const { url, tier = 'free' } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // For demo mode, return mock data
    if (isDemoMode()) {
      return NextResponse.json({
        url,
        tier,
        isDemo: true,
        overallScore: 83,
        pillarScores: {
          infrastructure: 86,
          perception: 81,
          commerce: 84
        },
        dimensionScores: [
          { name: 'Schema & Structured Data', score: 85, description: 'Well-implemented structured data', pillar: 'infrastructure' },
          { name: 'Semantic Clarity', score: 78, description: 'Clear content organization', pillar: 'infrastructure' },
          { name: 'Knowledge Graph Presence', score: 92, description: 'Strong knowledge graph signals', pillar: 'infrastructure' },
          { name: 'LLM Readability', score: 88, description: 'Optimized for AI parsing', pillar: 'infrastructure' },
          { name: 'Geographic Visibility', score: 76, description: 'Good regional coverage', pillar: 'perception' },
          { name: 'Citation Strength', score: 82, description: 'Strong citation network', pillar: 'perception' },
          { name: 'AI Response Quality', score: 79, description: 'Accurate AI responses', pillar: 'perception' },
          { name: 'Brand Heritage', score: 85, description: 'Well-established brand story', pillar: 'perception' },
          { name: 'Product Identification', score: 91, description: 'Clear product catalog', pillar: 'commerce' },
          { name: 'Recommendation Accuracy', score: 87, description: 'AI recommends correctly', pillar: 'commerce' },
          { name: 'Transaction Clarity', score: 83, description: 'Clear purchase process', pillar: 'commerce' },
          { name: 'Competitive Positioning', score: 74, description: 'Room for improvement', pillar: 'commerce' }
        ],
        aiProviders: tier === 'free' ? ['openai'] : ['openai', 'anthropic', 'google', 'mistral', 'llama'],
        defaultModel: 'gpt-4',
        recommendations: [
          { priority: 'high', title: 'Improve Competitive Positioning', score: 74, description: 'AI models struggle to differentiate your brand from competitors' },
          { priority: 'medium', title: 'Enhance Geographic Visibility', score: 76, description: 'Limited visibility in certain regions' },
          { priority: 'low', title: 'Optimize Semantic Clarity', score: 78, description: 'Some content could be clearer for AI understanding' }
        ]
      })
    }

    // For production mode, run actual evaluation
    const config = {
      brandId: `temp-${Date.now()}`, // Temporary brand ID for URL-based evaluation
      userId: 'guest-user',
      enabledProviders: (tier === 'free' ? ['openai'] : ['openai', 'anthropic', 'google', 'mistral', 'llama']) as AIProviderName[],
      testCompetitors: tier !== 'free',
      competitorUrls: tier !== 'free' ? [] : undefined
    }

    const engine = new EvaluationEngine(config)
    
    // This would trigger the actual evaluation
    // For now, return structured response indicating real evaluation would happen
    return NextResponse.json({
      url,
      tier,
      isDemo: false,
      status: 'evaluation_started',
      message: 'Real AI evaluation would be triggered here',
      config: {
        enabledProviders: config.enabledProviders,
        defaultModel: tier === 'free' ? 'gpt-4' : 'multi-model',
        testCompetitors: config.testCompetitors
      }
    })

  } catch (error) {
    console.error('Evaluation API error:', error)
    return NextResponse.json(
      { error: 'Failed to start evaluation' },
      { status: 500 }
    )
  }
}