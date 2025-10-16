// Type definitions for Industry Reports system

export interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl?: string;
  targetAudience?: string;
  marketSizeNotes?: string;
  active: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectorPrompt {
  id: string;
  sectorId: string;
  promptText: string;
  promptType: 'head' | 'mid-tail' | 'long-tail';
  intentCategory: 'recommendation' | 'comparison' | 'research' | 'troubleshooting';
  geographicScope?: string;
  temporalContext?: string;
  expectedBrandCount?: number;
  biasControls?: {
    brandNeutral: boolean;
    avoidSuperlatives: boolean;
    includeContext?: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandMention {
  brand: string;
  position: number; // 1-indexed position in response
  contextSnippet: string;
  confidence: number; // 0-1
  sentiment?: 'positive' | 'neutral' | 'negative';
  isRecommendation?: boolean;
}

export interface ProbeResult {
  id: string;
  sectorId: string;
  promptId: string;
  modelId: string;
  modelVersion?: string;
  runDate: Date;
  runNumber: number;
  
  // Raw response
  responseText: string;
  responseTokens: number;
  responseLatencyMs: number;
  
  // Extracted data
  brandsMentioned: BrandMention[];
  brandCount: number;
  sentimentAnalysis: Record<string, {
    score: number;
    context: string;
    reasoning?: string;
  }>;
  sourcesCited: Array<{
    source: string;
    url?: string;
    mentionedForBrand?: string;
  }>;
  hallucinationFlags: Array<{
    brand: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  
  // Quality metrics
  responseQualityScore: number;
  brandExtractionConfidence: number;
  
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface BrandPerformance {
  id: string;
  sectorId: string;
  reportMonth: Date;
  brandName: string;
  brandDomain?: string;
  
  // Core metrics
  mentionCount: number;
  mentionShare: number; // %
  avgPosition: number;
  top3Appearances: number;
  recommendationRate: number; // %
  
  // Model coverage
  modelsMentionedIn: number;
  modelBreakdown: Record<string, number>;
  
  // Sentiment
  avgSentimentScore: number; // -1 to 1
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  
  // Competitive
  rankOverall: number;
  rankChange: number; // vs previous month
  coMentionedBrands: string[];
  
  // Quality
  hallucinationRate: number; // %
  sourceCitationRate: number; // %
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustryReport {
  id: string;
  sectorId: string;
  reportMonth: Date;
  reportTitle: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  
  // Content
  executiveSummary: string;
  keyFindings: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    category: string;
  }>;
  methodologyNotes?: string;
  
  // Data sections
  leaderboard: Array<{
    rank: number;
    brand: string;
    score: number;
    change: number;
    metrics: Partial<BrandPerformance>;
  }>;
  topMovers: Array<{
    brand: string;
    previousRank: number;
    currentRank: number;
    change: number;
    reason?: string;
  }>;
  newEntrants: Array<{
    brand: string;
    rank: number;
    firstAppearance: Date;
    notableFor?: string;
  }>;
  
  // Analysis
  trendsAnalysis: {
    overallTrend: 'growing' | 'stable' | 'declining';
    marketConcentration: number; // HHI or similar
    avgBrandsPerResponse: number;
    insights: string[];
  };
  competitiveLandscape: {
    marketLeaders: string[];
    challengers: string[];
    niche: string[];
    insights: string[];
  };
  emergingThreats: Array<{
    brand: string;
    threat: string;
    watchLevel: 'high' | 'medium' | 'low';
    evidence: string;
  }>;
  modelInsights: {
    modelDiversity: number; // How diverse are recommendations across models
    modelBiases: Array<{
      model: string;
      bias: string;
      examples: string[];
    }>;
    consistencyScore: number; // 0-1, how consistent across models
  };
  
  // Recommendations
  recommendations: Array<{
    forBrandTier: 'top10' | 'mid-tier' | 'emerging' | 'absent';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    tactics: string[];
  }>;
  
  // Assets
  pdfUrl?: string;
  dashboardUrl?: string;
  samplePreviewUrl?: string;
  
  // Publishing
  publishedAt?: Date;
  publishedBy?: string;
  editorialNotes?: string;
  
  // Metrics
  viewCount: number;
  downloadCount: number;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSubscription {
  id: string;
  userId: string;
  sectorId: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  
  // Access control
  canViewFullReports: boolean;
  canDownloadPdfs: boolean;
  canAccessArchive: boolean;
  archiveMonthsLimit?: number;
  canRequestCustomPrompts: boolean;
  apiAccessEnabled: boolean;
  
  // Billing
  priceMonthly: number;
  currency: string;
  billingInterval: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  
  // Dates
  startedAt: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProbeSchedule {
  id: string;
  sectorId: string;
  scheduleType: 'monthly' | 'weekly' | 'manual';
  scheduleConfig: {
    dayOfMonth?: number;
    dayOfWeek?: number;
    hour?: number;
  };
  
  // Execution tracking
  lastRunAt?: Date;
  lastRunStatus?: 'success' | 'partial' | 'failed';
  lastRunSummary?: {
    promptsRun: number;
    modelsProbed: number;
    brandsMentioned: number;
    errors: string[];
  };
  nextScheduledRun?: Date;
  
  // Controls
  enabled: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Configuration for LLM models
export interface ModelConfig {
  id: string; // 'gpt-4-turbo', 'claude-3-5-sonnet', etc.
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'perplexity';
  version: string;
  enabled: boolean;
  costPerToken: {
    input: number;
    output: number;
  };
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

// Tier-based feature access
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free Preview',
    price: 0,
    currency: 'GBP',
    features: {
      executiveSummary: true,
      top10Leaderboard: true,
      archiveMonths: 1,
      pdfDownload: false,
      customPrompts: false,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Index Pro',
    price: 119,
    currency: 'GBP',
    features: {
      executiveSummary: true,
      fullLeaderboard: true,
      archiveMonths: 12,
      pdfDownload: true,
      weeklyAlerts: true,
      customPrompts: false,
      apiAccess: false,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 319,
    currency: 'GBP',
    features: {
      executiveSummary: true,
      fullLeaderboard: true,
      archiveMonths: 36,
      pdfDownload: true,
      weeklyAlerts: true,
      brandDeepDives: true,
      customPrompts: true,
      apiAccess: true,
      quarterlyStrategyCalls: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

