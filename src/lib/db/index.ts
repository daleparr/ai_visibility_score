import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// Database connection with Netlify Neon support
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL

if (!connectionString) {
  console.warn('No database URL found. Database operations will be disabled.')
}

// Create the connection only if we have a connection string
let sql: any = null
let db: any = null

if (connectionString) {
  try {
    sql = neon(connectionString)
    db = drizzle(sql, { schema })
    console.log('✅ Database connection initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error)
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

// Export the database instance (real or mock)
export const dbInstance = db || mockDb
export { dbInstance as db, sql }

// Export schema for use in other files
export * from './schema'