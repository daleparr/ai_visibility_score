// Industry Reports Landing Page with Figma Design

import { FigmaIndustryReportsPage } from '@/components/FigmaIndustryReportsPage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IndustryReportsPage() {
  // Use Figma design (will integrate CMS sector data later)
  return <FigmaIndustryReportsPage />;
}

/* OLD CMS VERSION - Will be enhanced with Figma design later
export async function OldIndustryReportsPage() {
  let sectors: any[] = [];
  let error: string | null = null;
  let heroHeadline, heroDescription, heroBadges, valueProps;
  
  try {
    // Fetch sectors from industry_report_sectors table (CMS-managed with lock status)
    const sectorsResult = await db.execute(
      sql`
        SELECT 
          sector_slug as slug,
          sector_name as name,
          sector_description as description,
          is_available,
          has_content,
          brand_count,
          monthly_price,
          badge_text,
          demo_cta_text,
          demo_cta_url,
          display_order
        FROM industry_report_sectors
        ORDER BY display_order, sector_name
      `
    );
    sectors = sectorsResult.rows as any;
    
    // Fetch from CMS
    heroHeadline = await contentManager.getBlockByKey('reports-landing', 'reports_hero_headline');
    heroDescription = await contentManager.getBlockByKey('reports-landing', 'reports_hero_description');
    heroBadges = await contentManager.getBlockByKey('reports-landing', 'reports_hero_badges');
    valueProps = await contentManager.getBlockByKey('reports-landing', 'reports_value_props');
  } catch (err) {
    console.error('Error loading sectors:', err);
    error = 'Failed to load sectors';
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">AI Discoverability Index</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-slate-300 hover:text-white transition flex items-center gap-2">
                <Home size={16} />
                Home
              </Link>
              <Link href="/evaluate" className="text-slate-300 hover:text-white transition">
                Get Your Score
              </Link>
              <Link href="/reports" className="text-emerald-400 font-medium flex items-center gap-2">
                <BarChart3 size={16} />
                Industry Reports
              </Link>
              <Link href="/leaderboards" className="text-slate-300 hover:text-white transition">
                Leaderboards
              </Link>
              <Link href="/auth/signin" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {heroHeadline?.text || 'Monthly AI Brand Visibility Reports'}
          </h1>
          <div 
            className="text-xl text-slate-300 mb-8"
            dangerouslySetInnerHTML={{ __html: heroDescription?.html || `Track how leading AI models recommend brands across ${sectors.length} industries.` }}
          />
          <div className="flex justify-center gap-4 mb-12">
            {heroBadges?.badges?.map((badge: string, idx: number) => (
              <span key={idx} className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-600/30">
                {badge}
              </span>
            )) || (
              <>
                <span className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-600/30">
                  4 AI Models Tracked
                </span>
                <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium border border-blue-600/30">
                  Monthly Updates
                </span>
                <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-full text-sm font-medium border border-purple-600/30">
                  Audit-Grade Data
                </span>
              </>
            )}
          </div>
        </div>

        {/* Value Propositions */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {(valueProps?.props || [
            {icon: "📊", title: "Brand Leaderboards", description: "See how your brand ranks in AI recommendations vs. competitors. Track month-over-month changes."},
            {icon: "🎯", title: "Emerging Threats", description: "Spot new competitors gaining AI visibility before they dominate your market."},
            {icon: "💡", title: "Actionable Insights", description: "Get specific recommendations to improve your brand's AI discoverability."}
          ]).map((prop: any, idx: number) => (
            <ValueProp
              key={idx}
              icon={prop.icon}
              title={prop.title}
              description={prop.description}
            />
          ))}
        </div>

        {/* Sectors Grid */}
        <div className="max-w-7xl mx-auto" id="sectors">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Choose Your Industry
          </h2>
          
          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 text-center mb-8">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {sectors.length === 0 && !error && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 text-center mb-8">
              <p className="text-yellow-400">No sectors configured yet. Please seed the database.</p>
            </div>
          )}
          
          {sectors.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectors.map((sector) => (
                <SectorCard key={sector.id} sector={sector} />
              ))}
            </div>
          )}
          
          {/* Demo Report CTA */}
          {sectors.length > 0 && (
            <div className="mt-12 text-center">
              <p className="text-slate-400 mb-4">Want to see a sample report first?</p>
              <Link
                href="/reports/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                <BarChart3 size={16} />
                View Demo Report
              </Link>
            </div>
          )}
        </div>

        {/* Social Proof */}
        <div className="mt-20 max-w-4xl mx-auto">
          <LogoDisplay 
            collectionKey="industry_leaders"
            title="Trusted by brand managers at leading companies"
            className="text-slate-400"
          />
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
          <BrowseReportsButton />
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

      <Footer />
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
    id?: string;
    slug: string;
    name: string;
    description: string;
    targetAudience?: string;
    is_available?: boolean;
    has_content?: boolean;
    brand_count?: number;
    monthly_price?: number;
    badge_text?: string;
    demo_cta_text?: string;
    demo_cta_url?: string;
  };
}

function SectorCard({ sector }: SectorCardProps) {
  // Check if sector is locked (not available)
  const isLocked = sector.is_available === false || !sector.has_content;
  
  if (isLocked) {
    // Locked sector - show demo CTA, not clickable to sector page
    return (
      <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-6 relative">
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30">
            🔒 {sector.badge_text || 'Coming Soon'}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-slate-300 mb-3">
          {sector.name}
        </h3>
        <p className="text-slate-500 text-sm mb-4">{sector.description}</p>
        
        {sector.brand_count && sector.brand_count > 0 && (
          <p className="text-xs text-slate-600 mb-4">
            {sector.brand_count} brands being analyzed
          </p>
        )}
        
        <Link
          href={sector.demo_cta_url || '/demo'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {sector.demo_cta_text || 'Request Demo for This Sector'}
          <span>→</span>
        </Link>
      </div>
    );
  }
  
  // Available sector - clickable to sector report
  return (
    <Link
      href={`/reports/${sector.slug}`}
      className="group bg-slate-800/50 border border-slate-700 hover:border-emerald-500 rounded-xl p-6 transition-all hover:scale-105"
    >
      <div className="absolute top-4 right-4">
        {sector.badge_text && (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
            {sector.badge_text}
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition">
        {sector.name}
      </h3>
      <p className="text-slate-400 text-sm mb-4">{sector.description}</p>
      
      {sector.brand_count && sector.brand_count > 0 && (
        <p className="text-xs text-emerald-400 mb-3">
          ✓ {sector.brand_count} brands analyzed
        </p>
      )}
      
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

