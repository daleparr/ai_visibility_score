// API: Subscribe to sector reports

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { industryReportsDB } from '@/lib/industry-reports/db';
import { SUBSCRIPTION_TIERS } from '@/lib/industry-reports/types';
import Stripe from 'stripe';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { sectorSlug, tier } = body;
    
    if (!sectorSlug || !tier) {
      return NextResponse.json(
        { success: false, error: 'sectorSlug and tier are required' },
        { status: 400 }
      );
    }
    
    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tier. Must be: free, pro, or enterprise' },
        { status: 400 }
      );
    }
    
    // Get sector
    const sector = await industryReportsDB.getSectorBySlug(sectorSlug);
    if (!sector) {
      return NextResponse.json(
        { success: false, error: 'Sector not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has subscription
    const existing = await industryReportsDB.checkUserAccess(session.user.id, sector.id);
    if (existing && existing.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Active subscription already exists' },
        { status: 400 }
      );
    }
    
    // Get tier config
    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    
    if (tier === 'free') {
      // Create free subscription directly
      const subscription = await industryReportsDB.createSubscription({
        userId: session.user.id,
        sectorId: sector.id,
        tier: 'free',
        status: 'active',
        canViewFullReports: false,
        canDownloadPdfs: false,
        canAccessArchive: false,
        archiveMonthsLimit: 1,
        canRequestCustomPrompts: false,
        apiAccessEnabled: false,
        priceMonthly: 0,
        currency: 'GBP',
        billingInterval: 'monthly',
        startedAt: new Date(),
      });
      
      return NextResponse.json({
        success: true,
        subscription,
        message: 'Free subscription activated',
      });
    }
    
    // For paid tiers, create Stripe checkout session
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${sector.name} - ${tierConfig.name}`,
              description: `Monthly subscription to ${sector.name} AI Brand Visibility Reports`,
            },
            unit_amount: tierConfig.price * 100, // Convert to pence
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/reports/${sectorSlug}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/reports/${sectorSlug}?canceled=true`,
      metadata: {
        userId: session.user.id,
        sectorId: sector.id,
        tier,
      },
    });
    
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// GET endpoint to check user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: true, subscriptions: [] });
    }
    
    const subscriptions = await industryReportsDB.getUserSubscriptions(session.user.id);
    
    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

