import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/ai-models - Get AI model logos based on user tier
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get('tier') || 'free';

    // Get AI models with tier-specific display rules
    const result = await db.execute(
      sql`
        SELECT 
          l.logo_slug,
          l.logo_name,
          l.file_url,
          l.width,
          l.height,
          l.alt_text,
          COALESCE(t.is_displayed, false) as is_displayed,
          t.model_version,
          t.badge_text,
          COALESCE(t.display_order, l.display_order) as display_order
        FROM client_logos l
        LEFT JOIN ai_model_tier_display t ON t.model_slug = l.logo_slug AND t.tier_key = ${tier}
        WHERE l.category = 'ai_model' AND l.is_active = true
        ORDER BY display_order
      `
    );

    return NextResponse.json({ 
      models: result.rows,
      tier: tier,
      total_models: result.rows.length,
      displayed_count: result.rows.filter((m: any) => m.is_displayed).length
    });
  } catch (error) {
    console.error('Failed to get AI models:', error);
    return NextResponse.json(
      { error: 'Failed to load AI models' },
      { status: 500 }
    );
  }
}

