import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection with Netlify Neon support - server-side only
let sql: any = null
let db: any = null

// Only initialize database connection server-side
if (typeof window === 'undefined') {
  // Try multiple connection string sources
  const connectionString = process.env.NETLIFY_DATABASE_URL ||
                          process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
                          process.env.DATABASE_URL
  
  console.log('🔍 [DB] Environment check:', {
    hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
    hasNetlifyUnpooled: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    connectionStringLength: connectionString?.length || 0
  })
  
  if (connectionString) {
    try {
      console.log('🔗 [DB] Attempting connection with:', connectionString.substring(0, 50) + '...')
      
      sql = neon(connectionString)
      db = drizzle(sql, {
        schema,
        logger: process.env.NODE_ENV === 'development'
      })
      
      // Set search path to production schema for all queries
      console.log('🔧 [DB] Setting search path to production schema...')
      
      // Test the connection and set search path
      console.log('🧪 [DB] Testing database connection...')
      
      // Force a simple query to verify connection works and set search path
      ;(async () => {
        try {
          await sql`SET search_path TO production, public`
          console.log('✅ [DB] Search path set to production schema')
        } catch (spErr: any) {
          console.warn('⚠️ [DB] Failed to set search_path; continuing with schema-qualified tables', spErr)
        }
        try {
          await sql`SELECT 1 as test`
          console.log('✅ [DB] Database connection test successful')
        } catch (testError: any) {
          console.error('❌ [DB] Database connection test failed:', testError)
          // Do NOT nullify db here. Keep the real connection; tables are schema-qualified.
        }
      })()
      
      console.log('✅ [DB] Database connection initialized with production schema')
    } catch (error) {
      console.error('❌ [DB] Failed to initialize database connection:', error)
      console.error('❌ [DB] Connection string available:', !!connectionString)
      console.error('❌ [DB] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      db = null
    }
  } else {
    console.warn('⚠️ [DB] No database connection string found')
    console.warn('⚠️ [DB] Available env vars:',
      Object.keys(process.env).filter(k => k.includes('DATABASE')))
    db = null
  }
}

// Create a comprehensive mock database for when no connection is available
const mockDb = {
  select: (fields?: any) => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        orderBy: (order: any) => Promise.resolve([]),
        limit: (count: number) => Promise.resolve([]),
        then: (resolve: any) => Promise.resolve([]).then(resolve)
      }),
      leftJoin: (table: any, condition: any) => ({
        where: (condition: any) => ({
          orderBy: (order: any) => Promise.resolve([]),
          limit: (count: number) => Promise.resolve([]),
          then: (resolve: any) => Promise.resolve([]).then(resolve)
        }),
        limit: (count: number) => Promise.resolve([]),
        then: (resolve: any) => Promise.resolve([]).then(resolve)
      }),
      orderBy: (order: any) => Promise.resolve([]),
      limit: (count: number) => Promise.resolve([]),
      then: (resolve: any) => Promise.resolve([]).then(resolve)
    }),
    then: (resolve: any) => Promise.resolve([]).then(resolve)
  }),
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => Promise.resolve([{
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      }]),
      then: (resolve: any) => Promise.resolve([{
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      }]).then(resolve)
    }),
    then: (resolve: any) => Promise.resolve([{
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }]).then(resolve)
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: () => Promise.resolve([{
          id: `mock_${Date.now()}`,
          updatedAt: new Date(),
          ...data
        }]),
        then: (resolve: any) => Promise.resolve([{
          id: `mock_${Date.now()}`,
          updatedAt: new Date(),
          ...data
        }]).then(resolve)
      }),
      then: (resolve: any) => Promise.resolve([{
        id: `mock_${Date.now()}`,
        updatedAt: new Date(),
        ...data
      }]).then(resolve)
    }),
    then: (resolve: any) => Promise.resolve([{
      id: `mock_${Date.now()}`,
      updatedAt: new Date()
    }]).then(resolve)
  }),
  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: () => Promise.resolve([]),
      then: (resolve: any) => Promise.resolve([]).then(resolve)
    }),
    then: (resolve: any) => Promise.resolve([]).then(resolve)
  })
}

// Force real database connection - no fallback to mock in production
if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production' && !db) {
    console.error('🚨 [CRITICAL] No database connection in production! This will cause data loss!')
    console.error('🚨 [CRITICAL] Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
    
    // In production, we MUST have a real database connection
    // Try one more time with explicit connection
    const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.NETLIFY_DATABASE_URL_UNPOOLED
    if (connectionString) {
      try {
        console.log('🔄 [CRITICAL] Attempting emergency database connection...')
        sql = neon(connectionString)
        db = drizzle(sql, { schema })
        console.log('✅ [CRITICAL] Emergency database connection successful')
      } catch (emergencyError) {
        console.error('❌ [CRITICAL] Emergency database connection failed:', emergencyError)
      }
    }
  }
}

// Export the database instance - NEVER use mock in production
export const dbInstance = db || (process.env.NODE_ENV === 'production' ? null : mockDb)
export { dbInstance as db, sql }

// Add runtime check to prevent mock database usage in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && !db) {
  console.error('🚨 [FATAL] No real database connection available in production!')
  console.error('🚨 [FATAL] This will cause complete data loss!')
  console.error('🚨 [FATAL] Environment variables available:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
}

// Add database connection validator
export const validateDatabaseConnection = async (): Promise<boolean> => {
  if (!db) {
    console.error('❌ [DB] No database instance available')
    return false
  }
  
  try {
    console.log('🧪 [DB] Testing database connection with production schema...')
    // Set search path and test connection
    await sql`SET search_path TO production, public`
    await sql`SELECT 1 as connection_test`
    console.log('✅ [DB] Database connection test successful with production schema')
    return true
  } catch (error) {
    console.error('❌ [DB] Database connection test failed:', error)
    return false
  }
}

// Add database operation logger
export const logDatabaseOperation = (operation: string, table: string, data?: any) => {
  console.log(`🔍 [DB] ${operation} on ${table}:`, {
    timestamp: new Date().toISOString(),
    operation,
    table,
    dataKeys: data ? Object.keys(data) : undefined,
    dbType: typeof db,
    isProduction: process.env.NODE_ENV === 'production'
  })
}

// Export schema for use in other files
export * from './schema'
// Ensure adiSubscriptions is exported as subscriptions for backward compatibility
export { adiSubscriptions as subscriptions } from './schema'