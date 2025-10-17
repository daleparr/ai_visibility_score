import { SeverityLevel } from '@/components/adi/shared/SeverityBadge';

interface Recommendation {
  dimension_key?: string;
  dimension_score?: number;
  impact?: 'high' | 'medium' | 'low';
  category?: string;
  effort?: 'high' | 'medium' | 'low';
  priority?: number;
}

/**
 * Calculate severity level for a recommendation based on multiple factors
 */
export function calculateSeverity(recommendation: Recommendation): SeverityLevel {
  const { dimension_score = 50, impact, category, effort, priority } = recommendation;
  
  // Critical: Core infrastructure dimensions scoring very low
  const criticalDimensions = [
    'schema_structured_data',
    'llm_readability',
    'semantic_clarity'
  ];
  
  if (dimension_score < 50 && category && criticalDimensions.includes(category)) {
    return 'critical';
  }
  
  // Critical: High impact + low effort (quick wins that matter)
  if (impact === 'high' && effort === 'low') {
    return 'critical';
  }
  
  // High: Important dimensions scoring below 60 OR high impact items
  if (dimension_score < 60 && impact === 'high') {
    return 'high';
  }
  
  // High: Priority 1 items (if priority is set)
  if (priority === 1) {
    return 'high';
  }
  
  // Medium: Scores 60-75 OR medium impact
  if ((dimension_score >= 60 && dimension_score < 75) || impact === 'medium') {
    return 'medium';
  }
  
  // Low: Everything else (scores 75+ or low impact)
  return 'low';
}

/**
 * Get severity counts from a list of recommendations
 */
export function getSeverityCounts(recommendations: Recommendation[]): Record<SeverityLevel, number> {
  const counts: Record<SeverityLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  recommendations.forEach(rec => {
    const severity = calculateSeverity(rec);
    counts[severity]++;
  });
  
  return counts;
}

/**
 * Get timeline text for severity level
 */
export function getSeverityTimeline(level: SeverityLevel): string {
  const timelines: Record<SeverityLevel, string> = {
    critical: '2 days',
    high: '2 weeks',
    medium: '30 days',
    low: '90 days'
  };
  
  return timelines[level];
}

/**
 * Sort recommendations by severity (critical first)
 */
export function sortBySeverity(recommendations: Recommendation[]): Recommendation[] {
  const severityOrder: Record<SeverityLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };
  
  return [...recommendations].sort((a, b) => {
    const severityA = calculateSeverity(a);
    const severityB = calculateSeverity(b);
    return severityOrder[severityA] - severityOrder[severityB];
  });
}

/**
 * Check if there are any critical issues
 */
export function hasCriticalIssues(recommendations: Recommendation[]): boolean {
  return recommendations.some(rec => calculateSeverity(rec) === 'critical');
}

/**
 * Get critical issues count
 */
export function getCriticalCount(recommendations: Recommendation[]): number {
  return recommendations.filter(rec => calculateSeverity(rec) === 'critical').length;
}


