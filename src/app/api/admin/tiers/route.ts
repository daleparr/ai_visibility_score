import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/tiers - Get all pricing tiers with features
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all tiers with their features
    const result = await db.execute(
      sql`
        SELECT 
          t.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'feature_key', f.feature_key,
                'feature_name', f.feature_name,
                'feature_category', f.feature_category,
                'is_included', tfm.is_included,
                'feature_limit', tfm.feature_limit
              ) ORDER BY tfm.display_order
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'
          ) as features
        FROM pricing_tiers t
        LEFT JOIN tier_feature_mapping tfm ON tfm.tier_id = t.id
        LEFT JOIN tier_features f ON f.id = tfm.feature_id
        GROUP BY t.id
        ORDER BY t.display_order, t.tier_name
      `
    );

    return NextResponse.json({ tiers: result.rows });
  } catch (error) {
    console.error('Failed to get tiers:', error);
    return NextResponse.json(
      { error: 'Failed to load tiers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tiers - Create new pricing tier
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id || (session.user as any).email;

    // Create tier
    const result = await db.execute(
      sql`
        INSERT INTO pricing_tiers (
          tier_key, tier_name, tier_type, price_amount, price_currency,
          billing_period, is_active, is_visible_public, is_custom,
          custom_for_user_id, badge_text, description, created_by, display_order
        )
        VALUES (
          ${body.tier_key}, ${body.tier_name}, ${body.tier_type || 'standard'},
          ${body.price_amount}, ${body.price_currency || 'GBP'},
          ${body.billing_period}, ${body.is_active !== false}, ${body.is_visible_public !== false},
          ${body.is_custom || false}, ${body.custom_for_user_id || null},
          ${body.badge_text || null}, ${body.description || null}, ${userId},
          ${body.display_order || 999}
        )
        RETURNING id
      `
    );

    const tierId = result.rows[0].id;

    // Add features to tier
    if (body.features && Array.isArray(body.features)) {
      for (let i = 0; i < body.features.length; i++) {
        const featureId = body.features[i];
        await db.execute(
          sql`
            INSERT INTO tier_feature_mapping (tier_id, feature_id, is_included, display_order)
            VALUES (${tierId}, ${featureId}, true, ${i})
            ON CONFLICT (tier_id, feature_id) DO UPDATE
            SET is_included = true, display_order = ${i}
          `
        );
      }
    }

    return NextResponse.json({ id: tierId, success: true });
  } catch (error) {
    console.error('Failed to create tier:', error);
    return NextResponse.json(
      { error: 'Failed to create tier' },
      { status: 500 }
    );
  }
}

