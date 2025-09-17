import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection with fallback handling
const connectionString = process.env.DATABASE_URL

// Enhanced diagnostic logging
console.log('=== DATABASE CONNECTION DIAGNOSTICS ===')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('DEMO_MODE:', process.env.DEMO_MODE)
console.log('DATABASE_URL exists:', !!connectionString)
console.log('DATABASE_URL length:', connectionString?.length || 0)
console.log('DATABASE_URL starts with postgresql:', connectionString?.startsWith('postgresql://') || false)
console.log('DATABASE_URL contains neon.tech:', connectionString?.includes('neon.tech') || false)
console.log('All environment variables starting with DATABASE:',
  Object.keys(process.env).filter(key => key.startsWith('DATABASE')))
console.log('All environment variables starting with NEON:',
  Object.keys(process.env).filter(key => key.startsWith('NEON')))
console.log('==========================================')

if (!connectionString) {
  console.warn('DATABASE_URL not found. Database operations will be disabled.')
  console.warn('Available environment variables:', Object.keys(process.env).sort())
}

// Create the connection only if we have a connection string
let sql: any = null
let db: any = null

if (connectionString) {
  try {
    console.log('Attempting to connect to Neon database...')
    sql = neon(connectionString)
    db = drizzle(sql, { schema })
    console.log('✅ Database connection initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error)
    console.error('Connection string format:', connectionString?.substring(0, 20) + '...')
  }
} else {
  console.warn('⚠️ No DATABASE_URL found, using mock database')
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

// Export the database instance (real or mock)
export const dbInstance = db || mockDb
export { dbInstance as db, sql }

// Export schema for use in other files
export * from './schema'