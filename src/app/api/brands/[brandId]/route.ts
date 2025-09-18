export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { neon } from '@netlify/neon'

export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brandId } = params

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID required' }, { status: 400 })
    }

    // Check if we're in Netlify environment (production)
    if (process.env.NETLIFY_DATABASE_URL || process.env.CONTEXT === 'production') {
      // Use Netlify Neon extension
      const sql = neon()
      
      const rows = await sql`
        SELECT id, name, website_url, industry, description, created_at
        FROM brands 
        WHERE id = ${brandId} AND user_id = ${sessionUser.id}
      `

      if (rows[0]) {
        return NextResponse.json({ 
          success: true, 
          brand: rows[0]
        })
      } else {
        return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
      }
    } else {
      // Local development - use regular pg client
      const { Client } = await import('pg')
      const client = new Client({ connectionString: process.env.DATABASE_URL })
      
      try {
        await client.connect()
        const result = await client.query(
          `SELECT id, name, website_url, industry, description, created_at
           FROM brands 
           WHERE id = $1 AND user_id = $2`,
          [brandId, sessionUser.id]
        )
        
        if (result.rows[0]) {
          return NextResponse.json({ 
            success: true, 
            brand: result.rows[0]
          })
        } else {
          return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
        }
      } finally {
        await client.end()
      }
    }

  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch brand',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}