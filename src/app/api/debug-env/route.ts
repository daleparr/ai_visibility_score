export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check for Netlify database URL (primary) and fallback to DATABASE_URL
    const netlifyDbUrl = process.env.NETLIFY_DATABASE_URL
    const netlifyDbUrlUnpooled = process.env.NETLIFY_DATABASE_URL_UNPOOLED
    const databaseUrl = process.env.DATABASE_URL
    const primaryDbUrl = netlifyDbUrl || netlifyDbUrlUnpooled || databaseUrl

    return NextResponse.json({
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!primaryDbUrl,
      databaseUrlLength: primaryDbUrl?.length || 0,
      databaseUrlPrefix: primaryDbUrl?.substring(0, 20) || 'undefined',
      netlifyDatabaseUrl: !!netlifyDbUrl,
      netlifyDatabaseUrlUnpooled: !!netlifyDbUrlUnpooled,
      standardDatabaseUrl: !!databaseUrl,
      allDatabaseKeys: Object.keys(process.env).filter(k => k.includes('DATABASE')),
      netlifyContext: process.env.CONTEXT || 'unknown',
      deployId: process.env.DEPLOY_ID || 'unknown',
      netlifyEnvVars: {
        NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
        NETLIFY_DATABASE_URL_UNPOOLED: !!process.env.NETLIFY_DATABASE_URL_UNPOOLED,
        CONTEXT: process.env.CONTEXT,
        DEPLOY_ID: process.env.DEPLOY_ID,
        NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}