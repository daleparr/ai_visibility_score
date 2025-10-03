export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { normalizeBrandUrl } from '@/lib/brand-normalize'
import { getBrand } from '@/lib/database'
// REMOVE THIS - Wrong system
// import { EvaluationEngine, createEvaluationEngine } from '@/lib/evaluation-engine'
// ADD THIS - Correct system
import { ADIService } from '@/lib/adi/adi-service'
import { ensureGuestUser, createBrand as upsertBrand, createEvaluation } from '@/lib/database'
import { safeHostname } from '@/lib/url'

function extractBrandNameFromUrl(url: string): string {
  try {
    const hostname = safeHostname(url)
    if (!hostname) return 'Unnamed Brand'
    
    const parts = hostname.split('.')
    if (parts.length > 2 && parts[0] === 'www') {
      return parts[1]
    }
    return parts[0]
  } catch {
    return 'Unnamed Brand'
  }
}

// URL validation helper
function validateAndSuggestUrl(url: string): { isValid: boolean; normalizedUrl?: string; suggestion?: string; error?: string } {
  try {
    // Basic format check
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' }
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      return { isValid: false, error: 'URL cannot be empty' }
    }

    // Add protocol if missing
    const urlWithProtocol = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
    
    // Parse URL
    const parsedUrl = new URL(urlWithProtocol)
    const hostname = parsedUrl.hostname.toLowerCase()

    // Check for common typos
    const commonTypos: Record<string, string> = {
      '.come': '.com',
      '.co.': '.com',
      '.comm': '.com',
      '.coom': '.com',
      '.con': '.com',
      '.cmo': '.com'
    }

    let suggestion: string | undefined
    for (const [typo, correction] of Object.entries(commonTypos)) {
      if (hostname.includes(typo)) {
        const correctedHostname = hostname.replace(typo, correction)
        suggestion = `Did you mean: https://${correctedHostname}?`
        return { 
          isValid: false, 
          error: `Invalid domain detected: "${hostname}"`, 
          suggestion 
        }
      }
    }

    // Check for valid TLD (basic check)
    const validTlds = ['.com', '.org', '.net', '.edu', '.gov', '.co.uk', '.co', '.io', '.ai', '.app', '.dev']
    const hasValidTld = validTlds.some(tld => hostname.endsWith(tld))
    
    if (!hasValidTld) {
      return { 
        isValid: false, 
        error: `Invalid domain: "${hostname}". Please check the URL and try again.`,
        suggestion: 'Make sure the domain has a valid extension like .com, .org, .net, etc.'
      }
    }

    // Check for localhost or invalid domains
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
      return { 
        isValid: false, 
        error: 'Local URLs are not supported. Please provide a public website URL.' 
      }
    }

    const normalizedUrl = normalizeBrandUrl(url)
    return { isValid: true, normalizedUrl }

  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`🔍 [ROUTE_DEBUG] POST /api/evaluate called`)
    
    const body: { url?: string; tier?: string } = await request.json()
    const url = body.url
    const tier = body.tier || 'free'
    console.log(`🔍 [ROUTE_DEBUG] Request body parsed: url=${url}, tier=${tier}`)

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL and provide helpful suggestions
    console.log(`🔍 [ROUTE_DEBUG] Validating URL: ${url}`)
    const validation = validateAndSuggestUrl(url)
    if (!validation.isValid) {
      console.log(`🔍 [ROUTE_DEBUG] URL validation failed: ${validation.error}`)
      return NextResponse.json({ 
        error: validation.error,
        suggestion: validation.suggestion,
        code: 'INVALID_URL'
      }, { status: 400 })
    }

    const normalizedUrl = validation.normalizedUrl!
    console.log(`🔍 [ROUTE_DEBUG] URL validated and normalized: ${normalizedUrl}`)

    // 1. Ensure a user and brand exist
    console.log(`🔍 [ROUTE_DEBUG] Ensuring guest user exists`)
    const guestUser = await ensureGuestUser()
    console.log(`🔍 [ROUTE_DEBUG] Guest user ensured: ${guestUser.id}`)
    
    console.log(`🔍 [ROUTE_DEBUG] Creating/upserting brand`)
    const brand = await upsertBrand({
        userId: guestUser.id,
        name: extractBrandNameFromUrl(normalizedUrl),
        websiteUrl: normalizedUrl,
    })
    console.log(`🔍 [ROUTE_DEBUG] Brand created/upserted: ${brand?.id}`)

    if (!brand) {
        console.log(`🔍 [ROUTE_DEBUG] Brand creation failed`)
        return NextResponse.json({ error: 'Could not create or find brand' }, { status: 500 })
    }

    // Add this logging pattern to track exactly what's happening
    const correlationId = Math.random().toString(36).slice(2, 10);
    console.log(`[${correlationId}] Starting evaluation:`, { brandName: brand.name, websiteUrl: brand.websiteUrl, tier });

    // CREATE EVALUATION IN DATABASE FIRST
    const evaluation = await createEvaluation({
        brandId: brand.id,
        status: 'running'
    })

    // Before database write
    console.log(`[${correlationId}] Attempting to save evaluation:`, { 
      evaluationId: evaluation.id, 
      status: 'running',
      brandId: brand.id 
    });

    // After database write
    console.log(`[${correlationId}] Evaluation saved:`, { 
      evaluationId: evaluation.id, 
      inserted: true,
      elapsedMs: Date.now() - Date.now() // This will be 0, but the point is to track the time after the write
    });

    console.log(`[ROUTE_HANDLER] Created evaluation: ${evaluation.id}`)

    // 2. Use PROPER ADI orchestration system with the database evaluation ID
    console.log(`🔍 [ROUTE_DEBUG] Creating ADI Service instance`)
    const adiService = new ADIService()
    console.log(`🔍 [ROUTE_DEBUG] ADI Service instance created`)

    // Start evaluation in background - don't await it
    console.log(`🔍 [ROUTE_DEBUG] Starting evaluateBrand call`)
    adiService.evaluateBrand(brand.id, brand.websiteUrl, undefined, guestUser.id, {
      persistToDb: true,
      evaluationId: evaluation.id,  // ← USE THE DATABASE EVALUATION ID
      userTier: tier as 'free' | 'index-pro' | 'enterprise'
    }).then(result => {
      console.log(`[ROUTE_HANDLER] Completed evaluation: ${result.adiScore.overall}/100`)
    }).catch(error => {
      console.error(`[ROUTE_HANDLER] Evaluation failed: ${error.message}`)
      console.error(`[ROUTE_HANDLER] Error stack:`, error.stack)
    })
    console.log(`🔍 [ROUTE_DEBUG] evaluateBrand call initiated (background)`)

    // 3. Return immediate response
    // The response should include evaluationId for polling
    return NextResponse.json({
      evaluationId: evaluation.id,  // This is crucial for polling
      brandId: brand.id,
      url: normalizedUrl,
      status: 'running',
      message: 'Evaluation started successfully. Please check status for completion.',
      estimatedTime: '30-60 seconds'
    })
  } catch (error: any) {
    console.error('❌ [EVALUATE_API_ERROR] A critical error occurred:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during evaluation setup. Please try again.',
        details: error.message
      },
      { status: 500 }
    )
  }
}