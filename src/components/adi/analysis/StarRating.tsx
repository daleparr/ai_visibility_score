'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface StarRatingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  interactive?: boolean;
  categoryAverage?: number;
  className?: string;
}

/**
 * StarRating Component
 * Visual star rating with score display and category comparison
 */
export const StarRating: React.FC<StarRatingProps> = ({
  score,
  maxScore = 100,
  size = 'md',
  showScore = true,
  interactive = false,
  categoryAverage,
  className
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Calculate star rating (out of 5 stars)
  const starRating = Math.round((score / maxScore) * 5);
  const filledStars = Math.floor(starRating);
  const hasHalfStar = starRating % 1 !== 0;

  // Size configurations
  const sizeConfig = {
    sm: { starSize: 'h-3 w-3', textSize: 'text-xs', spacing: 'space-x-0.5' },
    md: { starSize: 'h-4 w-4', textSize: 'text-sm', spacing: 'space-x-1' },
    lg: { starSize: 'h-5 w-5', textSize: 'text-base', spacing: 'space-x-1' }
  };

  const config = sizeConfig[size];

  // Get performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 80) return { label: 'Very Good', color: 'text-green-500' };
    if (score >= 70) return { label: 'Good', color: 'text-yellow-600' };
    if (score >= 60) return { label: 'Fair', color: 'text-orange-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  const performance = getPerformanceLevel(score);

  // Render individual star
  const renderStar = (index: number) => {
    const isFilled = index < filledStars;
    const isHalfFilled = index === filledStars && hasHalfStar;
    const isHovered = hoveredStar !== null && index <= hoveredStar;

    return (
      <motion.div
        key={index}
        className={cn(
          'relative cursor-pointer',
          interactive && 'hover:scale-110'
        )}
        onMouseEnter={() => interactive && setHoveredStar(index)}
        onMouseLeave={() => interactive && setHoveredStar(null)}
        initial={!prefersReducedMotion ? { opacity: 0, scale: 0 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.3, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 200
        }}
      >
        <Star
          className={cn(
            config.starSize,
            'transition-colors duration-200',
            (isFilled || isHovered) ? 'fill-yellow-400 text-yellow-400' :
            isHalfFilled ? 'fill-yellow-200 text-yellow-400' :
            'fill-gray-200 text-gray-300'
          )}
        />
        
        {/* Half star overlay */}
        {isHalfFilled && (
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star
              className={cn(
                config.starSize,
                'fill-yellow-400 text-yellow-400'
              )}
            />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn('flex items-center', config.spacing, className)}>
      {/* Stars */}
      <div className={cn('flex items-center', config.spacing)}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>

      {/* Score and details */}
      {showScore && (
        <motion.div
          className={cn('flex items-center', config.spacing, config.textSize)}
          initial={!prefersReducedMotion ? { opacity: 0, x: -10 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          {/* Numeric score */}
          <span className="font-semibold text-gray-900">
            {score}/{maxScore}
          </span>

          {/* Category comparison */}
          {categoryAverage !== undefined && (
            <span className="text-gray-500">
              [Avg: {categoryAverage}]
            </span>
          )}

          {/* Performance indicator */}
          <span className={cn('font-medium', performance.color)}>
            {performance.label}
          </span>
        </motion.div>
      )}

      {/* Category comparison badge */}
      {categoryAverage !== undefined && (
        <motion.div
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            score > categoryAverage 
              ? 'bg-green-100 text-green-700' 
              : score < categoryAverage 
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          )}
          initial={!prefersReducedMotion ? { opacity: 0, scale: 0.8 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          {score > categoryAverage && `+${score - categoryAverage}`}
          {score < categoryAverage && `${score - categoryAverage}`}
          {score === categoryAverage && '±0'}
        </motion.div>
      )}

      {/* Accessibility description */}
      <div className="sr-only">
        Rating: {starRating} out of 5 stars. 
        Score: {score} out of {maxScore}. 
        Performance level: {performance.label}.
        {categoryAverage !== undefined && 
          ` Category average: ${categoryAverage}. 
          Your score is ${score > categoryAverage ? 'above' : score < categoryAverage ? 'below' : 'equal to'} average.`
        }
      </div>
    </div>
  );
};

export default StarRating;