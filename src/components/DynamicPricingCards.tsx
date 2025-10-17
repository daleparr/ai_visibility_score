'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  id: string;
  tier_key: string;
  tier_name: string;
  price_amount: number;
  price_currency: string;
  billing_period: string;
  is_active: boolean;
  is_visible_public: boolean;
  requires_auth: boolean;
  access_level: string;
  badge_text?: string;
  description?: string;
  features: TierFeature[];
}

interface TierFeature {
  feature_key: string;
  feature_name: string;
  feature_limit?: string;
}

interface DynamicPricingCardsProps {
  className?: string;
}

export function DynamicPricingCards({ className = '' }: DynamicPricingCardsProps) {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTiers();
  }, []);

  const loadTiers = async () => {
    try {
      const response = await fetch('/api/pricing/tiers');
      const data = await response.json();
      setTiers(data.tiers || []);
      setIsAuthenticated(data.user_authenticated || false);
    } catch (error) {
      console.error('Failed to load pricing tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`text-center py-12 ${className}`}>Loading pricing...</div>;
  }

  if (tiers.length === 0) {
    return null;
  }

  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {tiers.map((tier) => (
        <Card 
          key={tier.id} 
          className={`relative ${tier.badge_text ? 'border-brand-300 shadow-lg' : ''}`}
        >
          {tier.badge_text && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-brand-600 text-white px-4 py-1">
                {tier.badge_text}
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{tier.tier_name}</CardTitle>
            <div className="text-4xl font-bold text-brand-600">
              {tier.price_currency === 'GBP' && '£'}
              {tier.price_currency === 'USD' && '$'}
              {tier.price_currency === 'EUR' && '€'}
              {Number(tier.price_amount || 0).toLocaleString()}
            </div>
            <CardDescription>
              {tier.billing_period === 'monthly' && 'per month'}
              {tier.billing_period === 'annual' && 'per year'}
              {tier.billing_period === 'one-time' && 'one-time'}
              {tier.billing_period === 'quarterly' && 'per quarter'}
            </CardDescription>
            {tier.description && (
              <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
            )}
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    {feature.feature_name}
                    {feature.feature_limit && (
                      <span className="text-gray-500 ml-1">({feature.feature_limit})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            
            {tier.requires_auth && !isAuthenticated ? (
              <Button className="w-full" variant="outline" asChild>
                <Link href="/auth/signin">
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In to Access
                </Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link href={`/checkout?tier=${tier.tier_key}`}>
                  {tier.billing_period === 'one-time' ? 'Get Started' : 'Subscribe Now'}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Upsell message for anonymous users */}
      {!isAuthenticated && tiers.length < 6 && (
        <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
          <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Lock className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">More Options Available</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign in to see additional pricing tiers including monthly subscriptions and enterprise packages
            </p>
            <Button variant="outline" asChild>
              <Link href="/auth/signin">
                View All Pricing Options
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

