'use client';

/**
 * Executive Intelligence Panel - Overview Tab
 * Board-ready intelligence with actionable insights and priority alerts
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, Award, BarChart3, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';

interface PortfolioHealthSummary {
  totalBrands: number;
  avgAidiScore: number;
  avgAidiScoreChange: number;
  aboveBenchmark: number;
  actionRequired: number;
  lastUpdated: Date;
  trends: {
    scoreTrend: 'up' | 'down' | 'stable';
    benchmarkTrend: 'up' | 'down' | 'stable';
    portfolioGrowth: number;
  };
  insights: string[];
}

interface PriorityAlert {
  id: string;
  type: 'Critical' | 'Warning' | 'Opportunity' | 'Success';
  title: string;
  description: string;
  recommendation: string;
  metric: string;
  change: number;
  p_value: string;
  confidence_interval: string;
  brandName: string;
  brandId: string;
  createdAt: Date;
}

export function ExecutiveIntelligencePanel() {
  const [portfolioData, setPortfolioData] = useState<PortfolioHealthSummary | null>(null);
  const [priorityAlerts, setPriorityAlerts] = useState<PriorityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load portfolio summary and priority alerts in parallel
      const [portfolioResponse, alertsResponse] = await Promise.all([
        fetch('/api/dashboard/portfolio-summary'),
        fetch('/api/dashboard/priority-alerts')
      ]);

      if (!portfolioResponse.ok || !alertsResponse.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const portfolioResult = await portfolioResponse.json();
      const alertsResult = await alertsResponse.json();

      if (portfolioResult.success) {
        setPortfolioData(portfolioResult.data);
      }

      if (alertsResult.success) {
        setPriorityAlerts(alertsResult.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'Critical': return '#ef4444';
      case 'Warning': return '#f59e0b';
      case 'Opportunity': return '#3b82f6';
      case 'Success': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : trend === 'down' ? TrendingUp : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#d4a574' }} />
          <p style={{ color: '#64748b' }}>Loading executive intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: '#ef4444' }} />
        <p style={{ color: '#ef4444' }}>Error loading dashboard data: {error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 rounded-md text-sm font-medium"
          style={{ 
            backgroundColor: '#d4a574', 
            color: 'white',
            border: 'none'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const portfolioMetrics = portfolioData ? [
    {
      label: 'PORTFOLIO BRANDS',
      value: `${portfolioData.totalBrands} brands`,
      icon: Award,
      color: '#0f172a'
    },
    {
      label: 'AVG AIDI SCORE',
      value: portfolioData.avgAidiScore.toString(),
      change: portfolioData.avgAidiScoreChange > 0 ? `+${portfolioData.avgAidiScoreChange}` : portfolioData.avgAidiScoreChange.toString(),
      icon: BarChart3,
      color: portfolioData.avgAidiScoreChange > 0 ? '#22c55e' : portfolioData.avgAidiScoreChange < 0 ? '#ef4444' : '#64748b',
      trend: portfolioData.trends.scoreTrend
    },
    {
      label: 'ABOVE BENCHMARK',
      value: `${portfolioData.aboveBenchmark} of ${portfolioData.totalBrands}`,
      icon: CheckCircle2,
      color: '#22c55e'
    },
    {
      label: 'ACTION REQUIRED',
      value: `${portfolioData.actionRequired} brands`,
      icon: AlertTriangle,
      color: '#ef4444'
    }
  ] : [];

  const executiveSummary = portfolioData?.insights || [
    'Portfolio data is being processed. Please check back in a few minutes.',
    'If this message persists, please contact support.'
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
          {priorityAlerts.length > 0 ? priorityAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
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
                  style={{ backgroundColor: getAlertColor(alert.type) }}
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
                    className="text-xs font-medium mb-2"
                    style={{ 
                      color: getAlertColor(alert.type),
                      fontWeight: 500
                    }}
                  >
                    Action: {alert.recommendation}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                    <span>p-value: {alert.p_value}</span>
                    <span>•</span>
                    <span>CI: {alert.confidence_interval}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-8">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-4" style={{ color: '#22c55e' }} />
              <p style={{ color: '#64748b' }}>No priority alerts at this time</p>
              <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>
                All brands are performing within expected parameters
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
