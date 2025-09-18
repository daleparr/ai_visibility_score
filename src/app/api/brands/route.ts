export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { neon } from '@netlify/neon'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export async function POST(request: NextRequest) {
  try {
    // Production debugging - check Netlify environment
    console.log('=== NETLIFY NEON DEBUG ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('NETLIFY_DATABASE_URL exists:', !!process.env.NETLIFY_DATABASE_URL)
    console.log('NETLIFY_DATABASE_URL_UNPOOLED exists:', !!process.env.NETLIFY_DATABASE_URL_UNPOOLED)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
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

    // Normalize industry to prevent constraint violations
    const industryNorm = String(industry || '').toLowerCase().replace(/[^a-z]/g, '')
    
    console.log('Creating brand:', { name, websiteUrl, industry: industryNorm, userId: sessionUser.id })

    let rows: any[]
    
    // Check if we're in Netlify environment (production)
    if (process.env.NETLIFY_DATABASE_URL || process.env.CONTEXT === 'production') {
      console.log('Using Netlify Neon extension')
      // Use Netlify Neon extension - automatically uses NETLIFY_DATABASE_URL
      const sql = neon()
      
      rows = await sql`
        INSERT INTO brands (id, name, website_url, description, industry, competitors, user_id, created_at, updated_at)
        VALUES (gen_random_uuid(), ${name}, ${websiteUrl}, ${description || null}, ${industryNorm || null}, ${JSON.stringify(competitors || [])}, ${sessionUser.id}, NOW(), NOW())
        RETURNING id, name, website_url
      `
    } else {
      console.log('Using local DATABASE_URL with pg client')
      // Local development - use regular pg client
      const { Client } = await import('pg')
      const client = new Client({ connectionString: process.env.DATABASE_URL })
      
      try {
        await client.connect()
        const result = await client.query(
          `INSERT INTO brands (id, name, website_url, description, industry, competitors, user_id, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
           RETURNING id, name, website_url`,
          [name, websiteUrl, description || null, industryNorm || null, JSON.stringify(competitors || []), sessionUser.id]
        )
        rows = result.rows
      } finally {
        await client.end()
      }
    }

    if (rows[0]) {
      console.log('✅ Brand created successfully:', rows[0])
      return NextResponse.json({ 
        success: true, 
        brand: rows[0],
        message: 'Brand created successfully' 
      })
    } else {
      console.log('❌ No brand returned from insert')
      return NextResponse.json({ error: 'Failed to create brand - no data returned' }, { status: 500 })
    }

  } catch (error) {
    console.log('❌ Error creating brand:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as any)?.code || 'UNKNOWN'
    
    return NextResponse.json({ 
      error: 'Failed to create brand',
      details: errorMessage,
      code: errorCode
    }, { status: 500 })
  }
}