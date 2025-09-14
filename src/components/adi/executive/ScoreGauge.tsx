'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getScoreColor, getScoreGrade } from '../../../design-system/tokens';
import type { ScoreGaugeProps } from '../../../lib/adi/ui-types';

/**
 * ScoreGauge Component
 * Animated semicircle gauge showing ADI score with grade
 * Supports accessibility and reduced motion preferences
 */
export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  grade,
  size = 'md',
  animated = true,
  showGrade = true,
  className
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  // Size configurations
  const sizeConfig = {
    sm: { diameter: 120, strokeWidth: 8, fontSize: 24, gradeSize: 16 },
    md: { diameter: 160, strokeWidth: 10, fontSize: 32, gradeSize: 18 },
    lg: { diameter: 200, strokeWidth: 12, fontSize: 48, gradeSize: 24 }
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const scoreColor = getScoreColor(score);
  const calculatedGrade = grade || getScoreGrade(score);

  // Animate score counting
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayScore(score);
      return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, increment * step);
      setDisplayScore(Math.round(current));

      if (step >= steps || current >= score) {
        clearInterval(timer);
        setDisplayScore(score);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score, shouldAnimate]);

  // Calculate stroke dash offset for progress
  const progress = (score / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div 
      className={cn(
        'relative flex flex-col items-center justify-center',
        className
      )}
      style={{ width: config.diameter, height: config.diameter * 0.6 }}
    >
      {/* SVG Gauge */}
      <svg
        width={config.diameter}
        height={config.diameter * 0.6}
        viewBox={`0 0 ${config.diameter} ${config.diameter * 0.6}`}
        className="transform -rotate-90"
        role="img"
        aria-label={`AI Discoverability Score: ${score} out of 100, Grade ${calculatedGrade}`}
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.diameter / 2} A ${radius} ${radius} 0 0 1 ${config.diameter - config.strokeWidth / 2} ${config.diameter / 2}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <motion.path
          d={`M ${config.strokeWidth / 2} ${config.diameter / 2} A ${radius} ${radius} 0 0 1 ${config.diameter - config.strokeWidth / 2} ${config.diameter / 2}`}
          fill="none"
          stroke={scoreColor}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={shouldAnimate ? circumference : strokeDashoffset}
          animate={shouldAnimate ? { strokeDashoffset } : {}}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: 0.2
          }}
        />
      </svg>

      {/* Score and Grade Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Score Number */}
        <motion.div
          className="flex items-baseline"
          initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span
            className="font-bold tabular-nums"
            style={{ 
              fontSize: config.fontSize,
              color: scoreColor,
              lineHeight: 1
            }}
          >
            {displayScore}
          </span>
          <span
            className="text-gray-500 ml-1"
            style={{ fontSize: config.fontSize * 0.4 }}
          >
            /100
          </span>
        </motion.div>

        {/* Grade */}
        {showGrade && (
          <motion.div
            className="mt-1"
            initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span
              className="font-semibold text-gray-700"
              style={{ fontSize: config.gradeSize }}
            >
              Grade {calculatedGrade}
            </span>
          </motion.div>
        )}
      </div>

      {/* Screen reader only content */}
      <div className="sr-only">
        Current AI Discoverability Score is {score} points out of 100, 
        which corresponds to a grade of {calculatedGrade}.
        {score >= 81 && " This is an excellent score."}
        {score >= 61 && score < 81 && " This is a good score with room for improvement."}
        {score >= 41 && score < 61 && " This score needs improvement."}
        {score < 41 && " This score requires urgent attention."}
      </div>
    </div>
  );
};

export default ScoreGauge;