/**
 * AI Visibility Score - Cost Simulation Calculator
 * Calculates operational costs for different user volumes
 */

// AI Provider Pricing (per 1M tokens)
export const AI_PROVIDER_COSTS = {
  openai: { input: 30, output: 60, total: 90 },
  anthropic: { input: 15, output: 75, total: 90 },
  google: { input: 0.5, output: 1.5, total: 2 },
  mistral: { input: 8, output: 24, total: 32 },
  llama: { input: 0.6, output: 0.6, total: 1.2 }
} as const

// Evaluation Configuration
export const EVALUATION_CONFIG = {
  tokensPerDimension: 2000, // 1K prompt + 1K response
  dimensionsPerEvaluation: 10,
  providersPerDimension: 5,
  totalTokensPerEvaluation: 100000, // 10 dimensions × 5 providers × 2K tokens
  averageCostPerEvaluation: 4.50 // Weighted average across providers
} as const

// User Behavior Patterns
export const USER_PATTERNS = {
  activeUserPercentage: 0.20, // 20% of users are active monthly
  subscriptionDistribution: {
    free: 0.70,      // 70% free users
    professional: 0.25, // 25% professional users  
    enterprise: 0.05    // 5% enterprise users
  },
  evaluationsPerMonth: {
    free: 2,           // Average 2 evaluations/month
    professional: 25,  // Average 25 evaluations/month
    enterprise: 200    // Average 200 evaluations/month
  }
} as const

// Infrastructure Pricing
export const INFRASTRUCTURE_COSTS = {
  database: {
    neon: {
      free: { storage: 0.5, compute: 100, cost: 0 },
      pro: { baseCost: 19, storagePerGB: 0.102, computePerHour: 0.16 },
      scale: { baseCost: 69, storagePerGB: 0.102, computePerHour: 0.16 }
    }
  },
  hosting: {
    netlify: {
      free: { bandwidth: 100, buildMinutes: 300, cost: 0 },
      pro: { baseCost: 19, bandwidthPer100GB: 55 },
      business: { baseCost: 99, bandwidthPer100GB: 55 },
      enterprise: { baseCost: 300, bandwidthPer100GB: 55 }
    }
  }
} as const

export interface CostBreakdown {
  aiProviderCosts: number
  databaseCosts: number
  hostingCosts: number
  totalMonthlyCost: number
  costPerUser: number
  totalEvaluations: number
}

export interface UserScenario {
  totalUsers: number
  freeUsers: number
  professionalUsers: number
  enterpriseUsers: number
  totalEvaluations: number
}

export class CostSimulator {
  
  /**
   * Calculate user distribution for a given total
   */
  static calculateUserDistribution(totalUsers: number): UserScenario {
    const freeUsers = Math.floor(totalUsers * USER_PATTERNS.subscriptionDistribution.free)
    const professionalUsers = Math.floor(totalUsers * USER_PATTERNS.subscriptionDistribution.professional)
    const enterpriseUsers = Math.floor(totalUsers * USER_PATTERNS.subscriptionDistribution.enterprise)
    
    // Calculate total evaluations
    const totalEvaluations = 
      (freeUsers * USER_PATTERNS.evaluationsPerMonth.free) +
      (professionalUsers * USER_PATTERNS.evaluationsPerMonth.professional) +
      (enterpriseUsers * USER_PATTERNS.evaluationsPerMonth.enterprise)
    
    return {
      totalUsers,
      freeUsers,
      professionalUsers,
      enterpriseUsers,
      totalEvaluations
    }
  }

  /**
   * Calculate AI/LLM costs based on evaluation volume
   */
  static calculateAIProviderCosts(totalEvaluations: number): number {
    return totalEvaluations * EVALUATION_CONFIG.averageCostPerEvaluation
  }

  /**
   * Calculate database costs based on usage
   */
  static calculateDatabaseCosts(totalUsers: number, totalEvaluations: number): number {
    const storageGB = Math.max(1, Math.ceil(totalEvaluations * 0.05 / 1000)) // 50KB per evaluation
    const computeHours = Math.max(10, Math.ceil(totalEvaluations * 0.1)) // 0.1 hour per evaluation
    
    if (totalUsers <= 100) {
      // Pro tier
      return INFRASTRUCTURE_COSTS.database.neon.pro.baseCost + 
             (storageGB * INFRASTRUCTURE_COSTS.database.neon.pro.storagePerGB) +
             (computeHours * INFRASTRUCTURE_COSTS.database.neon.pro.computePerHour)
    } else {
      // Scale tier
      return INFRASTRUCTURE_COSTS.database.neon.scale.baseCost + 
             (storageGB * INFRASTRUCTURE_COSTS.database.neon.scale.storagePerGB) +
             (computeHours * INFRASTRUCTURE_COSTS.database.neon.scale.computePerHour)
    }
  }

  /**
   * Calculate hosting costs based on traffic
   */
  static calculateHostingCosts(totalUsers: number): number {
    const bandwidthGB = totalUsers * 2 // Estimate 2GB per user per month
    const extraBandwidth = Math.max(0, bandwidthGB - 100) // Free tier includes 100GB
    const extraBandwidth100GBUnits = Math.ceil(extraBandwidth / 100)
    
    if (totalUsers <= 500) {
      // Pro tier
      return INFRASTRUCTURE_COSTS.hosting.netlify.pro.baseCost + 
             (extraBandwidth100GBUnits * INFRASTRUCTURE_COSTS.hosting.netlify.pro.bandwidthPer100GB)
    } else if (totalUsers <= 2500) {
      // Business tier
      return INFRASTRUCTURE_COSTS.hosting.netlify.business.baseCost + 
             (extraBandwidth100GBUnits * INFRASTRUCTURE_COSTS.hosting.netlify.business.bandwidthPer100GB)
    } else {
      // Enterprise tier
      return INFRASTRUCTURE_COSTS.hosting.netlify.enterprise.baseCost + 
             (extraBandwidth100GBUnits * INFRASTRUCTURE_COSTS.hosting.netlify.enterprise.bandwidthPer100GB)
    }
  }

  /**
   * Calculate total costs for a user scenario
   */
  static calculateTotalCosts(totalUsers: number): CostBreakdown {
    const scenario = this.calculateUserDistribution(totalUsers)
    
    const aiProviderCosts = this.calculateAIProviderCosts(scenario.totalEvaluations)
    const databaseCosts = this.calculateDatabaseCosts(totalUsers, scenario.totalEvaluations)
    const hostingCosts = this.calculateHostingCosts(totalUsers)
    
    const totalMonthlyCost = aiProviderCosts + databaseCosts + hostingCosts
    const costPerUser = totalMonthlyCost / totalUsers
    
    return {
      aiProviderCosts,
      databaseCosts,
      hostingCosts,
      totalMonthlyCost,
      costPerUser,
      totalEvaluations: scenario.totalEvaluations
    }
  }

  /**
   * Generate cost simulation for all user tiers
   */
  static generateCostSimulation(): Record<number, CostBreakdown> {
    const userTiers = [100, 500, 1000, 2500, 5000, 10000]
    const results: Record<number, CostBreakdown> = {}
    
    for (const userCount of userTiers) {
      results[userCount] = this.calculateTotalCosts(userCount)
    }
    
    return results
  }

  /**
   * Calculate optimized costs with cost reduction strategies
   */
  static calculateOptimizedCosts(totalUsers: number, optimizationLevel: 'basic' | 'advanced' | 'aggressive'): CostBreakdown {
    const baseCosts = this.calculateTotalCosts(totalUsers)
    
    let reductionFactor = 1.0
    
    switch (optimizationLevel) {
      case 'basic':
        // Reduce to 3 providers, basic caching
        reductionFactor = 0.5 // 50% reduction
        break
      case 'advanced':
        // 2 providers, smart caching, prompt optimization
        reductionFactor = 0.3 // 70% reduction
        break
      case 'aggressive':
        // Smart provider selection, heavy caching, batch processing
        reductionFactor = 0.2 // 80% reduction
        break
    }
    
    return {
      ...baseCosts,
      aiProviderCosts: baseCosts.aiProviderCosts * reductionFactor,
      totalMonthlyCost: (baseCosts.aiProviderCosts * reductionFactor) + baseCosts.databaseCosts + baseCosts.hostingCosts,
      costPerUser: ((baseCosts.aiProviderCosts * reductionFactor) + baseCosts.databaseCosts + baseCosts.hostingCosts) / totalUsers
    }
  }

  /**
   * Calculate revenue requirements for profitability
   */
  static calculateRevenueRequirements(totalUsers: number, targetMargin: number = 0.4): {
    requiredRevenue: number
    revenuePerUser: number
    professionalPrice: number
    enterprisePrice: number
  } {
    const costs = this.calculateTotalCosts(totalUsers)
    const requiredRevenue = costs.totalMonthlyCost / (1 - targetMargin)
    const revenuePerUser = requiredRevenue / totalUsers
    
    const scenario = this.calculateUserDistribution(totalUsers)
    
    // Calculate pricing based on evaluation usage
    const professionalPrice = (USER_PATTERNS.evaluationsPerMonth.professional * EVALUATION_CONFIG.averageCostPerEvaluation) / (1 - targetMargin)
    const enterprisePrice = (USER_PATTERNS.evaluationsPerMonth.enterprise * EVALUATION_CONFIG.averageCostPerEvaluation) / (1 - targetMargin)
    
    return {
      requiredRevenue,
      revenuePerUser,
      professionalPrice: Math.ceil(professionalPrice),
      enterprisePrice: Math.ceil(enterprisePrice)
    }
  }
}

// Export for use in other modules
export default CostSimulator