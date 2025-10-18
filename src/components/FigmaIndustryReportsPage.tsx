/**
 * AIDI Industry Reports Page - Client Component
 * Dark theme, sector-based report cards
 * Monthly AI Brand Visibility Reports
 */

'use client';

import { motion } from 'framer-motion';
import { Download, TrendingUp, AlertCircle, Lightbulb, BarChart3, ArrowRight, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaIndustryReportsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectors = [
    {
      name: 'Fashion & Apparel',
      emoji: '👗',
      brandCount: 15,
      status: 'Premium',
      description: 'Athletic footwear, luxury fashion, fast fashion vs. recommendations vs. competitors. Track month-over-month insights.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Beauty & Personal Care',
      emoji: '💄',
      brandCount: 12,
      status: 'Premium',
      description: 'Skincare, haircare, beauty brands. Monitor AI recommendations for beauty, skincare, haircare, and cosmetics vs. search.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Consumer Electronics & Tech',
      emoji: '📱',
      brandCount: 18,
      status: 'Extended',
      description: 'Flagship tech products: smartphones, laptops, headphones. Track how AI platforms recommend vs. competitors.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Health & Wellness',
      emoji: '💪',
      brandCount: 14,
      status: 'Extended',
      description: 'Supplement brands, fitness equipment, wellness apps. Track recommendations vs. search rankings.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'CPG & FMCG',
      emoji: '🛒',
      brandCount: 20,
      status: 'Premium',
      description: 'Consumer packaged goods: snacks, beverages, household items. Competitive intelligence for category leads.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Home & Lifestyle',
      emoji: '🏡',
      brandCount: 16,
      status: 'Extended',
      description: 'Home decor, furniture, kitchenware, lifestyle brands. Track share of AI recommendations.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Hospitality & Travel',
      emoji: '✈️',
      brandCount: 12,
      status: 'Extended',
      description: 'Hotels, airlines, booking platforms, tourism boards. Monitor conversational platform mentions.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Mobility & Automotive',
      emoji: '🚗',
      brandCount: 15,
      status: 'Premium',
      description: 'Auto manufacturers, ride-sharing, EV brands. Track mention rate vs. legacy competitors.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Banking & Fintech',
      emoji: '💳',
      brandCount: 18,
      status: 'Extended',
      description: 'Digital banks, payment platforms, investment platforms. Competitive intelligence vs. incumbents.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'Professional Services',
      emoji: '💼',
      brandCount: 10,
      status: 'Extended',
      description: 'Consulting, legal, accounting, marketing agencies. AI visibility tracking for B2B services.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'B2B SaaS & Software',
      emoji: '💻',
      brandCount: 22,
      status: 'Extended',
      description: 'Enterprise software, productivity tools, dev tools. Category leaders vs. emerging challengers.',
      action: 'Request Demo for This Sector →'
    },
    {
      name: 'iGaming & Online Gambling',
      emoji: '🎰',
      brandCount: 14,
      status: 'Extended',
      description: 'Online casinos, sports betting platforms, poker sites. Regulatory-compliant AI visibility measurement.',
      action: 'Request Demo for This Sector →'
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Brand Leaderboards',
      description: 'See which brands AI models recommend most (and least) within your vertical. Track month-over-month movement.',
    },
    {
      icon: AlertCircle,
      title: 'Emerging Threats',
      description: 'Identify rising challengers before they dominate your category. Real-time competitive intelligence alerts.',
    },
    {
      icon: Lightbulb,
      title: 'Actionable Insights',
      description: 'Data-driven recommendations to improve your brand\'s discoverability in conversational AI platforms.',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1419' }}>
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50" style={{ backgroundColor: '#0f1419', borderColor: '#1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{ backgroundColor: '#22c55e' }}
              >
                <LogoImage size={28} />
              </div>
              <div style={{ fontWeight: 600, color: 'white', letterSpacing: '-0.01em' }}>
                AI Discoverability Index
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 md:gap-8">
              <a href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#cbd5e1', fontWeight: 500 }}>
                Home
              </a>
              <a href="/evaluate" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#cbd5e1', fontWeight: 500 }}>
                Get Your Score
              </a>
              <a href="/reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#22c55e', fontWeight: 500 }}>
                Industry Reports
              </a>
              <a href="/leaderboards" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#cbd5e1', fontWeight: 500 }}>
                Leaderboards
              </a>
              <button 
                className="px-4 md:px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: '#22c55e', color: '#0f1419', fontWeight: 500 }}
              >
                Sign In
              </button>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" style={{ color: '#cbd5e1' }} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]" style={{ backgroundColor: '#0f1419', borderLeft: '1px solid #1e293b' }}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: '#1e293b' }}>
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <LogoImage size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white', letterSpacing: '-0.01em' }}>
                        AIDI
                      </div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: '#64748b', fontWeight: 400 }}>
                        Industry Reports
                      </div>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1 pt-6">
                    <a 
                      href="/" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: '#cbd5e1', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                    <a 
                      href="/evaluate" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: '#cbd5e1', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Your Score
                    </a>
                    <a 
                      href="/reports" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: '#22c55e', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Industry Reports
                    </a>
                    <a 
                      href="/leaderboards" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: '#cbd5e1', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboards
                    </a>
                  </nav>

                  <div className="mt-auto pt-6 border-t" style={{ borderColor: '#1e293b' }}>
                    <button 
                      className="w-full px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#22c55e', color: '#0f1419', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="mb-6"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 400,
                color: 'white',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              Monthly AI Brand Visibility
              <br />
              Reports
            </h1>
            
            <p 
              className="mb-8 text-base md:text-lg"
              style={{ 
                color: '#94a3b8',
                maxWidth: '700px',
                margin: '0 auto 3rem',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              Track how leading <span style={{ color: '#4ade80', fontWeight: 400 }}>AI models recommend brands</span> across industries with <span style={{ color: '#4ade80', fontWeight: 400 }}>statistical confidence intervals</span>. Data-driven insights for CMOs and data scientists.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span 
                className="text-sm px-4 py-2 rounded-md"
                style={{ 
                  backgroundColor: '#22c55e20',
                  color: '#4ade80',
                  border: '1px solid #22c55e40',
                  fontWeight: 400
                }}
              >
                3+ AI Models Tested
              </span>
              <span 
                className="text-sm px-4 py-2 rounded-md"
                style={{ 
                  backgroundColor: '#22c55e20',
                  color: '#4ade80',
                  border: '1px solid #22c55e40',
                  fontWeight: 400
                }}
              >
                95% Confidence Intervals
              </span>
              <span 
                className="text-sm px-4 py-2 rounded-md"
                style={{ 
                  backgroundColor: '#22c55e20',
                  color: '#4ade80',
                  border: '1px solid #22c55e40',
                  fontWeight: 400
                }}
              >
                Audit-Grade Data
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16 border-y" style={{ borderColor: '#1e293b' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-6 border"
                style={{ borderColor: '#334155' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <feature.icon className="w-8 h-8 mb-4" style={{ color: '#4ade80' }} />
                <h3 
                  className="mb-2"
                  style={{ 
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: 'white'
                  }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Industry */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 
            className="text-center mb-12"
            style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 400,
              color: 'white',
              fontFamily: 'Georgia, serif'
            }}
          >
            Choose Your Industry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sectors.map((sector, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl p-6 border hover:border-emerald-500/50 transition-all cursor-pointer"
                style={{ borderColor: '#334155' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{sector.emoji}</div>
                  <span 
                    className="text-xs px-3 py-1 rounded-md"
                    style={{ 
                      backgroundColor: sector.status === 'Premium' ? '#d4a57420' : '#3b82f620',
                      color: sector.status === 'Premium' ? '#e9c896' : '#60a5fa',
                      border: sector.status === 'Premium' ? '1px solid #d4a57440' : '1px solid #3b82f640',
                      fontWeight: 400
                    }}
                  >
                    {sector.status}
                  </span>
                </div>

                <h3 
                  className="mb-2"
                  style={{ 
                    fontSize: '1.125rem',
                    fontWeight: 400,
                    color: 'white'
                  }}
                >
                  {sector.name}
                </h3>

                <p 
                  className="mb-4 text-sm"
                  style={{ 
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  {sector.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#64748b', fontWeight: 300 }}>
                    {sector.brandCount} brands
                  </span>
                  <button 
                    className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{ color: '#4ade80', fontWeight: 400 }}
                  >
                    View Report →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{ 
              background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
            }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 400,
                color: 'white',
                fontFamily: 'Georgia, serif'
              }}
            >
              Start with a Free Preview
            </h2>
            <p className="mb-8 text-base md:text-lg" style={{ color: 'white', opacity: 0.95, lineHeight: 1.7 }}>
              Get executive-level summaries and top 10 brand rankings for any sector. Upgrade for full leaderboards, archive access, and PDF exports.
            </p>
            <button
              className="px-8 md:px-10 py-4 rounded-xl hover:opacity-90 transition-all shadow-xl"
              style={{
                backgroundColor: 'white',
                color: '#22c55e',
                fontWeight: 500,
                fontSize: '1rem'
              }}
            >
              Browse Reports
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

