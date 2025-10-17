import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/roles - Get all user roles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`SELECT * FROM user_roles ORDER BY role_name`
    );

    return NextResponse.json({ roles: result.rows });
  } catch (error) {
    console.error('Failed to get roles:', error);
    return NextResponse.json(
      { error: 'Failed to load roles' },
      { status: 500 }
    );
  }
}

