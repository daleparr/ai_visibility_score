/**
 * Quick Scan Mode - Fast 2-minute evaluation
 * Tests only 4 core dimensions for rapid initial assessment
 */

export const QUICK_SCAN_DIMENSIONS = [
  'schema_structured_data',   // Can AI parse your site?
  'llm_readability',          // Is content LLM-friendly?
  'citation_authority',       // Are you mentioned anywhere?
  'ai_answer_quality'         // Do AI models know you?
] as const;

export type QuickScanDimension = typeof QUICK_SCAN_DIMENSIONS[number];

interface QuickScanResult {
  dimension: QuickScanDimension;
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  key_finding: string;
}

export interface QuickScanReport {
  overall_score: number;
  grade: string;
  results: QuickScanResult[];
  duration_seconds: number;
  recommendation: string;
  upgrade_message: string;
}

/**
 * Calculate quick scan score (simple average of 4 dimensions)
 */
export function calculateQuickScanScore(results: QuickScanResult[]): number {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
}

/**
 * Calculate grade from score
 */
export function calculateGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get status from score
 */
export function getStatus(score: number): QuickScanResult['status'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs_improvement';
  return 'critical';
}

/**
 * Generate recommendation based on quick scan results
 */
export function generateQuickScanRecommendation(score: number): string {
  if (score >= 80) {
    return 'Solid AEO foundation detected! Consider a full audit to identify optimization opportunities and competitive positioning.';
  } else if (score >= 60) {
    return 'Good start with AEO, but significant gaps detected. Run a full audit for detailed action plan and competitive benchmarking.';
  } else {
    return 'Critical AEO gaps identified. Full audit highly recommended to prevent visibility loss and create strategic improvement roadmap.';
  }
}

/**
 * Generate upgrade message based on score
 */
export function generateUpgradeMessage(score: number): string {
  if (score >= 80) {
    return 'Your score looks good! A full audit will help you maintain competitive advantage and identify hidden opportunities.';
  } else if (score >= 60) {
    return 'Important gaps detected. A full audit will provide specific fixes prioritized by ROI and competitive impact.';
  } else {
    return 'Critical issues found. A full audit is essential to understand root causes and create an effective improvement plan.';
  }
}

/**
 * Mock quick scan execution (replace with actual evaluation logic)
 */
export async function runQuickScan(brandUrl: string): Promise<QuickScanReport> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock results (replace with actual evaluation)
  const results: QuickScanResult[] = [
    {
      dimension: 'schema_structured_data',
      score: 45,
      status: 'critical',
      key_finding: 'Missing FAQ and Product schema on key pages'
    },
    {
      dimension: 'llm_readability',
      score: 68,
      status: 'needs_improvement',
      key_finding: 'Content structure could be more AI-friendly'
    },
    {
      dimension: 'citation_authority',
      score: 72,
      status: 'good',
      key_finding: 'Moderate citation presence, room for growth'
    },
    {
      dimension: 'ai_answer_quality',
      score: 55,
      status: 'needs_improvement',
      key_finding: 'AI models provide incomplete information about your brand'
    }
  ];
  
  const overall_score = calculateQuickScanScore(results);
  const grade = calculateGrade(overall_score);
  
  return {
    overall_score,
    grade,
    results,
    duration_seconds: 120, // 2 minutes
    recommendation: generateQuickScanRecommendation(overall_score),
    upgrade_message: generateUpgradeMessage(overall_score)
  };
}

/**
 * Compare quick scan vs full audit features
 */
export const SCAN_COMPARISON = {
  quick: {
    name: 'Quick Scan',
    duration: '2 minutes',
    dimensions: 4,
    platforms: 'Primary models only',
    competitor_analysis: false,
    detailed_recommendations: false,
    historical_tracking: false,
    price: 499,
    best_for: [
      'Quick initial assessment',
      'Budget-conscious evaluation',
      'Testing the platform'
    ]
  },
  full: {
    name: 'Full Audit',
    duration: '10 minutes',
    dimensions: 12,
    platforms: 'All frontier models',
    competitor_analysis: true,
    detailed_recommendations: true,
    historical_tracking: true,
    price: 2500,
    best_for: [
      'Strategic planning',
      'Board presentations',
      'Competitive intelligence'
    ]
  }
};

/**
 * Get dimension name for display
 */
export function getDimensionName(dimension: QuickScanDimension): string {
  const names: Record<QuickScanDimension, string> = {
    schema_structured_data: 'Schema & Structure',
    llm_readability: 'AI Readability',
    citation_authority: 'Citation Presence',
    ai_answer_quality: 'AI Understanding'
  };
  return names[dimension];
}

/**
 * Get dimension description
 */
export function getDimensionDescription(dimension: QuickScanDimension): string {
  const descriptions: Record<QuickScanDimension, string> = {
    schema_structured_data: 'How well AI can parse your structured data',
    llm_readability: 'How easily AI models can understand your content',
    citation_authority: 'How often authoritative sources mention you',
    ai_answer_quality: 'How accurately AI describes your brand'
  };
  return descriptions[dimension];
}


