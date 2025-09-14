import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

/**
 * ADI Benchmarks API
 * GET /api/adi/benchmarks - Retrieve industry benchmarks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industryId = searchParams.get('industryId')
    const dateRange = searchParams.get('dateRange')
    const includePrivate = searchParams.get('includePrivate') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Validate API access
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key required' },
        { status: 401 }
      )
    }

    // Validate subscription and rate limits
    const subscription = await validateAPIAccess(apiKey)
    if (!subscription.valid) {
      return NextResponse.json(
        { success: false, error: subscription.error },
        { status: subscription.status }
      )
    }

    const supabase = supabaseAdmin

    // Build query
    let query = supabase
      .from('adi_benchmarks')
      .select(`
        *,
        adi_industries (
          id,
          name,
          category,
          description
        )
      `)
      .order('benchmark_date', { ascending: false })
      .limit(limit)

    if (industryId) {
      query = query.eq('industry_id', industryId)
    }

    if (dateRange) {
      const [start, end] = dateRange.split(',')
      if (start) query = query.gte('benchmark_date', start)
      if (end) query = query.lte('benchmark_date', end)
    }

    const { data: benchmarks, error } = await query

    if (error) {
      console.error('Benchmark query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch benchmarks' },
        { status: 500 }
      )
    }

    // Log API usage
    await logAPIUsage(subscription.userId, 'GET', '/api/adi/benchmarks', benchmarks?.length || 0)

    // Transform data for API response
    const transformedBenchmarks = benchmarks?.map(benchmark => ({
      id: benchmark.id,
      industry: {
        id: benchmark.adi_industries?.id,
        name: benchmark.adi_industries?.name,
        category: benchmark.adi_industries?.category
      },
      benchmarkDate: benchmark.benchmark_date,
      statistics: {
        totalBrands: benchmark.total_brands_evaluated,
        median: benchmark.median_score,
        percentiles: {
          p25: benchmark.p25_score,
          p75: benchmark.p75_score,
          p90: benchmark.p90_score
        },
        topPerformer: benchmark.top_performer_score
      },
      dimensionMedians: benchmark.dimension_medians,
      methodologyVersion: benchmark.methodology_version
    }))

    return NextResponse.json({
      success: true,
      data: transformedBenchmarks,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0',
        rateLimit: {
          remaining: subscription.remainingCalls,
          resetTime: subscription.resetTime
        }
      }
    })

  } catch (error) {
    console.error('Benchmarks API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/adi/benchmarks - Create new benchmark (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const adminKey = request.headers.get('x-admin-key')
    
    if (!apiKey || !adminKey) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 401 }
      )
    }

    // Validate admin access
    const isAdmin = await validateAdminAccess(adminKey)
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { industryId, benchmarkData } = body

    const supabase = supabaseAdmin

    const { data: benchmark, error } = await supabase
      .from('adi_benchmarks')
      .insert({
        industry_id: industryId,
        benchmark_date: new Date().toISOString().split('T')[0],
        total_brands_evaluated: benchmarkData.totalBrands,
        median_score: benchmarkData.median,
        p25_score: benchmarkData.p25,
        p75_score: benchmarkData.p75,
        p90_score: benchmarkData.p90,
        top_performer_score: benchmarkData.topPerformer,
        dimension_medians: benchmarkData.dimensionMedians,
        methodology_version: 'ADI-v1.0'
      })
      .select()
      .single()

    if (error) {
      console.error('Benchmark creation error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create benchmark' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: benchmark,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: 'ADI-v1.0'
      }
    })

  } catch (error) {
    console.error('Benchmark creation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
async function validateAPIAccess(apiKey: string) {
  try {
    const supabase = supabaseAdmin
    
    // Find user by API key (in production, this would be properly encrypted)
    const { data: subscription, error } = await supabase
      .from('adi_subscriptions')
      .select('*')
      .eq('stripe_customer_id', apiKey) // Simplified for demo
      .eq('is_active', true)
      .single()

    if (error || !subscription) {
      return { valid: false, error: 'Invalid API key', status: 401 }
    }

    if (!subscription.api_access_enabled) {
      return { valid: false, error: 'API access not enabled', status: 403 }
    }

    // Check rate limits
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('adi_api_usage')
      .select('request_count')
      .eq('user_id', subscription.user_id)
      .eq('usage_date', today)
      .single()

    const dailyLimit = getDailyLimit(subscription.tier)
    const currentUsage = usage?.request_count || 0

    if (currentUsage >= dailyLimit) {
      return { valid: false, error: 'Rate limit exceeded', status: 429 }
    }

    return {
      valid: true,
      userId: subscription.user_id,
      subscriptionId: subscription.id,
      tier: subscription.tier,
      remainingCalls: dailyLimit - currentUsage,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }

  } catch (error) {
    console.error('API validation error:', error)
    return { valid: false, error: 'Validation failed', status: 500 }
  }
}

async function validateAdminAccess(adminKey: string): Promise<boolean> {
  // In production, this would validate against secure admin credentials
  return adminKey === process.env.ADI_ADMIN_KEY
}

async function logAPIUsage(
  userId: string,
  method: string,
  endpoint: string,
  responseSize: number
) {
  try {
    const supabase = supabaseAdmin
    const today = new Date().toISOString().split('T')[0]

    // Update or insert usage record
    const { error } = await supabase
      .from('adi_api_usage')
      .upsert({
        user_id: userId,
        endpoint,
        method,
        request_count: 1,
        response_size_bytes: responseSize,
        response_time_ms: 0, // Would be calculated in production
        status_code: 200,
        usage_date: today
      }, {
        onConflict: 'user_id,usage_date,endpoint',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Failed to log API usage:', error)
    }
  } catch (error) {
    console.error('API usage logging error:', error)
  }
}

function getDailyLimit(tier: string): number {
  const limits = {
    free: 0,
    professional: 1000,
    enterprise: 10000
  }
  return limits[tier as keyof typeof limits] || 0
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}