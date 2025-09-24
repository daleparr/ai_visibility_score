import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrands } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const brands = await getBrands(sessionUser.id)
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}