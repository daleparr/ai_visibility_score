import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection with fallback handling
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL not found. Database operations will be disabled.')
}

// Create the connection only if we have a connection string
let sql: any = null
let db: any = null

if (connectionString) {
  try {
    sql = neon(connectionString)
    db = drizzle(sql, { schema })
  } catch (error) {
    console.error('Failed to initialize database connection:', error)
  }
}

// Create a mock database for when no connection is available
const mockDb = {
  select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
  insert: () => ({ values: () => Promise.resolve({ insertId: 'mock' }) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  delete: () => ({ where: () => Promise.resolve() })
}

// Export the database instance (real or mock)
export const dbInstance = db || mockDb
export { dbInstance as db, sql }

// Export schema for use in other files
export * from './schema'