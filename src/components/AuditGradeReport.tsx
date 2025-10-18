'use client';

/**
 * AIDI Audit-Grade Report
 * The Bloomberg Terminal of AI Visibility
 * 
 * Design Philosophy:
 * - Institutional authority meets editorial sophistication
 * - Statistical rigor visually communicated
 * - Board-ready by default
 * - Every element defensible, peer-reviewable
 */

import { motion } from 'framer-motion';
import { TrendingUp, Database, Lock, CheckCircle2, AlertTriangle, Award, BarChart3, FileText, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Footer } from './Footer';
import { LogoImage } from './LogoImage';

export function AuditGradeReport() {
  const reportData = {
    score: 82,
    grade: 'B+',
    confidenceInterval: [79, 85],
    percentile: 94,
    industryAvg: 64,
    sampleSize: 15,
    pValue: 0.003,
    url: 'nike.com',
    sector: 'Athletic Footwear',
    dateGenerated: 'October 18, 2025',
    testRuns: 15,
    modelsAnalyzed: 4,
  };

  const methodologyComparison = [
    {
      dimension: 'Crawl Access',
      others: 'Public pages only',
      aidi: 'Full-site deep crawl with credentials',
      impact: 'critical',
    },
    {
      dimension: 'Testing Methodology',
      others: 'User-defined custom prompts',
      aidi: 'Standardized, locked framework',
      impact: 'critical',
    },
    {
      dimension: 'Query Bias Control',
      others: 'Branded prompts common',
      aidi: 'Brand-agnostic, category-generic baseline',
      impact: 'critical',
    },
    {
      dimension: 'Statistical Rigor',
      others: 'Single runs, no confidence intervals',
      aidi: 'Multi-run averages (n≥3), 95% CI, p-values',
      impact: 'critical',
    },
    {
      dimension: 'Benchmarking',
      others: 'Numbers stand alone',
      aidi: 'Percentile rankings, industry averages',
      impact: 'high',
    },
  ];

  const keyMetrics = [
    {
      name: 'Brand Perception Authority',
      score: 88,
      change: '+12',
      confidence: [85, 91],
      significance: 'p < 0.01',
      status: 'Statistically significant improvement',
    },
    {
      name: 'Technical Foundation',
      score: 79,
      change: '+6',
      confidence: [76, 82],
      significance: 'p < 0.05',
      status: 'Moderate improvement, approaching significance',
    },
    {
      name: 'Shopping Experience Quality',
      score: 91,
      change: '+3',
      confidence: [88, 94],
      significance: 'p = 0.18',
      status: 'Strong baseline, improvement not significant',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--slate-50)' }}>
      {/* Premium Header - Editorial Authority */}
      <header className="bg-white border-b" style={{ borderColor: 'var(--slate-200)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:justify-between gap-4 md:gap-0">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded flex items-center justify-center"
                    style={{ backgroundColor: 'var(--slate-950)' }}
                  >
                    <LogoImage size={28} className="md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h1 
                      className="text-xl md:text-2xl"
                      style={{ 
                        fontWeight: 600,
                        color: 'var(--slate-950)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        fontFamily: 'Georgia, serif'
                      }}
                    >
                      AIDI
                    </h1>
                    <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--slate-500)', fontWeight: 500, fontFamily: 'monospace' }}>
                      AI Discoverability Index
                    </p>
                  </div>
                </div>
                <div className="hidden md:block h-10 w-px" style={{ backgroundColor: 'var(--slate-200)' }} />
                <span 
                  className="text-xs uppercase tracking-wider px-4 py-1.5 rounded-md"
                  style={{ 
                    backgroundColor: '#d4a574',
                    color: 'white',
                    fontWeight: 600,
                    letterSpacing: '0.12em'
                  }}
                >
                  Audit-Grade Intelligence
                </span>
              </div>
              <p className="text-sm max-w-2xl" style={{ color: '#64748b', lineHeight: 1.6, fontWeight: 400, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Statistical rigor. Peer-reviewable methodology. Board-ready intelligence.
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                Report Generated
              </div>
              <div style={{ color: 'var(--slate-900)', fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {reportData.dateGenerated}
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                {reportData.testRuns} test runs • {reportData.modelsAnalyzed} AI models
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-6 md:py-12 space-y-6 md:space-y-12">
        {/* Hero Score Section - Asymmetric Layout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-br rounded-2xl border overflow-hidden" 
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--slate-950) 0%, var(--slate-800) 100%)',
              borderColor: 'var(--slate-700)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {/* Left: Score Display */}
              <div className="md:col-span-5 p-6 md:p-12 flex flex-col justify-center md:border-r" style={{ borderColor: 'var(--slate-700)' }}>
                <div className="text-xs uppercase tracking-widest mb-6" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                  Audit-Grade AIDI Score
                </div>
                
                <div className="flex items-end gap-3 md:gap-4 mb-4 md:mb-6">
                  <motion.div
                    className="text-6xl md:text-7xl lg:text-8xl"
                    style={{ 
                      fontWeight: 300,
                      color: 'white',
                      lineHeight: 1,
                      letterSpacing: '-0.04em',
                      fontFamily: 'Georgia, serif'
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    {reportData.score}
                  </motion.div>
                  <div className="mb-2 md:mb-3">
                    <div className="text-xl md:text-2xl" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>/100</div>
                    <div 
                      className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-white text-xs uppercase tracking-wider mt-2"
                      style={{ backgroundColor: '#d4a574', fontWeight: 600, fontFamily: 'monospace' }}
                    >
                      Grade {reportData.grade}
                    </div>
                  </div>
                </div>

                {/* Confidence Interval */}
                <div className="bg-slate-800 rounded-lg p-4 border" style={{ borderColor: '#334155' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4" style={{ color: '#94a3b8' }} />
                    <div className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      95% Confidence Interval
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {reportData.confidenceInterval[0]}–{reportData.confidenceInterval[1]}
                    </div>
                    <div className="text-xs" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      n = {reportData.sampleSize} runs
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Multi-run averaging with statistical significance testing
                  </div>
                </div>
              </div>

              {/* Right: Context & Benchmarking */}
              <div className="md:col-span-7 p-6 md:p-12 border-t md:border-t-0" style={{ borderColor: 'var(--slate-700)' }}>
                <div className="mb-6 md:mb-8">
                  <h2 
                    className="text-xl md:text-2xl lg:text-3xl mb-3"
                    style={{ 
                      color: 'white',
                      fontWeight: 300,
                      lineHeight: 1.3,
                      letterSpacing: '-0.02em',
                      fontFamily: 'Georgia, serif'
                    }}
                  >
                    AI Visibility Intelligence Report
                  </h2>
                  <div className="flex items-center gap-3 text-sm" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                    <span>{reportData.url}</span>
                    <span>•</span>
                    <span>{reportData.sector}</span>
                  </div>
                </div>

                {/* Benchmark Position */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-slate-800 rounded-lg p-4 md:p-6 border" style={{ borderColor: '#334155' }}>
                    <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      Percentile Rank
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="text-3xl md:text-4xl" style={{ color: 'white', fontWeight: 600, lineHeight: 1, fontFamily: 'monospace' }}>
                        {reportData.percentile}
                        <span className="text-xl md:text-2xl" style={{ color: '#94a3b8' }}>th</span>
                      </div>
                    </div>
                    <div className="text-xs mt-2" style={{ color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Top {100 - reportData.percentile}% in {reportData.sector}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-4 md:p-6 border" style={{ borderColor: '#334155' }}>
                    <div className="text-xs uppercase tracking-wider mb-2" style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      vs Industry Average
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl md:text-4xl" style={{ color: 'white', fontWeight: 600, lineHeight: 1, fontFamily: 'monospace' }}>
                        +{reportData.score - reportData.industryAvg}
                      </div>
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#22c55e' }} />
                    </div>
                    <div className="text-xs mt-2" style={{ color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Industry avg: {reportData.industryAvg}/100
                    </div>
                  </div>
                </div>

                {/* Statistical Significance */}
                <div className="bg-emerald-900/20 border rounded-lg p-5" style={{ borderColor: '#22c55e40' }}>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'white', fontWeight: 500, fontFamily: 'Georgia, serif' }}>
                        Statistically Significant Performance
                      </div>
                      <div className="text-xs" style={{ color: '#94a3b8', lineHeight: 1.6, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        Your score exceeds industry baseline with high confidence (p = {reportData.pValue}). 
                        This result is defensible for board presentation and M&A due diligence.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Methodology Superiority Section */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6" style={{ color: '#d4a574' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                Why AIDI is Audit-Grade
              </h2>
            </div>
            <p className="text-sm max-w-3xl" style={{ color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
              Not all AI visibility measurement is created equal. AIDI employs peer-reviewable methodology with statistical rigor designed for enterprise decision-making.
            </p>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--slate-50)', borderBottom: '1px solid #e2e8f0' }}>
                    <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs uppercase tracking-wider" style={{ color: '#64748b', fontWeight: 500 }}>
                      Dimension
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs uppercase tracking-wider" style={{ color: '#94a3b8', fontWeight: 400 }}>
                      Monitoring-Grade Tools
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs uppercase tracking-wider" style={{ color: '#1e293b', fontWeight: 500 }}>
                      AIDI (Audit-Grade)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {methodologyComparison.map((row, index) => {
                    // Determine background color based on impact
                    const getDimensionStyle = () => {
                      if (row.impact === 'critical') {
                        return {
                          backgroundColor: '#ef4444',
                          color: 'white'
                        };
                      } else if (row.impact === 'high') {
                        return {
                          backgroundColor: '#f97316',
                          color: 'white'
                        };
                      }
                      return {
                        backgroundColor: 'transparent',
                        color: 'var(--slate-700)'
                      };
                    };

                    const dimensionStyle = getDimensionStyle();

                    return (
                      <motion.tr
                        key={index}
                        className="border-b"
                        style={{ borderColor: '#e2e8f0' }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div 
                            className="inline-block px-3 py-1.5 rounded-md text-xs md:text-sm"
                            style={{ 
                              backgroundColor: dimensionStyle.backgroundColor,
                              color: dimensionStyle.color,
                              fontWeight: 500
                            }}
                          >
                            {row.dimension}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5 text-xs md:text-sm" style={{ color: '#64748b', fontWeight: 300 }}>
                          {row.others}
                        </td>
                        <td className="px-4 md:px-6 py-4 md:py-5">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#4ade80' }} />
                            <span className="text-xs md:text-sm" style={{ color: 'var(--slate-900)', fontWeight: 400 }}>
                              {row.aidi}
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-white px-4 md:px-6 py-5 md:py-6 border-t" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d4a574' }}>
                  <LogoImage size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-sm md:text-base" style={{ fontWeight: 500, color: 'var(--slate-900)' }}>
                    Enterprise-Grade Intelligence
                  </h4>
                  <p className="text-xs md:text-sm" style={{ color: '#64748b', lineHeight: 1.6, fontWeight: 300 }}>
                    AIDI methodology is designed for compliance, M&A diligence, enterprise procurement, and long-term AI search strategy. 
                    Every data point is defensible, reproducible, and peer-reviewable.
                  </p>
                </div>
                <button 
                  className="w-full md:w-auto px-5 md:px-6 py-2.5 md:py-3 rounded-lg text-white hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--slate-950)', fontWeight: 500 }}
                >
                  <FileText className="w-4 h-4" />
                  View Full Methodology
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics with Statistical Rigor */}
        <section>
          <div className="mb-8">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
              Performance Analysis with Statistical Validation
            </h2>
            <p className="text-sm" style={{ color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>
              Each metric includes confidence intervals and significance testing to distinguish real improvements from statistical noise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {keyMetrics.map((metric, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl border p-5 md:p-6"
                style={{ borderColor: '#e2e8f0' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
              >
                <div className="space-y-4">
                  {/* Metric Header */}
                  <div>
                    <h3 className="mb-3 text-sm md:text-base" style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                      {metric.name}
                    </h3>
                    <div className="flex items-end gap-3 mb-3">
                      <div className="text-5xl md:text-6xl" style={{ fontWeight: 600, color: 'var(--slate-950)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {metric.score}
                      </div>
                      <div className="mb-1">
                        <div 
                          className="px-2 md:px-3 py-1 rounded text-xs flex items-center gap-1"
                          style={{ backgroundColor: '#22c55e20', color: '#16a34a', fontWeight: 600 }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {metric.change}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--slate-600)' }}>95% CI:</span>
                        <span style={{ fontWeight: 500, color: 'var(--slate-900)' }}>
                          [{metric.confidence[0]}, {metric.confidence[1]}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--slate-600)' }}>Significance:</span>
                        <span style={{ fontWeight: 600, color: metric.significance.includes('<') ? '#16a34a' : 'var(--slate-500)' }}>
                          {metric.significance}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visualization & Status */}
                  <div>
                    {/* Progress Bar with CI Overlay */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--slate-500)' }}>
                        <span>0</span>
                        <span>100</span>
                      </div>
                      <div className="relative h-10 md:h-12 rounded-lg" style={{ backgroundColor: 'var(--slate-100)' }}>
                        {/* Confidence Interval Band */}
                        <motion.div
                          className="absolute h-full rounded-lg"
                          style={{ 
                            backgroundColor: '#22c55e20',
                            left: `${metric.confidence[0]}%`,
                            right: `${100 - metric.confidence[1]}%`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        />
                        {/* Score Bar */}
                        <motion.div
                          className="absolute h-full rounded-lg"
                          style={{ backgroundColor: '#22c55e' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.score}%` }}
                          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                        />
                        {/* Score Label */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 px-2 md:px-3 py-1 rounded text-xs text-white"
                          style={{ 
                            left: `${metric.score}%`,
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'var(--slate-950)',
                            fontWeight: 600
                          }}
                        >
                          {metric.score}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--slate-500)' }}>
                        <span>CI Lower: {metric.confidence[0]}</span>
                        <span>CI Upper: {metric.confidence[1]}</span>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div 
                      className="bg-slate-50 rounded-lg p-3 md:p-4 border"
                      style={{ borderColor: '#e2e8f0' }}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        {metric.significance.includes('<') ? (
                          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
                        ) : (
                          <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" style={{ color: '#94a3b8' }} />
                        )}
                        <div>
                          <div className="text-xs md:text-sm mb-1" style={{ fontWeight: 500, color: 'var(--slate-900)' }}>
                            Statistical Interpretation
                          </div>
                          <div className="text-xs" style={{ color: '#64748b', lineHeight: 1.5, fontWeight: 400 }}>
                            {metric.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Board-Ready CTA */}
        <section className="relative overflow-hidden">
          <div 
            className="rounded-xl md:rounded-2xl p-6 md:p-12 border relative z-10"
            style={{ 
              backgroundColor: 'var(--slate-950)',
              borderColor: 'var(--slate-800)'
            }}
          >
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 md:gap-3 mb-4">
                <Database className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#d4a574' }} />
                <span 
                  className="text-xs uppercase tracking-wider px-3 py-1.5 rounded-md"
                  style={{ 
                    backgroundColor: '#d4a574',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  Board-Ready Intelligence
                </span>
              </div>
              
              <h2 className="mb-3 md:mb-4 text-xl md:text-2xl lg:text-3xl" style={{ color: 'white', fontWeight: 300, lineHeight: 1.3 }}>
                Export for CFO, CEO, and Board Presentations
              </h2>
              
              <p className="text-xs md:text-sm mb-6 md:mb-8" style={{ color: 'var(--slate-400)', lineHeight: 1.7 }}>
                Every data point in this report includes statistical validation, confidence intervals, and peer-reviewable methodology. 
                Designed for M&A diligence, enterprise procurement, and strategic planning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  className="px-6 md:px-8 py-3 md:py-4 rounded-lg text-slate-950 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'white', fontWeight: 600 }}
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  Download Executive PDF
                </button>
                <button 
                  className="px-6 md:px-8 py-3 md:py-4 rounded-lg border text-white hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--slate-700)', fontWeight: 500 }}
                >
                  <FileText className="w-4 h-4 md:w-5 md:h-5" />
                  View Full Methodology
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
