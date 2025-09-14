/**
 * ADI UI Component Types
 * TypeScript interfaces for ADI frontend components
 */

// Base ADI Data Types
export interface ADIScore {
  overall: number;
  grade: string;
  infrastructure: number;
  perception: number;
  commerce: number;
  lastUpdated: string;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  categoryAverage?: number;
  trend?: 'up' | 'down' | 'stable';
  evidence?: string[];
}

export interface PillarScore {
  name: 'infrastructure' | 'perception' | 'commerce';
  score: number;
  weight: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

// Component Props Interfaces
export interface ScoreGaugeProps {
  score: number;
  grade: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showGrade?: boolean;
  className?: string;
}

export interface PillarBreakdownProps {
  pillars: PillarScore[];
  showTrends?: boolean;
  className?: string;
}

export interface QuickStatsProps {
  industryRank: number;
  totalBrands: number;
  percentile: number;
  category: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    change: number;
    period: string;
  };
  nextReview?: string;
  className?: string;
}

export interface VerdictLineProps {
  score: number;
  customMessage?: string;
  className?: string;
}

// Benchmarking Types
export interface LeaderboardEntry {
  rank: number;
  brand: string;
  score: number;
  infrastructure: number;
  perception: number;
  commerce: number;
  strength: string;
  gap: string;
  badge?: string;
  isCurrentBrand?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    change: number;
  };
}

export interface BenchmarkFilters {
  industry?: string;
  region?: string;
  companySize?: string;
  timePeriod?: string;
}

// Action Planning Types
export interface ActionItem {
  id: string;
  priority: 'immediate' | 'short-term' | 'strategic';
  title: string;
  description: string;
  why: string;
  steps: string[];
  expectedLift: {
    overall: number;
    dimension?: string;
    dimensionLift: number;
  };
  revenueImpact?: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}

// Alert Types
export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: string;
  actionRequired?: boolean;
  dismissed?: boolean;
}

// Trend Data Types
export interface TrendDataPoint {
  date: string;
  score: number;
  infrastructure?: number;
  perception?: number;
  commerce?: number;
}

export interface ChartEvent {
  date: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
}

// Report Types
export interface ReportData {
  type: 'lite' | 'full' | 'quarterly';
  brandName: string;
  score: ADIScore;
  benchmarks: {
    industryRank: number;
    percentile: number;
    category: string;
  };
  topActions: ActionItem[];
  generatedAt: string;
}

// Badge and Certification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  earned: boolean;
  earnedDate?: string;
  icon: string;
  color: string;
}

export interface Certification {
  level: 'certified' | 'excellence' | 'leader';
  grade: string;
  validUntil: string;
  badges: Badge[];
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface APIResponse<T> {
  data: T;
  status: LoadingState;
  error?: string;
}

// Component Size Variants
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';

// Color Variants
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

// Animation Preferences
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  respectReducedMotion: boolean;
}

// All types are exported individually above