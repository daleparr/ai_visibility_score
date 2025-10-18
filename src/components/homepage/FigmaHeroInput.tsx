'use client';

/**
 * Figma Hero Input Section
 * Matches exact Figma design with tier selector
 */

import { useState } from 'react';
import { Database, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FigmaHeroInput() {
  const [url, setUrl] = useState('');
  const [selectedTier, setSelectedTier] = useState<'quick' | 'full' | 'enterprise'>('full');
  const router = useRouter();

  const handleSubmit = () => {
    if (url) {
      router.push(`/evaluate?url=${encodeURIComponent(url)}&tier=${selectedTier}`);
    }
  };

  const tiers = [
    { id: 'quick' as const, label: 'Quick Scan', subtext: '$438 • 4 dimensions' },
    { id: 'full' as const, label: '💎 Full Audit', subtext: '$2,500 • Board-Ready' },
    { id: 'enterprise' as const, label: 'Enterprise', subtext: '$10,000 • M&A Ready' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto border" style={{ borderColor: 'var(--slate-200)' }}>
      {/* Tier Selector */}
      <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className="flex-1 px-4 py-3 rounded-lg transition-all text-center"
            style={{
              backgroundColor: selectedTier === tier.id ? 'white' : 'transparent',
              color: selectedTier === tier.id ? 'var(--slate-950)' : 'var(--slate-600)',
              fontWeight: selectedTier === tier.id ? 500 : 400,
              boxShadow: selectedTier === tier.id ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none',
            }}
          >
            <div className="text-sm md:text-base">{tier.label}</div>
            <div className="text-xs" style={{ color: 'var(--slate-500)' }}>{tier.subtext}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--slate-400)' }}
          >
            <Database className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter your website URL (e.g., example.com)"
            className="w-full pl-14 pr-6 py-4 md:py-5 rounded-xl text-base md:text-lg border-2 focus:outline-none transition-all"
            style={{
              borderColor: url ? '#d4a574' : 'var(--slate-200)',
              backgroundColor: 'var(--slate-50)',
              color: 'var(--slate-900)',
              fontWeight: 400
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!url}
          className="px-8 md:px-10 py-4 md:py-5 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--slate-950)',
            color: 'white',
            fontWeight: 500,
            fontSize: '1rem'
          }}
        >
          Get Benchmark Score
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Trust Signals */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-sm" style={{ color: 'var(--slate-600)' }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span>Board-ready • Multi-run averaging</span>
        </div>
        <div className="hidden md:block w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--slate-300)' }} />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
          <span>Statistical significance tested</span>
        </div>
      </div>
    </div>
  );
}

