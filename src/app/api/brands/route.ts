import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBrand } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('=== BRAND CREATION API DEBUG ===')
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    
    const session = await getServerSession(authOptions)
    console.log('Session user ID:', session?.user ? 'found' : 'missing')
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      console.log('❌ No user ID in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandData = await request.json()
    console.log('Brand data received:', { name: brandData.name, websiteUrl: brandData.websiteUrl })
    
    // Ensure the brand is associated with the authenticated user
    const brandWithUserId = {
      ...brandData,
      userId: sessionUser.id
    }

    console.log('Attempting to create brand in database...')
    const newBrand = await createBrand(brandWithUserId)
    console.log('Brand creation result:', newBrand ? 'success' : 'failed')
    
    if (!newBrand) {
      return NextResponse.json({ error: 'Failed to create brand - database returned null' }, { status: 500 })
    }

    console.log('✅ Brand created successfully:', newBrand.id)
    return NextResponse.json({ brand: newBrand })
  } catch (error: any) {
    console.error('❌ Error creating brand:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    return NextResponse.json({
      error: 'Failed to create brand',
      details: error.message,
      code: error.code || error.name
    }, { status: 500 })
  }
}