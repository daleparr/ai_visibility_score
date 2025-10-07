import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Bridge API: Callback endpoint for Railway notifications
 * This is a placeholder - the actual callback is handled by the Netlify function
 * POST /api/bridge/callback
 */
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Bridge callback endpoint - use Netlify function instead',
    redirect: '/.netlify/functions/bridge-callback'
  })
}

/**
 * Bridge API: Get callback status
 * GET /api/bridge/callback
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    status: 'operational',
    endpoint: '/.netlify/functions/bridge-callback',
    message: 'Callback endpoint is operational'
  })
}
