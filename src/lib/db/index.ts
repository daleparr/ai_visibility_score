import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection
const connectionString = process.env.DATABASE_URL!

// Create the connection
const sql = neon(connectionString)

// Create the database instance
export const db = drizzle(sql, { schema })

// Export schema for use in other files
export * from './schema'
export { sql }