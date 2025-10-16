// Industry Reports Landing Page

import Link from 'next/link';
import { industryReportsDB } from '@/lib/industry-reports/db';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IndustryReportsPage() {
  const sectors = await industryReportsDB.getSectors(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Monthly AI Brand Visibility Reports
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Track how leading AI models recommend brands across {sectors.length} industries.
            Data-driven insights for CMOs, brand strategists, and marketing executives.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <span className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-600/30">
              4 AI Models Tracked
            </span>
            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30">
              Monthly Updates
            </span>
            <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium border border-purple-600/30">
              Audit-Grade Data
            </span>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <ValueProp
            icon="📊"
            title="Brand Leaderboards"
            description="See how your brand ranks in AI recommendations vs. competitors. Track month-over-month changes."
          />
          <ValueProp
            icon="🎯"
            title="Emerging Threats"
            description="Spot new competitors gaining AI visibility before they dominate your market."
          />
          <ValueProp
            icon="💡"
            title="Actionable Insights"
            description="Get specific recommendations to improve your brand's AI discoverability."
          />
        </div>

        {/* Sectors Grid */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Industry
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <SectorCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <p className="text-slate-400 mb-8">
            Trusted by brand managers at leading companies
          </p>
          <div className="flex justify-center gap-8 flex-wrap opacity-50">
            <div className="text-2xl font-bold text-slate-500">BRAND 1</div>
            <div className="text-2xl font-bold text-slate-500">BRAND 2</div>
            <div className="text-2xl font-bold text-slate-500">BRAND 3</div>
            <div className="text-2xl font-bold text-slate-500">BRAND 4</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 max-w-3xl mx-auto bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Start with a Free Preview
          </h3>
          <p className="text-lg text-emerald-50 mb-8">
            Get executive summaries and top 10 brand rankings for any sector.
            Upgrade for full leaderboards, archive access, and PDF exports.
          </p>
          <Link
            href="/reports#sectors"
            className="inline-block px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition"
          >
            Browse Reports
          </Link>
        </div>
      </div>

      {/* Pricing Tiers (Brief) */}
      <div className="border-t border-slate-700 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pricing Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              tier="Free"
              price="£0"
              features={[
                'Executive summary',
                'Top 10 leaderboard',
                '1 month archive',
              ]}
            />
            <PricingCard
              tier="Index Pro"
              price="£119"
              period="/sector/month"
              features={[
                'Full leaderboard (50+ brands)',
                '12 month archive',
                'PDF downloads',
                'Weekly trend alerts',
              ]}
              highlighted
            />
            <PricingCard
              tier="Enterprise"
              price="£319"
              period="/sector/month"
              features={[
                'Brand-specific deep dives',
                'Custom prompt requests',
                'API access',
                'Quarterly strategy calls',
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}

interface SectorCardProps {
  sector: {
    id: string;
    slug: string;
    name: string;
    description: string;
    targetAudience?: string;
  };
}

function SectorCard({ sector }: SectorCardProps) {
  return (
    <Link
      href={`/reports/${sector.slug}`}
      className="group bg-slate-800/50 border border-slate-700 hover:border-emerald-500 rounded-xl p-6 transition-all hover:scale-105"
    >
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition">
        {sector.name}
      </h3>
      <p className="text-slate-400 text-sm mb-4">{sector.description}</p>
      {sector.targetAudience && (
        <p className="text-xs text-slate-500">
          <span className="text-emerald-400">For:</span> {sector.targetAudience}
        </p>
      )}
      <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
        View Latest Report <span className="ml-2">→</span>
      </div>
    </Link>
  );
}

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

function PricingCard({ tier, price, period, features, highlighted }: PricingCardProps) {
  return (
    <div
      className={`rounded-xl p-8 ${
        highlighted
          ? 'bg-gradient-to-b from-emerald-600/20 to-blue-600/20 border-2 border-emerald-500'
          : 'bg-slate-800/50 border border-slate-700'
      }`}
    >
      {highlighted && (
        <div className="text-xs font-semibold text-emerald-400 mb-2">MOST POPULAR</div>
      )}
      <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">{price}</span>
        {period && <span className="text-slate-400">{period}</span>}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-slate-300">
            <span className="text-emerald-400 mr-2">✓</span>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 rounded-lg font-semibold transition ${
          highlighted
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-slate-700 text-white hover:bg-slate-600'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

