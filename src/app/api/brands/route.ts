import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBrand } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brandData = await request.json()
    
    // Ensure the brand is associated with the authenticated user
    const brandWithUserId = {
      ...brandData,
      userId: sessionUser.id
    }

    const newBrand = await createBrand(brandWithUserId)
    
    if (!newBrand) {
      return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
    }

    return NextResponse.json({ brand: newBrand })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}