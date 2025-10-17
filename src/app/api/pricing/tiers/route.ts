import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/pricing/tiers - Get pricing tiers (respects auth status and visibility)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const isAuthenticated = !!session?.user;
    const userId = (session?.user as any)?.id;

    // Build query based on user authentication
    let query;
    
    if (!isAuthenticated) {
      // Anonymous users: Only public tiers that don't require auth
      query = sql`
        SELECT 
          t.*,
          COALESCE(
            json_agg(
              json_build_object(
                'feature_key', f.feature_key,
                'feature_name', f.feature_name,
                'feature_category', f.feature_category,
                'feature_limit', tfm.feature_limit
              ) ORDER BY tfm.display_order
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'
          ) as features
        FROM pricing_tiers t
        LEFT JOIN tier_feature_mapping tfm ON tfm.tier_id = t.id AND tfm.is_included = true
        LEFT JOIN tier_features f ON f.id = tfm.feature_id
        WHERE t.is_active = true 
          AND t.is_visible_public = true
          AND (t.requires_auth = false OR t.requires_auth IS NULL)
          AND (t.access_level = 'public' OR t.access_level IS NULL)
        GROUP BY t.id
        ORDER BY t.display_order, t.price_amount
      `;
    } else {
      // Authenticated users: Public + authenticated tiers + custom tiers for this user
      query = sql`
        SELECT 
          t.*,
          COALESCE(
            json_agg(
              json_build_object(
                'feature_key', f.feature_key,
                'feature_name', f.feature_name,
                'feature_category', f.feature_category,
                'feature_limit', tfm.feature_limit
              ) ORDER BY tfm.display_order
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'
          ) as features
        FROM pricing_tiers t
        LEFT JOIN tier_feature_mapping tfm ON tfm.tier_id = t.id AND tfm.is_included = true
        LEFT JOIN tier_features f ON f.id = tfm.feature_id
        WHERE t.is_active = true
          AND (
            (t.is_visible_public = true) OR
            (t.access_level IN ('authenticated', 'paid_only')) OR
            (t.is_custom = true AND t.custom_for_user_id = ${userId})
          )
        GROUP BY t.id
        ORDER BY t.display_order, t.price_amount
      `;
    }

    const result = await db.execute(query);

    return NextResponse.json({ 
      tiers: result.rows,
      user_authenticated: isAuthenticated,
      total_tiers: result.rows.length
    });
  } catch (error) {
    console.error('Failed to get pricing tiers:', error);
    return NextResponse.json(
      { error: 'Failed to load pricing tiers' },
      { status: 500 }
    );
  }
}

