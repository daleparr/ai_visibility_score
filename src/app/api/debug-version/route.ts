import { NextResponse } from 'next/server';
import { DEBUG_VERSION } from '@/lib/evaluation-engine';

export async function GET() {
  return NextResponse.json({ 
    message: "Deployment sanity check.",
    version: DEBUG_VERSION || "not-found",
    timestamp: new Date().toISOString()
  });
}