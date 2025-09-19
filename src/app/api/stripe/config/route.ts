import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return public Stripe configuration (safe to expose)
    const config = {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
      priceIds: {
        professional: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || null,
        enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE || null
      },
      configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY),
      webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
      environment: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test'
    };
    
    return NextResponse.json(config);
    
  } catch (error) {
    console.error('Stripe config error:', error);
    
    return NextResponse.json({
      error: 'Failed to get Stripe configuration',
      configured: false
    }, { status: 500 });
  }
}