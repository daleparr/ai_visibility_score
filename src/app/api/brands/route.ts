export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Client } from 'pg'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  
  try {
    // Production debugging - check environment in Netlify
    console.log('=== PRODUCTION DATABASE DEBUG ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) || 'undefined')
    console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
    
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
    const slug = slugify(name)
    

    await client.connect()
    
    // Insert brand into database
    const { rows } = await client.query(
      `INSERT INTO brands (id, name, website_url, description, industry, competitors, user_id, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, name, website_url`,
      [name, websiteUrl, description || null, industryNorm || null, JSON.stringify(competitors || []), sessionUser.id]
    )

    if (rows[0]) {
      console.log('✅ Brand created/updated successfully:', rows[0].id)
      return NextResponse.json({ brand: rows[0] })
    }

    return NextResponse.json({ error: 'Failed to create brand - no rows returned' }, { status: 500 })

  } catch (error: any) {
    console.error('❌ Error creating brand:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    return NextResponse.json({ 
      error: 'Failed to create brand', 
      details: error.message,
      code: error.code || error.name
    }, { status: error.code === '23505' ? 409 : 500 })
  } finally {
    await client.end()
  }
}