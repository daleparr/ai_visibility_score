// Tier-based model configuration for cost optimization
export type UserTier = 'free' | 'pro' | 'enterprise'

export interface TierModelConfig {
  primary: string
  fallback: string[]
  provider: string
  maxTokens: number
  costPerEvaluation: number
}

export const TIER_MODEL_CONFIGS: Record<UserTier, TierModelConfig> = {
  free: {
    primary: 'gpt-3.5-turbo',
    fallback: ['gemini-pro'],
    provider: 'openai',
    maxTokens: 4000,
    costPerEvaluation: 0.15 // ~$0.15 per evaluation
  },
  pro: {
    primary: 'gpt-4',
    fallback: ['claude-3-sonnet-20240229', 'gpt-3.5-turbo'],
    provider: 'openai',
    maxTokens: 8000,
    costPerEvaluation: 2.50 // ~$2.50 per evaluation
  },
  enterprise: {
    primary: 'gpt-4',
    fallback: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'mistral-large-latest'],
    provider: 'openai',
    maxTokens: 16000,
    costPerEvaluation: 4.50 // ~$4.50 per evaluation
  }
}

// Enhanced AI Provider configurations with tier support
export const getTierBasedModel = (tier: UserTier, agentType?: string): TierModelConfig => {
  const config = TIER_MODEL_CONFIGS[tier]
  
  // Special optimizations for specific agents
  if (agentType === 'llm_test_agent' && tier === 'free') {
    return {
      ...config,
      primary: 'gpt-3.5-turbo', // Always use fastest for LLM tests
      maxTokens: 2000
    }
  }
  
  return config
}

// Tier-based feature flags
export const TIER_FEATURES = {
  free: {
    evaluationsPerMonth: 3,
    agentEnhancements: false,
    perplexityIntegration: false,
    apiAccess: false,
    advancedReporting: false,
    customBranding: false
  },
  pro: {
    evaluationsPerMonth: 25,
    agentEnhancements: true,
    perplexityIntegration: true, // 🎯 KEY DIFFERENTIATOR
    apiAccess: false,
    advancedReporting: true,
    customBranding: false
  },
  enterprise: {
    evaluationsPerMonth: -1, // Unlimited
    agentEnhancements: true,
    perplexityIntegration: true,
    apiAccess: true,
    advancedReporting: true,
    customBranding: true
  }
} as const

// Cost optimization utilities
export const calculateTierCosts = (tier: UserTier, evaluationsPerMonth: number) => {
  const config = TIER_MODEL_CONFIGS[tier]
  return {
    modelCosts: config.costPerEvaluation * evaluationsPerMonth,
    tier,
    evaluationsPerMonth,
    costPerEvaluation: config.costPerEvaluation
  }
}
