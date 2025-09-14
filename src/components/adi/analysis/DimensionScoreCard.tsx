'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { StarRating } from './StarRating';
import type { DimensionScore } from '../../../lib/adi/ui-types';

interface DimensionScoreCardProps {
  dimension: DimensionScore;
  categoryAverage?: number;
  expanded?: boolean;
  onToggle?: () => void;
  showEvidence?: boolean;
  className?: string;
}

/**
 * DimensionScoreCard Component
 * Detailed card showing dimension score with evidence and recommendations
 */
export const DimensionScoreCard: React.FC<DimensionScoreCardProps> = ({
  dimension,
  categoryAverage,
  expanded = false,
  onToggle,
  showEvidence = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Get dimension color based on score
  const getDimensionColor = (score: number) => {
    if (score >= 85) return 'border-green-200 bg-green-50';
    if (score >= 70) return 'border-yellow-200 bg-yellow-50';
    if (score >= 60) return 'border-orange-200 bg-orange-50';
    return 'border-red-200 bg-red-50';
  };

  // Get trend icon
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get performance status
  const getPerformanceStatus = (score: number, categoryAvg?: number) => {
    if (!categoryAvg) {
      if (score >= 85) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
      if (score >= 70) return { label: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (score >= 60) return { label: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
    }

    const diff = score - categoryAvg;
    if (diff > 10) return { label: 'Above Average', color: 'text-green-600', bg: 'bg-green-100' };
    if (diff > 0) return { label: 'Slightly Above', color: 'text-green-500', bg: 'bg-green-50' };
    if (diff === 0) return { label: 'Average', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (diff > -10) return { label: 'Slightly Below', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { label: 'Below Average', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getPerformanceStatus(dimension.score, categoryAverage);

  // Mock evidence data (in real implementation, this would come from the dimension object)
  const mockEvidence = {
    'Schema & Structured Data': {
      strengths: ['JSON-LD implementation: 94%', 'Product schema coverage: 89%'],
      weaknesses: ['Review schema missing: 32% of PDPs', 'Offer schema incomplete'],
      recommendations: ['Add Review markup to product pages', 'Complete Offer schema implementation']
    },
    'AI Answer Quality & Presence': {
      strengths: ['High answer accuracy: 92%', 'Consistent brand mentions'],
      weaknesses: ['Limited query coverage: 68%', 'Factual gaps in responses'],
      recommendations: ['Expand content for long-tail queries', 'Improve fact verification']
    }
  };

  const evidence = mockEvidence[dimension.dimension as keyof typeof mockEvidence] || {
    strengths: ['Strong performance in key areas'],
    weaknesses: ['Some areas need improvement'],
    recommendations: ['Continue current strategy', 'Monitor performance']
  };

  return (
    <motion.div
      className={cn(
        'border rounded-lg transition-all duration-200',
        getDimensionColor(dimension.score),
        isHovered && 'shadow-md',
        expanded && 'ring-2 ring-blue-200',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div 
        className={cn(
          'p-4 cursor-pointer',
          onToggle && 'hover:bg-white/50'
        )}
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Dimension name and toggle */}
            <div className="flex items-center space-x-2 mb-2">
              {onToggle && (
                <motion.div
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </motion.div>
              )}
              <h3 className="font-semibold text-gray-900 text-sm">
                {dimension.dimension}
              </h3>
              {dimension.trend && getTrendIcon(dimension.trend)}
            </div>

            {/* Star rating */}
            <div className="mb-3">
              <StarRating
                score={dimension.score}
                maxScore={dimension.maxScore}
                size="sm"
                showScore={true}
                categoryAverage={categoryAverage}
              />
            </div>

            {/* Status badge */}
            <div className="flex items-center space-x-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                status.bg,
                status.color
              )}>
                {status.label}
              </span>
              
              {categoryAverage && (
                <span className="text-xs text-gray-500">
                  vs {categoryAverage} avg
                </span>
              )}
            </div>
          </div>

          {/* Score display */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {dimension.score}
            </div>
            <div className="text-xs text-gray-500">
              /{dimension.maxScore}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && showEvidence && (
        <motion.div
          className="border-t bg-white/70 p-4"
          initial={!prefersReducedMotion ? { opacity: 0, height: 0 } : {}}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {/* Strengths */}
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-700">Strengths</span>
              </div>
              <ul className="space-y-1">
                {evidence.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-600 text-xs">
                    ✓ {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-700">Areas for Improvement</span>
              </div>
              <ul className="space-y-1">
                {evidence.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-gray-600 text-xs">
                    ⚠ {weakness}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-700">Recommendations</span>
              </div>
              <ul className="space-y-1">
                {evidence.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600 text-xs">
                    → {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Impact estimate */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-1">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900 text-sm">Improvement Impact</span>
            </div>
            <p className="text-xs text-blue-700">
              Implementing these recommendations could improve this dimension by{' '}
              <span className="font-semibold">8-12 points</span> and contribute{' '}
              <span className="font-semibold">+3-5 points</span> to your overall ADI score.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DimensionScoreCard;