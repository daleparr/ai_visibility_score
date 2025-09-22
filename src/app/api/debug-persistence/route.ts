import { NextRequest, NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    console.log('=== MVP PERSISTENCE DEBUG TEST ===');
    
    // 1. Test database connection
    const dbTest = await sql`SELECT 1 as test`;
    console.log('✅ Database connection working');

    // 2. Check current table counts
    const evalCount = await sql`SELECT COUNT(*) as count FROM production.evaluations`;
    const dimCount = await sql`SELECT COUNT(*) as count FROM production.dimension_scores`;
    const brandCount = await sql`SELECT COUNT(*) as count FROM production.brands`;
    
    console.log('📊 Current table counts:', {
      evaluations: evalCount.rows?.[0]?.count || 0,
      dimension_scores: dimCount.rows?.[0]?.count || 0,
      brands: brandCount.rows?.[0]?.count || 0
    });

    // 3. Test simple brand creation
    const testBrand = {
      name: 'Debug Test Brand',
      website_url: 'https://debug-test.com',
      industry: 'Technology',
      user_id: 'debug-user-123'
    };

    const brandResult = await sql`
      INSERT INTO production.brands (user_id, name, website_url, industry)
      VALUES (${testBrand.user_id}, ${testBrand.name}, ${testBrand.website_url}, ${testBrand.industry})
      ON CONFLICT (user_id, normalized_host) DO UPDATE SET
        name = EXCLUDED.name
      RETURNING id, name
    `;
    
    console.log('✅ Brand creation test passed:', brandResult.rows?.[0]);

    // 4. Test evaluation creation
    const evalResult = await sql`
      INSERT INTO production.evaluations (
        user_id, brand_id, status, overall_score,
        accessibility_score, performance_score, content_score,
        social_media_score, user_experience_score
      )
      VALUES (
        ${testBrand.user_id}, ${brandResult.rows?.[0]?.id}, 'completed', 75.5,
        80.0, 70.0, 75.0, 78.0, 72.0
      )
      RETURNING id, status, overall_score
    `;

    console.log('✅ Evaluation creation test passed:', evalResult.rows?.[0]);

    // 5. Test dimension scores
    const dimResult = await sql`
      INSERT INTO production.dimension_scores (
        evaluation_id, dimension_name, score, reasoning
      )
      VALUES (
        ${evalResult.rows?.[0]?.id}, 'accessibility', 80.0, 'Test reasoning'
      )
      RETURNING id, dimension_name, score
    `;

    console.log('✅ Dimension score test passed:', dimResult.rows?.[0]);

    // 6. Final verification
    const finalCount = await sql`SELECT COUNT(*) as count FROM production.evaluations WHERE user_id = ${testBrand.user_id}`;
    
    return NextResponse.json({
      success: true,
      message: 'MVP Persistence Test PASSED',
      results: {
        database_connection: '✅ Working',
        brand_creation: '✅ Working',
        evaluation_creation: '✅ Working', 
        dimension_scores: '✅ Working',
        final_evaluation_count: finalCount.rows?.[0]?.count || 0
      },
      test_data: {
        brand_id: brandResult.rows?.[0]?.id,
        evaluation_id: evalResult.rows?.[0]?.id,
        dimension_score_id: dimResult.rows?.[0]?.id
      }
    });

  } catch (error: any) {
    console.error('❌ MVP Persistence Test FAILED:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MVP Persistence Test FAILED',
      error: error.message,
      details: {
        database_connection: error.message.includes('connection') ? '❌ Failed' : '✅ Working',
        likely_cause: error.message.includes('normalized_host') ? 'Missing normalized_host column' : 
                     error.message.includes('schema') ? 'Schema targeting issue' :
                     error.message.includes('constraint') ? 'Constraint violation' : 'Unknown'
      }
    }, { status: 500 });
  }
}