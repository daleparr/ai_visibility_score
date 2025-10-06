/**
 * Queue System Configuration
 * 
 * Centralized configuration for switching between traditional and intelligent queuing systems
 */

export interface QueueSystemConfig {
  enabled: boolean
  system: 'traditional' | 'intelligent'
  features: {
    progressiveTimeouts: boolean
    priorityScheduling: boolean
    fallbackStrategies: boolean
    resourceManagement: boolean
    circuitBreakers: boolean
  }
  limits: {
    maxConcurrentAgents: number
    maxQueueSize: number
    maxRetryAttempts: number
    circuitBreakerTimeout: number
  }
}

// Default configuration - can be overridden via environment variables
export const DEFAULT_QUEUE_CONFIG: QueueSystemConfig = {
  enabled: true,
  system: 'intelligent', // Switch to 'traditional' to use old system
  features: {
    progressiveTimeouts: true,
    priorityScheduling: true,
    fallbackStrategies: true,
    resourceManagement: true,
    circuitBreakers: true
  },
  limits: {
    maxConcurrentAgents: 3,
    maxQueueSize: 50,
    maxRetryAttempts: 4,
    circuitBreakerTimeout: 900000 // 15 minutes
  }
}

/**
 * Get queue configuration from environment or defaults
 */
export function getQueueConfig(): QueueSystemConfig {
  const envSystem = process.env.QUEUE_SYSTEM as 'traditional' | 'intelligent' | undefined
  const envEnabled = process.env.QUEUE_ENABLED !== 'false'
  
  return {
    enabled: envEnabled,
    system: envSystem || DEFAULT_QUEUE_CONFIG.system,
    features: {
      progressiveTimeouts: process.env.QUEUE_PROGRESSIVE_TIMEOUTS !== 'false',
      priorityScheduling: process.env.QUEUE_PRIORITY_SCHEDULING !== 'false',
      fallbackStrategies: process.env.QUEUE_FALLBACK_STRATEGIES !== 'false',
      resourceManagement: process.env.QUEUE_RESOURCE_MANAGEMENT !== 'false',
      circuitBreakers: process.env.QUEUE_CIRCUIT_BREAKERS !== 'false'
    },
    limits: {
      maxConcurrentAgents: parseInt(process.env.QUEUE_MAX_CONCURRENT || '3'),
      maxQueueSize: parseInt(process.env.QUEUE_MAX_SIZE || '50'),
      maxRetryAttempts: parseInt(process.env.QUEUE_MAX_RETRIES || '4'),
      circuitBreakerTimeout: parseInt(process.env.QUEUE_CIRCUIT_BREAKER_TIMEOUT || '900000')
    }
  }
}

/**
 * Agent timeout configurations for different systems
 */
export const AGENT_TIMEOUT_CONFIGS = {
  traditional: {
    crawl_agent: 45000,      // 45 seconds
    llm_test_agent: 30000,   // 30 seconds
    sentiment_agent: 25000,  // 25 seconds
    citation_agent: 20000,   // 20 seconds
    geo_visibility_agent: 30000, // 30 seconds
    commerce_agent: 25000    // 25 seconds
  },
  intelligent: {
    crawl_agent: {
      initial: 180000,       // 3 minutes
      progressive: [300000, 600000, 900000], // 5min, 10min, 15min
      circuitBreaker: 900000 // 15 minutes
    },
    llm_test_agent: {
      initial: 120000,       // 2 minutes
      progressive: [180000, 300000], // 3min, 5min
      circuitBreaker: 300000 // 5 minutes
    },
    sentiment_agent: {
      initial: 90000,        // 1.5 minutes
      progressive: [120000, 180000], // 2min, 3min
      circuitBreaker: 180000 // 3 minutes
    },
    citation_agent: {
      initial: 60000,        // 1 minute
      progressive: [90000, 120000], // 1.5min, 2min
      circuitBreaker: 120000 // 2 minutes
    },
    geo_visibility_agent: {
      initial: 120000,       // 2 minutes
      progressive: [180000, 240000], // 3min, 4min
      circuitBreaker: 240000 // 4 minutes
    },
    commerce_agent: {
      initial: 90000,        // 1.5 minutes
      progressive: [120000, 180000], // 2min, 3min
      circuitBreaker: 180000 // 3 minutes
    }
  }
}

/**
 * Get orchestrator class based on configuration
 */
export async function getOrchestrator() {
  const config = getQueueConfig()
  
  if (config.enabled && config.system === 'intelligent') {
    const { IntelligentHybridADIOrchestrator } = await import('./intelligent-hybrid-orchestrator')
    return new IntelligentHybridADIOrchestrator()
  } else {
    const { HybridADIOrchestrator } = await import('./hybrid-orchestrator')
    return new HybridADIOrchestrator()
  }
}

/**
 * Get background function endpoint based on configuration
 */
export function getBackgroundFunctionEndpoint(): string {
  const config = getQueueConfig()
  
  if (config.enabled && config.system === 'intelligent') {
    return '/.netlify/functions/intelligent-background-agents'
  } else {
    return '/.netlify/functions/background-agents'
  }
}

/**
 * Get status endpoint based on configuration
 */
export function getStatusEndpoint(evaluationId: string): string {
  const config = getQueueConfig()
  
  if (config.enabled && config.system === 'intelligent') {
    return `/api/evaluation/${evaluationId}/intelligent-status`
  } else {
    return `/api/evaluation/${evaluationId}/hybrid-status`
  }
}
