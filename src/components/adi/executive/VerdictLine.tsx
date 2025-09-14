'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getScoreColor, getVerdictMessage } from '../../../design-system/tokens';
import type { VerdictLineProps } from '../../../lib/adi/ui-types';

/**
 * VerdictLine Component
 * Displays a clear, contextual verdict about AI discoverability performance
 */
export const VerdictLine: React.FC<VerdictLineProps> = ({
  score,
  customMessage,
  className
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scoreColor = getScoreColor(score);
  const message = customMessage || getVerdictMessage(score);

  const getVerdictIcon = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '✅';
    if (score >= 70) return '⚠️';
    if (score >= 60) return '🔶';
    return '🚨';
  };

  const getBackgroundColor = (score: number) => {
    if (score >= 81) return 'bg-green-50 border-green-200';
    if (score >= 61) return 'bg-yellow-50 border-yellow-200';
    if (score >= 41) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const getTextColor = (score: number) => {
    if (score >= 81) return 'text-green-800';
    if (score >= 61) return 'text-yellow-800';
    if (score >= 41) return 'text-orange-800';
    return 'text-red-800';
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg border p-4 text-center',
        getBackgroundColor(score),
        className
      )}
      initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95 } : {}}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.8,
        ease: "easeOut"
      }}
    >
      <div className="flex items-center justify-center space-x-3">
        {/* Verdict Icon */}
        <motion.span
          className="text-2xl"
          initial={!prefersReducedMotion ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 1.0,
            type: "spring",
            stiffness: 200
          }}
        >
          {getVerdictIcon(score)}
        </motion.span>

        {/* Verdict Message */}
        <motion.div
          className={cn(
            'text-lg font-semibold',
            getTextColor(score)
          )}
          initial={!prefersReducedMotion ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          {message}
        </motion.div>
      </div>

      {/* Additional Context */}
      <motion.div
        className={cn(
          'mt-2 text-sm',
          getTextColor(score)
        )}
        initial={!prefersReducedMotion ? { opacity: 0 } : {}}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        {score >= 90 && "Your brand is highly discoverable by AI systems and consistently appears in AI-generated recommendations."}
        {score >= 80 && score < 90 && "Your brand has strong AI visibility with opportunities for optimization to reach industry leadership."}
        {score >= 70 && score < 80 && "Your brand is discoverable but faces strong competition in AI recommendations."}
        {score >= 60 && score < 70 && "Your brand has limited AI visibility and may be missing key opportunities for discovery."}
        {score < 60 && "Your brand is largely invisible to AI systems and requires immediate attention to improve discoverability."}
      </motion.div>
    </motion.div>
  );
};

export default VerdictLine;