export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'undefined',
      allDatabaseKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')),
      netlifyContext: process.env.CONTEXT || 'unknown',
      deployId: process.env.DEPLOY_ID || 'unknown'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}