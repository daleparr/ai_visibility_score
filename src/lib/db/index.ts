import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// ✅ Use centralized database URL - same for ALL connections
const DB_URL = 
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL!;

// Database connection - server-side only, single connection string
let sql: any = null
let db: any = null

// Only initialize database connection server-side
if (typeof window === 'undefined') {
  console.log('🔍 [DB] Environment check:', {
    hasDbUrl: !!DB_URL,
    nodeEnv: process.env.NODE_ENV,
    connectionStringLength: DB_URL?.length || 0,
    usingUrl: DB_URL?.substring(0, 50) + '...'
  })
  
  if (DB_URL) {
    try {
      console.log(`🔗 [DB] CENTRALIZED CONNECTION:`, DB_URL.substring(0, 50) + '...')
      
      // ✅ Force read-write connection (no replicas)
      const writerUrl = DB_URL.includes('?') 
        ? `${DB_URL}&target_session_attrs=read-write`
        : `${DB_URL}?target_session_attrs=read-write`
      
      sql = neon(writerUrl)
      db = drizzle(sql, {
        schema,
        logger: process.env.NODE_ENV === 'development'
      })
      
      // Set search path once on connection
      ;(async () => {
        try {
          await sql`SET search_path TO production, public`
          console.log('✅ [DB] Search path set to production schema')
        } catch (spErr: any) {
          console.warn('⚠️ [DB] Failed to set search_path; using schema-qualified tables', spErr)
        }
        try {
          await sql`SELECT 1 as test`
          console.log('✅ [DB] Database connection test successful')
        } catch (testError: any) {
          console.error('❌ [DB] Database connection test failed:', testError)
        }
      })()
      
      console.log('✅ [DB] CENTRALIZED database connection initialized')
    } catch (error) {
      console.error(`❌ [DB] Failed to initialize database connection:`, error)
    }
  } else {
    console.warn('⚠️ [DB] No database connection string found')
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
export * from './schema'