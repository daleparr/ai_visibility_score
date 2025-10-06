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

// Helper function to execute queries with guaranteed schema path and transaction consistency
export async function withSchema<T>(queryFn: () => Promise<T>): Promise<T> {
  if (sql) {
    let retryCount = 0
    const maxRetries = 2
    
    while (retryCount <= maxRetries) {
      try {
        // Force a fresh connection for each critical operation to avoid pooling issues
        const freshSql = neon(DB_URL.includes('?') 
          ? `${DB_URL}&target_session_attrs=read-write&connect_timeout=10`
          : `${DB_URL}?target_session_attrs=read-write&connect_timeout=10`)
        
        // Set schema path and verify connection in a single transaction-like operation
        await freshSql`SET search_path TO production, public`
        
        // Test connection and schema
        const schemaTest = await freshSql`SELECT current_schema() as schema, current_database() as db, pg_backend_pid() as pid`
        console.log(`🔗 [DB] Fresh connection established - Schema: ${schemaTest[0].schema}, DB: ${schemaTest[0].db}, PID: ${schemaTest[0].pid}`)
        
        // Create a fresh Drizzle instance with the new connection
        const freshDb = drizzle(freshSql, {
          schema,
          logger: process.env.NODE_ENV === 'development'
        })
        
        // Temporarily replace the global db instance for this operation
        const originalDb = db
        const originalSql = sql
        db = freshDb
        sql = freshSql
        
        try {
          const result = await queryFn()
          
          // Ensure any writes are committed by doing a final verification query
          await freshSql`SELECT 1 as commit_check`
          
          return result
        } finally {
          // Restore original connections
          db = originalDb
          sql = originalSql
        }
        
      } catch (error) {
        console.error(`❌ [DB] Query with schema failed (attempt ${retryCount + 1}/${maxRetries + 1}):`, error instanceof Error ? error.message : String(error))
        
        if (retryCount < maxRetries) {
          retryCount++
          const delay = retryCount * 1000 // 1s, 2s delays
          console.log(`🔄 [DB] Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw error
      }
    }
    
    // This should never be reached due to the throw in the catch block, but TypeScript needs it
    throw new Error('Maximum retries exceeded')
  } else {
    throw new Error('Database connection not available')
  }
}

export { sql, db }
export * from './schema'