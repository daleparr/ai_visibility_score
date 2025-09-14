'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getPillarColor } from '../../../design-system/tokens';
import type { PillarBreakdownProps } from '../../../lib/adi/ui-types';

/**
 * PillarBreakdown Component
 * Shows the three ADI pillars with scores, progress bars, and trends
 */
export const PillarBreakdown: React.FC<PillarBreakdownProps> = ({
  pillars,
  showTrends = true,
  className
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-500';
    }
  };

  const formatChange = (change: number, trend: 'up' | 'down' | 'stable') => {
    if (trend === 'stable') return '±0';
    const sign = trend === 'up' ? '+' : '';
    return `${sign}${change}`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {pillars.map((pillar, index) => {
        const pillarColor = getPillarColor(pillar.name);
        const progressPercentage = pillar.score;

        return (
          <motion.div
            key={pillar.name}
            className="space-y-3"
            initial={!prefersReducedMotion ? { opacity: 0, x: -20 } : {}}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            {/* Pillar Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Pillar Indicator */}
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: pillarColor }}
                />
                
                {/* Pillar Name and Weight */}
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {pillar.name} ({pillar.weight}%)
                  </h3>
                </div>
              </div>

              {/* Score and Trend */}
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {pillar.score}%
                </span>
                
                {showTrends && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(pillar.trend)}
                    <span className={cn(
                      'text-sm font-medium',
                      getTrendColor(pillar.trend)
                    )}>
                      {formatChange(pillar.change, pillar.trend)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              {/* Background Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: pillarColor }}
                  initial={!prefersReducedMotion ? { width: 0 } : { width: `${progressPercentage}%` }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.2 + 0.3,
                    ease: "easeOut"
                  }}
                />
              </div>

              {/* Progress Percentage Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white mix-blend-difference">
                  {pillar.score}%
                </span>
              </div>
            </div>

            {/* Trend Description */}
            {showTrends && (
              <motion.div
                className="text-sm text-gray-600"
                initial={!prefersReducedMotion ? { opacity: 0 } : {}}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.8 }}
              >
                {pillar.trend === 'up' && `↗ Improved by ${pillar.change} points vs Q3`}
                {pillar.trend === 'down' && `↘ Decreased by ${Math.abs(pillar.change)} points vs Q3`}
                {pillar.trend === 'stable' && `→ No significant change vs Q3`}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Pillar Explanation */}
      <motion.div
        className="mt-6 p-4 bg-gray-50 rounded-lg"
        initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium text-blue-900">Infrastructure (40%)</span>
            </div>
            <p className="text-gray-600 text-xs">
              Schema, semantic clarity, knowledge graphs, LLM readability
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="font-medium text-purple-900">Perception (40%)</span>
            </div>
            <p className="text-gray-600 text-xs">
              AI answer quality, citation authority, reputation signals
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium text-green-900">Commerce (20%)</span>
            </div>
            <p className="text-gray-600 text-xs">
              Hero products, use-case retrieval, policies clarity
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PillarBreakdown;