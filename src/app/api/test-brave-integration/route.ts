import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface TestBrandRequest {
  userId: string
  brandName: string
  websiteUrl: string
  industry?: string
}

// Enhanced logging utility for correlation tracking
const logger = {
  info: (correlationId: string, message: string, data?: any) => {
    console.log(`ℹ️ [${correlationId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (correlationId: string, message: string, error: any) => {
    console.error(`❌ [${correlationId}] ${message}`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  },
  debug: (correlationId: string, message: string, data?: any) => {
    if (process.env.DB_DEBUG === 'true') {
      console.log(`🔍 [${correlationId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  },
  success: (correlationId: string, message: string, data?: any) => {
    console.log(`✅ [${correlationId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  }
}

async function createBrandWithLogging(brand: any, correlationId: string) {
  logger.info(correlationId, 'PRE-INSERT: Starting brand creation')
  logger.debug(correlationId, 'PRE-INSERT: Brand data:', brand)
  
  // Get count before insert
  const countBefore = await sql<{count: number}>`
    SELECT count(*)::int as count 
    FROM production.brands 
    WHERE user_id = ${brand.userId}
  `
  logger.info(correlationId, `PRE-INSERT: Current brand count for user: ${countBefore[0]?.count || 0}`)
  
  try {
    // Insert brand using raw SQL for maximum visibility
    const result = await sql<any>`
      INSERT INTO production.brands (
        id, user_id, name, website_url, industry, description, 
        competitors, created_at, updated_at
      ) VALUES (
        ${brand.id || uuidv4()},
        ${brand.userId},
        ${brand.name},
        ${brand.websiteUrl},
        ${brand.industry || 'Technology'},
        ${brand.description || 'Test brand created via debug API'},
        '[]'::jsonb,
        now(),
        now()
      ) 
      ON CONFLICT (user_id, normalized_host) 
      DO UPDATE SET
        name = EXCLUDED.name,
        website_url = EXCLUDED.website_url,
        industry = COALESCE(EXCLUDED.industry, production.brands.industry),
        updated_at = now()
      RETURNING id, user_id, name, website_url, industry, created_at, updated_at
    `
    
    // Get count after insert
    const countAfter = await sql<{count: number}>`
      SELECT count(*)::int as count 
      FROM production.brands 
      WHERE user_id = ${brand.userId}
    `
    
    const rowsInserted = (countAfter[0]?.count || 0) - (countBefore[0]?.count || 0)
    logger.info(correlationId, `POST-INSERT: New brand count for user: ${countAfter[0]?.count || 0}`)
    logger.info(correlationId, `POST-INSERT: Rows inserted: ${rowsInserted}`)
    
    if (result && result.length > 0) {
      logger.success(correlationId, `POST-INSERT: Brand created/updated successfully with ID: ${result[0].id}`)
      return {
        success: true,
        brand: result[0],
        rowsInserted,
        countBefore: countBefore[0]?.count || 0,
        countAfter: countAfter[0]?.count || 0
      }
    } else {
      logger.error(correlationId, 'POST-INSERT: Brand creation returned empty result', {})
      return {
        success: false,
        error: 'Insert returned empty result',
        rowsInserted: 0
      }
    }
    
  } catch (error: any) {
    logger.error(correlationId, 'POST-INSERT: Brand creation failed', error)
    
    // Get count after failed insert
    const countAfter = await sql<{count: number}>`
      SELECT count(*)::int as count 
      FROM production.brands 
      WHERE user_id = ${brand.userId}
    `
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail,
      rowsInserted: (countAfter[0]?.count || 0) - (countBefore[0]?.count || 0),
      countBefore: countBefore[0]?.count || 0,
      countAfter: countAfter[0]?.count || 0
    }
  }
}

export async function POST(request: NextRequest) {
  const correlationId = uuidv4()
  logger.info(correlationId, '🚀 Starting Brave API integration test')
  
  try {
    const body: TestBrandRequest = await request.json()
    const { userId, brandName, websiteUrl, industry } = body
    
    // Validate required fields
    if (!userId || !brandName || !websiteUrl) {
      logger.error(correlationId, 'Missing required fields', { userId: !!userId, brandName: !!brandName, websiteUrl: !!websiteUrl })
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, brandName, websiteUrl',
        correlationId,
        received: { userId: !!userId, brandName: !!brandName, websiteUrl: !!websiteUrl }
      }, { status: 400 })
    }
    
    logger.debug(correlationId, 'Test parameters:', { userId, brandName, websiteUrl, industry })
    
    // Step 1: Database connection test
    logger.info(correlationId, 'STEP 1: Testing database connection')
    const connectionTest = await sql<any>`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        current_schema() as current_schema,
        now() as current_time
    `
    logger.success(correlationId, 'Database connection successful', connectionTest[0])
    
    // Step 2: Schema verification
    logger.info(correlationId, 'STEP 2: Verifying brands table schema')
    const schemaCheck = await sql<any>`
      SELECT count(*) as table_exists
      FROM information_schema.tables 
      WHERE table_name = 'brands' AND table_schema = 'production'
    `
    
    if (schemaCheck[0].table_exists === '0') {
      throw new Error('brands table does not exist in production schema')
    }
    logger.success(correlationId, 'Schema verification passed')
    
    // Step 3: Create brand with enhanced logging
    logger.info(correlationId, 'STEP 3: Creating test brand')
    const brandResult = await createBrandWithLogging({
      userId,
      name: brandName,
      websiteUrl,
      industry: industry || 'Technology'
    }, correlationId)
    
    // Step 4: Verify the insert by querying back
    if (brandResult.success && brandResult.brand) {
      logger.info(correlationId, 'STEP 4: Verifying brand creation')
      const verification = await sql<any>`
        SELECT id, name, website_url, industry, created_at, updated_at
        FROM production.brands 
        WHERE id = ${brandResult.brand.id}
      `
      
      logger.success(correlationId, 'Verification query completed', verification[0])
      
      // Step 5: Additional health checks
      const healthCheck = await sql<any>`
        SELECT 
          (SELECT count(*) FROM production.brands) as total_brands,
          (SELECT count(*) FROM production.brands WHERE user_id = ${userId}) as user_brands,
          (SELECT count(*) FROM production.brands WHERE created_at > now() - interval '1 hour') as recent_brands
      `
      
      return NextResponse.json({
        success: true,
        correlationId,
        message: 'Brave API integration test completed successfully',
        results: {
          connection: connectionTest[0],
          brandCreation: brandResult,
          verification: verification[0],
          healthCheck: healthCheck[0]
        },
        timing: {
          completedAt: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        correlationId,
        error: 'Brand creation failed',
        details: brandResult,
        results: {
          connection: connectionTest[0]
        }
      }, { status: 500 })
    }
    
  } catch (error: any) {
    logger.error(correlationId, 'Brave API integration test failed', error)
    
    return NextResponse.json({
      success: false,
      correlationId,
      error: error.message,
      code: error.code,
      detail: error.detail,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timing: {
        failedAt: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// GET endpoint for health check
export async function GET() {
  const correlationId = uuidv4()
  logger.info(correlationId, 'Health check requested')
  
  try {
    const healthData = await sql<any>`
      SELECT 
        'Brave API Debug Endpoint' as service,
        current_database() as database_name,
        current_user as user_name,
        version() as postgres_version,
        now() as current_time,
        (SELECT count(*) FROM production.brands) as total_brands,
        (SELECT count(*) FROM production.evaluations) as total_evaluations
    `
    
    logger.success(correlationId, 'Health check completed', healthData[0])
    
    return NextResponse.json({
      success: true,
      correlationId,
      health: healthData[0],
      endpoints: {
        test: 'POST /api/test-brave-integration',
        health: 'GET /api/test-brave-integration'
      },
      usage: {
        testBrand: {
          method: 'POST',
          body: {
            userId: 'string (required)',
            brandName: 'string (required)', 
            websiteUrl: 'string (required)',
            industry: 'string (optional)'
          }
        }
      }
    })
  } catch (error: any) {
    logger.error(correlationId, 'Health check failed', error)
    
    return NextResponse.json({
      success: false,
      correlationId,
      error: error.message,
      service: 'Brave API Debug Endpoint'
    }, { status: 500 })
  }
}