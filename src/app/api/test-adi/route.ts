import { NextRequest, NextResponse } from 'next/server'

// Use dynamic import to prevent webpack bundling issues
const getADIService = async () => {
  const { adiService } = await import('../../../lib/adi/adi-service')
  return adiService
}

/**
 * ADI Integration Test API
 * GET /api/test-adi - Test the complete ADI evaluation pipeline
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting ADI Integration Test via API...')

    // Test brand data
    const testBrand = {
      brandId: 'test_brand_001',
      websiteUrl: 'https://www.nike.com',
      industryId: 'apparel',
      userId: 'test_user_001'
    }

    // Initialize and test the service
    const adiService = await getADIService()
    await adiService.initialize()
    console.log('✅ ADI Service initialized')

    // Run evaluation
    const evaluationResult = await adiService.evaluateBrand(
      testBrand.brandId,
      testBrand.websiteUrl,
      testBrand.industryId,
      testBrand.userId
    )

    console.log('✅ Brand evaluation completed')

    // Generate report
    const report = await adiService.generateReport(evaluationResult, true)
    console.log('✅ Report generated')

    // Test benchmarking
    await adiService.updateIndustryBenchmarks(testBrand.industryId)
    console.log('✅ Benchmarks updated')

    // Test leaderboards
    await adiService.updateLeaderboards()
    console.log('✅ Leaderboards updated')

    // Verify framework completeness
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

    const missingDimensions = expectedDimensions.filter(d => !foundDimensions.includes(d as any))

    const testResults = {
      success: true,
      adiScore: evaluationResult.adiScore,
      report: {
        executiveSummary: report.executiveSummary,
        recommendationCount: report.recommendations.length,
        methodology: report.methodology.substring(0, 200) + '...'
      },
      frameworkAnalysis: {
        expectedDimensions: expectedDimensions.length,
        foundDimensions: foundDimensions.length,
        missingDimensions,
        completeness: ((foundDimensions.length / expectedDimensions.length) * 100).toFixed(1) + '%'
      },
      pillarBreakdown: evaluationResult.adiScore.pillars.map(p => ({
        pillar: p.pillar,
        score: p.score,
        weight: p.weight,
        dimensionCount: p.dimensions.length
      })),
      benchmarking: {
        industryPercentile: evaluationResult.industryPercentile,
        globalRank: evaluationResult.globalRank
      },
      testStatus: {
        serviceInitialization: '✅ PASSED',
        brandEvaluation: '✅ PASSED',
        reportGeneration: '✅ PASSED',
        benchmarking: '✅ PASSED',
        leaderboards: '✅ PASSED',
        frameworkCompleteness: missingDimensions.length === 0 ? '✅ PASSED' : '⚠️ PARTIAL'
      }
    }

    console.log('🎉 ADI Integration Test COMPLETED SUCCESSFULLY!')

    return NextResponse.json(testResults)

  } catch (error) {
    console.error('❌ ADI Integration Test FAILED:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testStatus: {
        serviceInitialization: '❌ FAILED',
        brandEvaluation: '❌ FAILED',
        reportGeneration: '❌ FAILED',
        benchmarking: '❌ FAILED',
        leaderboards: '❌ FAILED',
        frameworkCompleteness: '❌ FAILED'
      }
    }, { status: 500 })
  }
}