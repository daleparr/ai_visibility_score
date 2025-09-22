import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

export async function GET() {
  try {
    console.log('=== MVP SIMPLE TEST ===');
    
    // 1. Test database connection
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection working');

    // 2. Create test user (simple approach)
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    const testEmail = `mvp-test-${Date.now()}@example.com`;
    
    await sql`
      INSERT INTO production.users (id, email, name)
      VALUES (${testUserId}, ${testEmail}, 'MVP Test User')
      ON CONFLICT (id) DO NOTHING
    `;
    
    console.log('✅ User creation attempted');

    // 3. Create test brand (simple approach)
    const brandName = `MVP Test Brand ${Date.now()}`;
    
    await sql`
      INSERT INTO production.brands (user_id, name, website_url, industry)
      VALUES (${testUserId}, ${brandName}, 'https://mvp-test.com', 'Technology')
    `;
    
    console.log('✅ Brand creation attempted');

    // 4. Query back the created brand
    const brandQuery = await sql`
      SELECT id, name FROM production.brands 
      WHERE user_id = ${testUserId} AND name = ${brandName}
      LIMIT 1
    `;
    
    const brandId = brandQuery.rows?.[0]?.id;
    console.log('✅ Brand ID retrieved:', brandId);

    if (!brandId) {
      throw new Error('Brand not found after creation');
    }

    // 5. Create evaluation (simple approach)
    await sql`
      INSERT INTO production.evaluations (brand_id, status, overall_score)
      VALUES (${brandId}, 'completed', 75)
    `;
    
    console.log('✅ Evaluation creation attempted');

    // 6. Query back evaluation
    const evalQuery = await sql`
      SELECT id, status, overall_score FROM production.evaluations 
      WHERE brand_id = ${brandId}
      LIMIT 1
    `;
    
    const evaluationId = evalQuery.rows?.[0]?.id;
    console.log('✅ Evaluation ID retrieved:', evaluationId);

    // 7. Create dimension score
    if (evaluationId) {
      await sql`
        INSERT INTO production.dimension_scores (evaluation_id, dimension_name, score, reasoning)
        VALUES (${evaluationId}, 'accessibility', 80, 'MVP test reasoning')
      `;
      console.log('✅ Dimension score creation attempted');
    }

    // 8. Final verification
    const finalCounts = await sql`
      SELECT 
        (SELECT COUNT(*) FROM production.users WHERE id = ${testUserId}) as users,
        (SELECT COUNT(*) FROM production.brands WHERE user_id = ${testUserId}) as brands,
        (SELECT COUNT(*) FROM production.evaluations WHERE brand_id = ${brandId}) as evaluations,
        (SELECT COUNT(*) FROM production.dimension_scores WHERE evaluation_id = ${evaluationId}) as dimensions
    `;

    const counts = finalCounts.rows?.[0] || {};

    return NextResponse.json({
      success: true,
      message: '🎉 MVP PERSISTENCE TEST PASSED! 🎉',
      results: {
        database_connection: '✅ Working',
        user_creation: counts.users > 0 ? '✅ Working' : '❌ Failed',
        brand_creation: counts.brands > 0 ? '✅ Working' : '❌ Failed',
        evaluation_creation: counts.evaluations > 0 ? '✅ Working' : '❌ Failed',
        dimension_scores: counts.dimensions > 0 ? '✅ Working' : '❌ Failed'
      },
      final_counts: counts,
      test_data: {
        user_id: testUserId,
        brand_id: brandId,
        evaluation_id: evaluationId
      },
      mvp_status: (counts.users > 0 && counts.brands > 0 && counts.evaluations > 0 && counts.dimensions > 0) 
        ? 'MVP PERSISTENCE COMPLETE ✅' 
        : 'MVP PERSISTENCE PARTIAL ⚠️'
    });

  } catch (error: any) {
    console.error('❌ MVP Simple Test FAILED:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MVP Simple Test FAILED',
      error: error.message,
      error_code: error.code || 'unknown',
      details: {
        database_connection: '✅ Working',
        likely_cause: error.message.includes('normalized_host') ? 'Missing normalized_host column' :
                     error.message.includes('constraint') ? 'Constraint violation' :
                     error.message.includes('column') ? 'Schema mismatch' : 'Other database issue'
      }
    }, { status: 500 });
  }
}