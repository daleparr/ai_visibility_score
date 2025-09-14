'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Trophy, Target } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { QuickStatsProps } from '../../../lib/adi/ui-types';

/**
 * QuickStats Component
 * Displays key performance metrics in a compact format
 */
export const QuickStats: React.FC<QuickStatsProps> = ({
  industryRank,
  totalBrands,
  percentile,
  category,
  trend,
  nextReview,
  className
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTrendChange = (direction: 'up' | 'down' | 'stable', change: number) => {
    if (direction === 'stable') return '±0 pts';
    const sign = direction === 'up' ? '+' : '';
    return `${sign}${change} pts`;
  };

  const getPercentileOrdinal = (percentile: number) => {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = percentile % 100;
    return percentile + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  const stats = [
    {
      icon: Trophy,
      label: 'Industry Rank',
      value: `#${industryRank} of ${totalBrands}`,
      subtext: `Top ${Math.round((1 - (industryRank - 1) / totalBrands) * 100)}%`,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: Target,
      label: 'Percentile',
      value: getPercentileOrdinal(percentile),
      subtext: category,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: getTrendIcon(trend.direction).type,
      label: `${trend.period} Trend`,
      value: formatTrendChange(trend.direction, trend.change),
      subtext: trend.direction === 'up' ? 'Improving' : trend.direction === 'down' ? 'Declining' : 'Stable',
      color: getTrendColor(trend.direction),
      isCustomIcon: true,
      customIcon: getTrendIcon(trend.direction)
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={cn('p-2 rounded-lg', stat.color)}>
                    {stat.isCustomIcon ? (
                      stat.customIcon
                    ) : (
                      React.createElement(stat.icon, { className: 'h-4 w-4' })
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.subtext}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Review */}
      {nextReview && (
        <motion.div
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-200 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Next Review
              </div>
              <div className="text-sm text-gray-600">
                {nextReview}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Context */}
      <motion.div
        className="bg-blue-50 rounded-lg p-4 border border-blue-200"
        initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="text-sm">
          <div className="font-medium text-blue-900 mb-1">
            Performance Context
          </div>
          <div className="text-blue-700">
            {percentile >= 90 && "Exceptional performance - you're among the industry leaders"}
            {percentile >= 75 && percentile < 90 && "Strong performance - above most competitors"}
            {percentile >= 50 && percentile < 75 && "Average performance - room for improvement"}
            {percentile >= 25 && percentile < 50 && "Below average - significant opportunities exist"}
            {percentile < 25 && "Underperforming - urgent action recommended"}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickStats;