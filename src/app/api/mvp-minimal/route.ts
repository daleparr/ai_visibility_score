import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    console.log('=== MVP MINIMAL TEST ===');
    
    // Test basic database operations without normalized_host constraint
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection working');

    // Test direct table access
    const tableCheck = await sql`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'production' 
      AND table_name IN ('users', 'brands', 'evaluations', 'dimension_scores')
      ORDER BY table_name, ordinal_position
    `;
    
    console.log('📋 Table structure check:', tableCheck.rows?.length || 0, 'columns found');

    // Check for normalized_host column specifically
    const normHostCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='production' 
        AND table_name='brands' 
        AND column_name='normalized_host'
      ) as has_normalized_host
    `;
    
    const hasNormalizedHost = normHostCheck.rows?.[0]?.has_normalized_host;
    console.log('🔍 normalized_host exists:', hasNormalizedHost);

    // Simple test without constraints
    if (hasNormalizedHost) {
      console.log('✅ Can proceed with normal brand creation');
      
      // Test actual brand creation
      const testResult = await sql`
        INSERT INTO production.users (id, email, name)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User')
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      `;
      
      const brandResult = await sql`
        INSERT INTO production.brands (user_id, name, website_url, industry)
        VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Test Brand', 'https://test.com', 'Tech')
        RETURNING id
      `;
      
      return NextResponse.json({
        success: true,
        message: '🎉 MVP PERSISTENCE WORKING! 🎉',
        normalized_host_status: '✅ Column exists',
        brand_id: brandResult.rows?.[0]?.id,
        mvp_status: 'READY FOR PRODUCTION'
      });
      
    } else {
      return NextResponse.json({
        success: false,
        message: 'Waiting for normalized_host fix to complete',
        normalized_host_status: '⏳ Column missing - Terminal 4 fix in progress',
        table_info: tableCheck.rows?.slice(0, 10) || [],
        mvp_status: 'BLOCKED - WAITING FOR SCHEMA FIX'
      }, { status: 202 });
    }

  } catch (error: any) {
    console.error('❌ Minimal test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MVP Minimal Test FAILED',
      error: error.message,
      error_code: error.code || 'unknown'
    }, { status: 500 });
  }
}