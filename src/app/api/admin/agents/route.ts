import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/agents - Get all agent configurations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`
        SELECT * FROM agent_configurations
        ORDER BY execution_order
      `
    );

    return NextResponse.json({ agents: result.rows });
  } catch (error) {
    console.error('Failed to get agents:', error);
    return NextResponse.json(
      { error: 'Failed to load agents' },
      { status: 500 }
    );
  }
}

