export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { normalizeBrandUrl } from '@/lib/brand-normalize'
import { getBrand } from '@/lib/database'
// REMOVE THIS - Wrong system
// import { EvaluationEngine, createEvaluationEngine } from '@/lib/evaluation-engine'
// ADD THIS - Hybrid system for better performance
import { HybridADIService } from '@/lib/adi/hybrid-adi-service'
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
    // Basic format check with helpful guidance
    if (!url || typeof url !== 'string') {
      return { 
        isValid: false, 
        error: 'Website URL is required',
        suggestion: 'Please enter a website URL to analyze (like "example.com" or "https://mycompany.co.uk")'
      }
    }

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      return { 
        isValid: false, 
        error: 'Please enter a website URL',
        suggestion: 'Enter the domain name of the website you want to analyze (like "nike.com" or "newbalance.co.uk")'
      }
    }

    // Add protocol if missing
    const urlWithProtocol = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`
    
    // Parse URL
    const parsedUrl = new URL(urlWithProtocol)
    const hostname = parsedUrl.hostname.toLowerCase()

    // Check for common typos with helpful corrections
    const commonTypos: Array<{pattern: string, correction: string, description: string}> = [
      { pattern: '.come', correction: '.com', description: 'common typo' },
      { pattern: '.comm', correction: '.com', description: 'extra letter' },
      { pattern: '.coom', correction: '.com', description: 'typo' },
      { pattern: '.con', correction: '.com', description: 'missing letter' },
      { pattern: '.cmo', correction: '.com', description: 'letter order' },
      { pattern: '.ogr', correction: '.org', description: 'letter order' },
      { pattern: '.rog', correction: '.org', description: 'letter order' },
      { pattern: '.nte', correction: '.net', description: 'letter order' }
    ]

    for (const typo of commonTypos) {
      if (hostname.endsWith(typo.pattern)) {
        const correctedHostname = hostname.replace(typo.pattern, typo.correction)
        return { 
          isValid: false, 
          error: `Possible typo in domain: "${hostname}"`, 
          suggestion: `Did you mean "https://${correctedHostname}"? (${typo.description})`
        }
      }
    }

    // Check for valid TLD (comprehensive check)
    const validTlds = [
      '.com', '.org', '.net', '.edu', '.gov', '.mil', '.int',
      '.co.uk', '.co.nz', '.co.za', '.co.jp', '.co.kr', '.co.in', '.co.au',
      '.uk', '.de', '.fr', '.it', '.es', '.nl', '.be', '.ch', '.at', '.se', '.no', '.dk', '.fi',
      '.ca', '.mx', '.br', '.ar', '.cl', '.pe', '.co', '.us',
      '.au', '.nz', '.jp', '.kr', '.cn', '.in', '.sg', '.hk', '.tw', '.th', '.my', '.ph', '.id', '.vn',
      '.ru', '.pl', '.cz', '.hu', '.ro', '.bg', '.hr', '.si', '.sk', '.lt', '.lv', '.ee',
      '.io', '.ai', '.app', '.dev', '.tech', '.online', '.store', '.shop', '.site', '.website',
      '.info', '.biz', '.name', '.pro', '.mobi', '.travel', '.museum', '.aero', '.coop'
    ]
    const hasValidTld = validTlds.some(tld => hostname.endsWith(tld))
    
    if (!hasValidTld) {
      // Provide specific suggestions based on the domain
      let specificSuggestion = 'Make sure the domain has a valid extension.'
      
      if (hostname.includes('.')) {
        const currentTld = hostname.substring(hostname.lastIndexOf('.'))
        if (currentTld === '.cm') {
          specificSuggestion = `Did you mean "${hostname.replace('.cm', '.com')}"?`
        } else if (currentTld === '.om') {
          specificSuggestion = `Did you mean "${hostname.replace('.om', '.com')}"?`
        } else if (currentTld === '.co') {
          specificSuggestion = `Did you mean "${hostname}.uk" or "${hostname}m"?`
        } else {
          specificSuggestion = `"${currentTld}" is not a recognized domain extension. Try .com, .org, .co.uk, or other standard extensions.`
        }
      } else {
        specificSuggestion = `Add a domain extension like "${hostname}.com" or "${hostname}.org"`
      }
      
      return { 
        isValid: false, 
        error: `Invalid domain extension in "${hostname}"`,
        suggestion: specificSuggestion
      }
    }

    // Check for localhost or private network domains
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.endsWith('.local')) {
      return { 
        isValid: false, 
        error: 'Local or private network URLs cannot be analyzed',
        suggestion: 'Please enter a public website URL that can be accessed from the internet (like "example.com" or "mycompany.co.uk")'
      }
    }

    const normalizedUrl = normalizeBrandUrl(url)
    return { isValid: true, normalizedUrl }

  } catch (error) {
    // Provide helpful error messages for common URL format issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    let userFriendlyError = 'Invalid URL format'
    let suggestion = 'Please check your URL and try again'
    
    if (errorMessage.includes('Invalid URL')) {
      userFriendlyError = 'URL format is not recognized'
      suggestion = 'Try entering just the domain name (like "example.com") or include "https://" at the beginning'
    } else if (errorMessage.includes('hostname')) {
      userFriendlyError = 'Domain name appears to be invalid'
      suggestion = 'Make sure the domain name is spelled correctly and includes a valid extension like .com, .org, or .co.uk'
    }
    
    return { 
      isValid: false, 
      error: userFriendlyError,
      suggestion: suggestion
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

    // 2. Use HYBRID ADI orchestration system for better performance
    console.log(`🔍 [ROUTE_DEBUG] Creating Hybrid ADI Service instance`)
    const hybridAdiService = new HybridADIService()
    console.log(`🔍 [ROUTE_DEBUG] Hybrid ADI Service instance created`)

    // Start hybrid evaluation - returns fast results immediately, slow agents run in background
    console.log(`🔍 [ROUTE_DEBUG] Starting hybrid evaluateBrand call`)
    hybridAdiService.evaluateBrand(
      brand.id, 
      brand.websiteUrl, 
      tier as 'free' | 'index-pro' | 'enterprise'
    ).then(result => {
      console.log(`[ROUTE_HANDLER] Fast phase completed: ${Object.keys(result.agentResults).length} agents, status: ${result.overallStatus}`)
      // Note: Slow agents continue running in background
    }).catch(error => {
      console.error(`[ROUTE_HANDLER] Hybrid evaluation failed: ${error.message}`)
      console.error(`[ROUTE_HANDLER] Error stack:`, error.stack)
    })
    console.log(`🔍 [ROUTE_DEBUG] Hybrid evaluateBrand call initiated (fast + background)`)

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