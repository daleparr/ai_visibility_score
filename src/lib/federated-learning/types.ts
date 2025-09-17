// Federated Learning Types for ADI Platform

export interface FederatedDataPoint {
  id: string
  anonymizedUserId: string
  timestamp: string
  industryCategory: string
  brandSize: 'startup' | 'sme' | 'enterprise'
  subscriptionTier: 'free' | 'professional' | 'enterprise'
  
  // Anonymized evaluation data
  evaluationResults: {
    overallScore: number
    dimensionScores: Record<string, number>
    pillarScores: Record<string, number>
    confidence: number
    methodology: string
  }
  
  // Website characteristics (anonymized)
  websiteMetrics: {
    structureComplexity: number
    contentQuality: number
    technicalStack: string[]
    industryKeywords: string[]
    pageCount: number
    loadTime: number
  }
  
  // Agent performance data
  agentPerformance: {
    agentName: string
    executionTime: number
    successRate: number
    confidence: number
    errorTypes: string[]
  }[]
  
  // User improvement actions (if consented)
  improvementActions?: {
    recommendationId: string
    actionTaken: boolean
    implementationDate?: string
    outcomeScore?: number
    timeToImplement?: number
  }[]
  
  // Geographic and temporal context
  context: {
    region: string
    timezone: string
    evaluationTime: string
    seasonality: string
  }
}

export interface IndustryBenchmark {
  industryCategory: string
  lastUpdated: string
  sampleSize: number
  
  benchmarks: {
    medianScore: number
    p25Score: number
    p75Score: number
    p90Score: number
    topPerformerScore: number
    
    dimensionMedians: Record<string, number>
    pillarMedians: Record<string, number>
    
    commonStrengths: string[]
    commonWeaknesses: string[]
    improvementPatterns: string[]
  }
  
  trends: {
    scoreEvolution: { month: string; score: number }[]
    emergingPatterns: string[]
    seasonalEffects: Record<string, number>
  }
}

export interface PredictiveModel {
  modelId: string
  version: string
  trainedOn: string
  accuracy: number
  
  predictions: {
    estimatedScore: number
    confidenceInterval: [number, number]
    keyFactors: { factor: string; impact: number }[]
    improvementPotential: number
    timeToImprovement: number
  }
}

export interface PersonalizedInsights {
  userId: string
  generatedAt: string
  
  recommendations: {
    id: string
    priority: 'high' | 'medium' | 'low'
    category: string
    title: string
    description: string
    expectedImpact: number
    implementationEffort: 'low' | 'medium' | 'high'
    industryRelevance: number
    evidenceStrength: number
  }[]
  
  benchmarkComparisons: {
    industryPosition: number // percentile
    similarCompanies: {
      anonymizedId: string
      score: number
      improvements: string[]
    }[]
    gapAnalysis: {
      dimension: string
      gap: number
      closureStrategy: string
    }[]
  }
  
  predictiveInsights: {
    futureScore: number
    confidenceLevel: number
    keyDrivers: string[]
    riskFactors: string[]
  }
}

export interface FederatedLearningConfig {
  enabled: boolean
  privacyLevel: 'minimal' | 'standard' | 'enhanced'
  dataRetention: number // days
  anonymizationLevel: number // 1-10
  contributionIncentives: {
    enhancedBenchmarks: boolean
    earlyInsights: boolean
    customReports: boolean
  }
}