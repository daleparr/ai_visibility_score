export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { normalizeBrandUrl } from '@/lib/brand-normalize'
import { getBrand } from '@/lib/database'
import { EvaluationEngine, createEvaluationEngine } from '@/lib/evaluation-engine'
import { ensureGuestUser, createBrand as upsertBrand } from '@/lib/database'

function extractBrandNameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.split('.')
    if (parts.length > 2 && parts[0] === 'www') {
      return parts[1]
    }
    return parts[0]
  } catch {
    return 'Unnamed Brand'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { url?: string } = await request.json()
    const url = body.url

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const normalizedUrl = normalizeBrandUrl(url)

    // 1. Ensure a user and brand exist to associate the evaluation with
    const guestUser = await ensureGuestUser()
    const brand = await upsertBrand({
        userId: guestUser.id,
        name: extractBrandNameFromUrl(normalizedUrl),
        websiteUrl: normalizedUrl,
    })

    if (!brand) {
        return NextResponse.json({ error: 'Could not create or find brand' }, { status: 500 })
    }

    console.log(`[ROUTE_HANDLER] Starting evaluation for brand: ${brand.name} (${brand.id})`)

    // 2. Use the simple, correct trigger function we built.
    const { triggerEvaluation } = await import('@/lib/evaluation-engine')
    const finalEvaluation = await triggerEvaluation(brand.id)

    console.log(`[ROUTE_HANDLER] Completed evaluation: ${finalEvaluation.id}`)

    // 3. Return frontend-compatible response structure
    return NextResponse.json({
      url: normalizedUrl,
      tier: 'free',
      isDemo: false,
      overallScore: finalEvaluation.overallScore || 0,
      grade: finalEvaluation.grade || 'F',
      pillarScores: {
        infrastructure: finalEvaluation.overallScore || 0,
        perception: 0,
        commerce: 0
      },
      dimensionScores: [
        {
          name: 'schema_structured_data',
          score: finalEvaluation.overallScore || 0,
          description: 'Basic infrastructure evaluation completed',
          pillar: 'infrastructure'
        }
      ],
      recommendations: [
        {
          title: 'Improve Infrastructure',
          description: 'Basic evaluation completed. Upgrade to professional tier for detailed analysis.',
          score: finalEvaluation.overallScore || 0,
          priority: 'medium'
        }
      ],
      aiProviders: ['openai'],
      defaultModel: 'gpt-4',
      analysisMethod: 'Hybrid Infrastructure Evaluation'
    })
  } catch (error: any) {
    console.error('❌ [EVALUATE_API_ERROR] A critical error occurred:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during evaluation.',
        details: error.message,
      },
      { status: 500 }
    )
  }
}