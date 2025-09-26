import { db } from '@/lib/db'
import { users, subscriptions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export type SubscriptionTier = 'free' | 'index-pro' | 'enterprise'

export interface UserSubscription {
  tier: SubscriptionTier
  status: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

export async function getUserSubscription(userEmail: string): Promise<UserSubscription> {
  try {
    // Get user with their subscription
    const result = await db
      .select({
        user: users,
        subscription: subscriptions,
      })
      .from(users)
      .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
      .where(eq(users.email, userEmail))
      .limit(1)

    const userRecord = result[0]

    if (!userRecord?.user) {
      return {
        tier: 'free',
        status: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
      }
    }

    const subscription = userRecord.subscription

    // If no subscription or inactive subscription, user is on free tier
    if (!subscription || !isActiveSubscription(subscription.status)) {
      return {
        tier: 'free',
        status: subscription?.status || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        stripeCustomerId: userRecord.user.stripeCustomerId,
      }
    }

    return {
      tier: subscription.tier as SubscriptionTier,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
      stripeCustomerId: userRecord.user.stripeCustomerId,
    }

  } catch (error) {
    console.error('Error getting user subscription:', error)
    return {
      tier: 'free',
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
    }
  }
}

export function isActiveSubscription(status: string | null): boolean {
  return status === 'active' || status === 'trialing'
}

export function canAccessFeature(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    free: 0,
    'index-pro': 1,
    enterprise: 2,
  }

  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

export function getFeatureAccess(tier: SubscriptionTier) {
  return {
    // Free tier features
    basicAnalysis: true,
    gpt4Testing: true,
    basicReports: true,
    
    // Professional tier features
    multiModelTesting: canAccessFeature(tier, 'index-pro'),
    advancedAnalytics: canAccessFeature(tier, 'index-pro'),
    leaderboardAccess: canAccessFeature(tier, 'index-pro'),
    prioritySupport: canAccessFeature(tier, 'index-pro'),
    
    // Enterprise tier features
    customIntegrations: canAccessFeature(tier, 'enterprise'),
    dedicatedSupport: canAccessFeature(tier, 'enterprise'),
    advancedReporting: canAccessFeature(tier, 'enterprise'),
    apiAccess: canAccessFeature(tier, 'enterprise'),
  }
}

export function getUpgradeMessage(currentTier: SubscriptionTier): string {
  switch (currentTier) {
    case 'free':
      return 'Upgrade to Index Pro for multi-model testing and leaderboard access'
    case 'index-pro':
      return 'Upgrade to Enterprise for custom integrations and dedicated support'
    case 'enterprise':
      return 'You have access to all features'
    default:
      return 'Upgrade for more features'
  }
}