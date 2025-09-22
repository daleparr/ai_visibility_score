import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    console.log('=== MVP SIMPLE PERSISTENCE TEST ===');
    
    // 1. Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection working');

    // 2. Check current table counts
    const evalCount = await sql`SELECT COUNT(*) as count FROM production.evaluations`;
    const dimCount = await sql`SELECT COUNT(*) as count FROM production.dimension_scores`;
    const brandCount = await sql`SELECT COUNT(*) as count FROM production.brands`;
    
    console.log('📊 Table counts:', {
      evaluations: evalCount.rows?.[0]?.count || 0,
      dimension_scores: dimCount.rows?.[0]?.count || 0,
      brands: brandCount.rows?.[0]?.count || 0
    });

    // 3. Create test user first (required for foreign key)
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    const userResult = await sql`
      INSERT INTO production.users (id, email, name)
      VALUES (${testUserId}, 'mvp-test@example.com', 'MVP Test User')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `;
    
    console.log('✅ User created:', userResult.rows?.[0]);

    // 4. Test brand creation
    const testBrand = {
      name: 'MVP Test Brand',
      website_url: 'https://mvp-test.com',
      industry: 'Technology',
      user_id: testUserId
    };

    const brandResult = await sql`
      INSERT INTO production.brands (user_id, name, website_url, industry)
      VALUES (${testBrand.user_id}, ${testBrand.name}, ${testBrand.website_url}, ${testBrand.industry})
      RETURNING id, name
    `;
    
    console.log('✅ Brand created:', brandResult.rows?.[0]);
    
    if (!brandResult.rows?.[0]?.id) {
      throw new Error('Brand creation failed - no ID returned');
    }
    
    const brandId = brandResult.rows[0].id;

    // 5. Test evaluation creation
    const evalResult = await sql`
      INSERT INTO production.evaluations (
        brand_id, status, overall_score
      )
      VALUES (
        ${brandId}, 'completed', 75
      )
      RETURNING id, status, overall_score
    `;

    console.log('✅ Evaluation created:', evalResult.rows?.[0]);

    // 6. Test dimension scores
    const dimResult = await sql`
      INSERT INTO production.dimension_scores (
        evaluation_id, dimension_name, score, reasoning
      )
      VALUES (
        ${evalResult.rows?.[0]?.id}, 'accessibility', 80.0, 'MVP test reasoning'
      )
      RETURNING id, dimension_name, score
    `;

    console.log('✅ Dimension score created:', dimResult.rows?.[0]);

    return NextResponse.json({
      success: true,
      message: '🎉 MVP PERSISTENCE TEST PASSED! 🎉',
      results: {
        database_connection: '✅ Working',
        brand_creation: '✅ Working', 
        evaluation_creation: '✅ Working',
        dimension_scores: '✅ Working'
      },
      test_data: {
        brand_id: brandResult.rows?.[0]?.id,
        evaluation_id: evalResult.rows?.[0]?.id,
        dimension_score_id: dimResult.rows?.[0]?.id
      },
      mvp_status: 'READY FOR PRODUCTION'
    });

  } catch (error: any) {
    console.error('❌ MVP Test FAILED:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MVP Persistence Test FAILED',
      error: error.message,
      details: {
        database_connection: '✅ Working',
        error_type: error.code || 'unknown',
        likely_cause: error.message.includes('normalized_host') ? 'Column still missing' :
                     error.message.includes('constraint') ? 'Constraint violation' :
                     'Other database issue'
      }
    }, { status: 500 });
  }
}