import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// PATCH /api/admin/logos/[id] - Update logo (toggle active, etc.)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const logoId = params.id;

    await db.execute(
      sql`
        UPDATE client_logos
        SET is_active = ${body.is_active},
            updated_at = NOW()
        WHERE id = ${logoId}
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update logo:', error);
    return NextResponse.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/logos/[id] - Delete logo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.execute(
      sql`DELETE FROM client_logos WHERE id = ${params.id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}

