import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST /api/admin/logo-collections/[id]/logos - Add logo to collection
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
    const collectionId = params.id;

    // Get current max order
    const maxOrderResult = await db.execute(
      sql`
        SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
        FROM logo_collection_mapping
        WHERE collection_id = ${collectionId}
      `
    );
    
    const nextOrder = maxOrderResult.rows[0].next_order;

    // Add logo to collection
    await db.execute(
      sql`
        INSERT INTO logo_collection_mapping (collection_id, logo_id, display_order)
        VALUES (${collectionId}, ${body.logo_id}, ${nextOrder})
        ON CONFLICT (collection_id, logo_id) DO NOTHING
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to add logo to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add logo' },
      { status: 500 }
    );
  }
}

