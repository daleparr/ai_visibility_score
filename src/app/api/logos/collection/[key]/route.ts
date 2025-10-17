import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/logos/collection/[key] - Get logos for a collection (public endpoint)
export async function GET(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const collectionKey = params.key;

    // Get collection with its active logos
    const result = await db.execute(
      sql`
        SELECT 
          c.collection_name,
          c.max_logos_shown,
          c.randomize_order,
          COALESCE(
            json_agg(
              json_build_object(
                'logo_id', l.id,
                'logo_name', l.logo_name,
                'file_url', l.file_url,
                'alt_text', l.alt_text,
                'display_order', lcm.display_order
              ) ORDER BY lcm.display_order
            ) FILTER (WHERE l.id IS NOT NULL),
            '[]'
          ) as logos
        FROM logo_collections c
        LEFT JOIN logo_collection_mapping lcm ON lcm.collection_id = c.id
        LEFT JOIN client_logos l ON l.id = lcm.logo_id AND l.is_active = true
        WHERE c.collection_key = ${collectionKey} AND c.is_active = true
        GROUP BY c.id
      `
    );

    if (!result.rows[0]) {
      return NextResponse.json({ logos: [] });
    }

    const collection = result.rows[0];
    let logos = JSON.parse(collection.logos || '[]');

    // Limit to max shown
    logos = logos.slice(0, collection.max_logos_shown);

    // Randomize if configured
    if (collection.randomize_order && logos.length > 0) {
      logos = logos.sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({ 
      logos,
      collection_name: collection.collection_name
    });
  } catch (error) {
    console.error('Failed to get logo collection:', error);
    return NextResponse.json({ logos: [] });
  }
}

