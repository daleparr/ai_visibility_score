'use client';

/**
 * Executive Intelligence Panel - Overview Tab
 * Board-ready intelligence with actionable insights and priority alerts
 */

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, Award, BarChart3 } from 'lucide-react';
import { Badge } from './ui/badge';

export function ExecutiveIntelligencePanel() {
  const portfolioMetrics = [
    {
      label: 'PORTFOLIO BRANDS',
      value: '12 brands',
      icon: Award,
      color: '#0f172a'
    },
    {
      label: 'AVG AIDI SCORE',
      value: '78',
      change: '+4',
      icon: BarChart3,
      color: '#22c55e',
      trend: 'up'
    },
    {
      label: 'ABOVE BENCHMARK',
      value: '9 of 12',
      icon: CheckCircle2,
      color: '#22c55e'
    },
    {
      label: 'ACTION REQUIRED',
      value: '2 brands',
      icon: AlertTriangle,
      color: '#ef4444'
    }
  ];

  const executiveSummary = [
    'Portfolio strengthening: 7 of 12 brands trending upward with statistically significant improvements (p < 0.05)',
    'Competitive threats: Nike showing concerning 12-point decline while Adidas vulnerability presents opportunity',
    'Industry context: Athletic Footwear sector benchmark rose 8 points; maintaining 78-point average keeps portfolio in 82nd percentile',
    'Recommended action: Immediate review of Technical Foundation dimension for declining brands; replicate Shopping Experience Quality approach across portfolio'
  ];

  const priorityAlerts = [
    {
      type: 'critical',
      title: 'Nike Score Decline',
      description: '12-point drop in Q4 (p < 0.01)',
      action: 'Review Technical Foundation dimension',
      color: '#ef4444'
    },
    {
      type: 'opportunity',
      title: 'Adidas Vulnerability',
      description: 'Competitor showing 8-point decline',
      action: 'Increase market share capture',
      color: '#f59e0b'
    },
    {
      type: 'success',
      title: 'Jordan Brand Excellence',
      description: 'Consistent 85+ scores across quarters',
      action: 'Replicate strategies across portfolio',
      color: '#22c55e'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Executive Overview Header */}
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
          Executive Overview
        </h1>
        <p 
          className="text-base md:text-lg max-w-3xl mx-auto"
          style={{ 
            color: '#64748b',
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Board-ready intelligence with actionable insights and priority alerts
        </p>
      </div>

      {/* Portfolio Health Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {portfolioMetrics.map((metric, index) => (
          <motion.div
            key={index}
            className="bg-white rounded-xl border p-4 md:p-6 text-center"
            style={{ borderColor: '#e2e8f0' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-center mb-3">
              <metric.icon 
                className="w-5 h-5 md:w-6 md:h-6" 
                style={{ color: metric.color }} 
              />
            </div>
            <div 
              className="text-lg md:text-xl mb-1"
              style={{ 
                fontWeight: 600,
                color: '#0f172a',
                fontFamily: 'Georgia, serif'
              }}
            >
              {metric.value}
            </div>
            <div 
              className="text-xs md:text-sm mb-2"
              style={{ 
                color: '#64748b',
                fontWeight: 500,
                letterSpacing: '0.05em'
              }}
            >
              {metric.label}
            </div>
            {metric.change && (
              <div className="flex items-center justify-center gap-1">
                <TrendingUp 
                  className="w-3 h-3" 
                  style={{ color: metric.trend === 'up' ? '#22c55e' : '#ef4444' }} 
                />
                <span 
                  className="text-xs font-medium"
                  style={{ color: metric.trend === 'up' ? '#22c55e' : '#ef4444' }}
                >
                  {metric.change}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Board-Ready Summary */}
      <motion.div
        className="bg-white rounded-xl border p-6 md:p-8"
        style={{ borderColor: '#e2e8f0' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6" style={{ color: '#d4a574' }} />
          <h2 
            className="text-lg md:text-xl"
            style={{ 
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'Georgia, serif'
            }}
          >
            Board-Ready Summary
          </h2>
        </div>
        
        <div className="space-y-4">
          {executiveSummary.map((point, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
            >
              <div 
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#d4a574' }}
              />
              <p 
                className="text-sm md:text-base"
                style={{ 
                  color: '#475569',
                  lineHeight: 1.6,
                  fontWeight: 400
                }}
              >
                {point}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Priority Alerts */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <h2 
          className="text-lg md:text-xl mb-4"
          style={{ 
            fontWeight: 600,
            color: '#0f172a',
            fontFamily: 'Georgia, serif'
          }}
        >
          Priority Alerts
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityAlerts.map((alert, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl border p-4 md:p-6"
              style={{ borderColor: '#e2e8f0' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: alert.color }}
                />
                <div className="flex-1">
                  <h3 
                    className="text-sm md:text-base mb-2"
                    style={{ 
                      fontWeight: 600,
                      color: '#0f172a'
                    }}
                  >
                    {alert.title}
                  </h3>
                  <p 
                    className="text-xs md:text-sm mb-3"
                    style={{ 
                      color: '#64748b',
                      lineHeight: 1.5,
                      fontWeight: 400
                    }}
                  >
                    {alert.description}
                  </p>
                  <div 
                    className="text-xs font-medium"
                    style={{ 
                      color: alert.color,
                      fontWeight: 500
                    }}
                  >
                    Action: {alert.action}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
