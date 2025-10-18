/**
 * AIDI Methodology Page - Client Component
 * Light theme, scientific rigor showcase
 * Peer-reviewed framework documentation
 */

'use client';

import { motion } from 'framer-motion';
import { FileText, Download, Users, BarChart3, CheckCircle2, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaMethodologyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pillars = [
    {
      icon: '🎯',
      title: 'Standardized Tests',
      subtitle: 'Every brand tested identically. No user-defined prompts.',
      example: {
        label: 'Statistical Rigor',
        code: 'Test-Retest Reliability = 0.94'
      }
    },
    {
      icon: '🔍',
      title: 'Unbiased Queries',
      subtitle: 'Objective, product-first prompts—not brand inflation.',
    },
    {
      icon: '📊',
      title: 'Multi-Run Averaging',
      subtitle: 'N=3 tests per AI model (9+ data points). 95% confidence intervals.',
    },
    {
      icon: '🏆',
      title: 'Industry Baselines',
      subtitle: 'Percentile rankings vs. competitors. Peer-benchmarked.',
    },
    {
      icon: '📚',
      title: 'Peer-Reviewed',
      subtitle: 'Published framework with academic validation.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50" style={{ borderColor: 'var(--slate-200)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{ backgroundColor: 'var(--slate-950)' }}
              >
                <LogoImage size={28} />
              </div>
              <div style={{ fontWeight: 600, color: 'var(--slate-950)', letterSpacing: '-0.01em' }}>
                AIDI
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 md:gap-8">
              <a href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Home
              </a>
              <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="/faq" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                FAQ
              </a>
              <a href="/aidi-vs-monitoring-tools" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                vs. Monitoring Tools
              </a>
              <button 
                className="px-4 md:px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--slate-950)', color: 'white', fontWeight: 500 }}
              >
                Get Your Score
              </button>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" style={{ color: 'var(--slate-700)' }} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: 'var(--slate-200)' }}>
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--slate-950)' }}
                    >
                      <LogoImage size={28} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--slate-950)', letterSpacing: '-0.01em' }}>
                      AIDI
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1 pt-6">
                    <a 
                      href="/" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                    <a 
                      href="/methodology" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#3b82f6', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Methodology
                    </a>
                    <a 
                      href="/faq" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                    <a 
                      href="/aidi-vs-monitoring-tools" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      vs. Monitoring Tools
                    </a>
                  </nav>

                  <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--slate-200)' }}>
                    <button 
                      className="w-full px-4 py-3 rounded-lg text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: 'var(--slate-950)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Your Score
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              AIDI Methodology: Peer-Reviewed Framework
            </h1>
            
            <p 
              className="mb-8 text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              Transparently published. Academically validated. Third-party auditable.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 text-sm" style={{ color: 'var(--slate-600)' }}>
              <div>
                <span style={{ fontWeight: 500 }}>Version 1.2</span>
                <span className="mx-2">•</span>
                <span>Published: October 15, 2025</span>
              </div>
              <div className="hidden md:block">•</div>
              <div>
                <span>Last Updated: October 15, 2025</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button 
                className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all text-sm"
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)', fontWeight: 500 }}
              >
                <FileText className="w-4 h-4" />
                Methodology PDF
              </button>
              <button 
                className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all text-sm"
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)', fontWeight: 500 }}
              >
                <BarChart3 className="w-4 h-4" />
                Statistics Protocol
              </button>
              <button 
                className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all text-sm"
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)', fontWeight: 500 }}
              >
                <Users className="w-4 h-4" />
                Peer Review
              </button>
              <button 
                className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all text-sm"
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)', fontWeight: 500 }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Validation Study
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="p-6 md:p-8 rounded-xl border-l-4"
            style={{ 
              backgroundColor: '#f8fafc',
              borderColor: '#3b82f6'
            }}
          >
            <p className="text-base md:text-lg mb-4" style={{ color: 'var(--slate-700)', lineHeight: 1.8, fontWeight: 400 }}>
              Our testing methodology is <span style={{ fontWeight: 500 }}>publicly available, peer-reviewable, and replicable</span>. Unlike "trust us" proprietary black-box approaches, every AIDI methodology is publicly available. Because best requires transparency.
            </p>
            <p className="text-base md:text-lg" style={{ color: 'var(--slate-700)', lineHeight: 1.8, fontWeight: 400 }}>
              <span style={{ fontWeight: 500, color: '#3b82f6' }}>AIDI is on a mission to become the Bloomberg of AI visibility</span>—delivering audit-grade intelligence on how brands appear (or disappear) in conversational AI platforms.
            </p>
          </div>
        </div>
      </section>

      {/* Five Pillars */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 
            className="text-center mb-12"
            style={{ 
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 400,
              color: 'var(--slate-950)',
              fontFamily: 'Georgia, serif'
            }}
          >
            Five Pillars of Scientific Rigor
          </h2>

          <div className="space-y-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl border p-6 md:p-8 hover:shadow-lg transition-all"
                style={{ borderColor: 'var(--slate-200)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="text-4xl md:text-5xl flex-shrink-0">
                    {pillar.icon}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="mb-2"
                      style={{ 
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        color: 'var(--slate-950)'
                      }}
                    >
                      {pillar.title}
                    </h3>
                    <p 
                      className="mb-4 text-base"
                      style={{ 
                        color: 'var(--slate-600)',
                        lineHeight: 1.7,
                        fontWeight: 400
                      }}
                    >
                      {pillar.subtitle}
                    </p>

                    {pillar.example && (
                      <div 
                        className="rounded-lg p-4 border-l-4"
                        style={{ 
                          backgroundColor: '#f0fdf4',
                          borderColor: '#22c55e'
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#22c55e' }} />
                          <span className="text-xs uppercase tracking-wider" style={{ color: '#22c55e', fontWeight: 500 }}>
                            {pillar.example.label}
                          </span>
                        </div>
                        <code 
                          className="text-sm"
                          style={{ 
                            fontFamily: 'monospace',
                            color: 'var(--slate-700)',
                            fontWeight: 500
                          }}
                        >
                          {pillar.example.code}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 
            className="mb-8"
            style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 400,
              color: 'var(--slate-950)',
              fontFamily: 'Georgia, serif'
            }}
          >
            How It Works
          </h2>

          <div className="space-y-6">
            {[
              {
                title: '1. Standardized Query Framework',
                description: 'We use identical, brand-agnostic prompts across all tests. No custom queries designed to inflate specific brands. Every competitor faces the same questions.'
              },
              {
                title: '2. Multi-Model Testing',
                description: 'We test across 4+ frontier AI models (ChatGPT, Claude, Gemini, Perplexity) to ensure comprehensive coverage. Your score reflects aggregate visibility, not just one platform.'
              },
              {
                title: '3. Statistical Averaging (n≥3)',
                description: 'Every brand tested at least 3 times per model (9+ total data points). We calculate 95% confidence intervals and test for statistical significance (p-values).'
              },
              {
                title: '4. Industry Benchmarking',
                description: 'Your score is contextualized against industry averages and percentile rankings. A score of 82 means you\'re in the top 6% of your sector—not just an isolated number.'
              },
              {
                title: '5. Transparent Documentation',
                description: 'All methodology documents, statistical protocols, and validation studies are publicly available. Independent researchers can audit our work. No black boxes.'
              },
            ].map((step, index) => (
              <div key={index}>
                <h3 className="mb-3" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--slate-950)' }}>
                  {step.title}
                </h3>
                <p className="text-base" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
                  {step.description}
                </p>
              </div>
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
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
              Ready for Benchmark-Grade AEO Intelligence?
            </h2>
            <p className="mb-8 text-base md:text-lg" style={{ color: 'white', opacity: 0.95, lineHeight: 1.7 }}>
              Our peer-reviewed methodology ensures results you can defend to boards, present to CFOs, and rely on for strategic investment.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                className="px-8 md:px-10 py-4 rounded-xl hover:opacity-90 transition-all shadow-xl"
                style={{
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  fontWeight: 500,
                  fontSize: '1rem'
                }}
              >
                Get Your Benchmark Score →
              </button>
              <button
                className="px-8 md:px-10 py-4 rounded-xl hover:bg-white/20 transition-all border-2"
                style={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '1rem',
                  backgroundColor: 'transparent'
                }}
              >
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

