const { neon } = require('@neondatabase/serverless')

async function testFinalDatabaseFix() {
  try {
    console.log('🎯 Testing final database fix for Spotify evaluation...')
    
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
    
    // Check recent dimension scores (this is where the data should be)
    console.log('📊 Checking recent dimension scores...')
    const recentDimensions = await sql`
      SELECT COUNT(*) as count 
      FROM production.dimension_scores 
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    `
    console.log('📈 Recent dimension scores:', recentDimensions)
    
    // Check recent evaluations
    console.log('📊 Checking recent evaluations...')
    const recentEvals = await sql`
      SELECT COUNT(*) as count 
      FROM production.evaluations 
      WHERE created_at > NOW() - INTERVAL '5 minutes'
    `
    console.log('📈 Recent evaluations:', recentEvals)
    
    // Check total records in key tables
    console.log('📊 Checking total records in all tables...')
    const tableStats = await sql`
      SELECT 
        'dimension_scores' as table_name,
        COUNT(*) as total_records
      FROM production.dimension_scores
      UNION ALL
      SELECT 
        'evaluations' as table_name,
        COUNT(*) as total_records
      FROM production.evaluations
      UNION ALL
      SELECT 
        'niche_brand_selection' as table_name,
        COUNT(*) as total_records
      FROM production.niche_brand_selection
      ORDER BY table_name
    `
    console.log('📈 Table statistics:', tableStats)
    
    // Show recent dimension scores if any exist
    console.log('📊 Showing recent dimension score records...')
    const recentRecords = await sql`
      SELECT evaluation_id, dimension_name, score, created_at 
      FROM production.dimension_scores 
      ORDER BY created_at DESC 
      LIMIT 10
    `
    console.log('📈 Recent dimension score records:', recentRecords)
    
    if (recentRecords.length > 0) {
      console.log('🎉 SUCCESS! Database writes are working!')
    } else {
      console.log('❌ No records found - database writes still failing')
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testFinalDatabaseFix()