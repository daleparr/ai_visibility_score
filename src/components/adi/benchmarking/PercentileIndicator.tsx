'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface PercentileIndicatorProps {
  percentile: number;
  totalBrands: number;
  industryRank: number;
  category: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * PercentileIndicator Component
 * Visual indicator showing brand's position within industry percentiles
 */
export const PercentileIndicator: React.FC<PercentileIndicatorProps> = ({
  percentile,
  totalBrands,
  industryRank,
  category,
  showDetails = true,
  size = 'md',
  className
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', width: 'w-48', textSize: 'text-xs' },
    md: { height: 'h-3', width: 'w-64', textSize: 'text-sm' },
    lg: { height: 'h-4', width: 'w-80', textSize: 'text-base' }
  };

  const config = sizeConfig[size];

  // Get percentile color and message
  const getPercentileInfo = (percentile: number) => {
    if (percentile >= 90) return {
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      message: 'Top Performer',
      description: 'Exceptional performance - industry leader'
    };
    if (percentile >= 75) return {
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      message: 'Above Average',
      description: 'Strong performance - ahead of most competitors'
    };
    if (percentile >= 50) return {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      message: 'Average',
      description: 'Typical performance - room for improvement'
    };
    if (percentile >= 25) return {
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      message: 'Below Average',
      description: 'Underperforming - significant opportunities'
    };
    return {
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      message: 'Needs Improvement',
      description: 'Poor performance - urgent action required'
    };
  };

  const info = getPercentileInfo(percentile);

  // Calculate position for indicator
  const indicatorPosition = `${percentile}%`;

  // Get ordinal suffix
  const getOrdinal = (num: number) => {
    const suffix = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {showDetails && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn('font-semibold text-gray-900', config.textSize)}>
              Industry Position
            </h3>
            <p className={cn('text-gray-600', config.textSize === 'text-xs' ? 'text-xs' : 'text-sm')}>
              {category}
            </p>
          </div>
          <div className="text-right">
            <div className={cn('font-bold', info.textColor, config.textSize)}>
              {getOrdinal(percentile)} Percentile
            </div>
            <div className={cn('text-gray-600', config.textSize === 'text-xs' ? 'text-xs' : 'text-sm')}>
              #{industryRank} of {totalBrands}
            </div>
          </div>
        </div>
      )}

      {/* Percentile Bar */}
      <div className="relative">
        {/* Background bar */}
        <div className={cn(
          'relative rounded-full bg-gray-200 overflow-hidden',
          config.height,
          config.width
        )}>
          {/* Percentile segments */}
          <div className="absolute inset-0 flex">
            <div className="w-1/4 bg-red-200"></div>
            <div className="w-1/4 bg-orange-200"></div>
            <div className="w-1/4 bg-yellow-200"></div>
            <div className="w-1/4 bg-green-200"></div>
          </div>

          {/* Progress fill */}
          <motion.div
            className={cn('absolute inset-y-0 left-0 rounded-full', info.color)}
            initial={!prefersReducedMotion ? { width: 0 } : { width: indicatorPosition }}
            animate={{ width: indicatorPosition }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </div>

        {/* Position indicator */}
        <motion.div
          className="absolute top-0 transform -translate-x-1/2"
          style={{ left: indicatorPosition }}
          initial={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className={cn(
            'w-0 h-0 border-l-2 border-r-2 border-transparent',
            config.height === 'h-2' ? 'border-b-4' : config.height === 'h-3' ? 'border-b-6' : 'border-b-8',
            info.color.replace('bg-', 'border-b-')
          )}></div>
        </motion.div>

        {/* Percentile labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Performance message */}
      {showDetails && (
        <motion.div
          className={cn('p-3 rounded-lg', info.bgColor)}
          initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-start space-x-3">
            <div className={cn('p-1 rounded', info.color)}>
              {percentile >= 75 ? (
                <TrendingUp className="h-4 w-4 text-white" />
              ) : percentile >= 50 ? (
                <Target className="h-4 w-4 text-white" />
              ) : (
                <Users className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <div className={cn('font-medium', info.textColor)}>
                {info.message}
              </div>
              <div className={cn('text-sm', info.textColor.replace('800', '700'))}>
                {info.description}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed stats */}
      {showDetails && (
        <motion.div
          className="grid grid-cols-3 gap-4 text-center"
          initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {Math.round((totalBrands - industryRank + 1) / totalBrands * 100)}%
            </div>
            <div className="text-xs text-gray-600">Brands Behind</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {industryRank - 1}
            </div>
            <div className="text-xs text-gray-600">Brands Ahead</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {totalBrands}
            </div>
            <div className="text-xs text-gray-600">Total Brands</div>
          </div>
        </motion.div>
      )}

      {/* Accessibility description */}
      <div className="sr-only">
        You are ranked {getOrdinal(percentile)} percentile in {category}, 
        which means you perform better than {percentile}% of brands in your industry.
        Your rank is #{industryRank} out of {totalBrands} total brands.
        Performance level: {info.message}. {info.description}
      </div>
    </div>
  );
};

export default PercentileIndicator;