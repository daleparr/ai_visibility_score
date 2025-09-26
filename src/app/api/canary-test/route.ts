import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const correlationId = Math.random().toString(36).slice(2, 10);
    console.log(`[${correlationId}] Starting canary test`);
    
    // Dynamic import to avoid build-time initialization
    const { sql } = await import('@/lib/db');
    
    // Test basic insert
    const result = await sql`
      INSERT INTO production.evaluations(
        id, brand_id, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        gen_random_uuid(), 
        'completed', 
        now(), 
        now()
      ) RETURNING id, status, created_at
    `;
    
    console.log(`[${correlationId}] Canary insert successful:`, result[0]);
    
    return NextResponse.json({
      success: true,
      correlationId,
      inserted: result[0],
      message: 'Canary test passed - database writes working'
    });
    
  } catch (error) {
    console.error('Canary test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Canary test failed - database writes not working'
    }, { status: 500 });
  }
}
