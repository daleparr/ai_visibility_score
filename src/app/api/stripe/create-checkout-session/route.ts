import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating checkout session...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('❌ No authenticated user session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, tier } = await request.json()
    console.log('📋 Request data:', { priceId, tier, userEmail: session.user.email })

    if (!priceId || !tier) {
      console.error('❌ Missing required fields:', { priceId, tier })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate price ID format
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      console.error('❌ Invalid price ID format:', priceId)
      return NextResponse.json({ error: 'Invalid price ID format' }, { status: 400 })
    }

    // Get or create user in database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (!user) {
      console.log('🔄 Creating new user in database:', session.user.email)
      // Create user if they don't exist
      const [newUser] = await db
        .insert(users)
        .values({
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || null,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning()
      
      user = newUser
      console.log('✅ User created successfully:', user.id)
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, user.id))
    }

    // Create checkout session
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/evaluate`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tier,
        },
      },
    })

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url 
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}