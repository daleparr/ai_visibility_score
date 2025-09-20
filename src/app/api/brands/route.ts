export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, users } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { createBrand } from '@/lib/database'
import { LeaderboardPopulationService } from '@/lib/leaderboard-population-service'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const normalizeUrl = (u: string): string | null => {
  try {
    const nu = u?.startsWith('http') ? u : `https://${u}`
    const parsed = new URL(nu)
    return parsed.origin + parsed.pathname.replace(/\/+$/, '')
  } catch {
    return null
  }
}
const extractBrandFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '')
    return domain.split('.')[0].replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  } catch {
    return 'Unknown Brand'
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== BRAND API DEBUG (Drizzle) ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)

    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined

    if (!sessionUser?.id) {
      console.log('❌ No user ID in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { name, websiteUrl, description, industry, competitors } = body || {}

    if (!name || !websiteUrl) {
      return NextResponse.json({ error: 'name and websiteUrl required' }, { status: 400 })
    }

    // Normalize inputs
    const industryNorm: string | null = String(industry || '')
      .toLowerCase()
      .replace(/[^a-z]/g, '') || null

    const competitorsNorm: string[] = Array.isArray(competitors)
      ? (competitors as string[]).map(String).map(s => s.trim()).filter(Boolean)
      : typeof competitors === 'string'
        ? (competitors as string).split(',').map(s => s.trim()).filter(Boolean)
        : []

    const normalizedCompetitorUrls = competitorsNorm
      .map(normalizeUrl)
      .filter((u): u is string => !!u)

    // Ensure user exists (FK for brands.user_id)
    console.log('🔍 Ensuring user exists in DB...', { userId: sessionUser.id, email: sessionUser.email })
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, sessionUser.id)).limit(1)
    if (!existing[0]) {
      await db.insert(users).values({
        id: sessionUser.id,
        email: sessionUser.email || `${sessionUser.id}@unknown.local`,
        name: sessionUser.name || null
      })
      console.log('✅ User inserted')
    } else {
      console.log('ℹ️ User already exists')
    }

    // Create brand via typed helper (targets production schema automatically)
    console.log('🏢 Creating brand via Drizzle helper...')
    const brandRecord = await createBrand({
      userId: sessionUser.id,
      name,
      websiteUrl,
      description: description || null,
      industry: industryNorm,
      competitors: normalizedCompetitorUrls
    } as any)

    if (!brandRecord) {
      console.log('❌ Brand creation returned null')
      return NextResponse.json({ error: 'Failed to create brand - no data returned' }, { status: 500 })
    }

    // Enqueue competitor evaluations (non-blocking DB ops only)
    let competitorQueueCount = 0
    if (normalizedCompetitorUrls.length > 0) {
      try {
        const service = LeaderboardPopulationService.getInstance()
        await Promise.all(
          normalizedCompetitorUrls.map((url) =>
            service.handleCompetitorAdded(
              sessionUser.id!,
              brandRecord.id!,
              url,
              extractBrandFromUrl(url)
            )
          )
        )
        competitorQueueCount = normalizedCompetitorUrls.length
        console.log(`📝 Enqueued ${competitorQueueCount} competitors for evaluation`)
      } catch (e) {
        console.error('⚠️ Failed to enqueue competitors:', e)
      }
    }

    console.log('✅ Brand created:', { id: brandRecord.id, name: brandRecord.name })
    return NextResponse.json({
      success: true,
      brand: {
        id: brandRecord.id,
        name: brandRecord.name,
        website_url: brandRecord.websiteUrl
      },
      competitorQueueCount,
      message: 'Brand created successfully'
    })
  } catch (error: any) {
    console.error('❌ Error creating brand:', error)
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN'
    return NextResponse.json(
      {
        error: 'Failed to create brand',
        details: errorMessage,
        code: errorCode
      },
      { status: 500 }
    )
  }
}