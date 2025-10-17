import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// POST /api/admin/users/[id]/roles - Assign role to user
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = params.id;
    const assignedBy = (session.user as any).id || (session.user as any).email;

    await db.execute(
      sql`
        INSERT INTO user_role_assignments (user_id, role_id, assigned_by, expires_at)
        VALUES (${userId}, ${body.role_id}, ${assignedBy}, ${body.expires_at || null})
        ON CONFLICT (user_id, role_id) DO UPDATE
        SET assigned_at = NOW(), expires_at = ${body.expires_at || null}
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to assign role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/roles/[roleId] - Remove role from user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('roleId');

    await db.execute(
      sql`
        DELETE FROM user_role_assignments
        WHERE user_id = ${userId} AND role_id = ${roleId}
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}

