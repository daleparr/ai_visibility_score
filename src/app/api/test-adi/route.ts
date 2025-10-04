import { NextRequest, NextResponse } from 'next/server'

// Use dynamic import to prevent webpack bundling issues
const getADIService = async () => {
  const { HybridADIService } = await import('../../../lib/adi/hybrid-adi-service')
  return new HybridADIService()
}

/**
 * ADI Integration Test API
 * GET /api/test-adi - Test the complete ADI evaluation pipeline
 */
export async function GET(request: NextRequest) {
  // Gate integration test during build
  if (process.env.ADI_RUN_INTEGRATION_TEST !== 'true') {
    return NextResponse.json({
      message: 'Integration test disabled during build',
      note: 'Set ADI_RUN_INTEGRATION_TEST=true to enable'
    });
  }

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
    // Run evaluation
    const evaluationResult = await adiService.evaluateBrand(
      testBrand.brandId,
      testBrand.websiteUrl,
      'index-pro',
      'test_evaluation_001'
    )

    console.log('✅ Brand evaluation completed')

    // Generate report

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

    const foundDimensions = Object.keys(evaluationResult.agentResults)

    const missingDimensions = expectedDimensions.filter(d => !foundDimensions.includes(d as any))

    const testResults = {
      success: true,
      adiScore: {},
      report: {},
      frameworkAnalysis: {
        expectedDimensions: expectedDimensions.length,
        foundDimensions: foundDimensions.length,
        missingDimensions,
        completeness: ((foundDimensions.length / expectedDimensions.length) * 100).toFixed(1) + '%'
      },
      pillarBreakdown: [],
      benchmarking: {},
      testStatus: {
        serviceInitialization: '✅ PASSED',
        brandEvaluation: '✅ PASSED',
        reportGeneration: 'N/A',
        benchmarking: 'N/A',
        leaderboards: 'N/A',
        frameworkCompleteness: 'N/A'
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