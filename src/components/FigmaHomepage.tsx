/**
 * AIDI Homepage — Figma Design with CMS Integration
 * Light Theme, Audit-Grade Authority
 * 
 * This component integrates the Figma design with existing CMS functionality
 */

import { CheckCircle2, BarChart3, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { contentManager } from '@/lib/cms/cms-client';
import { FigmaHeroInput } from './homepage/FigmaHeroInput';
import { AIModelLogos } from './AIModelLogos';
import { FigmaHomepageClient } from './FigmaHomepageClient';

export async function FigmaHomepage() {
  // Fetch CMS content
  let heroHeadline, heroSubhead, heroDescription, trustIndicators, pricingTiers, footerAbout, threePillars, evaluationFormConfig;
  
  try {
    heroHeadline = await contentManager.getBlockByKey('homepage', 'hero_headline');
    heroSubhead = await contentManager.getBlockByKey('homepage', 'hero_subhead');
    heroDescription = await contentManager.getBlockByKey('homepage', 'hero_description');
    trustIndicators = await contentManager.getBlockByKey('homepage', 'trust_indicators');
    pricingTiers = await contentManager.getBlockByKey('homepage', 'pricing_tiers');
    footerAbout = await contentManager.getBlockByKey('homepage', 'footer_about');
    threePillars = await contentManager.getBlockByKey('homepage', 'three_pillars_cards');
    evaluationFormConfig = await contentManager.getBlockByKey('homepage', 'evaluation_form_config');
  } catch (error) {
    console.error('Error loading CMS content:', error);
  }

  // Process pricing tiers from CMS
  const tiers = pricingTiers?.content?.tiers || [
    {
      id: 'quick',
      name: 'Quick Scan',
      price: '$438',
      features: ['4 core dimensions', '2-day turnaround', 'Baseline report'],
      badge: 'Foundation',
      recommended: false,
    },
    {
      id: 'full',
      name: 'Full Audit',
      price: '$2,500',
      features: ['Board-ready report', 'Multi-run averaging', '95% confidence intervals'],
      badge: 'Most Popular',
      recommended: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$30,000',
      features: ['M&A-grade diligence', 'Continuous monitoring', 'Peer benchmarking'],
      badge: 'Strategic',
      recommended: false,
    },
  ];

  const aiModels = [
    { name: 'OpenAI', icon: '🤖', active: true },
    { name: 'Anthropic', icon: '🧠', active: true },
    { name: 'Google', icon: '🔍', active: true },
    { name: 'Perplexity', icon: '🔬', active: true },
  ];

  const methodologyPoints = [
    'Full-site deep crawl with credentialed access',
    'Standardized, locked testing framework',
    'Brand-agnostic, category-generic queries',
    'Multi-run averaging (n≥3) with 95% CI',
    'Percentile rankings vs. industry benchmarks',
    'Peer-reviewable, published methodology',
  ];

  const trustStats = [
    { value: '4+', label: 'AI Models Tested', sublabel: 'Frontier systems' },
    { value: '12', label: 'Dimensions', sublabel: 'Analyzed' },
    { value: '95%', label: 'Confidence', sublabel: 'Intervals' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky Light Header */}
      <FigmaHomepageClient>
        {/* Hero Section - Light & Spacious */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-24">
            <div className="text-center mb-12 md:mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full mb-6 md:mb-8 border" 
                style={{ 
                  backgroundColor: 'white',
                  borderColor: '#d4a574',
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
                }}
              >
                <Award className="w-4 h-4" style={{ color: '#d4a574' }} />
                <span className="text-xs md:text-sm uppercase tracking-widest" style={{ color: '#d4a574', fontWeight: 500, letterSpacing: '0.1em' }}>
                  The Bloomberg Terminal of AI Visibility
                </span>
              </div>

              {/* Headline - CMS Driven */}
              <h1 
                className="mb-6 md:mb-8 px-4"
                style={{ 
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  fontWeight: 400,
                  color: 'var(--slate-950)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  fontFamily: 'Georgia, serif',
                  maxWidth: '900px',
                  margin: '0 auto 2rem'
                }}
              >
                {heroHeadline?.content?.text || 'Discover Your AI Visibility.'}
                <br />
                <span style={{ fontWeight: 300, color: 'var(--slate-700)' }}>Instantly.</span>
              </h1>

              {/* Subheadline - CMS Driven */}
              <p 
                className="text-base md:text-lg mb-8 md:mb-12 px-4"
                style={{ 
                  color: 'var(--slate-600)',
                  maxWidth: '600px',
                  margin: '0 auto 3rem',
                  lineHeight: 1.7,
                  fontWeight: 400
                }}
              >
                {heroSubhead?.content?.text || 'See exactly how ChatGPT, Claude, and Gemini recommend your brand. Statistical rigor. Peer-reviewable methodology. Board-ready intelligence.'}
              </p>

              {/* Input Section - Figma Hero Input */}
              <FigmaHeroInput />
            </div>
          </div>
        </section>

        {/* Trust Stats Bar */}
        <section className="border-y py-8 md:py-12 bg-slate-50" style={{ borderColor: 'var(--slate-200)' }}>
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {trustStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-5xl mb-2" style={{ fontWeight: 400, color: 'var(--slate-950)', fontFamily: 'Georgia, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base mb-1" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                    {stat.label}
                  </div>
                  <div className="text-xs md:text-sm" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Models Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-10 md:mb-12">
              <div className="text-xs md:text-sm uppercase tracking-widest mb-3" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                Frontier AI Models Tested
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, color: 'var(--slate-950)', fontFamily: 'Georgia, serif' }}>
                Multi-Model Benchmarking
              </h2>
            </div>

            {/* Use existing AIModelLogos component */}
            <AIModelLogos 
              userTier="free"
              showUpgradePrompt={false}
              variant="homepage"
              className="mb-8 md:mb-12"
            />
          </div>
        </section>

        {/* Methodology Section - Two Column */}
        <section className="py-12 md:py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left: Content */}
              <div>
                <Badge 
                  className="mb-4 text-xs uppercase tracking-wider"
                  style={{ 
                    backgroundColor: '#d4a574',
                    color: 'white',
                    fontWeight: 500,
                    padding: '0.5rem 1rem'
                  }}
                >
                  Why AIDI
                </Badge>
                <h2 
                  className="mb-4 md:mb-6"
                  style={{ 
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    fontWeight: 400,
                    color: 'var(--slate-950)',
                    lineHeight: 1.3,
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  Audit-Grade Methodology.
                  <br />
                  <span style={{ fontWeight: 300, color: 'var(--slate-700)' }}>Board-Ready Intelligence.</span>
                </h2>
                <p className="text-base md:text-lg mb-6 md:mb-8" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
                  Not all AI visibility measurement is created equal. AIDI employs statistical rigor, 
                  peer-reviewable methodology, and bias-controlled testing designed for enterprise decision-making.
                </p>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  {methodologyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                      <span style={{ color: 'var(--slate-700)', lineHeight: 1.6, fontWeight: 400 }}>{point}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className="px-6 md:px-8 py-3 md:py-4 rounded-xl border-2 hover:bg-slate-50 transition-all flex items-center gap-2"
                  style={{ 
                    borderColor: 'var(--slate-950)',
                    color: 'var(--slate-950)',
                    fontWeight: 500
                  }}
                >
                  View Full Methodology
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right: Visual Proof */}
              <div className="relative">
                <div 
                  className="rounded-2xl p-6 md:p-8 border-2 bg-white shadow-xl"
                  style={{ 
                    borderColor: 'var(--slate-200)'
                  }}
                >
                  <div className="space-y-4 md:space-y-6">
                    {/* Score Display */}
                    <div className="bg-slate-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: 'var(--slate-200)' }}>
                      <div className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                        AIDI Score
                      </div>
                      <div className="flex items-end gap-3">
                        <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', fontWeight: 400, color: 'var(--slate-950)', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
                          82
                        </div>
                        <div className="mb-2 text-xl" style={{ color: 'var(--slate-500)' }}>/100</div>
                      </div>
                    </div>

                    {/* CI Display */}
                    <div className="bg-slate-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: 'var(--slate-200)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4" style={{ color: 'var(--slate-600)' }} />
                        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                          95% Confidence Interval
                        </div>
                      </div>
                      <div style={{ color: 'var(--slate-950)', fontSize: '1.5rem', fontWeight: 500 }}>
                        79–85
                      </div>
                      <div className="text-xs mt-2" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                        n = 15 runs • p &lt; 0.01
                      </div>
                    </div>

                    {/* Percentile */}
                    <div className="bg-emerald-50 rounded-xl p-5 md:p-6 border" style={{ borderColor: '#22c55e40' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                        <div className="text-xs uppercase tracking-wider" style={{ color: '#16a34a', fontWeight: 500 }}>
                          Percentile Rank
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div style={{ fontSize: '2rem', color: '#22c55e', fontWeight: 500, lineHeight: 1 }}>
                          94<span style={{ fontSize: '1.25rem', color: '#16a34a' }}>th</span>
                        </div>
                      </div>
                      <div className="text-xs mt-2" style={{ color: '#16a34a', fontWeight: 400 }}>
                        Top 6% in Athletic Footwear
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - CMS Driven */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 
                className="mb-4 md:mb-6"
                style={{ 
                  fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                  fontWeight: 400,
                  color: 'var(--slate-950)',
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1.2
                }}
              >
                Institutional-Grade Intelligence
              </h2>
              <p className="text-base md:text-lg" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400, maxWidth: '700px', margin: '0 auto' }}>
                Choose the audit depth that matches your strategic requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {tiers.map((tier: any) => (
                <div
                  key={tier.id}
                  className="relative bg-white rounded-2xl p-8 border-2 shadow-lg hover:shadow-2xl transition-all"
                  style={{
                    borderColor: tier.recommended ? '#d4a574' : 'var(--slate-200)',
                  }}
                >
                  {tier.recommended && (
                    <div 
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs uppercase tracking-wider"
                      style={{ backgroundColor: '#d4a574', color: 'white', fontWeight: 500 }}
                    >
                      {tier.badge}
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="text-sm uppercase tracking-wider mb-3" style={{ fontWeight: 500, color: 'var(--slate-600)', letterSpacing: '0.1em' }}>
                      {tier.name}
                    </div>
                    <div className="mb-2" style={{ fontSize: '3rem', fontWeight: 400, fontFamily: 'Georgia, serif', color: 'var(--slate-950)' }}>
                      {tier.price}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--slate-500)' }}>
                      One-time payment
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                        <span className="text-sm" style={{ color: 'var(--slate-700)', lineHeight: 1.6 }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full px-6 py-4 rounded-xl transition-all hover:opacity-90 shadow-md"
                    style={{
                      backgroundColor: tier.recommended ? 'var(--slate-950)' : 'white',
                      color: tier.recommended ? 'white' : 'var(--slate-950)',
                      border: tier.recommended ? 'none' : '2px solid var(--slate-200)',
                      fontWeight: 500
                    }}
                  >
                    {tier.cta || 'Subscribe Now'}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-10 md:mt-12">
              <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
                All plans include peer-reviewable methodology and statistical rigor
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 
              className="mb-4 md:mb-6"
              style={{ 
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                fontFamily: 'Georgia, serif',
                lineHeight: 1.2
              }}
            >
              Ready to see your AI visibility score?
            </h2>
            <p className="text-base md:text-lg mb-8 md:mb-10" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
              Join leading brands using AIDI for competitive intelligence and strategic planning.
            </p>
            <button
              className="px-10 md:px-12 py-4 md:py-5 rounded-xl text-white text-base md:text-lg hover:opacity-90 transition-all shadow-xl"
              style={{
                backgroundColor: 'var(--slate-950)',
                fontWeight: 500
              }}
            >
              Get Your AIDI Score →
            </button>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </FigmaHomepageClient>
    </div>
  );
}

