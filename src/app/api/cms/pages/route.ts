import { NextRequest, NextResponse } from 'next/server';
import { contentManager } from '@/lib/cms/cms-client';

// GET /api/cms/pages - Get all CMS pages
export async function GET(req: NextRequest) {
  try {
    const pages = await contentManager.getAllPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Failed to get pages:', error);
    return NextResponse.json(
      { error: 'Failed to load pages' },
      { status: 500 }
    );
  }
}

