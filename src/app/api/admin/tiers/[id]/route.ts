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

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (body.is_active !== undefined) {
      updates.push(`is_active = $${valueIndex++}`);
      values.push(body.is_active);
    }
    if (body.is_visible_public !== undefined) {
      updates.push(`is_visible_public = $${valueIndex++}`);
      values.push(body.is_visible_public);
    }
    if (body.badge_text !== undefined) {
      updates.push(`badge_text = $${valueIndex++}`);
      values.push(body.badge_text);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(tierId);

    await db.execute({
      sql: `UPDATE pricing_tiers SET ${updates.join(', ')} WHERE id = $${valueIndex}`,
      args: values
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tier:', error);
    return NextResponse.json(
      { error: 'Failed to update tier' },
      { status: 500 }
    );
  }
}

