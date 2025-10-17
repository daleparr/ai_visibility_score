import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

// PUT /api/cms/content/[id] - Update a content block by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content, is_visible } = body;
    const blockId = params.id;
    const userId = (session.user as any).id || (session.user as any).email || 'system';

    // Update the content block using raw query
    const contentJson = JSON.stringify(content);
    const visibleValue = is_visible !== undefined ? is_visible : true;
    
    await db.execute({
      sql: `UPDATE content_blocks
            SET content = $1::jsonb,
                is_visible = $2,
                updated_by = $3,
                updated_at = NOW()
            WHERE id = $4`,
      args: [contentJson, visibleValue, userId, blockId]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update content block:', error);
    return NextResponse.json(
      { error: 'Failed to update content block', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/cms/content/[id] - Get a single content block by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blockId = params.id;

    const result = await db.execute(
      sql`SELECT * FROM content_blocks WHERE id = ${blockId}`
    );

    if (!result.rows[0]) {
      return NextResponse.json(
        { error: 'Content block not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ block: result.rows[0] });
  } catch (error) {
    console.error('Failed to get content block:', error);
    return NextResponse.json(
      { error: 'Failed to load content block' },
      { status: 500 }
    );
  }
}

