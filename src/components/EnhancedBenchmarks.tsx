'use client';

/**
 * Enhanced Benchmarks - Benchmarks Tab
 * Percentile positioning and competitive context
 */

import { motion } from 'framer-motion';
import { Award, TrendingUp, BarChart3 } from 'lucide-react';

export function EnhancedBenchmarks() {
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
          Enhanced Benchmarks
        </h1>
        <p 
          className="text-base md:text-lg max-w-3xl mx-auto"
          style={{ 
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Percentile positioning and competitive context with industry distribution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white rounded-xl border p-6 text-center"
          style={{ borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Award className="w-8 h-8 mx-auto mb-4" style={{ color: '#d4a574' }} />
          <div 
            className="text-3xl mb-2"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            82nd
          </div>
          <div className="text-sm" style={{ color: '#64748b' }}>Overall Percentile</div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border p-6 text-center"
          style={{ borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <TrendingUp className="w-8 h-8 mx-auto mb-4" style={{ color: '#22c55e' }} />
          <div 
            className="text-3xl mb-2"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            #2
          </div>
          <div className="text-sm" style={{ color: '#64748b' }}>Portfolio Rank</div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border p-6 text-center"
          style={{ borderColor: '#e2e8f0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <BarChart3 className="w-8 h-8 mx-auto mb-4" style={{ color: '#3b82f6' }} />
          <div 
            className="text-3xl mb-2"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            47
          </div>
          <div className="text-sm" style={{ color: '#64748b' }}>Peer Group Size</div>
        </motion.div>
      </div>

      <motion.div
        className="bg-white rounded-xl border p-6"
        style={{ borderColor: '#e2e8f0' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h2 
          className="text-lg mb-4"
          style={{ 
            fontWeight: 600,
            color: '#0f172a',
            fontFamily: 'Georgia, serif'
          }}
        >
          Industry Distribution
        </h2>
        <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
          <p style={{ color: '#64748b' }}>Bell curve chart placeholder - Recharts integration needed</p>
        </div>
      </motion.div>
    </div>
  );
}
