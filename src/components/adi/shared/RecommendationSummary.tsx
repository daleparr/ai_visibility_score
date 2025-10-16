'use client';

import { AlertTriangle } from 'lucide-react';
import { SeverityCard } from './SeverityBadge';
import { calculateSeverity, getSeverityCounts, getCriticalCount } from '@/lib/adi/severity-calculator';
import { SeverityLevel } from './SeverityBadge';

interface Recommendation {
  id?: string;
  dimension_key?: string;
  dimension_score?: number;
  impact?: 'high' | 'medium' | 'low';
  category?: string;
  title?: string;
}

interface RecommendationSummaryProps {
  recommendations: Recommendation[];
  onSeverityClick?: (severity: SeverityLevel) => void;
  className?: string;
}

export function RecommendationSummary({ 
  recommendations, 
  onSeverityClick,
  className = '' 
}: RecommendationSummaryProps) {
  const counts = getSeverityCounts(recommendations);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const criticalCount = getCriticalCount(recommendations);

  return (
    <div className={`bg-white rounded-xl border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Action Items</h3>
        <span className="text-sm text-gray-500">
          {total} total {total === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-3">
        <SeverityCard 
          level="critical" 
          count={counts.critical}
          onClick={() => onSeverityClick?.('critical')}
        />
        <SeverityCard 
          level="high" 
          count={counts.high}
          onClick={() => onSeverityClick?.('high')}
        />
        <SeverityCard 
          level="medium" 
          count={counts.medium}
          onClick={() => onSeverityClick?.('medium')}
        />
        <SeverityCard 
          level="low" 
          count={counts.low}
          onClick={() => onSeverityClick?.('low')}
        />
      </div>

      {criticalCount > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-600">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900 font-medium">
                {criticalCount} critical {criticalCount === 1 ? 'issue' : 'issues'} require immediate attention
              </p>
              <p className="text-xs text-red-700 mt-1">
                These should be fixed within 2 days to prevent significant AEO visibility impact.
              </p>
            </div>
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No recommendations found.</p>
          <p className="text-xs mt-1">Your AEO setup looks great!</p>
        </div>
      )}
    </div>
  );
}

// Compact version for inline display
export function RecommendationSummaryCompact({ recommendations }: { recommendations: Recommendation[] }) {
  const counts = getSeverityCounts(recommendations);
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-red-600" />
        <span className="font-medium">{counts.critical}</span>
        <span className="text-gray-500">Critical</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-orange-600" />
        <span className="font-medium">{counts.high}</span>
        <span className="text-gray-500">High</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-yellow-600" />
        <span className="font-medium">{counts.medium}</span>
        <span className="text-gray-500">Medium</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-600" />
        <span className="font-medium">{counts.low}</span>
        <span className="text-gray-500">Low</span>
      </div>
    </div>
  );
}

