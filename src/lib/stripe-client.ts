'use client'

import { useSession, signIn } from 'next-auth/react'

export async function createCheckoutSession(tier: 'professional' | 'enterprise') {
  try {
    // Check if user is authenticated first
    const response = await fetch('/api/auth/session')
    const session = await response.json()
    
    if (!session?.user?.email) {
      console.log('🔐 User not authenticated, redirecting to sign in...')
      alert('Please sign in to upgrade your subscription.')
      signIn('google', { callbackUrl: window.location.href })
      return
    }
    
    console.log('✅ User authenticated:', session.user.email)

    // Get price ID from environment or use fallback for development
    let priceId = tier === 'professional'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE

    // Fallback price IDs for development/testing
    if (!priceId) {
      console.warn(`Price ID not configured for ${tier} tier, using fallback`)
      priceId = tier === 'professional'
        ? 'price_1QKqGJP7VqU7bNcLQXKqGJP7' // Fallback for professional
        : 'price_1QKqGKP7VqU7bNcLQXKqGKP7' // Fallback for enterprise
    }

    const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        tier,
      }),
    })

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json()
      console.error('❌ Checkout session creation failed:', error)
      throw new Error(error.error || 'Failed to create checkout session')
    }

    const { url } = await checkoutResponse.json()
    console.log('✅ Checkout session created successfully:', { url })
    
    if (url) {
      window.location.href = url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert(`Unable to start checkout: ${errorMessage}`)
    
    throw error
  }
}

export async function createCustomerPortalSession() {
  try {
    const response = await fetch('/api/stripe/customer-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create customer portal session')
    }

    const { url } = await response.json()
    
    if (url) {
      window.location.href = url
    } else {
      throw new Error('No portal URL returned')
    }
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw error
  }
}

export function getUpgradeButtonText(currentTier: string): string {
  switch (currentTier) {
    case 'free':
      return 'Upgrade to Index Pro - £119/month'
    case 'professional':
      return 'Upgrade to Enterprise - £319/month'
    case 'enterprise':
      return 'Manage Subscription'
    default:
      return 'Upgrade Now'
  }
}

export function getUpgradeAction(currentTier: string): () => Promise<void> {
  switch (currentTier) {
    case 'free':
      return () => createCheckoutSession('professional')
    case 'professional':
      return () => createCheckoutSession('enterprise')
    case 'enterprise':
      return () => createCustomerPortalSession()
    default:
      return () => createCheckoutSession('professional')
  }
}