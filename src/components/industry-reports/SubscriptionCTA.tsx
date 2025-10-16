'use client';

// Subscription CTA Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionCTAProps {
  sectorSlug: string;
  sectorName: string;
}

export function SubscriptionCTA({ sectorSlug, sectorName }: SubscriptionCTAProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleSubscribe = async (tier: 'pro' | 'enterprise') => {
    setLoading(tier);
    
    try {
      const response = await fetch('/api/industry-reports/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectorSlug, tier }),
      });
      
      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success && data.subscription) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to create subscription');
        setLoading(null);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription');
      setLoading(null);
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-3">
          Unlock Full {sectorName} Insights
        </h3>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          You're viewing the free preview. Upgrade to access the complete leaderboard,
          archive reports, and actionable recommendations.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Pro Tier */}
        <div className="bg-slate-900/50 border-2 border-emerald-500 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-sm font-medium text-emerald-400 mb-1">MOST POPULAR</div>
            <div className="text-4xl font-bold text-white mb-2">$99</div>
            <div className="text-slate-400">/month for this sector</div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <Feature text="Full leaderboard (50+ brands)" />
            <Feature text="12-month report archive" />
            <Feature text="Downloadable PDF reports" />
            <Feature text="Weekly trend alerts" />
            <Feature text="Brand comparison tools" />
          </ul>
          
          <button
            onClick={() => handleSubscribe('pro')}
            disabled={loading !== null}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
          </button>
        </div>
        
        {/* Enterprise Tier */}
        <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-sm font-medium text-purple-400 mb-1">ENTERPRISE</div>
            <div className="text-4xl font-bold text-white mb-2">$499</div>
            <div className="text-slate-400">/month for this sector</div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <Feature text="All Pro features" />
            <Feature text="Brand-specific deep dives" />
            <Feature text="Custom prompt requests" />
            <Feature text="Raw data API access" />
            <Feature text="Quarterly strategy calls" />
          </ul>
          
          <button
            onClick={() => handleSubscribe('enterprise')}
            disabled={loading !== null}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'enterprise' ? 'Processing...' : 'Upgrade to Enterprise'}
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-400">
        💳 Secure payment via Stripe • Cancel anytime • All prices in USD
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-slate-300">
      <span className="text-emerald-400 text-lg">✓</span>
      <span>{text}</span>
    </li>
  );
}

