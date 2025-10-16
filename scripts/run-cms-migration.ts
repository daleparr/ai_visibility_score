#!/usr/bin/env tsx
/**
 * CMS Content Migration Runner
 * Populates CMS with authoritative tone copy
 */

import { db, sql } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function runMigration() {
  console.log('🚀 Starting CMS Content Migration...\n')
  
  try {
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'sql', 'cms-content-authoritative-tone-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    console.log('📄 Migration file loaded:', migrationPath)
    console.log('📊 File size:', migrationSQL.length, 'bytes\n')
    
    // Execute the migration
    console.log('⚡ Executing migration...')
    
    // For Neon, we need to execute the raw SQL
    if (!sql) {
      throw new Error('Database connection not available')
    }
    
    // Execute the full migration
    await sql(migrationSQL)
    
    console.log('✅ Migration executed successfully!\n')
    
    // Verify content blocks were created
    console.log('🔍 Verifying content blocks...')
    const result = await sql`
      SELECT 
        p.slug AS page,
        COUNT(cb.id) AS block_count
      FROM cms_pages p
      LEFT JOIN content_blocks cb ON cb.page_id = p.id
      GROUP BY p.slug
      ORDER BY p.slug
    `
    
    console.log('\n📊 Content Blocks Per Page:')
    console.table(result)
    
    console.log('\n✅ CMS Content Migration Complete!')
    console.log('🔗 Access CMS at: /admin/cms')
    console.log('📝 Next: Update frontend to fetch from CMS\n')
    
  } catch (error) {
    console.error('\n❌ Migration Failed:', error)
    console.error('\nPlease check:')
    console.error('1. Database connection is working')
    console.error('2. CMS schema tables exist (run sql/cms-schema.sql first)')
    console.error('3. SQL syntax is correct\n')
    process.exit(1)
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

