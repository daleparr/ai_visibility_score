export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { normalizeBrandUrl } from '@/lib/brand-normalize'
import { getBrand } from '@/lib/database'
// WRONG - Uses legacy system with no timeouts
import { EvaluationEngine, createEvaluationEngine } from '@/lib/evaluation-engine'

// CORRECT - Use proper orchestrated system with timeouts
import { ADIService } from '@/lib/adi/adi-service'
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

    // 2. Start evaluation asynchronously and return immediately
    const { triggerEvaluation } = await import('@/lib/evaluation-engine')
    
    // Start evaluation in background - don't await it
    triggerEvaluation(brand.id).then(finalEvaluation => {
      console.log(`[ROUTE_HANDLER] Completed evaluation: ${finalEvaluation.id}`)
    }).catch(error => {
      console.error(`[ROUTE_HANDLER] Evaluation failed: ${error.message}`)
    })

    // 3. Return immediate response with evaluation ID for polling
    return NextResponse.json({
      evaluationId: brand.id, // Use brand ID to track evaluation
      brandId: brand.id,
      url: normalizedUrl,
      status: 'running',
      message: 'Evaluation started successfully. Please check status for completion.',
      estimatedTime: '60-90 seconds'
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