import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/features - Get all tier features
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`
        SELECT * FROM tier_features
        ORDER BY feature_category, feature_name
      `
    );

    return NextResponse.json({ features: result.rows });
  } catch (error) {
    console.error('Failed to get features:', error);
    return NextResponse.json(
      { error: 'Failed to load features' },
      { status: 500 }
    );
  }
}

// POST /api/admin/features - Create new feature
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const result = await db.execute(
      sql`
        INSERT INTO tier_features (
          feature_key, feature_name, feature_category, description, is_premium
        )
        VALUES (
          ${body.feature_key}, ${body.feature_name}, ${body.feature_category},
          ${body.description || null}, ${body.is_premium || false}
        )
        RETURNING id
      `
    );

    return NextResponse.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    console.error('Failed to create feature:', error);
    return NextResponse.json(
      { error: 'Failed to create feature' },
      { status: 500 }
    );
  }
}

