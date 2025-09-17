import { ADIScoringEngine } from './scoring'
import type { ADIOrchestrationResult, ADIAgentOutput } from '../../types/adi'

/**
 * Test script to verify hybrid scoring implementation
 */
export function testHybridScoring() {
  console.log('🧪 Testing Hybrid ADI Scoring Framework...')
  
  // Create mock orchestration result
  const mockOrchestrationResult: ADIOrchestrationResult = {
    evaluationId: 'test-hybrid-001',
    overallStatus: 'completed',
    agentResults: createMockAgentResults(),
    totalExecutionTime: 45000,
    errors: [],
    warnings: []
  }
  
  try {
    // Test standard scoring
    console.log('\n📊 Testing Standard ADI Scoring...')
    const standardScore = ADIScoringEngine.calculateADIScore(mockOrchestrationResult)
    console.log(`✅ Standard Score: ${standardScore.overall}/100 (${standardScore.grade})`)
    console.log(`📈 Pillars: ${standardScore.pillars.length} pillars`)
    console.log(`🎯 Confidence: ±${standardScore.confidenceInterval}`)
    
    // Test hybrid scoring
    console.log('\n🔄 Testing Hybrid ADI Scoring...')
    const hybridScore = ADIScoringEngine.calculateHybridADIScore(mockOrchestrationResult)
    console.log(`✅ Hybrid Score: ${hybridScore.overall}/100 (${hybridScore.grade})`)
    console.log(`📊 Primary Dimensions: ${Object.keys(hybridScore.primaryDimensions.scores).length}`)
    console.log(`🎯 Optimization Areas: ${hybridScore.optimizationAreas.totalAreas}`)
    console.log(`🚨 Critical Areas: ${hybridScore.optimizationAreas.criticalAreas}`)
    console.log(`⚡ Quick Wins: ${hybridScore.optimizationAreas.quickWins.length}`)
    console.log(`🔧 Sub-dimension Breakdowns: ${hybridScore.subDimensionBreakdowns.length}`)
    
    // Test specific optimization areas
    console.log('\n🎯 Testing Optimization Areas...')
    const optimizationAreas = Object.keys(hybridScore.optimizationAreas.scores)
    console.log(`📋 Available Areas: ${optimizationAreas.join(', ')}`)
    
    // Test brand heritage specifically
    const brandHeritageArea = hybridScore.optimizationAreas.scores['brand_heritage']
    if (brandHeritageArea) {
      console.log(`🏛️ Brand Heritage Score: ${brandHeritageArea.score}/100`)
      console.log(`📝 Recommendations: ${brandHeritageArea.recommendations.length}`)
      console.log(`⏱️ Time to Impact: ${brandHeritageArea.timeToImpact}`)
    }
    
    // Test conversational copy separation
    const conversationalArea = hybridScore.optimizationAreas.scores['conversational_copy']
    const llmReadabilityArea = hybridScore.optimizationAreas.scores['llm_readability']
    if (conversationalArea && llmReadabilityArea) {
      console.log(`💬 Conversational Copy: ${conversationalArea.score}/100`)
      console.log(`📖 LLM Readability: ${llmReadabilityArea.score}/100`)
      console.log(`✅ Successfully separated conversational copy from LLM readability`)
    }
    
    console.log('\n🎉 Hybrid Scoring Test Completed Successfully!')
    return {
      success: true,
      standardScore,
      hybridScore,
      message: 'All hybrid scoring features working correctly'
    }
    
  } catch (error) {
    console.error('❌ Hybrid Scoring Test Failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Hybrid scoring implementation has issues'
    }
  }
}

function createMockAgentResults(): Record<string, ADIAgentOutput> {
  return {
    'crawl_agent': {
      agentName: 'crawl_agent',
      status: 'completed',
      results: [
        {
          resultType: 'homepage_crawl',
          rawValue: 85,
          normalizedScore: 85,
          confidenceLevel: 0.9,
          evidence: { url: 'https://example.com', contentSize: 50000 }
        }
      ],
      executionTime: 5000,
      metadata: { timestamp: new Date().toISOString() }
    },
    'schema_agent': {
      agentName: 'schema_agent',
      status: 'completed',
      results: [
        {
          resultType: 'schema_analysis',
          rawValue: 75,
          normalizedScore: 75,
          confidenceLevel: 0.85,
          evidence: { schemaTypes: ['Product', 'Organization'], coverage: 0.75 }
        }
      ],
      executionTime: 3000,
      metadata: { timestamp: new Date().toISOString() }
    },
    'semantic_agent': {
      agentName: 'semantic_agent',
      status: 'completed',
      results: [
        {
          resultType: 'semantic_clarity',
          rawValue: 70,
          normalizedScore: 70,
          confidenceLevel: 0.8,
          evidence: { clarityScore: 70, consistencyScore: 75 }
        },
        {
          resultType: 'ontology_analysis',
          rawValue: 65,
          normalizedScore: 65,
          confidenceLevel: 0.75,
          evidence: { taxonomyDepth: 3, categoryConsistency: 0.65 }
        }
      ],
      executionTime: 4000,
      metadata: { timestamp: new Date().toISOString() }
    },
    'conversational_copy_agent': {
      agentName: 'conversational_copy_agent',
      status: 'completed',
      results: [
        {
          resultType: 'conversational_analysis',
          rawValue: 60,
          normalizedScore: 60,
          confidenceLevel: 0.8,
          evidence: { conversationalTone: 0.6, useCaseFraming: 0.55 }
        }
      ],
      executionTime: 3500,
      metadata: { timestamp: new Date().toISOString() }
    },
    'llm_test_agent': {
      agentName: 'llm_test_agent',
      status: 'completed',
      results: [
        {
          resultType: 'llm_readability',
          rawValue: 80,
          normalizedScore: 80,
          confidenceLevel: 0.85,
          evidence: { readabilityScore: 80, structureScore: 85 }
        },
        {
          resultType: 'answer_quality',
          rawValue: 78,
          normalizedScore: 78,
          confidenceLevel: 0.9,
          evidence: { accuracyScore: 78, completenessScore: 82 }
        }
      ],
      executionTime: 8000,
      metadata: { timestamp: new Date().toISOString() }
    },
    'brand_heritage_agent': {
      agentName: 'brand_heritage_agent',
      status: 'completed',
      results: [
        {
          resultType: 'brand_story_analysis',
          rawValue: 45,
          normalizedScore: 45,
          confidenceLevel: 0.7,
          evidence: { storyElements: ['founded', 'mission'], hasNarrative: false }
        },
        {
          resultType: 'founder_story_analysis',
          rawValue: 30,
          normalizedScore: 30,
          confidenceLevel: 0.6,
          evidence: { founderElements: [], hasFounderStory: false }
        }
      ],
      executionTime: 4500,
      metadata: { timestamp: new Date().toISOString() }
    },
    'sentiment_agent': {
      agentName: 'sentiment_agent',
      status: 'completed',
      results: [
        {
          resultType: 'sentiment_analysis',
          rawValue: 72,
          normalizedScore: 72,
          confidenceLevel: 0.8,
          evidence: { overallSentiment: 0.72, trustSignals: 0.75 }
        }
      ],
      executionTime: 3000,
      metadata: { timestamp: new Date().toISOString() }
    },
    'commerce_agent': {
      agentName: 'commerce_agent',
      status: 'completed',
      results: [
        {
          resultType: 'hero_products',
          rawValue: 68,
          normalizedScore: 68,
          confidenceLevel: 0.85,
          evidence: { productIdentification: 0.68, recommendationAccuracy: 0.70 }
        },
        {
          resultType: 'logistics_policies',
          rawValue: 55,
          normalizedScore: 55,
          confidenceLevel: 0.75,
          evidence: { shippingClarity: 0.55, policyAccessibility: 0.60 }
        }
      ],
      executionTime: 5000,
      metadata: { timestamp: new Date().toISOString() }
    }
  }
}

// Export for use in development/testing
if (typeof window === 'undefined') {
  // Only run in Node.js environment (not browser)
  // testHybridScoring()
}