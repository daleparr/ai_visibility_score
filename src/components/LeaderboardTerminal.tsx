'use client';

/**
 * AIDI Leaderboard Terminal
 * Bloomberg Terminal-inspired competitive intelligence
 * Mobile-optimized for iPhone 16 (393px) and desktop
 * 
 * Design Philosophy:
 * - Dark terminal aesthetic with adaptive density
 * - Lighter font weights for improved readability
 * - Responsive: Card-based mobile, Table desktop
 * - Touch-friendly interactions
 * - Statistical rigor visible throughout
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Info,
  BarChart3,
  Zap,
  Target,
  Award,
  ExternalLink,
  Download,
  Bell,
  RefreshCw,
  Filter,
  Search,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { LogoImage } from './LogoImage';

interface LeaderboardEntry {
  rank: number;
  brand: string;
  url: string;
  logo?: string;
  score: number;
  grade: string;
  strengthsCount: number;
  strengthsLabel: string;
  weaknessesCount: number;
  weaknessesLabel: string;
  movement: number; // points gained/lost
  trend: number[]; // sparkline data
  lastUpdated: string;
  confidence: [number, number];
}

export function LeaderboardTerminal() {
  const [selectedSector, setSelectedSector] = useState('luxury-fashion');
  const [showExplanations, setShowExplanations] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      brand: 'Supreme',
      url: 'supremenewyork.com',
      score: 94,
      grade: 'A',
      strengthsCount: 11,
      strengthsLabel: 'Extreme Ready',
      weaknessesCount: 1,
      weaknessesLabel: 'Strong Sentiment',
      movement: 3,
      trend: [88, 89, 91, 90, 92, 91, 94],
      lastUpdated: 'Q4 2024',
      confidence: [92, 96],
    },
    {
      rank: 2,
      brand: 'Palace',
      url: 'palaceskateboards.com',
      score: 91,
      grade: 'A',
      strengthsCount: 10,
      strengthsLabel: 'Extreme Ready',
      weaknessesCount: 2,
      weaknessesLabel: 'Strong Sentiment',
      movement: 2,
      trend: [85, 87, 88, 89, 90, 89, 91],
      lastUpdated: 'Q4 2024',
      confidence: [89, 93],
    },
    {
      rank: 3,
      brand: 'Stone Island',
      url: 'stoneisland.com',
      score: 88,
      grade: 'B+',
      strengthsCount: 9,
      strengthsLabel: 'Extreme Ready',
      weaknessesCount: 3,
      weaknessesLabel: 'Strong Sentiment',
      movement: 0,
      trend: [87, 88, 87, 88, 89, 88, 88],
      lastUpdated: 'Q4 2024',
      confidence: [86, 90],
    },
    {
      rank: 4,
      brand: 'Off-White',
      url: 'off---white.com',
      score: 85,
      grade: 'B',
      strengthsCount: 8,
      strengthsLabel: 'Strong Sentiment',
      weaknessesCount: 4,
      weaknessesLabel: 'Competing Ready',
      movement: -1,
      trend: [88, 87, 86, 87, 86, 85, 85],
      lastUpdated: 'Q4 2024',
      confidence: [83, 87],
    },
    {
      rank: 5,
      brand: 'Fear of God',
      url: 'fearofgod.com',
      score: 82,
      grade: 'B',
      strengthsCount: 7,
      strengthsLabel: 'Strong Sentiment',
      weaknessesCount: 5,
      weaknessesLabel: 'Competing Ready',
      movement: 1,
      trend: [79, 80, 81, 80, 82, 81, 82],
      lastUpdated: 'Q4 2024',
      confidence: [80, 84],
    },
  ];

  const sectorAverage = 88.00;
  const topPerformer = leaderboardData[0];
  const risingBrands = leaderboardData.filter(b => b.movement > 0).length;
  const decliningBrands = leaderboardData.filter(b => b.movement < 0).length;

  const metricExplanations = {
    score: 'AIDI Score: Composite metric (0-100) derived from 12 dimensions across 4+ AI models with multi-run averaging (n≥3) and 95% confidence intervals. Higher scores indicate stronger AI recommendation likelihood.',
    strengths: 'Strengths: Number of dimensions scoring Grade A or above. Indicates areas where AI consistently recommends the brand.',
    weaknesses: 'Weaknesses: Dimensions requiring improvement. Shows competitive gaps and optimization opportunities.',
    movement: 'Movement: Points gained or lost vs. previous quarter. Statistical significance tested (p<0.05 required).',
    trend: 'Trend Sparkline: 7-period historical score trajectory. Visual indicator of momentum and volatility.',
    confidence: '95% Confidence Interval: Statistical range where true score likely falls. Narrower intervals indicate more reliable measurements.',
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#22c55e';
    if (grade.startsWith('B')) return '#3b82f6';
    if (grade.startsWith('C')) return '#f59e0b';
    if (grade.startsWith('D')) return '#ef4444';
    return 'var(--slate-500)';
  };

  const Sparkline = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const MetricTooltip = ({ metric, children }: { metric: string; children: React.ReactNode }) => (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setHoveredMetric(metric)}
      onMouseLeave={() => setHoveredMetric(null)}
    >
      {children}
      <AnimatePresence>
        {hoveredMetric === metric && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-80 p-4 rounded-lg shadow-xl"
            style={{
              backgroundColor: 'var(--slate-900)',
              border: '1px solid var(--slate-700)',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px'
            }}
          >
            <div className="text-xs" style={{ color: 'var(--slate-300)', lineHeight: 1.6 }}>
              {metricExplanations[metric as keyof typeof metricExplanations]}
            </div>
            <div 
              className="absolute w-2 h-2 rotate-45"
              style={{
                backgroundColor: 'var(--slate-900)',
                border: '1px solid var(--slate-700)',
                borderTop: 'none',
                borderLeft: 'none',
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0e1a' }}>
      {/* Terminal Header - Mobile Optimized */}
      <header className="border-b sticky top-0 z-50" style={{ backgroundColor: '#0f1419', borderColor: '#1e293b' }}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <div className="text-xs md:text-sm" style={{ color: '#22c55e', fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                  AIDI TERMINAL
                </div>
                <div className="hidden md:block text-xs" style={{ color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 400 }}>
                  LIVE DATA FEED
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setShowExplanations(!showExplanations)}
                className="px-4 py-2 rounded border text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors"
                style={{ 
                  borderColor: showExplanations ? '#22c55e' : '#1e293b',
                  color: showExplanations ? '#22c55e' : 'var(--slate-400)',
                  fontFamily: 'monospace',
                  fontWeight: 400
                }}
              >
                <Info className="w-4 h-4" />
                {showExplanations ? 'HIDE' : 'SHOW'} INFO
              </button>
              
              <button className="px-4 py-2 rounded border text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors" style={{ borderColor: '#1e293b', color: 'var(--slate-400)', fontFamily: 'monospace', fontWeight: 400 }}>
                <Download className="w-4 h-4" />
                EXPORT
              </button>
              
              <button className="px-4 py-2 rounded text-xs flex items-center gap-2" style={{ backgroundColor: '#22c55e', color: '#0a0e1a', fontWeight: 500, fontFamily: 'monospace' }}>
                GET SCORE
              </button>
            </div>

            {/* Mobile Menu - Burger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className="md:hidden p-2 rounded border hover:bg-slate-800 transition-colors"
                  style={{ borderColor: '#1e293b', color: 'var(--slate-400)' }}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]" style={{ backgroundColor: '#0a0e1a', borderLeft: '1px solid #1e293b' }}>
                <div className="flex flex-col h-full">
                  {/* Logo in mobile menu */}
                  <div className="flex items-center gap-3 pb-6 border-b" style={{ borderColor: '#1e293b' }}>
                    <div 
                      className="w-10 h-10 rounded flex items-center justify-center"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <LogoImage size={28} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: '#22c55e', letterSpacing: '0.03em', fontFamily: 'monospace' }}>
                        AIDI
                      </div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontWeight: 400, fontFamily: 'monospace' }}>
                        TERMINAL
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col gap-1 pt-6">
                    <a 
                      href="#leaderboard" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--slate-300)', fontWeight: 400, fontFamily: 'monospace' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Leaderboard
                    </a>
                    <a 
                      href="#methodology" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--slate-400)', fontWeight: 400, fontFamily: 'monospace' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Methodology
                    </a>
                    <a 
                      href="#home" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                      style={{ color: 'var(--slate-400)', fontWeight: 400, fontFamily: 'monospace' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </a>
                    <button 
                      onClick={() => {
                        setShowExplanations(!showExplanations);
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-left flex items-center gap-2"
                      style={{ color: 'var(--slate-400)', fontWeight: 400, fontFamily: 'monospace' }}
                    >
                      <Info className="w-4 h-4" />
                      {showExplanations ? 'Hide' : 'Show'} Info
                    </button>
                    <a 
                      href="#export" 
                      className="px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                      style={{ color: 'var(--slate-400)', fontWeight: 400, fontFamily: 'monospace' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </a>
                  </nav>

                  {/* CTA Button at bottom */}
                  <div className="mt-auto pt-6 border-t" style={{ borderColor: '#1e293b' }}>
                    <button 
                      className="w-full px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#22c55e', color: '#0a0e1a', fontWeight: 500, fontFamily: 'monospace' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      GET YOUR SCORE
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Alert Banner - Mobile Optimized */}
        <div className="border-t" style={{ borderColor: '#1e293b' }}>
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-2 md:py-3">
            <div className="flex items-center gap-2">
              <Bell className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
              <div className="text-xs md:text-sm" style={{ color: 'var(--slate-300)', fontWeight: 400 }}>
                <span className="hidden md:inline uppercase tracking-wider mr-2" style={{ color: '#ef4444', fontWeight: 500, fontFamily: 'monospace' }}>
                  ALERT:
                </span>
                <span>Supreme +3 pts this week</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Section Header - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <Award className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#22c55e' }} />
                <h1 className="text-lg md:text-3xl" style={{ color: 'white', fontWeight: 400, fontFamily: 'Georgia, serif' }}>
                  Luxury Fashion Top 20
                </h1>
                <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-md" style={{ backgroundColor: '#22c55e', color: '#0a0e1a', fontWeight: 400 }}>
                  LIVE
                </span>
              </div>
              <p className="text-xs md:text-sm" style={{ color: 'var(--slate-400)', fontWeight: 400 }}>
                Real-time AI rankings • Q4 2024
              </p>
            </div>

            <button className="hidden md:flex px-6 py-3 rounded-lg items-center gap-2" style={{ backgroundColor: '#d4a574', color: '#0a0e1a', fontWeight: 500 }}>
              <ExternalLink className="w-4 h-4" />
              Get Your Report
            </button>
          </div>

          {/* Market Summary Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border rounded-lg p-4 md:p-5" style={{ borderColor: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#22c55e' }} />
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 400 }}>
                  Average
                </div>
              </div>
              <div className="text-xl md:text-3xl mb-1" style={{ color: '#22c55e', fontWeight: 400, fontFamily: 'Georgia, serif' }}>
                {sectorAverage.toFixed(0)}
              </div>
              <div className="text-xs" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                Sector baseline
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border rounded-lg p-4 md:p-5" style={{ borderColor: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#3b82f6' }} />
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 400 }}>
                  Leader
                </div>
              </div>
              <div className="text-lg md:text-2xl mb-1" style={{ color: 'white', fontWeight: 500 }}>
                {topPerformer.brand}
              </div>
              <div className="text-xs" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                Score: {topPerformer.score}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border rounded-lg p-4 md:p-5" style={{ borderColor: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#22c55e' }} />
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 400 }}>
                  Rising
                </div>
              </div>
              <div className="text-xl md:text-3xl mb-1" style={{ color: '#22c55e', fontWeight: 500 }}>
                {risingBrands}
              </div>
              <div className="text-xs" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                Gaining
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border rounded-lg p-4 md:p-5" style={{ borderColor: '#1e293b' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4" style={{ color: '#ef4444' }} />
                <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 400 }}>
                  Falling
                </div>
              </div>
              <div className="text-xl md:text-3xl mb-1" style={{ color: '#ef4444', fontWeight: 500 }}>
                {decliningBrands}
              </div>
              <div className="text-xs" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
                Declining
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard - Mobile Cards / Desktop Table */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border rounded-xl overflow-hidden" style={{ borderColor: '#1e293b' }}>
          {/* Header */}
          <div className="border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between" style={{ borderColor: '#1e293b', backgroundColor: '#0f1419' }}>
            <div className="text-xs uppercase tracking-wider" style={{ color: '#22c55e', fontWeight: 500, fontFamily: 'monospace' }}>
              League Table
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button className="text-xs flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-slate-800 transition-colors" style={{ borderColor: '#1e293b', color: 'var(--slate-400)', fontFamily: 'monospace', fontWeight: 400 }}>
                <Filter className="w-3 h-3" />
                Compare
              </button>
              <button className="text-xs flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-slate-800 transition-colors" style={{ borderColor: '#1e293b', color: 'var(--slate-400)', fontFamily: 'monospace', fontWeight: 400 }}>
                <RefreshCw className="w-3 h-3" />
                Alerts
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y" style={{ borderColor: '#334155' }}>
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={entry.brand}
                className="p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Rank Badge */}
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: entry.rank <= 3 ? (entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : '#c07a4d') : '#1e293b',
                      color: entry.rank <= 3 ? '#0a0e1a' : 'var(--slate-400)',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  >
                    {entry.rank}
                  </div>

                  {/* Brand Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-0.5" style={{ color: 'white', fontWeight: 500, fontSize: '1rem' }}>
                      {entry.brand}
                    </h3>
                    <div className="text-xs mb-2" style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 400 }}>
                      {entry.url}
                    </div>
                    
                    {/* Score & Grade */}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl" style={{ color: getGradeColor(entry.grade), fontWeight: 600 }}>
                        {entry.score}
                      </div>
                      <div className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: `${getGradeColor(entry.grade)}20`, color: getGradeColor(entry.grade), fontWeight: 500 }}>
                        Grade {entry.grade}
                      </div>
                      {/* Movement */}
                      <div className="flex items-center gap-1 ml-auto">
                        {entry.movement > 0 ? (
                          <>
                            <ChevronUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                            <span className="text-sm" style={{ color: '#22c55e', fontWeight: 600 }}>
                              +{entry.movement}
                            </span>
                          </>
                        ) : entry.movement < 0 ? (
                          <>
                            <ChevronDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                            <span className="text-sm" style={{ color: '#ef4444', fontWeight: 600 }}>
                              {entry.movement}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm" style={{ color: 'var(--slate-500)', fontWeight: 500 }}>
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-emerald-900/20 border rounded-md px-3 py-2" style={{ borderColor: '#22c55e40' }}>
                    <div className="text-xs mb-1" style={{ color: '#4ade80', fontWeight: 400 }}>
                      {entry.strengthsCount} dimensions
                    </div>
                    <div className="text-xs" style={{ color: '#22c55e60', fontWeight: 300 }}>
                      {entry.strengthsLabel}
                    </div>
                  </div>
                  <div className="bg-purple-900/20 border rounded-md px-3 py-2" style={{ borderColor: '#a855f740' }}>
                    <div className="text-xs mb-1" style={{ color: '#c084fc', fontWeight: 400 }}>
                      {entry.weaknessesCount} areas
                    </div>
                    <div className="text-xs" style={{ color: '#a855f760', fontWeight: 300 }}>
                      {entry.weaknessesLabel}
                    </div>
                  </div>
                </div>

                {/* Trend & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkline data={entry.trend} />
                    <span className="text-xs" style={{ color: '#475569', fontWeight: 300 }}>7-day</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: '#1e293b', color: 'var(--slate-400)' }}>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded border flex items-center justify-center" style={{ borderColor: '#1e293b', color: 'var(--slate-400)' }}>
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs uppercase tracking-wider" style={{ borderColor: '#1e293b', backgroundColor: '#0a0e1a', color: 'var(--slate-500)', fontFamily: 'monospace', fontWeight: 500 }}>
            <div className="col-span-1">Rank</div>
            <div className="col-span-2">Brand</div>
            <div className="col-span-1">
              <MetricTooltip metric="score">
                <div className="flex items-center gap-1 cursor-help">
                  AIDI Score
                  <Info className="w-3 h-3" />
                </div>
              </MetricTooltip>
            </div>
            <div className="col-span-2">
              <MetricTooltip metric="strengths">
                <div className="flex items-center gap-1 cursor-help">
                  Strengths
                  <Info className="w-3 h-3" />
                </div>
              </MetricTooltip>
            </div>
            <div className="col-span-2">
              <MetricTooltip metric="weaknesses">
                <div className="flex items-center gap-1 cursor-help">
                  Weaknesses
                  <Info className="w-3 h-3" />
                </div>
              </MetricTooltip>
            </div>
            <div className="col-span-1">
              <MetricTooltip metric="movement">
                <div className="flex items-center gap-1 cursor-help">
                  Movement
                  <Info className="w-3 h-3" />
                </div>
              </MetricTooltip>
            </div>
            <div className="col-span-2">
              <MetricTooltip metric="trend">
                <div className="flex items-center gap-1 cursor-help">
                  Trend
                  <Info className="w-3 h-3" />
                </div>
              </MetricTooltip>
            </div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y" style={{ borderColor: '#334155' }}>
            {leaderboardData.map((entry, index) => (
              <motion.div
                key={entry.brand}
                className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-800/30 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center gap-2">
                  {entry.rank <= 3 ? (
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ 
                        backgroundColor: entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#94a3b8' : '#c07a4d',
                        color: '#0a0e1a',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      {entry.rank}
                    </div>
                  ) : (
                    <div className="text-lg" style={{ color: 'var(--slate-500)', fontWeight: 500, fontFamily: 'monospace' }}>
                      #{entry.rank}
                    </div>
                  )}
                </div>

                {/* Brand */}
                <div className="col-span-2 flex items-center gap-3">
                  <div>
                    <div style={{ color: 'white', fontWeight: 500, marginBottom: '0.125rem' }}>
                      {entry.brand}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 400 }}>
                      {entry.url}
                    </div>
                  </div>
                </div>

                {/* AIDI Score */}
                <div className="col-span-1 flex items-center">
                  <div>
                    <div className="text-2xl mb-1" style={{ color: getGradeColor(entry.grade), fontWeight: 600 }}>
                      {entry.score}
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-md inline-block" style={{ backgroundColor: `${getGradeColor(entry.grade)}20`, color: getGradeColor(entry.grade), fontWeight: 500 }}>
                      Grade {entry.grade}
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="col-span-2 flex items-center">
                  <div className="bg-emerald-900/20 border rounded-md px-3 py-2" style={{ borderColor: '#22c55e40' }}>
                    <div className="text-sm mb-1" style={{ color: '#4ade80', fontWeight: 400 }}>
                      {entry.strengthsCount} dimensions
                    </div>
                    <div className="text-xs" style={{ color: '#22c55e60', fontWeight: 300 }}>
                      {entry.strengthsLabel}
                    </div>
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="col-span-2 flex items-center">
                  <div className="bg-purple-900/20 border rounded-md px-3 py-2" style={{ borderColor: '#a855f740' }}>
                    <div className="text-sm mb-1" style={{ color: '#c084fc', fontWeight: 400 }}>
                      {entry.weaknessesCount} areas
                    </div>
                    <div className="text-xs" style={{ color: '#a855f760', fontWeight: 300 }}>
                      {entry.weaknessesLabel}
                    </div>
                  </div>
                </div>

                {/* Movement */}
                <div className="col-span-1 flex items-center">
                  <div className="flex items-center gap-2">
                    {entry.movement > 0 ? (
                      <>
                        <ChevronUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                        <span style={{ color: '#22c55e', fontWeight: 600, fontFamily: 'monospace' }}>
                          +{entry.movement}
                        </span>
                      </>
                    ) : entry.movement < 0 ? (
                      <>
                        <ChevronDown className="w-4 h-4" style={{ color: '#ef4444' }} />
                        <span style={{ color: '#ef4444', fontWeight: 600, fontFamily: 'monospace' }}>
                          {entry.movement}
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4" style={{ color: 'var(--slate-500)' }} />
                        <span style={{ color: 'var(--slate-500)', fontWeight: 500, fontFamily: 'monospace' }}>
                          0
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs ml-2" style={{ color: 'var(--slate-600)', fontWeight: 400 }}>
                    Q4 2024
                  </div>
                </div>

                {/* Trend Sparkline */}
                <div className="col-span-2 flex items-center gap-3">
                  <Sparkline data={entry.trend} />
                  <div className="text-xs" style={{ color: '#475569', fontWeight: 300 }}>
                    7-period
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center gap-2">
                  <button className="w-8 h-8 rounded border flex items-center justify-center hover:bg-slate-700 transition-colors" style={{ borderColor: '#1e293b', color: 'var(--slate-400)' }}>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded border flex items-center justify-center hover:bg-slate-700 transition-colors" style={{ borderColor: '#1e293b', color: 'var(--slate-400)' }}>
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          </div>

          {/* Table Footer */}
          <div className="border-t px-4 md:px-6 py-3 md:py-4" style={{ borderColor: '#1e293b', backgroundColor: '#0f1419' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs" style={{ color: 'var(--slate-500)', fontWeight: 400 }}>
              <div>
                <span className="md:hidden">5 of 20 brands</span>
                <span className="hidden md:inline">Showing 5 of 20 brands • Multi-run averaging (n≥3) • 95% CI</span>
              </div>
              <button className="text-left md:text-right hover:text-white transition-colors">
                View Full Leaderboard →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Intelligence Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
          {/* Live Market Intelligence */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border rounded-xl p-5 md:p-6" style={{ borderColor: '#3b82f6' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#3b82f6' }} />
              <h3 style={{ color: 'white', fontWeight: 400, fontSize: '0.9375rem' }}>Market Intelligence</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--slate-400)', fontWeight: 300 }}>Sector Average:</span>
                <span style={{ color: '#60a5fa', fontWeight: 400 }}>88/100</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--slate-400)', fontWeight: 300 }}>Top Performer:</span>
                <span style={{ color: '#4ade80', fontWeight: 400 }}>Supreme</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--slate-400)', fontWeight: 300 }}>Opportunity:</span>
                <span style={{ color: '#fbbf24', fontWeight: 400 }}>+6 points</span>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/20 border rounded-xl p-5 md:p-6" style={{ borderColor: '#22c55e' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#22c55e' }} />
              <h3 style={{ color: 'white', fontWeight: 400, fontSize: '0.9375rem' }}>Trends</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#22c55e', color: '#0a0e1a', fontWeight: 400 }}>Rising</span>
                <span className="text-sm" style={{ color: 'var(--slate-300)', fontWeight: 300 }}>Supreme</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#22c55e', color: '#0a0e1a', fontWeight: 400 }}>Rising</span>
                <span className="text-sm" style={{ color: 'var(--slate-300)', fontWeight: 300 }}>Palace</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#ef4444', color: 'white', fontWeight: 400 }}>Declining</span>
                <span className="text-sm" style={{ color: 'var(--slate-300)', fontWeight: 300 }}>Off-White</span>
              </div>
            </div>
          </div>

          {/* Get Started */}
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border rounded-xl p-5 md:p-6" style={{ borderColor: '#a855f7' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#a855f7' }} />
              <h3 style={{ color: 'white', fontWeight: 400, fontSize: '0.9375rem' }}>Get Started</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--slate-400)', lineHeight: 1.6, fontWeight: 300 }}>
              See how your brand scores
            </p>
            <button className="w-full px-4 py-3 rounded-lg" style={{ backgroundColor: '#a855f7', color: 'white', fontWeight: 400 }}>
              Analyze My Brand →
            </button>
          </div>
        </div>

        {/* Methodology Explanation (if enabled) */}
        <AnimatePresence>
          {showExplanations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8 bg-slate-900/80 border rounded-xl p-8 overflow-hidden"
              style={{ borderColor: '#1e293b' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-6 h-6" style={{ color: '#22c55e' }} />
                <h3 className="text-xl" style={{ color: 'white', fontWeight: 600 }}>
                  How This Leaderboard Works
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#22c55e', fontWeight: 500 }}>
                    AIDI Methodology
                  </h4>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--slate-400)', lineHeight: 1.7, fontWeight: 400 }}>
                    <li>• Multi-model testing across 4+ frontier AI systems</li>
                    <li>• Standardized, brand-agnostic query framework</li>
                    <li>• Multi-run averaging (n≥3) with statistical significance testing</li>
                    <li>• Percentile rankings benchmarked against industry averages</li>
                    <li>• Quarterly updates with historical trend tracking</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: '#3b82f6', fontWeight: 500 }}>
                    Professional Features
                  </h4>
                  <ul className="space-y-3 text-sm" style={{ color: 'var(--slate-400)', lineHeight: 1.7, fontWeight: 400 }}>
                    <li>• Live competitive intelligence dashboards</li>
                    <li>• Market alerts for ranking changes</li>
                    <li>• Historical trend analysis (7-period sparklines)</li>
                    <li>• Export capabilities for CFO/CEO presentations</li>
                    <li>• Audit-grade reporting with confidence intervals</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
