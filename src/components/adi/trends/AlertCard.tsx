'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  X,
  Clock,
  TrendingDown,
  Lightbulb,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { Alert } from '../../../lib/adi/ui-types';

interface AlertCardProps {
  alert: Alert;
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string) => void;
  onSnooze?: (alertId: string, duration: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * AlertCard Component
 * Notification cards with severity levels and action buttons
 */
export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onAction,
  onSnooze,
  showActions = true,
  compact = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Alert type configurations
  const alertConfig = {
    critical: {
      color: 'border-red-200 bg-red-50',
      headerColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
      icon: XCircle,
      label: 'CRITICAL'
    },
    warning: {
      color: 'border-orange-200 bg-orange-50',
      headerColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      icon: AlertTriangle,
      label: 'WARNING'
    },
    info: {
      color: 'border-blue-200 bg-blue-50',
      headerColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      icon: Info,
      label: 'INFO'
    },
    success: {
      color: 'border-green-200 bg-green-50',
      headerColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      icon: CheckCircle,
      label: 'SUCCESS'
    }
  };

  const config = alertConfig[alert.type];
  const AlertIcon = config.icon;

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Snooze options
  const snoozeOptions = [
    { label: '1 hour', value: '1h' },
    { label: '4 hours', value: '4h' },
    { label: '1 day', value: '1d' },
    { label: '1 week', value: '1w' }
  ];

  if (alert.dismissed && !compact) return null;

  return (
    <motion.div
      className={cn(
        'border rounded-lg transition-all duration-200',
        config.color,
        compact ? 'p-3' : 'p-4',
        alert.dismissed && 'opacity-50',
        className
      )}
      initial={!prefersReducedMotion ? { opacity: 0, x: -20 } : {}}
      animate={{ opacity: alert.dismissed ? 0.5 : 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Alert Icon */}
          <div className={cn('p-2 rounded-lg bg-white shadow-sm')}>
            <AlertIcon className={cn('h-4 w-4', config.iconColor)} />
          </div>

          {/* Alert Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="secondary" className={cn('text-xs', config.textColor, config.headerColor)}>
                {config.label}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatTimestamp(alert.timestamp)}
              </span>
            </div>

            <h4 className={cn('font-semibold', config.textColor, compact ? 'text-sm' : 'text-base')}>
              {alert.title}
            </h4>

            <p className={cn(
              'mt-1',
              config.textColor.replace('800', '700'),
              compact ? 'text-xs' : 'text-sm'
            )}>
              {alert.description}
            </p>

            {/* Expanded Details */}
            {isExpanded && !compact && (
              <motion.div
                className="mt-3 space-y-3"
                initial={!prefersReducedMotion ? { opacity: 0, height: 0 } : {}}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                {/* Additional context based on alert type */}
                {alert.type === 'critical' && (
                  <div className="p-3 bg-white rounded border border-red-200">
                    <div className="text-sm font-medium text-red-800 mb-1">
                      Immediate Action Required
                    </div>
                    <div className="text-xs text-red-700">
                      This issue is affecting your AI discoverability and should be addressed within 24-48 hours.
                    </div>
                  </div>
                )}

                {alert.type === 'warning' && (
                  <div className="p-3 bg-white rounded border border-orange-200">
                    <div className="text-sm font-medium text-orange-800 mb-1">
                      Monitor Closely
                    </div>
                    <div className="text-xs text-orange-700">
                      This trend could impact your performance if not addressed within the next week.
                    </div>
                  </div>
                )}

                {alert.type === 'info' && (
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Opportunity Identified
                    </div>
                    <div className="text-xs text-blue-700">
                      Consider taking action to capitalize on this opportunity for improvement.
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && !alert.dismissed && (
          <div className="flex items-start space-x-2">
            {!compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && !alert.dismissed && !compact && (
        <div className="flex items-center space-x-3 mt-4">
          {alert.actionRequired && onAction && (
            <Button
              onClick={() => onAction(alert.id)}
              size="sm"
              className={cn(
                alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                alert.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {alert.type === 'critical' ? 'Fix Now' : 
               alert.type === 'warning' ? 'Investigate' : 
               'Learn More'}
            </Button>
          )}

          {alert.type !== 'success' && onSnooze && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
              >
                <Clock className="h-4 w-4 mr-1" />
                Snooze
              </Button>

              {showSnoozeOptions && (
                <motion.div
                  className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  initial={!prefersReducedMotion ? { opacity: 0, y: -10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2 space-y-1">
                    {snoozeOptions.map((option) => (
                      <button
                        key={option.value}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                        onClick={() => {
                          onSnooze(alert.id, option.value);
                          setShowSnoozeOptions(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'} Details
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default AlertCard;