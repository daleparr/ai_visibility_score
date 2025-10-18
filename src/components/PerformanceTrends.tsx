'use client';

/**
 * Performance Trends - Performance Tab
 * Time-series analysis with statistical rigor
 */

import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Award } from 'lucide-react';

export function PerformanceTrends() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 
          className="text-2xl md:text-3xl lg:text-4xl mb-4"
          style={{ 
            fontWeight: 400,
            color: '#0f172a',
            fontFamily: 'Georgia, serif',
            lineHeight: 1.2
          }}
        >
          Performance Trends
        </h1>
        <p 
          className="text-base md:text-lg max-w-3xl mx-auto"
          style={{ 
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Time-series analysis with statistical rigor and confidence intervals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-xl border p-6"
          style={{ borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" style={{ color: '#d4a574' }} />
            <h2 
              className="text-lg"
              style={{ 
                fontWeight: 600,
                color: '#0f172a',
                fontFamily: 'Georgia, serif'
              }}
            >
              Quarterly Trends
            </h2>
          </div>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
            <p style={{ color: '#64748b' }}>Chart placeholder - Recharts integration needed</p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border p-6"
          style={{ borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6" style={{ color: '#d4a574' }} />
            <h2 
              className="text-lg"
              style={{ 
                fontWeight: 600,
                color: '#0f172a',
                fontFamily: 'Georgia, serif'
              }}
            >
              Dimension Breakdown
            </h2>
          </div>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
            <p style={{ color: '#64748b' }}>Chart placeholder - Recharts integration needed</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
