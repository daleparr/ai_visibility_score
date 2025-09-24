import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // This debug route is disabled to prevent build failures
  // Similar to other debug routes that have been disabled
  return NextResponse.json({
    status: 'disabled',
    message: 'This debug route is temporarily disabled to allow for stable builds.',
    timestamp: new Date().toISOString(),
    note: 'Use /api/health or /api/debug-env for basic health checks'
  }, { status: 200 });
}