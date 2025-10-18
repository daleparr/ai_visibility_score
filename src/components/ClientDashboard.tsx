'use client';

/**
 * AIDI Client Dashboard - Bloomberg Terminal-Grade Intelligence
 * 
 * Features:
 * - Tabbed interface preventing infinite scrolling
 * - Mobile-optimized horizontal scroll tabs
 * - 5 distinct tabs: Overview, Portfolio, Performance, Benchmarks, Reports
 * - Executive intelligence with board-ready summaries
 * - Statistical rigor throughout
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Award, BarChart3, TrendingUp, FileText, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { LogoImage } from './LogoImage';
import { ExecutiveIntelligencePanel } from './ExecutiveIntelligencePanel';
import { PortfolioHeatMap } from './PortfolioHeatMap';
import { PerformanceTrends } from './PerformanceTrends';
import { EnhancedBenchmarks } from './EnhancedBenchmarks';
import { ReportsActionCenter } from './ReportsActionCenter';

export function ClientDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <header className="bg-white border-b sticky top-0 z-50" style={{ borderColor: '#e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: '#0f172a' }}
              >
                <LogoImage size={28} />
              </div>
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  color: '#0f172a', 
                  letterSpacing: '-0.01em',
                  fontSize: '1.25rem'
                }}>
                  AIDI Dashboard
                </div>
                <div className="hidden md:block text-xs uppercase tracking-wider" 
                     style={{ color: '#64748b', fontWeight: 500 }}>
                  CLIENT INTELLIGENCE PORTAL
                </div>
              </div>
            </div>

            {/* Portfolio Badge */}
            <div className="hidden md:flex items-center gap-3">
              <Badge 
                className="text-xs uppercase tracking-wider px-3 py-1.5"
                style={{ 
                  backgroundColor: '#d4a574',
                  color: 'white',
                  fontWeight: 500
                }}
              >
                PORTFOLIO: 12 BRANDS
              </Badge>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2">
                    <Menu className="w-6 h-6" style={{ color: '#64748b' }} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-6 mt-6">
                    <div className="flex items-center gap-3">
                      <LogoImage size={24} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>AIDI Dashboard</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>CLIENT INTELLIGENCE PORTAL</div>
                      </div>
                    </div>
                    
                    <Badge 
                      className="text-xs uppercase tracking-wider px-3 py-1.5 w-fit"
                      style={{ 
                        backgroundColor: '#d4a574',
                        color: 'white',
                        fontWeight: 500
                      }}
                    >
                      PORTFOLIO: 12 BRANDS
                    </Badge>

                    <div className="space-y-4">
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                        style={{ color: '#0f172a', fontWeight: 500 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Overview
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                        style={{ color: '#64748b', fontWeight: 400 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Portfolio
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                        style={{ color: '#64748b', fontWeight: 400 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Performance
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                        style={{ color: '#64748b', fontWeight: 400 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Benchmarks
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 transition-colors"
                        style={{ color: '#64748b', fontWeight: 400 }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Reports
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <Tabs defaultValue="overview" className="w-full">
          {/* Desktop Tab Navigation */}
          <div className="hidden md:block mb-8">
            <TabsList className="grid w-full grid-cols-5 bg-slate-50 p-1 rounded-lg" style={{ backgroundColor: '#f8fafc' }}>
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ 
                  color: '#0f172a',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                Portfolio
              </TabsTrigger>
              <TabsTrigger 
                value="performance"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                Performance
              </TabsTrigger>
              <TabsTrigger 
                value="benchmarks"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                Benchmarks
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                style={{ 
                  color: '#64748b',
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile Tab Navigation - Horizontal Scroll */}
          <div className="md:hidden mb-6">
            <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button 
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium bg-white border"
                style={{ 
                  color: '#0f172a',
                  borderColor: '#d4a574',
                  fontWeight: 500
                }}
              >
                Overview
              </button>
              <button 
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium border hover:bg-slate-50 transition-colors"
                style={{ 
                  color: '#64748b',
                  borderColor: '#e2e8f0',
                  fontWeight: 400
                }}
              >
                Portfolio
              </button>
              <button 
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium border hover:bg-slate-50 transition-colors"
                style={{ 
                  color: '#64748b',
                  borderColor: '#e2e8f0',
                  fontWeight: 400
                }}
              >
                Performance
              </button>
              <button 
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium border hover:bg-slate-50 transition-colors"
                style={{ 
                  color: '#64748b',
                  borderColor: '#e2e8f0',
                  fontWeight: 400
                }}
              >
                Benchmarks
              </button>
              <button 
                className="flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium border hover:bg-slate-50 transition-colors"
                style={{ 
                  color: '#64748b',
                  borderColor: '#e2e8f0',
                  fontWeight: 400
                }}
              >
                Reports
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="mt-0">
            <ExecutiveIntelligencePanel />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0">
            <PortfolioHeatMap />
          </TabsContent>

          <TabsContent value="performance" className="mt-0">
            <PerformanceTrends />
          </TabsContent>

          <TabsContent value="benchmarks" className="mt-0">
            <EnhancedBenchmarks />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsActionCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
