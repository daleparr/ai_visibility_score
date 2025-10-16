import { NextRequest, NextResponse } from 'next/server';

/**
 * CMS Status Check - Diagnose what's working
 */

export async function GET(req: NextRequest) {
  const status = {
    server: 'running',
    timestamp: new Date().toISOString(),
    checks: {} as any
  };

  // Check 1: Basic response
  status.checks.basicResponse = 'OK';

  // Check 2: Database import
  try {
    const { db } = await import('@/lib/db');
    status.checks.dbImport = 'OK';
  } catch (error: any) {
    status.checks.dbImport = 'FAILED: ' + error.message;
  }

  // Check 3: CMS client import
  try {
    const { themeManager } = await import('@/lib/cms/cms-client');
    status.checks.cmsClientImport = 'OK';
  } catch (error: any) {
    status.checks.cmsClientImport = 'FAILED: ' + error.message;
  }

  // Check 4: Database query
  try {
    const { db } = await import('@/lib/db');
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(sql`SELECT 1 as test`);
    status.checks.dbQuery = 'OK';
  } catch (error: any) {
    status.checks.dbQuery = 'FAILED: ' + error.message;
  }

  // Check 5: CMS tables exist
  try {
    const { db } = await import('@/lib/db');
    const { sql } = await import('drizzle-orm');
    const result = await db.execute(
      sql`SELECT COUNT(*) FROM site_settings`
    );
    status.checks.cmsTablesExist = 'OK - ' + result.rows[0].count + ' settings';
  } catch (error: any) {
    status.checks.cmsTablesExist = 'FAILED: ' + error.message;
  }

  return NextResponse.json(status, { status: 200 });
}

