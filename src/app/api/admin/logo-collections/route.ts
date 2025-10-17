import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/logo-collections - Get all logo collections with their logos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get collections with their mapped logos
    const result = await db.execute(
      sql`
        SELECT 
          c.*,
          COALESCE(
            json_agg(
              json_build_object(
                'mapping_id', lcm.id,
                'logo_id', l.id,
                'logo_name', l.logo_name,
                'file_url', l.file_url,
                'display_order', lcm.display_order
              ) ORDER BY lcm.display_order
            ) FILTER (WHERE l.id IS NOT NULL),
            '[]'
          ) as logos
        FROM logo_collections c
        LEFT JOIN logo_collection_mapping lcm ON lcm.collection_id = c.id
        LEFT JOIN client_logos l ON l.id = lcm.logo_id AND l.is_active = true
        GROUP BY c.id
        ORDER BY c.id
      `
    );

    return NextResponse.json({ collections: result.rows });
  } catch (error) {
    console.error('Failed to get logo collections:', error);
    return NextResponse.json(
      { error: 'Failed to load logo collections' },
      { status: 500 }
    );
  }
}

