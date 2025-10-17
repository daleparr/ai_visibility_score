import { NextRequest, NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/cms-client';
import { getServerSession } from 'next-auth/next';

// GET /api/cms/content?page=homepage - Get content blocks for a page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageSlug = searchParams.get('page');

    if (!pageSlug) {
      return NextResponse.json(
        { error: 'Page slug is required' },
        { status: 400 }
      );
    }

    const page = await contentManager.getPage(pageSlug);
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // For admin, get ALL blocks including hidden ones
    const blocks = await contentManager.getAllBlocksForPage(pageSlug);

    return NextResponse.json({ page, blocks });
  } catch (error) {
    console.error('Failed to get content:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

// PUT /api/cms/content/[blockId] - Update a content block
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pageSlug, blockKey, content } = body;
    const userId = (session.user as any).id || (session.user as any).email || 'system';

    await contentManager.updateBlock(pageSlug, blockKey, content, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// POST /api/cms/content - Create new content block
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pageSlug, blockKey, blockType, content } = body;
    const userId = (session.user as any).id || (session.user as any).email || 'system';

    await contentManager.createBlock(
      pageSlug,
      blockKey,
      blockType,
      content,
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

