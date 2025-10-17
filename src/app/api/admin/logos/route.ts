import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/logos - Get all client logos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.execute(
      sql`
        SELECT * FROM client_logos
        ORDER BY display_order, logo_name
      `
    );

    return NextResponse.json({ logos: result.rows });
  } catch (error) {
    console.error('Failed to get logos:', error);
    return NextResponse.json(
      { error: 'Failed to load logos' },
      { status: 500 }
    );
  }
}

// POST /api/admin/logos - Create new logo entry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id || (session.user as any).email;

    const result = await db.execute(
      sql`
        INSERT INTO client_logos (
          logo_name, logo_slug, file_url, file_type, file_size,
          width, height, alt_text, category, company_url,
          is_active, display_order, created_by
        )
        VALUES (
          ${body.logo_name}, ${body.logo_slug}, ${body.file_url},
          ${body.file_type}, ${body.file_size || 0},
          ${body.width || 200}, ${body.height || 80},
          ${body.alt_text}, ${body.category || 'client'},
          ${body.company_url || null}, ${body.is_active !== false},
          ${body.display_order || 999}, ${userId}
        )
        RETURNING id
      `
    );

    return NextResponse.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    console.error('Failed to create logo:', error);
    return NextResponse.json(
      { error: 'Failed to create logo' },
      { status: 500 }
    );
  }
}

