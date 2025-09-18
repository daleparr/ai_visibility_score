import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    db_url: process.env.DATABASE_URL ? "found" : "missing",
    db_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    db_url_starts_with_postgresql: process.env.DATABASE_URL ? process.env.DATABASE_URL.startsWith('postgresql://') : false,
    db_url_contains_neon: process.env.DATABASE_URL ? process.env.DATABASE_URL.includes('neon.tech') : false,
    all_env_vars_count: Object.keys(process.env).length,
    database_related_vars: Object.keys(process.env).filter(key => key.includes('DATABASE')),
    neon_related_vars: Object.keys(process.env).filter(key => key.includes('NEON')),
    node_env: process.env.NODE_ENV,
    demo_mode: process.env.DEMO_MODE,
    timestamp: new Date().toISOString()
  })
}