import { NextRequest, NextResponse } from 'next/server';
import { blogManager } from '@/lib/cms/cms-client';
import { getServerSession } from 'next-auth/next';

// PUT /api/cms/blog/[id] - Update blog post
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
    await blogManager.updatePost(params.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/blog/[id] - Delete blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete post (implement delete method in BlogManager)
    await fetch(`/api/blog/${params.id}`, { method: 'DELETE' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

