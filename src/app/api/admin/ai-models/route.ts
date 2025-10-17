import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/ai-models - Get all AI model configurations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`
        SELECT * FROM ai_model_configurations
        ORDER BY model_provider, estimated_cost_per_evaluation DESC
      `
    );

    return NextResponse.json({ models: result.rows });
  } catch (error) {
    console.error('Failed to get AI models:', error);
    return NextResponse.json(
      { error: 'Failed to load AI models' },
      { status: 500 }
    );
  }
}

