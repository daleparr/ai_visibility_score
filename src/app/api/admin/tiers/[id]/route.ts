import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// PATCH /api/admin/tiers/[id] - Update tier (toggle active, etc.)
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
    const tierId = params.id;

    console.log('[Tier Toggle] Updating tier:', tierId, 'with:', body);

    // Use sql template literal (format that works)
    if (body.is_active !== undefined) {
      await db.execute(
        sql`
          UPDATE pricing_tiers
          SET is_active = ${body.is_active},
              updated_at = NOW()
          WHERE id = ${tierId}
        `
      );
    }
    
    if (body.is_visible_public !== undefined) {
      await db.execute(
        sql`
          UPDATE pricing_tiers
          SET is_visible_public = ${body.is_visible_public},
              updated_at = NOW()
          WHERE id = ${tierId}
        `
      );
    }

    console.log('[Tier Toggle] ✅ Update successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tier:', error);
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    );
  }
}

