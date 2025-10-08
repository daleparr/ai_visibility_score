/**
 * Feature Flag System for AIDI
 * Allows toggling between original system and Railway bridge
 */

import { createLogger } from './utils/logger'

const logger = createLogger('feature-flags')

export interface FeatureFlags {
  enableRailwayBridge: boolean
  railwayBridgeTiers: string[]
  enableHybridFallback: boolean
  enableSyntheticData: boolean
  enableAdvancedLogging: boolean
}

class FeatureFlagManager {
  private flags: FeatureFlags
  private lastUpdate: number = 0
  private readonly CACHE_TTL = 60000 // 1 minute cache

  constructor() {
    this.flags = this.loadFlags()
    logger.info('Feature flags initialized', { flags: this.flags })
  }

  private loadFlags(): FeatureFlags {
    const flags: FeatureFlags = {
      // Railway Bridge System
      enableRailwayBridge: this.getBooleanFlag('ENABLE_RAILWAY_BRIDGE', false),
      railwayBridgeTiers: this.getArrayFlag('RAILWAY_BRIDGE_TIERS', ['free', 'index-pro', 'enterprise']),
      
      // Fallback Systems
      enableHybridFallback: this.getBooleanFlag('ENABLE_HYBRID_FALLBACK', true),
      enableSyntheticData: this.getBooleanFlag('ENABLE_SYNTHETIC_DATA', false),
      
      // Debugging
      enableAdvancedLogging: this.getBooleanFlag('ENABLE_ADVANCED_LOGGING', false)
    }

    this.lastUpdate = Date.now()
    return flags
  }

  private getBooleanFlag(envVar: string, defaultValue: boolean): boolean {
    const value = process.env[envVar]
    if (value === undefined) return defaultValue
    return value.toLowerCase() === 'true' || value === '1'
  }

  private getArrayFlag(envVar: string, defaultValue: string[]): string[] {
    const value = process.env[envVar]
    if (!value) return defaultValue
    return value.split(',').map(s => s.trim()).filter(Boolean)
  }

  /**
   * Get current feature flags (with caching)
   */
  getFlags(): FeatureFlags {
    const now = Date.now()
    if (now - this.lastUpdate > this.CACHE_TTL) {
      logger.debug('Refreshing feature flags from environment')
      this.flags = this.loadFlags()
    }
    return { ...this.flags }
  }

  /**
   * Check if Railway bridge is enabled for a specific tier
   */
  isRailwayBridgeEnabled(tier?: string): boolean {
    const flags = this.getFlags()
    
    if (!flags.enableRailwayBridge) {
      return false
    }

    if (!tier) {
      return true
    }

    return flags.railwayBridgeTiers.includes(tier)
  }

  /**
   * Check if hybrid fallback is enabled
   */
  isHybridFallbackEnabled(): boolean {
    return this.getFlags().enableHybridFallback
  }

  /**
   * Check if synthetic data generation is enabled
   */
  isSyntheticDataEnabled(): boolean {
    return this.getFlags().enableSyntheticData
  }

  /**
   * Check if advanced logging is enabled
   */
  isAdvancedLoggingEnabled(): boolean {
    return this.getFlags().enableAdvancedLogging
  }

  /**
   * Get system routing decision for an evaluation
   */
  getSystemRouting(tier: string, agentNames: string[]): {
    useRailwayBridge: boolean
    useLegacySystem: boolean
    reason: string
  } {
    const flags = this.getFlags()

    // Check if Railway bridge is enabled for this tier
    if (!this.isRailwayBridgeEnabled(tier)) {
      return {
        useRailwayBridge: false,
        useLegacySystem: true,
        reason: `Railway bridge disabled for tier: ${tier}`
      }
    }

    // Check for slow agents that benefit from Railway
    // These should match the SLOW_AGENTS in IntelligentHybridADIOrchestrator
    const slowAgents = ['crawl_agent', 'llm_test_agent', 'geo_visibility_agent', 'citation_agent', 'commerce_agent']
    const hasSlowAgents = agentNames.some(agent => slowAgents.includes(agent))

    if (hasSlowAgents) {
      return {
        useRailwayBridge: true,
        useLegacySystem: false,
        reason: `Slow agents detected: ${agentNames.filter(a => slowAgents.includes(a)).join(', ')}`
      }
    }

    // Default to legacy system for fast agents
    return {
      useRailwayBridge: false,
      useLegacySystem: true,
      reason: 'Only fast agents, using legacy system'
    }
  }

  /**
   * Force refresh flags from environment
   */
  refreshFlags(): FeatureFlags {
    logger.info('Force refreshing feature flags')
    this.flags = this.loadFlags()
    return { ...this.flags }
  }

  /**
   * Get flag status for debugging
   */
  getDebugInfo(): {
    flags: FeatureFlags
    lastUpdate: string
    cacheAge: number
    environment: Record<string, string>
  } {
    return {
      flags: this.getFlags(),
      lastUpdate: new Date(this.lastUpdate).toISOString(),
      cacheAge: Date.now() - this.lastUpdate,
      environment: {
        ENABLE_RAILWAY_BRIDGE: process.env.ENABLE_RAILWAY_BRIDGE || 'undefined',
        RAILWAY_BRIDGE_TIERS: process.env.RAILWAY_BRIDGE_TIERS || 'undefined',
        ENABLE_HYBRID_FALLBACK: process.env.ENABLE_HYBRID_FALLBACK || 'undefined',
        ENABLE_SYNTHETIC_DATA: process.env.ENABLE_SYNTHETIC_DATA || 'undefined',
        ENABLE_ADVANCED_LOGGING: process.env.ENABLE_ADVANCED_LOGGING || 'undefined'
      }
    }
  }
}

// Singleton instance
let featureFlagManager: FeatureFlagManager | null = null

export function getFeatureFlags(): FeatureFlagManager {
  if (!featureFlagManager) {
    featureFlagManager = new FeatureFlagManager()
  }
  return featureFlagManager
}

// Convenience functions
export function isRailwayBridgeEnabled(tier?: string): boolean {
  return getFeatureFlags().isRailwayBridgeEnabled(tier)
}

export function getSystemRouting(tier: string, agentNames: string[]) {
  return getFeatureFlags().getSystemRouting(tier, agentNames)
}

export function isAdvancedLoggingEnabled(): boolean {
  return getFeatureFlags().isAdvancedLoggingEnabled()
}
