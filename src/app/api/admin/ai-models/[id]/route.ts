import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';

// PATCH /api/admin/ai-models/[id] - Toggle model active status
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
    const modelId = params.id;

    await db.execute({
      sql: `UPDATE ai_model_configurations
            SET is_active = $1,
                updated_at = NOW()
            WHERE id = $2`,
      args: [body.is_active, modelId]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update model:', error);
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}

