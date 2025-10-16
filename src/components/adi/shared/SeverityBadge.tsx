import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface SeverityBadgeProps {
  level: SeverityLevel;
  count?: number;
  timeline?: string;
  className?: string;
}

export function SeverityBadge({ level, count, timeline, className = '' }: SeverityBadgeProps) {
  const config = {
    critical: {
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Critical',
      timeline: '2 days',
      dotColor: 'bg-red-600'
    },
    high: {
      icon: AlertTriangle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'High',
      timeline: '2 weeks',
      dotColor: 'bg-orange-600'
    },
    medium: {
      icon: Info,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Medium',
      timeline: '30 days',
      dotColor: 'bg-yellow-600'
    },
    low: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Low',
      timeline: '90 days',
      dotColor: 'bg-green-600'
    }
  };

  const { icon: Icon, color, label, timeline: defaultTimeline, dotColor } = config[level];
  const displayTimeline = timeline || defaultTimeline;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${color} ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="font-medium text-sm">{label}</span>
      {count !== undefined && <span className="text-xs font-semibold">({count})</span>}
      <span className="text-xs opacity-75">• Fix in {displayTimeline}</span>
    </div>
  );
}

// Compact version for use in cards
export function SeverityDot({ level, className = '' }: { level: SeverityLevel; className?: string }) {
  const config = {
    critical: 'bg-red-600',
    high: 'bg-orange-600',
    medium: 'bg-yellow-600',
    low: 'bg-green-600'
  };

  return (
    <div className={`w-2 h-2 rounded-full ${config[level]} ${className}`} />
  );
}

// Large version for dashboard summary
export function SeverityCard({ level, count, onClick }: { level: SeverityLevel; count: number; onClick?: () => void }) {
  const config = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      countColor: 'text-red-600',
      label: 'Critical Priority',
      timeline: '2 days'
    },
    high: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
      countColor: 'text-orange-600',
      label: 'High Priority',
      timeline: '2 weeks'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      countColor: 'text-yellow-600',
      label: 'Medium Priority',
      timeline: '30 days'
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      countColor: 'text-green-600',
      label: 'Low Priority',
      timeline: '90 days'
    }
  };

  const { bg, border, text, countColor, label, timeline } = config[level];

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full p-3 rounded-lg border ${bg} ${border} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <SeverityDot level={level} />
        <span className={`font-medium ${text}`}>{label}</span>
        <span className="text-xs text-gray-500">• Fix in {timeline}</span>
      </div>
      <div className={`text-2xl font-bold ${countColor}`}>{count}</div>
    </button>
  );
}

