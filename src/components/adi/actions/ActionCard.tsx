'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Play, 
  MoreHorizontal,
  AlertCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { ActionItem } from '../../../lib/adi/ui-types';

interface ActionCardProps {
  action: ActionItem;
  onStartAction?: (actionId: string) => void;
  onLearnMore?: (actionId: string) => void;
  onUpdateStatus?: (actionId: string, status: ActionItem['status']) => void;
  className?: string;
}

/**
 * ActionCard Component
 * Traffic light prioritized action cards with impact predictions
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onStartAction,
  onLearnMore,
  onUpdateStatus,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Priority configurations
  const priorityConfig = {
    immediate: {
      color: 'border-red-200 bg-red-50',
      headerColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: AlertCircle,
      emoji: '🔴',
      label: 'IMMEDIATE'
    },
    'short-term': {
      color: 'border-yellow-200 bg-yellow-50',
      headerColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      icon: Lightbulb,
      emoji: '🟡',
      label: 'SHORT-TERM'
    },
    strategic: {
      color: 'border-green-200 bg-green-50',
      headerColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: Target,
      emoji: '🟢',
      label: 'STRATEGIC'
    }
  };

  const config = priorityConfig[action.priority];
  const PriorityIcon = config.icon;

  // Effort configurations
  const effortConfig = {
    low: { label: 'Low Effort', color: 'bg-green-100 text-green-700' },
    medium: { label: 'Medium Effort', color: 'bg-yellow-100 text-yellow-700' },
    high: { label: 'High Effort', color: 'bg-red-100 text-red-700' }
  };

  const effort = effortConfig[action.effort];

  // Status configurations
  const statusConfig = {
    'not-started': { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700' }
  };

  const status = statusConfig[action.status || 'not-started'];

  return (
    <motion.div
      className={cn(
        'border-2 rounded-lg transition-all duration-200 hover:shadow-md',
        config.color,
        className
      )}
      initial={!prefersReducedMotion ? { opacity: 0, y: 20 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className={cn('p-4', config.headerColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn('p-2 rounded-lg bg-white shadow-sm')}>
              <PriorityIcon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-bold tracking-wide">
                  {config.emoji} {config.label} ({action.timeline})
                </span>
                <Badge variant="secondary" className={effort.color}>
                  {effort.label}
                </Badge>
              </div>
              <h3 className={cn('font-semibold text-lg', config.textColor)}>
                {action.title}
              </h3>
              <p className={cn('text-sm mt-1', config.textColor.replace('800', '700'))}>
                {action.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={status.color}>
              {status.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Why Section */}
        <div className="mb-4">
          <h4 className={cn('font-medium mb-2 flex items-center', config.textColor)}>
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: config.iconColor.includes('red') ? '#DC2626' : config.iconColor.includes('yellow') ? '#D97706' : '#059669' }}></div>
            Why This Matters
          </h4>
          <p className="text-sm text-gray-700">
            {action.why}
          </p>
        </div>

        {/* Impact Prediction */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Expected Impact</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              +{action.expectedLift.overall} points overall
            </div>
            {action.expectedLift.dimension && (
              <div className="text-xs text-gray-600">
                +{action.expectedLift.dimensionLift} points {action.expectedLift.dimension}
              </div>
            )}
          </div>

          {action.revenueImpact && (
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Revenue Impact</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {action.revenueImpact}
              </div>
              <div className="text-xs text-gray-600">
                Estimated annual impact
              </div>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={!prefersReducedMotion ? { opacity: 0, height: 0 } : {}}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Implementation Steps */}
            <div>
              <h4 className={cn('font-medium mb-2 flex items-center', config.textColor)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Implementation Steps
              </h4>
              <ol className="space-y-2">
                {action.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5',
                      config.iconColor.includes('red') ? 'bg-red-500' : 
                      config.iconColor.includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700 flex-1">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Timeline and Effort */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Timeline</span>
                </div>
                <div className="text-sm text-gray-700">
                  {action.timeline}
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Effort Level</span>
                </div>
                <Badge variant="secondary" className={effort.color}>
                  {effort.label}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          {action.status !== 'completed' && onStartAction && (
            <Button
              onClick={() => onStartAction(action.id)}
              className={cn(
                'flex-1',
                action.priority === 'immediate' ? 'bg-red-600 hover:bg-red-700' :
                action.priority === 'short-term' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-green-600 hover:bg-green-700'
              )}
            >
              <Play className="h-4 w-4 mr-2" />
              {action.status === 'in-progress' ? 'Continue' : 'Start Implementation'}
            </Button>
          )}
          
          {onLearnMore && (
            <Button
              variant="outline"
              onClick={() => onLearnMore(action.id)}
              className="flex-1"
            >
              Learn More
            </Button>
          )}

          {action.status === 'completed' && (
            <div className="flex-1 flex items-center justify-center space-x-2 p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActionCard;