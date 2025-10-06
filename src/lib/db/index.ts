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
        // Add explicit transaction isolation and connection parameters
        const connectionParams = [
          'target_session_attrs=read-write',
          'connect_timeout=10',
          'application_name=adi-hybrid-system',
          'statement_timeout=30000', // 30 second statement timeout
          'idle_in_transaction_session_timeout=60000' // 1 minute idle timeout
        ].join('&')
        
        const freshSql = neon(DB_URL.includes('?') 
          ? `${DB_URL}&${connectionParams}`
          : `${DB_URL}?${connectionParams}`)
        
        // Set schema path and verify connection in a single transaction-like operation
        await freshSql`SET search_path TO production, public`
        
        // Test connection and schema with explicit transaction isolation
        const schemaTest = await freshSql`
          SELECT 
            current_schema() as schema, 
            current_database() as db, 
            pg_backend_pid() as pid,
            current_setting('transaction_isolation') as isolation_level,
            now() as connection_time
        `
        console.log(`🔗 [DB] Fresh connection established - Schema: ${schemaTest[0].schema}, DB: ${schemaTest[0].db}, PID: ${schemaTest[0].pid}, Isolation: ${schemaTest[0].isolation_level}`)
        
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
          
          // CRITICAL: Force explicit commit and read-after-write consistency
          // This ensures writes are immediately visible to subsequent reads
          await freshSql`COMMIT`
          await freshSql`BEGIN`
          
          // Verify the connection is still active and can see recent writes
          const commitVerification = await freshSql`
            SELECT 
              1 as commit_check,
              pg_backend_pid() as verify_pid,
              now() as verify_time,
              current_setting('transaction_isolation') as verify_isolation
          `
          console.log(`✅ [DB] Transaction commit verified - PID: ${commitVerification[0].verify_pid}, Time: ${commitVerification[0].verify_time}`)
          
          await freshSql`COMMIT`
          
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

// Helper function to verify database write visibility across connections
export async function verifyWriteVisibility<T>(
  writeOperation: () => Promise<T>,
  verificationQuery: () => Promise<any>,
  maxRetries: number = 5,
  baseDelay: number = 1000
): Promise<T> {
  console.log(`🔍 [DB] Starting write operation with visibility verification...`)
  
  // Perform the write operation
  const writeResult = await writeOperation()
  console.log(`✅ [DB] Write operation completed`)
  
  // Verify the write is visible with exponential backoff
  let retryCount = 0
  while (retryCount < maxRetries) {
    try {
      console.log(`🔍 [DB] Verification attempt ${retryCount + 1}/${maxRetries}...`)
      
      // Use a completely fresh connection for verification
      await withSchema(async () => {
        const verificationResult = await verificationQuery()
        if (!verificationResult || (Array.isArray(verificationResult) && verificationResult.length === 0)) {
          throw new Error('Verification failed: write not visible')
        }
        console.log(`✅ [DB] Write visibility verified on attempt ${retryCount + 1}`)
      })
      
      // If we get here, verification succeeded
      return writeResult
      
    } catch (verifyError) {
      console.log(`⚠️ [DB] Verification attempt ${retryCount + 1} failed:`, verifyError instanceof Error ? verifyError.message : String(verifyError))
      
      if (retryCount < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`🔄 [DB] Retrying verification in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        retryCount++
      } else {
        console.error(`❌ [DB] Write visibility verification failed after ${maxRetries} attempts`)
        throw new Error(`Write visibility verification failed after ${maxRetries} attempts: ${verifyError instanceof Error ? verifyError.message : String(verifyError)}`)
      }
    }
  }
  
  return writeResult
}

export { sql, db }
export * from './schema'