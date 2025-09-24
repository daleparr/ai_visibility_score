import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBrands, getEvaluations } from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all brands for the user first
    const brands = await getBrands(sessionUser.id)
    
    // Get evaluations for all brands
    const allEvaluations = []
    for (const brand of brands) {
      try {
        const evaluations = await getEvaluations(brand.id)
        allEvaluations.push(...evaluations)
      } catch (error) {
        console.warn(`Failed to load evaluations for brand ${brand.id}:`, error)
      }
    }

    return NextResponse.json({ evaluations: allEvaluations })
  } catch (error) {
    console.error('Error fetching evaluations:', error)
    return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 })
  }
}