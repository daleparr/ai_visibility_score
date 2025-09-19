const { neon } = require('@neondatabase/serverless')

async function testDatabasePopulation() {
  try {
    console.log('🔍 Testing database population...')
    
    const connectionString = process.env.NETLIFY_DATABASE_URL
    if (!connectionString) {
      console.error('❌ No NETLIFY_DATABASE_URL found')
      return
    }
    
    console.log('🔗 Connecting to database...')
    const sql = neon(connectionString)
    
    // Test connection
    console.log('🧪 Testing connection...')
    const testResult = await sql`SELECT 1 as test`
    console.log('✅ Connection successful:', testResult)
    
    // Check recent evaluations in production schema
    console.log('📊 Checking recent evaluations...')
    const recentEvals = await sql`
      SELECT COUNT(*) as count 
      FROM production.adi_agent_results 
      WHERE created_at > NOW() - INTERVAL '10 minutes'
    `
    console.log('📈 Recent evaluations:', recentEvals)
    
    // Check total records
    console.log('📊 Checking total records...')
    const totalRecords = await sql`
      SELECT COUNT(*) as total 
      FROM production.adi_agent_results
    `
    console.log('📈 Total records:', totalRecords)
    
    // Check if any evaluations exist at all
    console.log('📊 Checking all evaluation data...')
    const allEvals = await sql`
      SELECT evaluation_id, agent_id, created_at 
      FROM production.adi_agent_results 
      ORDER BY created_at DESC 
      LIMIT 5
    `
    console.log('📈 Recent evaluation records:', allEvals)
    
    // Check production schema tables
    console.log('📊 Checking production schema tables...')
    const tables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'production' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'production'
      ORDER BY table_name
    `
    console.log('📈 Production schema tables:', tables)
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testDatabasePopulation()