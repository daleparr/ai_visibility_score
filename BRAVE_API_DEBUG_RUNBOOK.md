# Brave API Debugging Runbook

## Overview
This runbook provides a systematic approach to debugging Brave API integration issues, particularly focusing on database persistence problems and data flow verification.

## Quick Triage Checklist

### 1. Canary Insert (Direct SQL)
**Purpose**: Verify basic database connectivity, permissions, and schema access.

```sql
-- Test basic connection and write permissions
INSERT INTO production.results (id, data, created_at) 
VALUES (gen_random_uuid(), '{"test": "canary"}', now()) 
RETURNING id, created_at;
```

**If this fails, check:**
- [ ] Database connection string (`DATABASE_URL` or `NETLIFY_DATABASE_URL`)
- [ ] Database user permissions (INSERT, SELECT on target schema)
- [ ] Schema exists and is accessible (`production` schema)
- [ ] Environment variables are correctly set
- [ ] Network connectivity to database

**Common fixes:**
```bash
# Check environment variables
echo $DATABASE_URL
echo $NETLIFY_DATABASE_URL

# Test connection with psql
psql $DATABASE_URL -c "SELECT current_database(), current_user, current_schema();"

# Verify schema access
psql $DATABASE_URL -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'production';"
```

### 2. Row Count Verification
**Purpose**: Ensure you're looking at the correct database and branch.

```sql
-- Check total row count in results table
SELECT count(*) FROM production.results;

-- Check recent inserts (last 24 hours)
SELECT count(*) FROM production.results 
WHERE created_at > now() - interval '24 hours';

-- Verify you're on the right database/schema
SELECT 
    current_database() as database_name,
    current_user as user_name,
    current_schema() as current_schema,
    version() as postgres_version;
```

**If count is 0 or unexpected:**
- [ ] Verify database connection points to production DB
- [ ] Check if using correct schema (`production` vs `public`)
- [ ] Confirm table name and structure
- [ ] Check for data in staging/development databases

### 3. Enable Database Query Logging
**Purpose**: Monitor actual SQL queries being executed.

#### For Drizzle ORM (Current Setup):
```typescript
// In src/lib/db/index.ts - add debug logging
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(connectionString, {
  debug: process.env.NODE_ENV === 'development' || process.env.DB_DEBUG === 'true'
})

export const db = drizzle(client, { 
  schema,
  logger: process.env.DB_DEBUG === 'true' ? {
    logQuery: (query, params) => {
      console.log('🔍 [DB Query]:', query)
      console.log('🔍 [DB Params]:', params)
    }
  } : undefined
})
```

#### Environment Variable Setup:
```bash
# Enable database debugging
export DB_DEBUG=true
export NODE_ENV=development
```

#### PostgreSQL Server-Side Logging:
```sql
-- Enable query logging (requires superuser)
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Or for specific session
SET log_statement = 'all';
```

### 4. Pre/Post Insert Logging with Correlation ID
**Purpose**: Track data flow and verify insert operations.

```typescript
// Enhanced logging wrapper for database operations
export const createBrandWithLogging = async (brand: NewBrand, correlationId: string): Promise<Brand | null> => {
  console.log(`🔍 [${correlationId}] PRE-INSERT: Starting brand creation`)
  console.log(`🔍 [${correlationId}] PRE-INSERT: Brand data:`, {
    name: brand.name,
    websiteUrl: brand.websiteUrl,
    userId: brand.userId,
    industry: brand.industry
  })
  
  // Get count before insert
  const countBefore = await sql<{count: number}>`SELECT count(*)::int as count FROM production.brands WHERE user_id = ${brand.userId}`
  console.log(`🔍 [${correlationId}] PRE-INSERT: Current brand count for user: ${countBefore[0]?.count || 0}`)
  
  try {
    const result = await createBrand(brand)
    
    // Get count after insert
    const countAfter = await sql<{count: number}>`SELECT count(*)::int as count FROM production.brands WHERE user_id = ${brand.userId}`
    console.log(`🔍 [${correlationId}] POST-INSERT: New brand count for user: ${countAfter[0]?.count || 0}`)
    console.log(`🔍 [${correlationId}] POST-INSERT: Rows inserted: ${(countAfter[0]?.count || 0) - (countBefore[0]?.count || 0)}`)
    
    if (result) {
      console.log(`✅ [${correlationId}] POST-INSERT: Brand created successfully with ID: ${result.id}`)
    } else {
      console.log(`❌ [${correlationId}] POST-INSERT: Brand creation returned null`)
    }
    
    return result
  } catch (error) {
    console.error(`❌ [${correlationId}] POST-INSERT: Brand creation failed:`, error)
    throw error
  }
}
```

### 5. Force Brave API Call via Server Route
**Purpose**: Test end-to-end flow with controlled input.

Create a test route: `/api/test-brave-integration`

```typescript
// src/app/api/test-brave-integration/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createBrandWithLogging } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const correlationId = uuidv4()
  console.log(`🚀 [${correlationId}] Starting Brave API integration test`)
  
  try {
    const body = await request.json()
    const { userId, brandName, websiteUrl, industry } = body
    
    if (!userId || !brandName || !websiteUrl) {
      return NextResponse.json({
        error: 'Missing required fields: userId, brandName, websiteUrl',
        correlationId
      }, { status: 400 })
    }
    
    console.log(`🔍 [${correlationId}] Test parameters:`, { userId, brandName, websiteUrl, industry })
    
    // Create brand with enhanced logging
    const brand = await createBrandWithLogging({
      userId,
      name: brandName,
      websiteUrl,
      industry: industry || 'Technology'
    }, correlationId)
    
    // Verify the insert by querying back
    const verification = await sql<any>`
      SELECT id, name, website_url, created_at 
      FROM production.brands 
      WHERE id = ${brand?.id}
    `
    
    console.log(`🔍 [${correlationId}] Verification query result:`, verification[0])
    
    return NextResponse.json({
      success: true,
      correlationId,
      brand,
      verification: verification[0],
      message: 'Brave API integration test completed successfully'
    })
    
  } catch (error: any) {
    console.error(`❌ [${correlationId}] Brave API integration test failed:`, error)
    return NextResponse.json({
      success: false,
      correlationId,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
```

**Test the route:**
```bash
curl -X POST http://localhost:3000/api/test-brave-integration \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "brandName": "Test Brand",
    "websiteUrl": "https://example.com",
    "industry": "Technology"
  }'
```

### 6. Raw SQL Insert Debugging
**Purpose**: If ORM inserts fail, test with direct SQL to isolate issues.

```sql
-- Test direct insert with exact data that failed
INSERT INTO production.brands (
  id, user_id, name, website_url, industry, description, 
  competitors, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'test-user-123',
  'Test Brand Direct SQL',
  'https://example.com',
  'Technology',
  'Test description',
  '[]'::jsonb,
  now(),
  now()
) RETURNING *;
```

**Check constraints and schema:**
```sql
-- View table constraints
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'brands' AND tc.table_schema = 'production';

-- View column definitions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'brands' AND table_schema = 'production'
ORDER BY ordinal_position;
```

## Common Issues and Solutions

### Issue: "relation does not exist"
```sql
-- Check if table exists in correct schema
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'brands';

-- Check current search_path
SHOW search_path;

-- Set search_path if needed
SET search_path TO production, public;
```

### Issue: "permission denied"
```sql
-- Check user permissions
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'brands' AND table_schema = 'production';

-- Grant permissions if needed (as superuser)
GRANT SELECT, INSERT, UPDATE, DELETE ON production.brands TO your_user;
```

### Issue: "constraint violation"
```sql
-- Check for unique constraint violations
SELECT 
  user_id, 
  normalized_host, 
  count(*) 
FROM production.brands 
GROUP BY user_id, normalized_host 
HAVING count(*) > 1;

-- Check foreign key constraints
SELECT 
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f' AND conrelid = 'production.brands'::regclass;
```

## Environment-Specific Debugging

### Local Development
```bash
# Check local database connection
psql $DATABASE_URL -c "SELECT 'Connection successful' as status;"

# Enable verbose logging
export DB_DEBUG=true
export NODE_ENV=development
npm run dev
```

### Production/Netlify
```bash
# Check Netlify environment variables
netlify env:list

# Test production database connection
netlify dev:exec "psql $NETLIFY_DATABASE_URL -c 'SELECT current_database();'"
```

## Monitoring and Alerting

### Key Metrics to Monitor
1. **Insert Success Rate**: Track successful vs failed inserts
2. **Response Times**: Monitor database query performance
3. **Error Rates**: Track specific error types and frequencies
4. **Connection Pool**: Monitor database connection usage

### Logging Best Practices
```typescript
// Structured logging for better debugging
const logger = {
  info: (correlationId: string, message: string, data?: any) => {
    console.log(`ℹ️ [${correlationId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
  },
  error: (correlationId: string, message: string, error: any) => {
    console.error(`❌ [${correlationId}] ${message}`, {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    })
  },
  debug: (correlationId: string, message: string, data?: any) => {
    if (process.env.DB_DEBUG === 'true') {
      console.log(`🔍 [${correlationId}] ${message}`, data ? JSON.stringify(data, null, 2) : '')
    }
  }
}
```

## Quick Reference Commands

### Database Health Check
```sql
-- Quick health check query
SELECT 
  'Database' as component,
  current_database() as database_name,
  current_user as user_name,
  version() as version,
  now() as current_time,
  (SELECT count(*) FROM production.brands) as total_brands,
  (SELECT count(*) FROM production.evaluations) as total_evaluations;
```

### Emergency Rollback
```sql
-- If bad data was inserted, rollback recent changes
BEGIN;
DELETE FROM production.brands 
WHERE created_at > '2024-01-01 12:00:00' 
  AND name LIKE '%test%';
-- Review the changes before committing
ROLLBACK; -- or COMMIT; if changes look correct
```

## Contact Information
- **Database Issues**: Check Neon/Netlify dashboard
- **API Issues**: Review Netlify function logs
- **Schema Issues**: Check drizzle migrations in `/drizzle` folder

---

*Last Updated: $(date)*
*Correlation ID Format: UUID v4*
*Log Level: INFO (set DB_DEBUG=true for DEBUG level)*