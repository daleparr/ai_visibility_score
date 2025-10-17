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
    console.log('[CMS Save] Starting update for block:', params.id);
    
    const session = await getServerSession();
    console.log('[CMS Save] Session check:', session?.user ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user) {
      console.error('[CMS Save] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[CMS Save] Request body received:', { 
      hasContent: !!body.content, 
      isVisible: body.is_visible,
      contentType: typeof body.content 
    });
    
    const { content, is_visible } = body;
    const blockId = params.id;
    const userId = (session.user as any).id || (session.user as any).email || 'system';

    // Validate content
    if (!content) {
      console.error('[CMS Save] Validation failed: No content');
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log('[CMS Save] Preparing update - blockId:', blockId, 'userId:', userId);
    
    // First, check if block exists
    const checkResult = await db.execute(
      sql`SELECT id, block_key FROM content_blocks WHERE id = ${blockId}`
    );
    
    if (!checkResult.rows[0]) {
      console.error('[CMS Save] Block not found:', blockId);
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }
    
    console.log('[CMS Save] Block exists:', checkResult.rows[0]);

    // Try the update
    console.log('[CMS Save] Executing UPDATE query...');
    const updateResult = await db.execute(
      sql`
        UPDATE content_blocks
        SET content = ${JSON.stringify(content)}::jsonb,
            is_visible = ${is_visible !== undefined ? is_visible : true},
            updated_by = ${userId},
            updated_at = NOW()
        WHERE id = ${blockId}
      `
    );

    console.log('[CMS Save] Update executed successfully. Result:', updateResult);
    console.log('[CMS Save] ✅ SUCCESS for block:', blockId);

    return NextResponse.json({ 
      success: true, 
      updated: true,
      blockId: blockId,
      debug: 'Update completed successfully'
    });
  } catch (error) {
    console.error('[CMS Save] ❌ EXCEPTION CAUGHT:');
    console.error('[CMS Save] Error type:', error?.constructor?.name);
    console.error('[CMS Save] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[CMS Save] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[CMS Save] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return NextResponse.json(
      { 
        error: 'Failed to update content block', 
        details: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name,
        blockId: params.id
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

