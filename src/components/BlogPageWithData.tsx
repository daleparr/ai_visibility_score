'use client';

/**
 * AIDI Blog Page with Real Data
 * Displays actual blog posts from the database
 */

import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, TrendingUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Link from 'next/link';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category?: { name: string; slug: string };
  published_at: string;
  tags: string[];
  view_count: number;
  meta_title?: string;
  meta_description?: string;
  featured?: boolean;
}

interface BlogPageWithDataProps {
  posts: BlogPost[];
}

export function BlogPageWithData({ posts }: BlogPageWithDataProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get featured post (first post or one marked as featured)
  const featuredPost = posts.find(post => post.featured) || posts[0];
  const latestPosts = posts.slice(1, 7); // Show remaining posts

  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

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
              <Link href="/" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Home
              </Link>
              <Link href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Methodology
              </Link>
              <Link href="/blog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
                Blog
              </Link>
              <Link href="/reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Industry Reports
              </Link>
              <Link href="/evaluate" className="px-4 md:px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--slate-950)', color: 'white', fontWeight: 500 }}>
                Get Your Score
              </Link>
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
                    <Link 
                      href="/" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/methodology" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Methodology
                    </Link>
                    <Link 
                      href="/blog" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#3b82f6', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                    <Link 
                      href="/reports" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Industry Reports
                    </Link>
                    <Link 
                      href="/careers" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Careers
                    </Link>
                  </nav>

                  <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--slate-200)' }}>
                    <Link 
                      href="/evaluate"
                      className="w-full px-4 py-3 rounded-lg text-white hover:opacity-90 transition-opacity block text-center"
                      style={{ backgroundColor: 'var(--slate-950)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Your Score
                    </Link>
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
      {featuredPost && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <span 
              className="inline-block mb-6 text-xs uppercase tracking-wider px-4 py-1.5 rounded-md"
              style={{ 
                backgroundColor: '#d4a574',
                color: 'white',
                fontWeight: 400
              }}
            >
              Featured Post
            </span>

            <motion.article
              className="bg-white rounded-2xl border p-6 md:p-8 hover:shadow-lg transition-shadow cursor-pointer"
              style={{ borderColor: '#e2e8f0' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Link href={`/blog/${featuredPost.slug}`}>
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
                      <span>{format(new Date(featuredPost.published_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{calculateReadTime(featuredPost.content)}</span>
                    </div>
                  </div>
                  
                  <span 
                    className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                    style={{ color: '#3b82f6', fontWeight: 500 }}
                  >
                    Read full article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.article>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
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
                  key={post.id}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  style={{ borderColor: '#e2e8f0' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/blog/${post.slug}`}>
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
                        <span>{format(new Date(post.published_at), 'MMM d, yyyy')}</span>
                      </div>
                      
                      <span 
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: '#3b82f6', fontWeight: 500 }}
                      >
                        Read →
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12 border" style={{ borderColor: '#e2e8f0' }}>
            <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: '#60a5fa' }} />
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
            <p className="mb-6 text-base" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
              Get monthly benchmark reports, methodology updates, and strategic insights delivered to your inbox.
            </p>
            <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border focus:outline-none transition-all text-base"
                style={{
                  borderColor: '#e2e8f0',
                  backgroundColor: 'white',
                  color: 'var(--slate-900)'
                }}
              />
              <button
                className="px-6 py-3 rounded-xl hover:opacity-90 transition-all"
                style={{
                  backgroundColor: 'var(--slate-950)',
                  color: 'white',
                  fontWeight: 400
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
