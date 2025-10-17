import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST /api/admin/tiers/[id]/features - Toggle feature for tier
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const tierId = params.id;

    await db.execute(
      sql`
        INSERT INTO tier_feature_mapping (tier_id, feature_id, is_included)
        VALUES (${tierId}, ${body.feature_id}, ${body.is_included})
        ON CONFLICT (tier_id, feature_id) DO UPDATE
        SET is_included = ${body.is_included}, display_order = EXCLUDED.display_order
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to toggle feature:', error);
    return NextResponse.json(
      { error: 'Failed to toggle feature' },
      { status: 500 }
    );
  }
}

