import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

// PATCH /api/admin/agents/[id] - Update agent configuration
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
    const agentId = params.id;

    const updates: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (body.is_active !== undefined) {
      updates.push(`is_active = $${valueIndex++}`);
      values.push(body.is_active);
    }
    if (body.primary_model_key !== undefined) {
      updates.push(`primary_model_key = $${valueIndex++}`);
      values.push(body.primary_model_key);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);
    values.push(agentId);

    await db.execute({
      sql: `UPDATE agent_configurations SET ${updates.join(', ')} WHERE id = $${valueIndex}`,
      args: values
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

