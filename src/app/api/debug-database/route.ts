import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG-DB] Starting comprehensive database debugging...')
    
    // Import database modules
    const { db, sql, validateDatabaseConnection, logDatabaseOperation } = await import('@/lib/db/index')
    const { createBrand, createEvaluation, createDimensionScore } = await import('@/lib/database')
    
    const debugResults = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
        hasNetlifyUnpooled: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      },
      connectionTest: null as any,
      schemaTest: null as any,
      insertTest: null as any,
      errors: [] as string[]
    }
    
    // STEP 1: Test database connection
    console.log('🧪 [DEBUG-DB] Testing database connection...')
    try {
      const connectionValid = await validateDatabaseConnection()
      debugResults.connectionTest = {
        success: connectionValid,
        dbExists: !!db,
        dbType: typeof db
      }
      
      if (!connectionValid) {
        debugResults.errors.push('Database connection validation failed')
      }
    } catch (error) {
      debugResults.connectionTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      debugResults.errors.push(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // STEP 2: Test schema access
    console.log('🏗️ [DEBUG-DB] Testing schema access...')
    try {
      const schemaQuery = `
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'production' 
        AND table_name IN ('brands', 'evaluations', 'dimension_scores')
        ORDER BY table_name
      `
      
      const schemaResult = await sql(schemaQuery)
      debugResults.schemaTest = {
        success: true,
        tablesFound: schemaResult.length,
        tables: schemaResult.map((row: any) => row.table_name)
      }
      
      if (schemaResult.length < 3) {
        debugResults.errors.push(`Missing production tables: expected 3, found ${schemaResult.length}`)
      }
    } catch (error) {
      debugResults.schemaTest = { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      debugResults.errors.push(`Schema test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    // STEP 3: Test actual insert operations
    console.log('💾 [DEBUG-DB] Testing insert operations...')
    try {
      const testBrandId = `debug_brand_${Date.now()}`
      const testEvaluationId = `debug_eval_${Date.now()}`
      
      // Test brand creation
      logDatabaseOperation('INSERT', 'brands', { name: 'Debug Test Brand' })
      const testBrand = await createBrand({
        userId: 'debug-user',
        name: 'Debug Test Brand',
        websiteUrl: 'https://debug-test.com',
        industry: 'testing',
        adiEnabled: true
      })
      
      if (!testBrand) {
        throw new Error('Brand creation returned null')
      }
      
      // Test evaluation creation
      logDatabaseOperation('INSERT', 'evaluations', { brandId: testBrand.id })
      const testEvaluation = await createEvaluation({
        brandId: testBrand.id,
        status: 'completed',
        overallScore: 85,
        grade: 'A',
        verdict: 'Debug test evaluation',
        adiScore: 85,
        adiGrade: 'A',
        confidenceInterval: 90,
        reliabilityScore: 95,
        methodologyVersion: 'DEBUG-v1.0',
        completedAt: new Date()
      })
      
      // Test dimension score creation
      logDatabaseOperation('INSERT', 'dimension_scores', { evaluationId: testEvaluation.id })
      const testDimensionScore = await createDimensionScore({
        evaluationId: testEvaluation.id,
        dimensionName: 'Debug Test Dimension',
        score: 85,
        explanation: 'Debug test dimension score',
        recommendations: ['Debug test recommendation']
      })
      
      debugResults.insertTest = {
        success: true,
        brandId: testBrand.id,
        evaluationId: testEvaluation.id,
        dimensionScoreId: testDimensionScore.id,
        message: 'All insert operations completed successfully'
      }
      
      console.log('✅ [DEBUG-DB] All insert tests passed')
      
    } catch (error) {
      debugResults.insertTest = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
      debugResults.errors.push(`Insert test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('❌ [DEBUG-DB] Insert test failed:', error)
    }
    
    // STEP 4: Verify data was actually saved
    console.log('🔍 [DEBUG-DB] Verifying saved data...')
    try {
      const verificationQuery = `
        SELECT 
          'brands' as table_name, COUNT(*) as count 
        FROM production.brands 
        WHERE name = 'Debug Test Brand'
        UNION ALL
        SELECT 
          'evaluations' as table_name, COUNT(*) as count 
        FROM production.evaluations 
        WHERE verdict = 'Debug test evaluation'
        UNION ALL
        SELECT 
          'dimension_scores' as table_name, COUNT(*) as count 
        FROM production.dimension_scores 
        WHERE dimension_name = 'Debug Test Dimension'
      `
      
      const verificationResult = await sql(verificationQuery)
      debugResults.insertTest.verification = verificationResult
      
    } catch (error) {
      debugResults.errors.push(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    return NextResponse.json({
      success: debugResults.errors.length === 0,
      summary: debugResults.errors.length === 0 
        ? 'All database operations working correctly' 
        : `${debugResults.errors.length} issues found`,
      results: debugResults
    })
    
  } catch (error) {
    console.error('❌ [DEBUG-DB] Debug endpoint failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}