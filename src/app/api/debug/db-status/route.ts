import { NextRequest, NextResponse } from 'next/server'
import { withSchema } from '../../../../lib/db'
import { BackendAgentTracker } from '../../../../lib/adi/backend-agent-tracker'

/**
 * Debug endpoint to check database connection and schema status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const evaluationId = request.nextUrl.searchParams.get('evaluationId')
  
  try {
    console.log('🔍 [DEBUG] Checking database status...')
    
    // Test basic connection and schema
    const connectionTest = await withSchema(async () => {
      const { sql } = await import('../../../../lib/db')
      if (!sql) {
        throw new Error('SQL connection not available')
      }
      
      // Test basic query
      const result = await sql`SELECT current_schema() as schema, current_user as user, version() as version`
      return result[0]
    })
    
    console.log('✅ [DEBUG] Connection test successful:', connectionTest)
    
    let executionTest = null
    if (evaluationId) {
      console.log(`🔍 [DEBUG] Testing execution retrieval for ${evaluationId}...`)
      const tracker = new BackendAgentTracker()
      const executions = await tracker.getEvaluationExecutions(evaluationId)
      executionTest = {
        evaluationId,
        executionCount: executions.length,
        executions: executions.map(e => ({
          id: e.id,
          agentName: e.agentName,
          status: e.status,
          startedAt: e.startedAt,
          completedAt: e.completedAt
        }))
      }
      console.log(`✅ [DEBUG] Found ${executions.length} executions for ${evaluationId}`)
    }
    
    // Test table access
    const tableTest = await withSchema(async () => {
      const { db, backendAgentExecutions } = await import('../../../../lib/db')
      const count = await db.select().from(backendAgentExecutions).limit(1)
      return { accessible: true, sampleCount: count.length }
    })
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      connection: connectionTest,
      tableAccess: tableTest,
      executionTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL || !!process.env.NETLIFY_DATABASE_URL || !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
        platform: process.platform
      }
    })
    
  } catch (error) {
    console.error('❌ [DEBUG] Database status check failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL || !!process.env.NETLIFY_DATABASE_URL || !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
        platform: process.platform
      }
    }, { status: 500 })
  }
}
