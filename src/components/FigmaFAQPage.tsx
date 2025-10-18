/**
 * AIDI FAQ Page - Client Component
 * Light theme, accordion-style Q&A
 * Clear answers about methodology, positioning, and strategic value
 */

'use client';

import { motion } from 'framer-motion';
import { Mail, FileText, HelpCircle, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is AIDI?',
          a: 'AIDI (AI Discoverability Index) is the world\'s first benchmark-grade measurement system for AI brand visibility. We deliver audit-grade intelligence on how brands appear (or disappear) in conversational AI platforms like ChatGPT, Claude, Gemini, and Perplexity.'
        },
        {
          q: 'How is AIDI different from SEO or monitoring tools?',
          a: 'AIDI provides strategic benchmarking for executives, not daily monitoring for practitioners. While tools like Searchable excel at real-time tracking, AIDI delivers peer-reviewed, statistically validated intelligence designed for board presentations and strategic decisions. See our "vs. Monitoring Tools" page for a full comparison.'
        },
        {
          q: 'Who is AIDI for?',
          a: 'AIDI is built for C-suite executives, CMOs, data scientists, and strategic decision-makers at enterprise brands who need defensible, audit-grade metrics for quarterly reviews, board presentations, and strategic investment decisions.'
        },
      ]
    },
    {
      category: 'Methodology & Data',
      questions: [
        {
          q: 'How is my AIDI score calculated?',
          a: 'Your AIDI score is calculated using a peer-reviewed framework: (1) Standardized, brand-agnostic queries across 4+ AI models, (2) Multi-run testing (n≥3 per model) with 95% confidence intervals, (3) Statistical averaging and significance testing (p-values), (4) Industry benchmarking against sector averages. Full methodology is publicly available.'
        },
        {
          q: 'What makes AIDI "audit-grade"?',
          a: 'AIDI uses peer-reviewed methodology, statistical rigor (95% confidence intervals, p-values), multi-run averaging (n≥3), and transparent documentation. Every claim is defensible, every number peer-reviewable. Unlike proprietary black-box tools, our methodology is publicly auditable.'
        },
        {
          q: 'Which AI models do you test?',
          a: 'We test across 4+ frontier AI models including ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), and Perplexity. Each brand is tested at least 3 times per model for statistical validity.'
        },
        {
          q: 'How often is data updated?',
          a: 'Full audits are conducted quarterly with optional monthly updates. This cadence matches executive reporting cycles and ensures statistical validity. Daily monitoring is better suited to tools like Searchable.'
        },
      ]
    },
    {
      category: 'Pricing & Plans',
      questions: [
        {
          q: 'What are the pricing tiers?',
          a: 'We offer three tiers: Snapshot Report ($438 one-time) for quick visibility checks, Full Audit ($2,500/quarter) for comprehensive quarterly intelligence, and Benchmark Suite ($30,000/year) for ongoing competitive monitoring with monthly updates and dedicated analyst support.'
        },
        {
          q: 'Can I try AIDI before committing?',
          a: 'Yes! The Snapshot Report ($438) provides a low-commitment entry point with your core AIDI score, grade, and 95% confidence interval. It\'s perfect for validating the value before upgrading to quarterly or annual plans.'
        },
        {
          q: 'Do you offer discounts for multiple brands?',
          a: 'Yes, we offer portfolio pricing for enterprises tracking 3+ brands. Contact us for custom pricing tailored to your needs.'
        },
      ]
    },
    {
      category: 'Results & Action',
      questions: [
        {
          q: 'What do I get in my report?',
          a: 'Your AIDI report includes: (1) Overall score (0-100) with letter grade, (2) 95% confidence intervals and statistical significance testing, (3) Industry percentile ranking, (4) Competitive positioning vs. sector leaders, (5) Dimension-level breakdown (12 metrics), (6) Actionable recommendations, (7) Board-ready PDF export.'
        },
        {
          q: 'How long does it take to get results?',
          a: 'Snapshot Reports are delivered within 3-5 business days. Full Audits take 7-10 business days due to multi-run testing requirements. Benchmark Suite clients receive monthly updates on a fixed schedule.'
        },
        {
          q: 'Can I improve my AIDI score?',
          a: 'Yes! Your report includes dimension-level breakdowns and actionable recommendations. Common improvement areas include content authority, entity clarity, structured data, and authoritative backlinks. Complement AIDI with monitoring tools like Searchable for ongoing optimization.'
        },
      ]
    },
    {
      category: 'Use Cases',
      questions: [
        {
          q: 'When should I use AIDI vs. monitoring tools?',
          a: 'Use AIDI for quarterly strategic validation, board presentations, industry benchmarking, and investment decisions. Use monitoring tools like Searchable for daily tracking, real-time alerts, and tactical optimization. They\'re complementary—not competitive.'
        },
        {
          q: 'Can I present AIDI data to my board?',
          a: 'Absolutely. AIDI reports are designed for board-level consumption with audit-grade rigor, peer-reviewed methodology, and PDF export capabilities. Our statistical framework (95% CI, p-values) meets institutional scrutiny standards.'
        },
        {
          q: 'Is AIDI suitable for small businesses?',
          a: 'AIDI is optimized for enterprise brands and strategic decision-makers. If you\'re a small business or solopreneur, monitoring tools like Searchable may be more cost-effective for tactical AEO.'
        },
      ]
    },
  ];

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const flatIndex = categoryIndex * 100 + questionIndex;
    setOpenIndex(openIndex === flatIndex ? null : flatIndex);
  };

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
              <a href="/faq" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
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
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Methodology
                    </a>
                    <a 
                      href="/faq" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#3b82f6', fontWeight: 500 }}
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
              className="mb-6"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              Frequently Asked Questions - AIDI
            </h1>
            
            <p 
              className="text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              Clear answers about AIDI's methodology, positioning, and strategic value.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 
                  className="mb-6"
                  style={{ 
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: 'var(--slate-950)'
                  }}
                >
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const flatIndex = categoryIndex * 100 + questionIndex;
                    const isOpen = openIndex === flatIndex;

                    return (
                      <motion.div
                        key={questionIndex}
                        className="bg-white rounded-xl border overflow-hidden"
                        style={{ borderColor: 'var(--slate-200)' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: questionIndex * 0.05, duration: 0.3 }}
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                        >
                          <span 
                            className="flex-1 pr-4"
                            style={{ 
                              fontSize: '1.0625rem',
                              fontWeight: 500,
                              color: 'var(--slate-950)',
                              lineHeight: 1.5
                            }}
                          >
                            {faq.q}
                          </span>
                          <ChevronDown 
                            className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            style={{ color: '#3b82f6' }}
                          />
                        </button>

                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t"
                            style={{ borderColor: 'var(--slate-200)' }}
                          >
                            <div 
                              className="px-6 py-5"
                              style={{ 
                                color: 'var(--slate-700)',
                                lineHeight: 1.8,
                                fontWeight: 400
                              }}
                            >
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMS Placeholder */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="bg-white rounded-xl border p-8 md:p-12 text-center"
            style={{ borderColor: 'var(--slate-200)' }}
          >
            <HelpCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--slate-400)' }} />
            <p className="text-sm mb-2" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
              FAQ questions will appear here once added to CMS
            </p>
            <p className="text-xs" style={{ color: 'var(--slate-400)', fontWeight: 400 }}>
              Go to CMS → Page Content → FAQ to add questions
            </p>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div 
            className="p-8 md:p-10 rounded-2xl border-l-4"
            style={{ 
              backgroundColor: '#eff6ff',
              borderColor: '#3b82f6'
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
              Still have questions?
            </h3>
            <p 
              className="mb-6 text-base"
              style={{ 
                color: 'var(--slate-700)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              We're here to help. Our team includes data scientists, AEO strategists, and former Fortune 500 executives who understand your challenges.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:hello@aidi.com"
                className="flex items-center gap-2 px-6 py-3 rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#3b82f6', color: 'white', fontWeight: 500 }}
              >
                <Mail className="w-4 h-4" />
                hello@aidi.com
              </a>
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all"
                style={{ borderColor: '#3b82f6', color: '#3b82f6', fontWeight: 500 }}
              >
                Get Started
              </button>
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 hover:bg-slate-50 transition-all"
                style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-700)', fontWeight: 500 }}
              >
                <FileText className="w-4 h-4" />
                Read Methodology
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

