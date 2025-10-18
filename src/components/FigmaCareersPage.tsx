/**
 * AIDI Careers Page - Client Component
 * Gradient hero with job listings
 * Building the Bloomberg Terminal of AI Visibility
 */

'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, TrendingUp, Users, Target, Award, Menu } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function FigmaCareersPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const stats = [
    { value: '4', label: 'Open Positions' },
    { value: '4', label: 'Departments' },
    { value: 'Remote OK', label: 'Work From Anywhere' },
  ];

  const departments = [
    { name: 'All Departments', count: 4, active: true },
    { name: 'Partnerships & Network', count: 1 },
    { name: 'Strategy & Business Development', count: 1 },
    { name: 'Engineering', count: 1 },
    { name: 'Data Science & Analytics', count: 1 },
  ];

  const jobs = [
    {
      title: 'Sector Collaborator (Guest Expert Network)',
      department: 'Partnerships & Network',
      location: 'Remote (Global)',
      type: 'Part-time / Contributor',
      compensation: 'Visibility + Data Access (No Cash)',
      description: 'Guest Expert Network. Join AIDI\'s Sector Collaborator Program—a curated network of 2-3 industry experts per vertical who contribute monthly guest commentary, validate findings, and co-author sections of our benchmark reports.',
      tags: ['Fashion & Apparel', 'Data-driven', 'Thought Leadership']
    },
    {
      title: 'Index Strategy Director',
      department: 'Strategy & Business Development',
      location: 'Remote (UK-based preferred)',
      type: 'Full-time',
      compensation: '£80k-130k + Significant Equity',
      description: 'The Market Maker. Shape AIDI\'s evolution from emerging benchmark to industry standard. You\'ll define new sectors, design competitive frameworks, drive partnerships with industry leaders, and position AIDI as the authoritative voice in AI discoverability.',
      tags: ['Strategy', 'Partnerships', 'Market Making']
    },
    {
      title: 'LLM Infrastructure Engineer',
      department: 'Engineering',
      location: 'Remote (UK/Europe)',
      type: 'Full-time',
      compensation: '£70k-110k + Equity',
      description: 'Build the measurement layer for conversational AI. Design and maintain our multi-model testing infrastructure, ensuring statistical rigor, reproducibility, and audit-grade reliability at scale.',
      tags: ['LLMs', 'Infrastructure', 'Python']
    },
    {
      title: 'Senior Data Scientist (Methodology)',
      department: 'Data Science & Analytics',
      location: 'Remote (Global)',
      type: 'Full-time',
      compensation: '£60k-100k + Equity',
      description: 'Own AIDI\'s statistical methodology. Design confidence intervals, validate significance testing, ensure peer-reviewable rigor, and build the analytical foundation for board-ready intelligence.',
      tags: ['Statistics', 'R/Python', 'Methodology']
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
              <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="/blog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Blog
              </a>
              <a href="/careers" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#6366f1', fontWeight: 500 }}>
                Careers
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
                      href="/blog" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Blog
                    </a>
                    <a 
                      href="/careers" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: '#6366f1', fontWeight: 500 }}
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

      {/* Hero Section - Gradient */}
      <section 
        className="py-16 md:py-24"
        style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="mb-6"
              style={{ 
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 400,
                lineHeight: 1.2,
                fontFamily: 'Georgia, serif'
              }}
            >
              Join Us: Building the Future of AI Brand Intelligence.
            </h1>
            
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-lg md:text-xl mb-4" style={{ lineHeight: 1.7, fontWeight: 400 }}>
                We've Built AIDI—The World's First AI Discoverability Index.
              </p>
              <p className="text-base md:text-lg opacity-90" style={{ lineHeight: 1.7, fontWeight: 400 }}>
                AIDI is on a mission to become the Bloomberg of AI visibility—delivering audit-grade intelligence on how brands appear (or disappear) in conversational AI platforms. We're defining a new category and establishing the benchmark standard for an industry worth billions.
              </p>
              <p className="text-base md:text-lg mt-4 opacity-90" style={{ lineHeight: 1.7, fontWeight: 400 }}>
                Help us maintain the benchmark standard for AEO intelligence. Work with data scientists, executives, and industry leaders.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                >
                  <div className="text-4xl md:text-5xl mb-2" style={{ fontWeight: 400, fontFamily: 'Georgia, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base opacity-90" style={{ fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 bg-slate-50 border-b" style={{ borderColor: 'var(--slate-200)' }}>
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-3">
            {departments.map((dept, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-lg text-sm transition-all"
                style={{
                  backgroundColor: dept.active ? '#3b82f6' : 'white',
                  color: dept.active ? 'white' : 'var(--slate-700)',
                  border: dept.active ? 'none' : '1px solid var(--slate-200)',
                  fontWeight: 500
                }}
              >
                {dept.name} ({dept.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <motion.article
                key={index}
                className="bg-white rounded-xl border p-6 md:p-8 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: 'var(--slate-200)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h3 
                      className="mb-2"
                      style={{ 
                        fontSize: '1.5rem',
                        fontWeight: 500,
                        color: 'var(--slate-950)',
                        lineHeight: 1.3
                      }}
                    >
                      {job.title}
                    </h3>
                    <Badge 
                      className="text-xs"
                      style={{ 
                        backgroundColor: '#ede9fe',
                        color: '#6366f1',
                        fontWeight: 500
                      }}
                    >
                      {job.department}
                    </Badge>
                  </div>
                  <button 
                    className="mt-4 md:mt-0 px-6 py-2.5 rounded-lg hover:opacity-90 transition-all text-sm whitespace-nowrap"
                    style={{ 
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      fontWeight: 500
                    }}
                  >
                    View Details →
                  </button>
                </div>

                <p 
                  className="mb-4 text-sm md:text-base"
                  style={{ 
                    color: 'var(--slate-700)',
                    lineHeight: 1.7,
                    fontWeight: 400
                  }}
                >
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-4 mb-4 text-sm" style={{ color: 'var(--slate-600)' }}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.compensation}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: 'var(--slate-100)',
                        color: 'var(--slate-700)',
                        fontWeight: 500
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
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
            Why Join AIDI?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                icon: Target,
                title: 'Define a New Category',
                description: 'You\'re not joining a startup—you\'re establishing the benchmark standard for an industry worth billions.',
              },
              {
                icon: TrendingUp,
                title: 'Work with Industry Leaders',
                description: 'Collaborate with CMOs, data scientists, and executives at leading global brands.',
              },
              {
                icon: Users,
                title: 'Remote-First Culture',
                description: 'Work from anywhere. We value outcomes over attendance. Async-friendly, global team.',
              },
              {
                icon: Award,
                title: 'Meaningful Equity',
                description: 'Significant equity packages. You\'re not an employee—you\'re a co-builder of the standard.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 md:p-8 border"
                style={{ borderColor: 'var(--slate-200)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <item.icon className="w-10 h-10 mb-4" style={{ color: '#6366f1' }} />
                <h3 
                  className="mb-2"
                  style={{ 
                    fontSize: '1.25rem',
                    fontWeight: 500,
                    color: 'var(--slate-950)'
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

