import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection with Netlify Neon support - server-side only
let sql: any = null
let db: any = null

// Only initialize database connection server-side
if (typeof window === 'undefined') {
  // Try multiple connection string sources
  const connectionString = process.env.NETLIFY_DATABASE_URL
  const unpooledConnectionString = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  
  console.log('🔍 [DB] Environment check:', {
    hasNetlifyUrl: !!process.env.NETLIFY_DATABASE_URL,
    hasNetlifyUnpooled: !!unpooledConnectionString,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    connectionStringLength: connectionString?.length || 0
  })
  
  const connect = (cs: string | undefined, is_pooled = true) => {
    if (cs) {
      try {
        console.log(`🔗 [DB] Attempting connection with ${is_pooled ? 'pooled' : 'unpooled'}:`, cs.substring(0, 50) + '...')
        
        sql = neon(cs)
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
        return true
      } catch (error) {
        console.error(`❌ [DB] Failed to initialize database connection with ${is_pooled ? 'pooled' : 'unpooled'}:`, error)
        return false
      }
    }
    return false
  }

  if (!connect(connectionString, true)) {
    connect(unpooledConnectionString, false)
  }
  
  if (!db) {
    console.warn('⚠️ [DB] No database connection string found or all connection attempts failed')
    console.warn('⚠️ [DB] Available env vars:',
      Object.keys(process.env).filter(k => k.includes('DATABASE')))
  }
}

// Create a comprehensive mock database for when no connection is available
const mockDb = {
  select: (fields?: any) => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        orderBy: (order: any) => Promise.resolve([]),
        limit: (l: number) => Promise.resolve([])
      }),
      execute: () => Promise.resolve([])
    })
  }),
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: () => Promise.resolve(data)
    })
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => Promise.resolve()
    })
  }),
  delete: (table: any) => ({
    where: (condition: any) => Promise.resolve()
  })
}

export { sql, db }