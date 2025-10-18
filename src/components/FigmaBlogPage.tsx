/**
 * AIDI Blog Page
 * Light theme, editorial content
 * Insights on AEO, benchmarking methodology, and AI visibility trends
 * 
 * Design: Light spacious theme consistent with Homepage
 */

import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, TrendingUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaBlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const featuredPost = {
    title: "The AIDI Standard: How the World's First AI Discoverability Index Is Changing the Benchmark",
    excerpt: "Introducing AIDI: peer-reviewed methodology, statistical validation, industry percentiles, monthly reports across 15+ sectors. See exactly where your brand ranks with audit-grade rigor.",
    date: "October 17, 2025",
    readTime: "5 min read",
    badge: "Featured Post"
  };

  const latestPosts = [
    {
      title: "The AIDI Standard: How the World's First AI Discoverability Index Is Changing the Benchmark",
      excerpt: "Introducing AIDI: peer-reviewed methodology, statistical validation, industry percentiles, monthly reports across 15+ sectors. See exactly where your brand ranks with audit-grade rigor.",
      date: "Oct 17, 2025",
    },
    {
      title: "Beyond Guesswork: Why Leading Brands Demand Audit-Grade AI Visibility Intelligence",
      excerpt: "When decisions involve millions—board presentations, M&A due diligence, strategic roadmaps—you need more than dashboards. You need peer-reviewed methodology and statistical validation.",
      date: "Oct 14, 2025",
    },
    {
      title: "October 2025 Fashion Industry Benchmark: Sustainable Brands Gain AI Share",
      excerpt: "Nike leads with 87% mention rate (95% CI: 84-89%, n=18). Sustainable brands show 12-point average increase.",
      date: "Oct 14, 2025",
    },
    {
      title: "Why Benchmark-Grade Measurement Matters: Beyond Consumer SEO Tools",
      excerpt: "Traditional SEO metrics measure discoverability in search. But AI platforms recommend brands differently. You need methodology designed for conversational AI.",
      date: "Oct 10, 2025",
    },
    {
      title: "Measurement Matters: Why \"Trust Me\" AEO Tools Are Settling Brands for Guesses, Not Grades",
      excerpt: "Not all AI visibility measurement is created equal. Learn why statistical rigor matters when presenting to boards and investors.",
      date: "Oct 7, 2025",
    },
    {
      title: "How to Use AIDI and Searchable Together: A Complementary Approach",
      excerpt: "AIDI measures visibility. Searchable optimizes content. Here's how leading brands use both for competitive advantage.",
      date: "Oct 3, 2025",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50" style={{ borderColor: 'var(--slate-200)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
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
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 md:gap-8">
              <a href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Home
              </a>
              <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="/blog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
                Blog
              </a>
              <a href="/reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Industry Reports
              </a>
              <button 
                className="px-4 md:px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--slate-950)', color: 'white', fontWeight: 500 }}
              >
                Get Your Score
              </button>
            </div>

            {/* Mobile Menu - Burger Menu */}
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
                      href="/blog" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#3b82f6', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </a>
                    <a 
                      href="/reports" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Industry Reports
                    </a>
                    <a 
                      href="/careers" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Careers
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
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              AIDI Blog
            </h1>
            <p 
              className="text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              Insights on AEO, benchmarking methodology, and AI visibility trends
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Badge 
            className="mb-6 text-xs uppercase tracking-wider"
            style={{ 
              backgroundColor: '#d4a574',
              color: 'white',
              fontWeight: 500,
              padding: '0.5rem 1rem'
            }}
          >
            {featuredPost.badge}
          </Badge>

          <motion.article
            className="bg-white rounded-2xl border p-6 md:p-8 hover:shadow-lg transition-shadow cursor-pointer"
            style={{ borderColor: 'var(--slate-200)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4 }}
          >
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                lineHeight: 1.3,
                fontFamily: 'Georgia, serif'
              }}
            >
              {featuredPost.title}
            </h2>
            
            <p 
              className="mb-6 text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              {featuredPost.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--slate-500)' }}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredPost.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
              
              <button 
                className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                style={{ color: '#3b82f6', fontWeight: 500 }}
              >
                Read full article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.article>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 
            className="mb-8 md:mb-12"
            style={{ 
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 400,
              color: 'var(--slate-950)',
              fontFamily: 'Georgia, serif'
            }}
          >
            Latest Posts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestPosts.map((post, index) => (
              <motion.article
                key={index}
                className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: 'var(--slate-200)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <h3 
                  className="mb-3"
                  style={{ 
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    color: 'var(--slate-950)',
                    lineHeight: 1.4
                  }}
                >
                  {post.title}
                </h3>
                
                <p 
                  className="mb-4 text-sm"
                  style={{ 
                    color: 'var(--slate-600)',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--slate-500)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  
                  <button 
                    className="text-xs hover:opacity-70 transition-opacity"
                    style={{ color: '#3b82f6', fontWeight: 500 }}
                  >
                    Read →
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 border" style={{ borderColor: 'var(--slate-200)' }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#3b82f6' }} />
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                fontFamily: 'Georgia, serif'
              }}
            >
              Stay Ahead of AI Visibility Trends
            </h2>
            <p className="mb-6 text-base" style={{ color: 'var(--slate-600)', lineHeight: 1.7 }}>
              Get monthly benchmark reports, methodology updates, and strategic insights delivered to your inbox.
            </p>
            <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition-all text-base"
                style={{
                  borderColor: 'var(--slate-200)',
                  backgroundColor: 'white',
                  color: 'var(--slate-900)'
                }}
              />
              <button
                className="px-6 py-3 rounded-lg hover:opacity-90 transition-all"
                style={{
                  backgroundColor: 'var(--slate-950)',
                  color: 'white',
                  fontWeight: 500
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
