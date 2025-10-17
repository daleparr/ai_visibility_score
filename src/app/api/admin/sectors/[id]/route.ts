import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

// PATCH /api/admin/sectors/[id] - Update sector availability and pricing
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
    const sectorId = params.id;

    // Build dynamic update
    const updates: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (body.is_available !== undefined) {
      updates.push(`is_available = $${valueIndex++}`);
      values.push(body.is_available);
    }
    if (body.has_content !== undefined) {
      updates.push(`has_content = $${valueIndex++}`);
      values.push(body.has_content);
    }
    if (body.monthly_price !== undefined) {
      updates.push(`monthly_price = $${valueIndex++}`);
      values.push(body.monthly_price);
    }
    if (body.annual_price !== undefined) {
      updates.push(`annual_price = $${valueIndex++}`);
      values.push(body.annual_price);
    }
    if (body.badge_text !== undefined) {
      updates.push(`badge_text = $${valueIndex++}`);
      values.push(body.badge_text || null);
    }
    if (body.demo_cta_text !== undefined) {
      updates.push(`demo_cta_text = $${valueIndex++}`);
      values.push(body.demo_cta_text);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(sectorId);

    await db.execute({
      sql: `UPDATE industry_report_sectors SET ${updates.join(', ')} WHERE id = $${valueIndex}`,
      args: values
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update sector:', error);
    return NextResponse.json(
      { error: 'Failed to update sector' },
      { status: 500 }
    );
  }
}

