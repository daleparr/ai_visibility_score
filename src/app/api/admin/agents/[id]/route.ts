import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

    console.log('[Agent Toggle] Updating agent:', agentId, 'with:', body);

    // Use sql template literal (format that works)
    if (body.is_active !== undefined) {
      await db.execute(
        sql`
          UPDATE agent_configurations
          SET is_active = ${body.is_active},
              updated_at = NOW()
          WHERE id = ${agentId}
        `
      );
    }
    
    if (body.primary_model_key !== undefined) {
      await db.execute(
        sql`
          UPDATE agent_configurations
          SET primary_model_key = ${body.primary_model_key},
              updated_at = NOW()
          WHERE id = ${agentId}
        `
      );
    }

    console.log('[Agent Toggle] ✅ Update successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

