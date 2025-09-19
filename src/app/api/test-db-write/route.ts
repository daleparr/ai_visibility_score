export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔍 Testing database write operation...')
    
    // Import database connection
    const { db } = await import('@/lib/db/index')
    const { adiAgentResults } = await import('@/lib/db/schema')
    
    console.log('📦 Database imports successful')
    console.log('🔗 Database instance:', typeof db)
    
    // Test if db is the mock database
    if (typeof db.insert === 'function') {
      console.log('✅ Database has insert method')
    } else {
      console.log('❌ Database missing insert method')
      return NextResponse.json({ 
        error: 'Database not properly initialized',
        dbType: typeof db,
        methods: Object.keys(db)
      }, { status: 500 })
    }
    
    // Try to insert a test record
    const testRecord = {
      evaluationId: `test_${Date.now()}`,
      agentId: 'test-agent',
      resultType: 'test',
      rawValue: 42,
      normalizedScore: 0.42,
      confidenceLevel: 0.8,
      evidence: { test: true }
    }
    
    console.log('📝 Attempting database insert...')
    const result = await db.insert(adiAgentResults).values(testRecord).returning()
    console.log('✅ Database insert successful:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Database write test successful',
      recordId: result[0]?.id,
      testRecord,
      dbType: typeof db
    })
    
  } catch (error) {
    console.error('❌ Database write test failed:', error)
    return NextResponse.json({ 
      error: 'Database write test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}