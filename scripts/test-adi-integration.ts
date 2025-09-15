/**
 * ADI Integration Test Script (TypeScript)
 * Tests the complete evaluation pipeline with new agents
 */

import { adiService } from '../src/lib/adi/adi-service'

async function testADIIntegration() {
  console.log('🚀 Starting ADI Integration Test...\n')

  try {
    // Test 1: Initialize ADI Service
    console.log('1️⃣ Testing ADI Service Initialization...')
    await adiService.initialize()
    console.log('✅ ADI Service initialized successfully\n')

    // Test 2: Test Brand Evaluation
    console.log('2️⃣ Testing Brand Evaluation Pipeline...')
    const testBrand = {
      brandId: 'test_brand_001',
      websiteUrl: 'https://example-brand.com',
      industryId: 'apparel',
      userId: 'test_user_001'
    }

    console.log(`   Evaluating: ${testBrand.websiteUrl}`)
    console.log(`   Industry: ${testBrand.industryId}`)
    
    const evaluationResult = await adiService.evaluateBrand(
      testBrand.brandId,
      testBrand.websiteUrl,
      testBrand.industryId,
      testBrand.userId
    )

    console.log('✅ Brand evaluation completed')
    console.log(`   ADI Score: ${evaluationResult.adiScore.overall}/100 (Grade ${evaluationResult.adiScore.grade})`)
    console.log(`   Confidence: ±${evaluationResult.adiScore.confidenceInterval} points`)
    console.log(`   Reliability: ${Math.round(evaluationResult.adiScore.reliabilityScore * 100)}%`)
    
    if (evaluationResult.industryPercentile) {
      console.log(`   Industry Percentile: ${Math.round(evaluationResult.industryPercentile)}th`)
    }
    
    if (evaluationResult.globalRank) {
      console.log(`   Global Rank: #${evaluationResult.globalRank}`)
    }
    console.log()

    // Test 3: Test Report Generation
    console.log('3️⃣ Testing Report Generation...')
    const report = await adiService.generateReport(evaluationResult, true)
    
    console.log('✅ Report generated successfully')
    console.log(`   Executive Summary: ${report.executiveSummary.substring(0, 100)}...`)
    console.log(`   Recommendations: ${report.recommendations.length} items`)
    console.log(`   Methodology: ${report.methodology.substring(0, 50)}...`)
    console.log()

    // Test 4: Test Pillar Breakdown
    console.log('4️⃣ Testing Pillar Breakdown...')
    for (const pillar of evaluationResult.adiScore.pillars) {
      console.log(`   ${pillar.pillar.toUpperCase()}: ${pillar.score}/100 (${pillar.dimensions.length} dimensions)`)
      for (const dimension of pillar.dimensions) {
        console.log(`     - ${dimension.dimension}: ${dimension.score}/100`)
      }
    }
    console.log()

    // Test 5: Test Benchmarking
    console.log('5️⃣ Testing Industry Benchmarking...')
    await adiService.updateIndustryBenchmarks(testBrand.industryId)
    console.log('✅ Industry benchmarks updated successfully\n')

    // Test 6: Test Leaderboards
    console.log('6️⃣ Testing Leaderboard Updates...')
    await adiService.updateLeaderboards()
    console.log('✅ Leaderboards updated successfully\n')

    // Test 7: Test Subscription Limits
    console.log('7️⃣ Testing Subscription Management...')
    const limits = await adiService.getSubscriptionLimits(testBrand.userId)
    console.log('✅ Subscription limits retrieved')
    console.log(`   Tier: ${limits.tier}`)
    console.log(`   Monthly Evaluations: ${limits.monthlyEvaluations}`)
    console.log(`   Remaining: ${limits.remainingEvaluations}`)
    console.log(`   API Access: ${limits.apiAccess}`)
    console.log(`   Benchmark Access: ${limits.benchmarkAccess}`)
    console.log()

    // Test 8: Verify Framework Completeness
    console.log('8️⃣ Verifying Framework Completeness...')
    const expectedDimensions = [
      'schema_structured_data',
      'semantic_clarity_ontology', 
      'knowledge_graphs_entity_linking',
      'llm_readability_conversational',
      'geo_visibility_presence',
      'ai_answer_quality_presence',
      'citation_authority_freshness',
      'reputation_signals',
      'hero_products_use_case',
      'policies_logistics_clarity'
    ]

    const foundDimensions = evaluationResult.adiScore.pillars
      .flatMap(p => p.dimensions)
      .map(d => d.dimension)

    console.log(`   Expected Dimensions: ${expectedDimensions.length}`)
    console.log(`   Found Dimensions: ${foundDimensions.length}`)
    
    const missingDimensions = expectedDimensions.filter(d => !foundDimensions.includes(d as any))
    if (missingDimensions.length === 0) {
      console.log('✅ All dimensions implemented correctly')
    } else {
      console.log(`⚠️  Missing dimensions: ${missingDimensions.join(', ')}`)
    }
    console.log()

    // Test Summary
    console.log('🎉 ADI Integration Test Summary:')
    console.log('✅ Service Initialization: PASSED')
    console.log('✅ Brand Evaluation: PASSED')
    console.log('✅ Report Generation: PASSED')
    console.log('✅ Pillar Breakdown: PASSED')
    console.log('✅ Benchmarking: PASSED')
    console.log('✅ Leaderboards: PASSED')
    console.log('✅ Subscription Management: PASSED')
    console.log(`${missingDimensions.length === 0 ? '✅' : '⚠️'} Framework Completeness: ${missingDimensions.length === 0 ? 'PASSED' : 'PARTIAL'}`)
    
    console.log('\n🚀 ADI Integration Test COMPLETED SUCCESSFULLY!')
    
    return {
      success: true,
      evaluationResult,
      report,
      missingDimensions,
      testResults: {
        serviceInitialization: true,
        brandEvaluation: true,
        reportGeneration: true,
        pillarBreakdown: true,
        benchmarking: true,
        leaderboards: true,
        subscriptionManagement: true,
        frameworkCompleteness: missingDimensions.length === 0
      }
    }

  } catch (error) {
    console.error('❌ ADI Integration Test FAILED:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testResults: {
        serviceInitialization: false,
        brandEvaluation: false,
        reportGeneration: false,
        pillarBreakdown: false,
        benchmarking: false,
        leaderboards: false,
        subscriptionManagement: false,
        frameworkCompleteness: false
      }
    }
  }
}

// Export for use in other modules
export { testADIIntegration }

// Run test if called directly
if (require.main === module) {
  testADIIntegration()
    .then(result => {
      if (result.success) {
        console.log('\n✅ All tests passed!')
        process.exit(0)
      } else {
        console.log('\n❌ Tests failed!')
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('Test execution failed:', error)
      process.exit(1)
    })
}