import { NextRequest, NextResponse } from 'next/server';
import { blogManager } from '@/lib/cms/cms-client';
import { getServerSession } from 'next-auth/next';

// GET /api/cms/blog - Get all blog posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await blogManager.getPosts({
      status,
      category,
      featured,
      limit,
      offset
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Failed to get posts:', error);
    return NextResponse.json(
      { error: 'Failed to load posts' },
      { status: 500 }
    );
  }
}

// POST /api/cms/blog - Create new blog post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = (session.user as any).id || (session.user as any).email || 'system';
    const postId = await blogManager.createPost(body, userId);

    return NextResponse.json({ id: postId, success: true });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

