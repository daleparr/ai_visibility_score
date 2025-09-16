const Stripe = require('stripe')

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// AIDI Product Configuration
export const AIDI_PRODUCTS = {
  professional: {
    name: 'AIDI Index Pro',
    description: 'Professional AI discoverability analysis with multi-model testing',
    price: 11900, // £119.00 in pence
    currency: 'gbp',
    lookup_key: 'aidi_index_pro',
    features: [
      'Testing across 5+ AI models (ChatGPT, Claude, Gemini)',
      'PDF & Excel exports',
      'Detailed optimization guides', 
      'Industry benchmarking',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'AIDI Enterprise',
    description: 'Complete AI discoverability mastery with competitive intelligence',
    price: 31900, // £319.00 in pence
    currency: 'gbp',
    lookup_key: 'aidi_enterprise',
    features: [
      'Everything in Professional',
      'AIDI leaderboard access',
      'Market insights & trends',
      'Historical tracking and progress monitoring',
      'White-label reporting',
      'Dedicated account manager'
    ]
  }
} as const

export type AIDITier = keyof typeof AIDI_PRODUCTS

// Helper function to get product by tier
export function getProductByTier(tier: AIDITier) {
  return AIDI_PRODUCTS[tier]
}

// Helper function to get tier by Stripe price ID
export function getTierByPriceId(priceId: string): AIDITier | null {
  // This will be populated once we create the products in Stripe
  const priceToTierMap: Record<string, AIDITier> = {
    // Will be filled with actual Stripe price IDs
  }
  
  return priceToTierMap[priceId] || null
}

// Stripe webhook event types we care about
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated', 
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
] as const