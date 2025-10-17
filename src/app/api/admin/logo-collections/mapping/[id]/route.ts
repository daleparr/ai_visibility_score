import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// DELETE /api/admin/logo-collections/mapping/[id] - Remove logo from collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mappingId = params.id;

    await db.execute(
      sql`DELETE FROM logo_collection_mapping WHERE id = ${mappingId}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove logo from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove logo' },
      { status: 500 }
    );
  }
}

