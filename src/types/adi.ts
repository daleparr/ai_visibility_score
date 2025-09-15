// ADI-specific database types (standalone until DB types are regenerated)
export interface ADISubscription {
  id: string
  user_id: string
  tier: ADISubscriptionTier
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start?: string
  current_period_end?: string
  is_active: boolean
  monthly_evaluation_limit: number
  api_access_enabled: boolean
  benchmarking_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ADIIndustry {
  id: string
  name: string
  category: ADIIndustryCategory
  description?: string
  query_canon?: Record<string, any>
  benchmark_criteria?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ADIAgent {
  id: string
  evaluation_id: string
  agent_name: string
  agent_version: string
  status: AgentStatus
  started_at?: string
  completed_at?: string
  execution_time_ms?: number
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  retry_count: number
  created_at: string
}

export interface ADIAgentResult {
  id: string
  agent_id: string
  result_type: string
  raw_value?: number
  normalized_score?: number
  confidence_level?: number
  evidence?: Record<string, any>
  created_at: string
}

export interface ADIBenchmark {
  id: string
  industry_id?: string
  benchmark_date: string
  total_brands_evaluated: number
  median_score: number
  p25_score: number
  p75_score: number
  p90_score: number
  top_performer_score: number
  dimension_medians?: Record<string, any>
  methodology_version?: string
  created_at: string
}

export interface ADILeaderboard {
  id: string
  brand_id: string
  evaluation_id: string
  industry_id?: string
  rank_global?: number
  rank_industry?: number
  rank_category?: number
  adi_score: number
  score_change_30d?: number
  score_change_90d?: number
  is_public: boolean
  featured_badge?: string
  leaderboard_date: string
  created_at: string
}

export interface ADIQueryCanon {
  id: string
  industry_id?: string
  query_text: string
  query_category?: string
  query_type?: string
  expected_response_elements?: string[]
  weight: number
  is_active: boolean
  version: string
  created_at: string
}

export interface ADICrawlArtifact {
  id: string
  evaluation_id: string
  artifact_type: string
  url?: string
  content_hash?: string
  content_size?: number
  storage_path?: string
  extracted_data?: Record<string, any>
  crawl_timestamp: string
  created_at: string
}

export interface ADIAPIUsage {
  id: string
  user_id: string
  subscription_id?: string
  endpoint: string
  method: string
  request_count: number
  response_size_bytes?: number
  response_time_ms?: number
  status_code?: number
  usage_date: string
  created_at: string
}

// Enum types
export type ADISubscriptionTier = 'free' | 'professional' | 'enterprise'
export type ADIIndustryCategory = 
  | 'apparel' | 'footwear' | 'accessories' | 'beauty' | 'home' | 'electronics'
  | 'automotive' | 'food_beverage' | 'health_wellness' | 'sports_outdoors'
  | 'luxury' | 'mass_market' | 'b2b' | 'services'

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
export type ADIEvaluationType = 'standard' | 'adi_premium' | 'benchmark'

// ADI Agent Framework Types
export interface ADIAgentConfig {
  name: string
  version: string
  description: string
  dependencies: string[]
  timeout: number
  retryLimit: number
  parallelizable: boolean
}

export interface ADIEvaluationContext {
  evaluationId: string
  brandId: string
  websiteUrl: string
  industryId?: string
  evaluationType: ADIEvaluationType
  queryCanon: ADIQueryCanon[]
  crawlArtifacts: ADICrawlArtifact[]
  metadata: Record<string, any>
}

export interface ADIAgentInput {
  context: ADIEvaluationContext
  previousResults?: ADIAgentResult[]
  config: Record<string, any>
}

export interface ADIAgentOutput {
  agentName: string
  status: AgentStatus
  results: {
    resultType: string
    rawValue: number
    normalizedScore: number
    confidenceLevel: number
    evidence: Record<string, any>
  }[]
  executionTime: number
  errorMessage?: string
  metadata: Record<string, any>
}

// Core ADI Agent Interface
export interface IADIAgent {
  readonly config: ADIAgentConfig
  execute(input: ADIAgentInput): Promise<ADIAgentOutput>
  validate(output: ADIAgentOutput): boolean
  retry(input: ADIAgentInput, attempt: number): Promise<ADIAgentOutput>
}

// ADI Orchestrator Types
export interface ADIOrchestrationPlan {
  parallelPhases: string[][]
  sequentialPhases: string[]
  dependencies: Record<string, string[]>
  totalEstimatedTime: number
}

export interface ADIOrchestrationResult {
  evaluationId: string
  overallStatus: 'completed' | 'partial' | 'failed'
  agentResults: Record<string, ADIAgentOutput>
  totalExecutionTime: number
  errors: string[]
  warnings: string[]
}

// ADI Scoring Types
export interface ADIDimensionScore {
  dimension: ADIDimensionName
  score: number
  confidenceInterval: number
  evidence: Record<string, any>
  agentContributions: Record<string, number>
}

export interface ADIPillarScore {
  pillar: 'infrastructure' | 'perception' | 'commerce'
  score: number
  weight: number
  dimensions: ADIDimensionScore[]
}

export interface ADIScore {
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  confidenceInterval: number
  reliabilityScore: number
  pillars: ADIPillarScore[]
  industryPercentile?: number
  globalRank?: number
  methodologyVersion: string
}

// ADI Dimension Names (10 dimensions - restored Geo Visibility)
export type ADIDimensionName =
  | 'schema_structured_data'           // 12% - Pillar A
  | 'semantic_clarity_ontology'        // 10% - Pillar A
  | 'knowledge_graphs_entity_linking'  // 8%  - Pillar A
  | 'llm_readability_conversational'   // 10% - Pillar A
  | 'geo_visibility_presence'          // 10% - Pillar B (RESTORED)
  | 'ai_answer_quality_presence'       // 15% - Pillar B (reduced from 18%)
  | 'citation_authority_freshness'     // 12% - Pillar B
  | 'reputation_signals'               // 10% - Pillar B
  | 'hero_products_use_case'           // 12% - Pillar C
  | 'policies_logistics_clarity'       // 8%  - Pillar C

// ADI Weights Configuration (Updated with Geo Visibility)
export const ADI_DIMENSION_WEIGHTS: Record<ADIDimensionName, number> = {
  // Pillar A: Infrastructure & Machine Readability (40%)
  'schema_structured_data': 0.12,
  'semantic_clarity_ontology': 0.10,
  'knowledge_graphs_entity_linking': 0.08,
  'llm_readability_conversational': 0.10,
  
  // Pillar B: Perception & Reputation (47% - increased to accommodate Geo Visibility)
  'geo_visibility_presence': 0.10,        // RESTORED
  'ai_answer_quality_presence': 0.15,     // Reduced from 0.18
  'citation_authority_freshness': 0.12,
  'reputation_signals': 0.10,
  
  // Pillar C: Commerce & Experience (20%)
  'hero_products_use_case': 0.12,
  'policies_logistics_clarity': 0.08,
}

export const ADI_PILLAR_WEIGHTS = {
  infrastructure: 0.40,
  perception: 0.47,  // Increased to accommodate Geo Visibility
  commerce: 0.20,
} as const

export const ADI_DIMENSION_PILLARS: Record<ADIDimensionName, keyof typeof ADI_PILLAR_WEIGHTS> = {
  'schema_structured_data': 'infrastructure',
  'semantic_clarity_ontology': 'infrastructure',
  'knowledge_graphs_entity_linking': 'infrastructure',
  'llm_readability_conversational': 'infrastructure',
  'geo_visibility_presence': 'perception',           // RESTORED
  'ai_answer_quality_presence': 'perception',
  'citation_authority_freshness': 'perception',
  'reputation_signals': 'perception',
  'hero_products_use_case': 'commerce',
  'policies_logistics_clarity': 'commerce',
}

export const ADI_DIMENSION_NAMES: Record<ADIDimensionName, string> = {
  'schema_structured_data': 'Schema & Structured Data',
  'semantic_clarity_ontology': 'Semantic Clarity & Ontology',
  'knowledge_graphs_entity_linking': 'Knowledge Graphs & Entity Linking',
  'llm_readability_conversational': 'LLM Readability & Conversational Copy',
  'geo_visibility_presence': 'Geographic Visibility & Presence',     // RESTORED
  'ai_answer_quality_presence': 'AI Answer Quality & Presence',
  'citation_authority_freshness': 'Citation Authority & Freshness',
  'reputation_signals': 'Reputation Signals',
  'hero_products_use_case': 'Hero Products & Use-Case Retrieval',
  'policies_logistics_clarity': 'Policies & Logistics Clarity',
}

// Benchmarking Types
export interface ADIIndustryBenchmark {
  industry: ADIIndustry
  benchmarkDate: string
  totalBrands: number
  scoreDistribution: {
    median: number
    p25: number
    p75: number
    p90: number
    topPerformer: number
  }
  dimensionMedians: Record<ADIDimensionName, number>
  trends: {
    monthOverMonth: number
    quarterOverQuarter: number
  }
}

export interface ADILeaderboardEntry {
  brand: {
    id: string
    name: string
    websiteUrl: string
    industry: string
  }
  ranking: {
    global: number
    industry: number
    category: number
  }
  score: {
    current: number
    change30d: number
    change90d: number
  }
  badges: string[]
  isPublic: boolean
}

// API Types
export interface ADIAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    requestId: string
    timestamp: string
    version: string
    rateLimit?: {
      remaining: number
      resetTime: string
    }
  }
}

export interface ADIBenchmarkRequest {
  industryId?: string
  dateRange?: {
    start: string
    end: string
  }
  includePrivate?: boolean
  limit?: number
}

export interface ADILeaderboardRequest {
  industryId?: string
  category?: string
  limit?: number
  includePrivate?: boolean
  sortBy?: 'score' | 'change30d' | 'change90d'
}

// Extended types with relationships
export interface ADIEvaluationWithDetails {
  evaluation: {
    id: string
    brandId: string
    status: string
    adiScore: number
    adiGrade: string
    confidenceInterval: number
    reliabilityScore: number
    industryPercentile: number
    globalRank: number
    methodologyVersion: string
  }
  brand: {
    id: string
    name: string
    websiteUrl: string
    industry: ADIIndustry
  }
  agents: ADIAgent[]
  agentResults: ADIAgentResult[]
  crawlArtifacts: ADICrawlArtifact[]
  leaderboardEntry?: ADILeaderboard
}

// Subscription Management Types
export interface ADISubscriptionLimits {
  monthlyEvaluations: number
  apiCallsPerDay: number
  benchmarkAccess: boolean
  leaderboardAccess: boolean
  customReporting: boolean
  prioritySupport: boolean
}

export const ADI_SUBSCRIPTION_LIMITS: Record<ADISubscriptionTier, ADISubscriptionLimits> = {
  free: {
    monthlyEvaluations: 3,
    apiCallsPerDay: 0,
    benchmarkAccess: false,
    leaderboardAccess: false,
    customReporting: false,
    prioritySupport: false,
  },
  professional: {
    monthlyEvaluations: 25,
    apiCallsPerDay: 1000,
    benchmarkAccess: true,
    leaderboardAccess: true,
    customReporting: true,
    prioritySupport: false,
  },
  enterprise: {
    monthlyEvaluations: -1, // unlimited
    apiCallsPerDay: 10000,
    benchmarkAccess: true,
    leaderboardAccess: true,
    customReporting: true,
    prioritySupport: true,
  },
}

// Error Types
export class ADIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ADIError'
  }
}

export class ADIAgentError extends ADIError {
  constructor(
    agentName: string,
    message: string,
    public agentConfig: ADIAgentConfig,
    details?: Record<string, any>
  ) {
    super(`Agent ${agentName}: ${message}`, 'AGENT_ERROR', details)
    this.name = 'ADIAgentError'
  }
}

export class ADIOrchestrationError extends ADIError {
  constructor(
    message: string,
    public failedAgents: string[],
    details?: Record<string, any>
  ) {
    super(message, 'ORCHESTRATION_ERROR', details)
    this.name = 'ADIOrchestrationError'
  }
}