import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/users - Get all users with roles and profiles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get users with their roles and profiles
    const result = await db.execute(
      sql`
        SELECT 
          u.id,
          u.email,
          u.name,
          u.image,
          u.created_at,
          u.updated_at,
          up.full_name,
          up.company_name,
          up.job_title,
          up.phone,
          COALESCE(
            json_agg(
              json_build_object(
                'id', ura.id,
                'role_id', r.id,
                'role_key', r.role_key,
                'role_name', r.role_name,
                'assigned_at', ura.assigned_at,
                'expires_at', ura.expires_at
              ) ORDER BY ura.assigned_at DESC
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) as roles
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN user_role_assignments ura ON ura.user_id = u.id
        LEFT JOIN user_roles r ON r.id = ura.role_id
        GROUP BY u.id, up.full_name, up.company_name, up.job_title, up.phone
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Failed to get users:', error);
    return NextResponse.json(
      { error: 'Failed to load users' },
      { status: 500 }
    );
  }
}

