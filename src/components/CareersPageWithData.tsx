'use client';

/**
 * AIDI Careers Page with Real Data
 * Displays actual job postings from the database
 */

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, DollarSign, Briefcase, ArrowRight, Menu, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Link from 'next/link';
import { format } from 'date-fns';

interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  nice_to_have?: string[];
  posted_at: string;
  view_count: number;
  application_count: number;
}

interface CareersPageWithDataProps {
  jobs: JobPosting[];
}

export function CareersPageWithData({ jobs }: CareersPageWithDataProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Get unique departments for filtering
  const departments = ['all', ...Array.from(new Set(jobs.map(job => job.department)))];
  
  // Filter jobs by department
  const filteredJobs = selectedDepartment === 'all' 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

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
              <Link href="/blog" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Blog
              </Link>
              <Link href="/reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Industry Reports
              </Link>
              <Link href="/careers" className="text-sm hover:opacity-70 transition-opacity" style={{ color: '#3b82f6', fontWeight: 500 }}>
                Careers
              </Link>
              <Link href="/evaluate" className="px-4 md:px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-all" style={{ backgroundColor: 'var(--slate-950)', color: 'white', fontWeight: 500 }}>
                Get Your Score
              </Link>
            </div>

            {/* Mobile Menu */}
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
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
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
                      style={{ color: '#3b82f6', fontWeight: 500 }}
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
              Join the AIDI Team
            </h1>
            <p 
              className="text-base md:text-lg"
              style={{ 
                color: 'var(--slate-600)',
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              Help build the Bloomberg Terminal of AI visibility measurement
            </p>
          </motion.div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 bg-white border-b" style={{ borderColor: 'var(--slate-200)' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedDepartment === dept
                    ? 'text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedDepartment === dept ? '#3b82f6' : 'transparent',
                  fontWeight: 500
                }}
              >
                {dept === 'all' ? 'All Positions' : dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-xl md:text-2xl"
              style={{ 
                fontWeight: 400,
                color: 'var(--slate-950)',
                fontFamily: 'Georgia, serif'
              }}
            >
              Open Positions ({filteredJobs.length})
            </h2>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No positions available</h3>
              <p className="text-gray-600">Check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <motion.article
                  key={job.id}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  style={{ borderColor: '#e2e8f0' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/careers/${job.slug}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: '#d4a574',
                              color: 'white',
                              fontWeight: 500
                            }}
                          >
                            {job.department}
                          </Badge>
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: '#f1f5f9',
                              color: 'var(--slate-600)',
                              fontWeight: 500
                            }}
                          >
                            {job.employment_type}
                          </span>
                        </div>
                        
                        <h3 
                          className="mb-2"
                          style={{ 
                            fontSize: '1.25rem',
                            fontWeight: 500,
                            color: 'var(--slate-950)',
                            lineHeight: 1.4
                          }}
                        >
                          {job.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {job.experience_level}
                          </span>
                          {job.salary_range && (
                            <span className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {job.salary_range}
                            </span>
                          )}
                        </div>
                        
                        <p 
                          className="text-sm mb-4"
                          style={{ 
                            color: 'var(--slate-600)',
                            lineHeight: 1.6,
                            fontWeight: 400
                          }}
                        >
                          {job.description.length > 200 
                            ? `${job.description.substring(0, 200)}...` 
                            : job.description
                          }
                        </p>
                      </div>
                      
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--slate-200)' }}>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Posted {format(new Date(job.posted_at), 'MMM d, yyyy')}</span>
                      </div>
                      
                      <span 
                        className="text-xs hover:opacity-70 transition-opacity"
                        style={{ color: '#3b82f6', fontWeight: 500 }}
                      >
                        View Details →
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Company Culture CTA */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12 border" style={{ borderColor: '#e2e8f0' }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#60a5fa' }} />
            <h2 
              className="mb-4"
              style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 400,
                color: 'var(--slate-950)',
                fontFamily: 'Georgia, serif'
              }}
            >
              Why Work at AIDI?
            </h2>
            <p className="mb-6 text-base" style={{ color: 'var(--slate-600)', lineHeight: 1.7, fontWeight: 400 }}>
              Join a team building the future of AI visibility measurement. We're looking for passionate individuals who want to make a real impact in the AI space.
            </p>
            <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
              <Link 
                href="/evaluate"
                className="px-6 py-3 rounded-xl hover:opacity-90 transition-all text-center"
                style={{
                  backgroundColor: 'var(--slate-950)',
                  color: 'white',
                  fontWeight: 500
                }}
              >
                Get Your AIDI Score
              </Link>
              <Link 
                href="/methodology"
                className="px-6 py-3 rounded-xl border hover:bg-gray-50 transition-all text-center"
                style={{
                  borderColor: 'var(--slate-200)',
                  color: 'var(--slate-950)',
                  fontWeight: 500
                }}
              >
                Learn Our Methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
