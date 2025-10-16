// API: List all industry sectors

import { NextRequest, NextResponse } from 'next/server';
import { industryReportsDB } from '@/lib/industry-reports/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false';
    
    const sectors = await industryReportsDB.getSectors(activeOnly);
    
    return NextResponse.json({
      success: true,
      sectors,
      count: sectors.length,
    });
  } catch (error) {
    console.error('Error fetching sectors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sectors' },
      { status: 500 }
    );
  }
}

