import { NextRequest, NextResponse } from 'next/server'
import { db, sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [PRODUCTION-DB-TEST] Starting database connection test...')
    
    // Check if we have a real database connection
    if (!db || !sql) {
      return NextResponse.json({
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: {
          message: 'No database connection available',
          code: 'NO_DB_CONNECTION'
        },
        environment: {
          hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
          hasNetlifyUnpooled: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 })
    }
    
    // Test 1: Basic connection using sql directly
    const connectionTest = await sql`SELECT 1 as test, current_user, current_database(), inet_server_addr() as server_ip`
    console.log('✅ [PRODUCTION-DB-TEST] Database connection successful')
    
    // Test 2: Check production schema exists
    const schemaTest = await sql`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'production'
    `
    
    // Test 3: Check critical tables exist in production schema
    const tablesTest = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'production'
      AND table_name IN ('evaluations', 'dimension_scores', 'brands', 'users', 'adi_agent_results')
      ORDER BY table_name
    `
    
    // Test 4: Check table structure for evaluations
    const evaluationsStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'production'
      AND table_name = 'evaluations'
      ORDER BY ordinal_position
    `
    
    // Test 5: Check table structure for dimension_scores
    const dimensionScoresStructure = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'production'
      AND table_name = 'dimension_scores'
      ORDER BY ordinal_position
    `
    
    // Test 6: Count existing records
    const recordCounts = await sql`
      SELECT
        (SELECT COUNT(*) FROM production.evaluations) as evaluations_count,
        (SELECT COUNT(*) FROM production.dimension_scores) as dimension_scores_count,
        (SELECT COUNT(*) FROM production.brands) as brands_count,
        (SELECT COUNT(*) FROM production.adi_agent_results) as adi_agent_results_count
    `
    
    // Test 7: Environment variables check
    const envCheck = {
      hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
      hasNetlifyUnpooled: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      connectionStringLength: process.env.NETLIFY_DATABASE_URL?.length || 0
    }
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      tests: {
        connection: {
          status: 'passed',
          details: connectionTest[0]
        },
        productionSchema: {
          status: schemaTest.length > 0 ? 'passed' : 'failed',
          exists: schemaTest.length > 0
        },
        criticalTables: {
          status: tablesTest.length >= 4 ? 'passed' : 'failed',
          found: tablesTest.map((row: any) => row.table_name),
          expected: ['evaluations', 'dimension_scores', 'brands', 'users', 'adi_agent_results']
        },
        evaluationsTable: {
          status: evaluationsStructure.length > 0 ? 'passed' : 'failed',
          columns: evaluationsStructure
        },
        dimensionScoresTable: {
          status: dimensionScoresStructure.length > 0 ? 'passed' : 'failed',
          columns: dimensionScoresStructure
        },
        recordCounts: {
          status: 'info',
          counts: recordCounts[0]
        },
        environment: {
          status: envCheck.hasNetlifyUrl ? 'passed' : 'failed',
          details: envCheck
        }
      }
    })
    
  } catch (error) {
    console.error('❌ [PRODUCTION-DB-TEST] Database test failed:', error)
    
    return NextResponse.json({
      status: 'failed',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        details: (error as any)?.detail
      },
      environment: {
        hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
        hasNetlifyUnpooled: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 })
  }
}