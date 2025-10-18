/**
 * AIDI vs. Monitoring Tools Page - Client Component  
 * Light theme, comparison/positioning page
 * Complementary approaches - not competitive
 */

'use client';

import { motion } from 'framer-motion';
import { LineChart, Target, TrendingUp, AlertCircle, Award, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaVsMonitoringToolsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="/faq" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                FAQ
              </a>
              <a href="/aidi-vs-monitoring-tools" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
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
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
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
                      style={{ color: '#3b82f6', fontWeight: 500 }}
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
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="mb-6"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              AIDI vs. Monitoring Tools:
              <br />
              Complementary Approaches
            </h1>
            
            <p 
              className="mb-8 text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400,
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              Different tools for different purposes. Use both for complete AEO mastery.
            </p>
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
              <span style={{ fontWeight: 500, color: '#3b82f6' }}>AIDI is on a mission to become the Bloomberg of AI visibility</span>—delivering audit-grade intelligence on how brands appear (or disappear) in conversational AI platforms.
            </p>
            <p className="text-base md:text-lg" style={{ color: 'var(--slate-700)', lineHeight: 1.8, fontWeight: 400 }}>
              Thanks to innovators like <span style={{ fontWeight: 500 }}>Searchable and Chris Donnelly</span>, brands are waking up to the importance of AI visibility. As the AEO market matures, enterprises need <span style={{ fontWeight: 500 }}>strategic measurement</span>—that is where AIDI comes in.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Monitoring Tools Card */}
            <motion.div
              className="bg-white rounded-2xl border p-6 md:p-8"
              style={{ borderColor: 'var(--slate-200)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl mb-4">📊</div>
              
              <h2 
                className="mb-3"
                style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: 'var(--slate-950)'
                }}
              >
                Monitoring-Grade Tools
              </h2>
              
              <p 
                className="mb-6 text-base"
                style={{ 
                  color: 'var(--slate-600)',
                  lineHeight: 1.7,
                  fontWeight: 400
                }}
              >
                Tools like Searchable excel at daily practitioner monitoring.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-950)' }}>
                    Strengths:
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--slate-600)' }}>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Daily visibility tracking</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Prompt optimization workflows</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Real-time alerts for ranking changes</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Practitioner-focused dashboards</div>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3b82f6' }}>
                    Perfect For:
                  </div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}>
                    Audience: SEO practitioners
                  </p>
                </div>

                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3b82f6' }}>
                    Pricing:
                  </div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}>
                    $49–$99/month
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Benchmark Intelligence Card */}
            <motion.div
              className="bg-white rounded-2xl border p-6 md:p-8"
              style={{ borderColor: '#3b82f6', borderWidth: '2px' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-5xl mb-4">🎯</div>
              
              <h2 
                className="mb-3"
                style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  color: 'var(--slate-950)'
                }}
              >
                Benchmark-Grade Intelligence
              </h2>
              
              <p 
                className="mb-6 text-base"
                style={{ 
                  color: 'var(--slate-600)',
                  lineHeight: 1.7,
                  fontWeight: 400
                }}
              >
                AIDI provides strategic benchmarking for executives.
              </p>

              <div className="space-y-4">
                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--slate-950)' }}>
                    Strengths:
                  </div>
                  <ul className="space-y-2 text-sm" style={{ color: 'var(--slate-600)' }}>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Audit-grade statistical rigor (95% CI)</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Industry percentile benchmarking</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Board-ready intelligence reports</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-0.5">•</div>
                      <div>Peer-reviewed methodology</div>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3b82f6' }}>
                    Perfect For:
                  </div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}>
                    Audience: C-suite executives
                  </p>
                </div>

                <div>
                  <div className="mb-2" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3b82f6' }}>
                    Pricing:
                  </div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}>
                    $2,500–$30,000/audit
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Callout Box */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="p-8 md:p-10 rounded-2xl border-l-4"
            style={{ 
              backgroundColor: '#ecfdf5',
              borderColor: '#22c55e'
            }}
          >
            <h3 
              className="mb-4"
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 500,
                color: 'var(--slate-950)'
              }}
            >
              Both Are Valuable. Neither Is Replaceable.
            </h3>
            <p 
              className="text-base md:text-lg"
              style={{ 
                color: 'var(--slate-700)',
                lineHeight: 1.8,
                fontWeight: 400
              }}
            >
              <span style={{ fontWeight: 500 }}>Both are valuable. Use monitoring tools for daily tactics. Use AIDI for quarterly strategic validation.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 md:py-16 bg-slate-50">
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
            When to Use Each
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-xl border p-6" style={{ borderColor: 'var(--slate-200)' }}>
              <LineChart className="w-8 h-8 mb-4" style={{ color: '#3b82f6' }} />
              <h3 className="mb-3" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--slate-950)' }}>
                Use Monitoring Tools When...
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--slate-600)' }}>
                <li>• You need daily tracking of visibility changes</li>
                <li>• You're optimizing content for specific queries</li>
                <li>• Your team needs real-time alerts</li>
                <li>• You want practitioner-level insights</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border p-6" style={{ borderColor: 'var(--slate-200)' }}>
              <Award className="w-8 h-8 mb-4" style={{ color: '#22c55e' }} />
              <h3 className="mb-3" style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--slate-950)' }}>
                Use AIDI When...
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--slate-600)' }}>
                <li>• You're presenting to boards or C-suite</li>
                <li>• You need industry benchmark comparisons</li>
                <li>• You require statistical validation (95% CI)</li>
                <li>• You're making strategic investment decisions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="rounded-2xl p-8 md:p-12 text-center text-white"
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
            }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 400,
                fontFamily: 'Georgia, serif'
              }}
            >
              Ready to Add Benchmark Intelligence to Your AEO Stack?
            </h2>
            <p className="mb-8 text-base md:text-lg" style={{ opacity: 0.95, lineHeight: 1.7 }}>
              Get the strategic metrics you need for board presentations.
              <br />
              Complement with monitoring tools for ongoing visibility.
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
                className="px-8 md:px-10 py-4 rounded-xl hover:bg-white/20 transition-all text-white"
                style={{
                  border: '2px solid white',
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

      {/* Related Resources */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h3 
            className="text-center mb-6"
            style={{ 
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--slate-950)'
            }}
          >
            Related Resources
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
              Read Our Complete Methodology →
            </a>
            <a href="/leaderboards" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
              View Industry Benchmarks →
            </a>
            <a href="/faq" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
              More Questions? FAQ →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

