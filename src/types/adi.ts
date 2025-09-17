// AIDI-specific database types (standalone until DB types are regenerated)
export interface AIDISubscription {
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

export interface AIDIAgent {
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

export interface AIDIAgentResult {
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

// AIDI Agent Framework Types
export interface AIDIAgentConfig {
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
  // Performance optimization flags
  optimized?: boolean
  maxExecutionTime?: number
}

export interface AIDIAgentInput {
  context: ADIEvaluationContext
  previousResults?: AIDIAgentResult[]
  config: Record<string, any>
}

export interface AIDIAgentOutput {
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

// Core AIDI Agent Interface
export interface IAIDIAgent {
  readonly config: AIDIAgentConfig
  execute(input: AIDIAgentInput): Promise<AIDIAgentOutput>
  validate(output: AIDIAgentOutput): boolean
  retry(input: AIDIAgentInput, attempt: number): Promise<AIDIAgentOutput>
}

// AIDI Orchestrator Types
export interface AIDIOrchestrationPlan {
  parallelPhases: string[][]
  sequentialPhases: string[]
  dependencies: Record<string, string[]>
  totalEstimatedTime: number
}

export interface ADIOrchestrationResult {
  evaluationId: string
  overallStatus: 'completed' | 'partial' | 'failed'
  agentResults: Record<string, AIDIAgentOutput>
  totalExecutionTime: number
  errors: string[]
  warnings: string[]
  // Performance optimization metadata
  optimizations?: {
    cacheUsed: boolean
    parallelPhases: number
    totalAgents: number
    performanceGain: string
  }
}

// AIDI Scoring Types
export interface AIDIDimensionScore {
  dimension: AIDIDimensionName
  score: number
  confidenceInterval: number
  evidence: Record<string, any>
  agentContributions: Record<string, number>
}

export interface AIDIOptimizationAreaScore {
  optimizationArea: AIDIOptimizationAreaName
  score: number
  confidenceInterval: number
  evidence: Record<string, any>
  agentContributions: Record<string, number>
  recommendations: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  timeToImpact: string
}

export interface AIDISubDimensionBreakdown {
  primaryDimension: AIDIPrimaryDimensionName
  primaryScore: number
  subDimensions: {
    [key: string]: {
      score: number
      weight: number
      optimizationAreas: AIDIOptimizationAreaName[]
    }
  }
}

export interface ADIPillarScore {
  pillar: 'infrastructure' | 'perception' | 'commerce'
  score: number
  weight: number
  dimensions: AIDIDimensionScore[]
}

export interface AIDIHybridPillarScore extends ADIPillarScore {
  optimizationAreas: AIDIOptimizationAreaScore[]
  subDimensionBreakdowns: AIDISubDimensionBreakdown[]
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

export interface AIDIHybridScore extends ADIScore {
  // Primary dimensions for dashboard display
  primaryDimensions: {
    scores: Record<AIDIPrimaryDimensionName, number>
    pillars: AIDIHybridPillarScore[]
  }
  // Detailed optimization areas for comprehensive guidance
  optimizationAreas: {
    scores: Record<AIDIOptimizationAreaName, AIDIOptimizationAreaScore>
    totalAreas: number
    criticalAreas: number
    quickWins: AIDIOptimizationAreaScore[]
  }
  // Sub-dimension breakdowns
  subDimensionBreakdowns: AIDISubDimensionBreakdown[]
}

// AIDI Primary Dimensions (10 dimensions for dashboard display)
export type AIDIPrimaryDimensionName =
  | 'schema_structured_data'           // 12% - Pillar A
  | 'semantic_clarity_ontology'        // 10% - Pillar A
  | 'knowledge_graphs_entity_linking'  // 8%  - Pillar A
  | 'llm_readability_conversational'   // 10% - Pillar A
  | 'geo_visibility_presence'          // 10% - Pillar B
  | 'ai_answer_quality_presence'       // 15% - Pillar B
  | 'citation_authority_freshness'     // 12% - Pillar B
  | 'reputation_signals'               // 10% - Pillar B
  | 'hero_products_use_case'           // 12% - Pillar C
  | 'policies_logistics_clarity'       // 8%  - Pillar C

// AIDI Detailed Optimization Areas (13 areas for comprehensive guidance)
export type AIDIOptimizationAreaName =
  | 'schema_structured_data'           // 1. Schema & Structured Data
  | 'semantic_clarity'                 // 2. Semantic Clarity (separated)
  | 'ontologies_taxonomy'              // 3. Ontologies & Taxonomy (separated)
  | 'knowledge_graphs_entity_linking'  // 4. Knowledge Graphs & Entity Linking
  | 'llm_readability'                  // 5. LLM Readability (separated)
  | 'conversational_copy'              // 6. Conversational Copy (separated)
  | 'geo_visibility_presence'          // 7. Geographic Visibility & Presence
  | 'ai_answer_quality_presence'       // 8. AI Answer Quality & Presence
  | 'citation_authority_freshness'     // 9. Citation Authority & Freshness
  | 'sentiment_trust'                  // 10. Sentiment & Trust (separated)
  | 'brand_heritage'                   // 11. Brand & Heritage (separated)
  | 'hero_products_use_case'           // 12. Hero Products & Use-Case Retrieval
  | 'policies_logistics_clarity'       // 13. Policies & Logistics Clarity

// Backward compatibility
export type AIDIDimensionName = AIDIPrimaryDimensionName

// AIDI Primary Dimension Weights (10 dimensions for scoring)
export const AIDI_PRIMARY_DIMENSION_WEIGHTS: Record<AIDIPrimaryDimensionName, number> = {
  // Pillar A: Infrastructure & Machine Readability (40%)
  'schema_structured_data': 0.12,
  'semantic_clarity_ontology': 0.10,
  'knowledge_graphs_entity_linking': 0.08,
  'llm_readability_conversational': 0.10,
  
  // Pillar B: Perception & Reputation (47%)
  'geo_visibility_presence': 0.10,
  'ai_answer_quality_presence': 0.15,
  'citation_authority_freshness': 0.12,
  'reputation_signals': 0.10,
  
  // Pillar C: Commerce & Experience (20%)
  'hero_products_use_case': 0.12,
  'policies_logistics_clarity': 0.08,
}

// AIDI Optimization Area Weights (13 areas for detailed guidance)
export const AIDI_OPTIMIZATION_AREA_WEIGHTS: Record<AIDIOptimizationAreaName, number> = {
  // Pillar A: Infrastructure & Machine Readability (40%)
  'schema_structured_data': 0.12,
  'semantic_clarity': 0.05,              // Split from semantic_clarity_ontology
  'ontologies_taxonomy': 0.05,           // Split from semantic_clarity_ontology
  'knowledge_graphs_entity_linking': 0.08,
  'llm_readability': 0.05,               // Split from llm_readability_conversational
  'conversational_copy': 0.05,           // Split from llm_readability_conversational
  
  // Pillar B: Perception & Reputation (47%)
  'geo_visibility_presence': 0.10,
  'ai_answer_quality_presence': 0.15,
  'citation_authority_freshness': 0.12,
  'sentiment_trust': 0.05,               // Split from reputation_signals
  'brand_heritage': 0.05,                // Split from reputation_signals
  
  // Pillar C: Commerce & Experience (20%)
  'hero_products_use_case': 0.12,
  'policies_logistics_clarity': 0.08,
}

// Backward compatibility
export const AIDI_DIMENSION_WEIGHTS = AIDI_PRIMARY_DIMENSION_WEIGHTS

export const AIDI_PILLAR_WEIGHTS = {
  infrastructure: 0.40,
  perception: 0.47,  // Increased to accommodate Geo Visibility
  commerce: 0.20,
} as const

export const AIDI_PRIMARY_DIMENSION_PILLARS: Record<AIDIPrimaryDimensionName, keyof typeof AIDI_PILLAR_WEIGHTS> = {
  'schema_structured_data': 'infrastructure',
  'semantic_clarity_ontology': 'infrastructure',
  'knowledge_graphs_entity_linking': 'infrastructure',
  'llm_readability_conversational': 'infrastructure',
  'geo_visibility_presence': 'perception',
  'ai_answer_quality_presence': 'perception',
  'citation_authority_freshness': 'perception',
  'reputation_signals': 'perception',
  'hero_products_use_case': 'commerce',
  'policies_logistics_clarity': 'commerce',
}

export const AIDI_OPTIMIZATION_AREA_PILLARS: Record<AIDIOptimizationAreaName, keyof typeof AIDI_PILLAR_WEIGHTS> = {
  'schema_structured_data': 'infrastructure',
  'semantic_clarity': 'infrastructure',
  'ontologies_taxonomy': 'infrastructure',
  'knowledge_graphs_entity_linking': 'infrastructure',
  'llm_readability': 'infrastructure',
  'conversational_copy': 'infrastructure',
  'geo_visibility_presence': 'perception',
  'ai_answer_quality_presence': 'perception',
  'citation_authority_freshness': 'perception',
  'sentiment_trust': 'perception',
  'brand_heritage': 'perception',
  'hero_products_use_case': 'commerce',
  'policies_logistics_clarity': 'commerce',
}

export const AIDI_PRIMARY_DIMENSION_NAMES: Record<AIDIPrimaryDimensionName, string> = {
  'schema_structured_data': 'Schema & Structured Data',
  'semantic_clarity_ontology': 'Semantic Clarity & Ontology',
  'knowledge_graphs_entity_linking': 'Knowledge Graphs & Entity Linking',
  'llm_readability_conversational': 'LLM Readability & Conversational Copy',
  'geo_visibility_presence': 'Geographic Visibility & Presence',
  'ai_answer_quality_presence': 'AI Answer Quality & Presence',
  'citation_authority_freshness': 'Citation Authority & Freshness',
  'reputation_signals': 'Reputation Signals',
  'hero_products_use_case': 'Hero Products & Use-Case Retrieval',
  'policies_logistics_clarity': 'Policies & Logistics Clarity',
}

export const AIDI_OPTIMIZATION_AREA_NAMES: Record<AIDIOptimizationAreaName, string> = {
  'schema_structured_data': 'Schema & Structured Data',
  'semantic_clarity': 'Semantic Clarity',
  'ontologies_taxonomy': 'Ontologies & Taxonomy',
  'knowledge_graphs_entity_linking': 'Knowledge Graphs & Entity Linking',
  'llm_readability': 'LLM Readability',
  'conversational_copy': 'Conversational Copy',
  'geo_visibility_presence': 'Geographic Visibility & Presence',
  'ai_answer_quality_presence': 'AI Answer Quality & Presence',
  'citation_authority_freshness': 'Citation Authority & Freshness',
  'sentiment_trust': 'Sentiment & Trust',
  'brand_heritage': 'Brand & Heritage',
  'hero_products_use_case': 'Hero Products & Use-Case Retrieval',
  'policies_logistics_clarity': 'Policies & Logistics Clarity',
}

// Primary Dimension to Optimization Areas Mapping
export const AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING: Record<AIDIPrimaryDimensionName, AIDIOptimizationAreaName[]> = {
  'schema_structured_data': ['schema_structured_data'],
  'semantic_clarity_ontology': ['semantic_clarity', 'ontologies_taxonomy'],
  'knowledge_graphs_entity_linking': ['knowledge_graphs_entity_linking'],
  'llm_readability_conversational': ['llm_readability', 'conversational_copy'],
  'geo_visibility_presence': ['geo_visibility_presence'],
  'ai_answer_quality_presence': ['ai_answer_quality_presence'],
  'citation_authority_freshness': ['citation_authority_freshness'],
  'reputation_signals': ['sentiment_trust', 'brand_heritage'],
  'hero_products_use_case': ['hero_products_use_case'],
  'policies_logistics_clarity': ['policies_logistics_clarity'],
}

// Optimization Area to Primary Dimension Mapping (reverse lookup)
export const AIDI_OPTIMIZATION_TO_PRIMARY_MAPPING: Record<AIDIOptimizationAreaName, AIDIPrimaryDimensionName> = {
  'schema_structured_data': 'schema_structured_data',
  'semantic_clarity': 'semantic_clarity_ontology',
  'ontologies_taxonomy': 'semantic_clarity_ontology',
  'knowledge_graphs_entity_linking': 'knowledge_graphs_entity_linking',
  'llm_readability': 'llm_readability_conversational',
  'conversational_copy': 'llm_readability_conversational',
  'geo_visibility_presence': 'geo_visibility_presence',
  'ai_answer_quality_presence': 'ai_answer_quality_presence',
  'citation_authority_freshness': 'citation_authority_freshness',
  'sentiment_trust': 'reputation_signals',
  'brand_heritage': 'reputation_signals',
  'hero_products_use_case': 'hero_products_use_case',
  'policies_logistics_clarity': 'policies_logistics_clarity',
}

// Backward compatibility
export const AIDI_DIMENSION_PILLARS = AIDI_PRIMARY_DIMENSION_PILLARS
export const AIDI_DIMENSION_NAMES = AIDI_PRIMARY_DIMENSION_NAMES

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
  dimensionMedians: Record<AIDIDimensionName, number>
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
  agents: AIDIAgent[]
  agentResults: AIDIAgentResult[]
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

// Export aliases for backward compatibility with ADI naming
export const ADI_DIMENSION_WEIGHTS = AIDI_DIMENSION_WEIGHTS
export const ADI_DIMENSION_PILLARS = AIDI_DIMENSION_PILLARS
export const ADI_PILLAR_WEIGHTS = AIDI_PILLAR_WEIGHTS
export const ADI_DIMENSION_NAMES = AIDI_DIMENSION_NAMES

// Type aliases for backward compatibility
export type ADISubscription = AIDISubscription
export type ADIAgentConfig = AIDIAgentConfig
export type ADIAgentInput = AIDIAgentInput
export type ADIAgentOutput = AIDIAgentOutput
export type ADIDimensionName = AIDIDimensionName
export type ADIDimensionScore = AIDIDimensionScore
export type ADIOrchestrationPlan = AIDIOrchestrationPlan
export type IADIAgent = IAIDIAgent
// Note: ADIOrchestrationResult, ADIEvaluationContext, ADIPillarScore and ADIScore already exist as interfaces above

export class AIDIAgentError extends ADIError {
  constructor(
    agentName: string,
    message: string,
    public agentConfig: AIDIAgentConfig,
    details?: Record<string, any>
  ) {
    super(`Agent ${agentName}: ${message}`, 'AGENT_ERROR', details)
    this.name = 'AIDIAgentError'
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