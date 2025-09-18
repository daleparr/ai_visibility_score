import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/database'
import { getUserSubscription } from '@/lib/subscription-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Type assertion for session user with id (added by auth callback)
    const sessionUser = session?.user as { id?: string; name?: string; email?: string; image?: string } | undefined
    
    if (!sessionUser?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load user profile and subscription with error handling
    let profileData = null
    let subscriptionData = null
    
    try {
      profileData = await getUserProfile(sessionUser.id)
    } catch (error) {
      console.warn('Failed to load user profile:', error)
    }
    
    try {
      subscriptionData = await getUserSubscription(session.user.email)
    } catch (error) {
      console.warn('Failed to load subscription:', error)
    }

    return NextResponse.json({ 
      profile: profileData,
      subscription: subscriptionData 
    })
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 })
  }
}