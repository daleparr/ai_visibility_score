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
      
      // Test connection immediately but don't set search_path globally
      // Each operation should set its own search_path to avoid race conditions
      ;(async () => {
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

// Helper function to ensure correct schema path is set for database operations
export async function ensureSchema(): Promise<void> {
  if (sql) {
    try {
      await sql`SET search_path TO production, public`
      console.log('🔗 [DB] Schema path set to production, public')
    } catch (error) {
      console.warn('⚠️ [DB] Could not set schema path:', error instanceof Error ? error.message : String(error))
    }
  }
}

// Helper function to execute queries with guaranteed schema path
export async function withSchema<T>(queryFn: () => Promise<T>): Promise<T> {
  if (sql) {
    try {
      // Set schema path immediately before the query and verify connection
      await sql`SET search_path TO production, public`
      
      // Test connection to ensure it's still active
      await sql`SELECT 1 as connection_test`
      
      console.log('🔗 [DB] Schema path enforced and connection verified for query')
      return await queryFn()
    } catch (error) {
      console.error('❌ [DB] Query with schema failed:', error instanceof Error ? error.message : String(error))
      
      // If it's a connection error, try to reconnect once
      if (error instanceof Error && (error.message.includes('connection') || error.message.includes('timeout'))) {
        console.log('🔄 [DB] Attempting to reinitialize connection...')
        try {
          // Reinitialize connection
          const writerUrl = DB_URL.includes('?') 
            ? `${DB_URL}&target_session_attrs=read-write`
            : `${DB_URL}?target_session_attrs=read-write`
          
          sql = neon(writerUrl)
          db = drizzle(sql, {
            schema,
            logger: process.env.NODE_ENV === 'development'
          })
          
          // Set schema path again and retry
          await sql`SET search_path TO production, public`
          await sql`SELECT 1 as connection_test`
          console.log('✅ [DB] Connection reestablished, retrying query...')
          
          return await queryFn()
        } catch (retryError) {
          console.error('❌ [DB] Connection retry failed:', retryError instanceof Error ? retryError.message : String(retryError))
          throw retryError
        }
      }
      
      throw error
    }
  } else {
    throw new Error('Database connection not available')
  }
}

export { sql, db }
export * from './schema'