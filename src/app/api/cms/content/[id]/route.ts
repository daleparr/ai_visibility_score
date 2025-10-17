import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
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

    console.log('Updating block:', blockId, 'with content:', content);

    // Validate content
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Update using parameterized query for better compatibility
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

    console.log('Block updated successfully:', blockId);

    return NextResponse.json({ success: true, updated: true });
  } catch (error) {
    console.error('Failed to update content block:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      blockId: params.id,
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to update content block', 
        details: error instanceof Error ? error.message : String(error)
      },
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

