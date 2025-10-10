import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  try {
    const correlationId = Math.random().toString(36).slice(2, 10);
    console.log(`[${correlationId}] Starting canary test`);
    
    // Dynamic import to avoid build-time initialization
    const { sql } = await import('@/lib/db');
    
    const evaluationId = crypto.randomUUID();
    const brandName = 'Canary Test Brand';
    const websiteUrl = 'https://canary-test.example.com';
    
    // TRANSACTIONAL FIX: User → Brand → Evaluation
    await sql`BEGIN`;
    try {
      // 1) Create or find a test user first
      let userResult = await sql`
        SELECT id FROM production.users 
        WHERE email = 'canary-test@example.com'
        LIMIT 1
      `;

      if (userResult.length === 0) {
        userResult = await sql`
          INSERT INTO production.users (id, email, name, email_verified)
          VALUES (gen_random_uuid(), 'canary-test@example.com', 'Canary Test User', now())
          RETURNING id
        `;
      }

      const userId = userResult[0].id;
      console.log(`[${correlationId}] Test user ready:`, userId);

      // 2) Upsert brand record (normalized_host dedupe)
      const brandResult = await sql`
        INSERT INTO production.brands (name, website_url, industry, user_id)
        VALUES (${brandName}, ${websiteUrl}, 'test', ${userId})
        ON CONFLICT (user_id, normalized_host)
        DO UPDATE SET
          name = EXCLUDED.name,
          website_url = EXCLUDED.website_url,
          industry = EXCLUDED.industry,
          updated_at = now()
        RETURNING id
      `;

      const brandId = brandResult[0].id;
      console.log(`[${correlationId}] Brand ready:`, brandId);

      // 3) Remove prior canary evaluations to keep state clean
      await sql`
        DELETE FROM production.evaluations
        WHERE brand_id = ${brandId}
      `;
      console.log(`[${correlationId}] Cleared prior canary evaluations`);

      // 4) Insert evaluation with valid brand_id
      const evalResult = await sql`
        INSERT INTO production.evaluations(
          id, brand_id, status, created_at, updated_at
        ) VALUES (
          ${evaluationId}, 
          ${brandId}, 
          'completed', 
          now(), 
          now()
        ) RETURNING id, status, created_at
      `;
      
      await sql`COMMIT`;
      console.log(`[${correlationId}] Evaluation inserted:`, evalResult[0]);
      
      return NextResponse.json({
        success: true,
        correlationId,
        brandId,
        evaluation: evalResult[0],
        message: 'Canary test passed - transactional user→brand→evaluation works'
      });
      
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
    
  } catch (error) {
    console.error('Canary test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Canary test failed - database writes not working'
    }, { status: 500 });
  }
}
