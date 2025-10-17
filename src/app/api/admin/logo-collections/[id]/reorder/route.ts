import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST /api/admin/logo-collections/[id]/reorder - Reorder logos in collection
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
    const logos = body.logos; // Array of {mapping_id, display_order}

    // Update each mapping's display order
    for (const logo of logos) {
      await db.execute(
        sql`
          UPDATE logo_collection_mapping
          SET display_order = ${logo.display_order}
          WHERE id = ${logo.mapping_id}
        `
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder logos:', error);
    return NextResponse.json(
      { error: 'Failed to reorder logos' },
      { status: 500 }
    );
  }
}

