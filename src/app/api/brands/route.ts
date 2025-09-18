export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, brands } from '@/lib/db'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    console.log('=== BRAND CREATION API DEBUG ===')
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL)
    
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      console.log('❌ No user ID in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, websiteUrl, description, industry, competitors } = await request.json()
    
    if (!name || !websiteUrl) {
      return NextResponse.json({ error: 'name and websiteUrl required' }, { status: 400 })
    }

    console.log('Creating brand:', { name, websiteUrl, userId: sessionUser.id })

    // Check if brand already exists for this user
    const existing = await db.select().from(brands)
      .where(and(eq(brands.name, name), eq(brands.userId, sessionUser.id)))
      .limit(1)
    
    if (existing.length > 0) {
      console.log('Brand already exists, returning existing:', existing[0].id)
      return NextResponse.json({ brand: existing[0] })
    }

    // Create new brand
    const brandData = {
      name,
      websiteUrl,
      industry,
      description,
      competitors,
      userId: sessionUser.id
    }

    const result = await db.insert(brands).values(brandData).returning()
    
    if (result && result.length > 0) {
      console.log('✅ Brand created successfully:', result[0].id)
      return NextResponse.json({ brand: result[0] })
    }

    console.log('❌ Insert returned empty result')
    return NextResponse.json({ error: 'Failed to create brand - insert returned empty' }, { status: 500 })

  } catch (error: any) {
    console.error('❌ Error creating brand:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    return NextResponse.json({ 
      error: 'Failed to create brand', 
      details: error.message,
      code: error.code || error.name
    }, { status: error.code === '23505' ? 409 : 500 })
  }
}