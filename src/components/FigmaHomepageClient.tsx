'use client';

/**
 * Client-side wrapper for Figma Homepage
 * Handles navigation state and mobile menu
 */

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { LogoImage } from './LogoImage';

export function FigmaHomepageClient({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Navigation - Sticky Light Header */}
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
              <div>
                <div style={{ fontWeight: 600, color: 'var(--slate-950)', letterSpacing: '-0.01em' }}>
                  AIDI
                </div>
                <div className="hidden md:block text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                  Audit-Grade Intelligence
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="/methodology" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Methodology
              </a>
              <a href="/leaderboards" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Leaderboard
              </a>
              <a href="/reports" className="text-sm hover:opacity-70 transition-opacity" style={{ color: 'var(--slate-700)', fontWeight: 500 }}>
                Reports
              </a>
              <button 
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--slate-700)', fontWeight: 500 }}
              >
                Sign In
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
                  {/* Logo in mobile menu */}
                  <div className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: 'var(--slate-200)' }}>
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: 'var(--slate-950)' }}
                    >
                      <LogoImage size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--slate-950)', letterSpacing: '-0.01em' }}>
                        AIDI
                      </div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                        Audit-Grade
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-1 pt-6">
                    <a 
                      href="/" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-900)', fontWeight: 500 }}
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
                      href="/leaderboards" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
                      style={{ color: 'var(--slate-700)', fontWeight: 500 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboard
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

                  {/* CTA Button at bottom */}
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

      {/* Main Content */}
      {children}
    </>
  );
}

