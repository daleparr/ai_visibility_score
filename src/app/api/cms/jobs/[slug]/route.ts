import { NextRequest, NextResponse } from 'next/server';
import { jobManager } from '@/lib/cms/cms-client';

// GET /api/cms/jobs/[slug] - Get single job posting by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const job = await jobManager.getJob(params.slug);

    if (!job) {
      return NextResponse.json(
        { error: 'Job posting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Failed to get job:', error);
    return NextResponse.json(
      { error: 'Failed to load job posting' },
      { status: 500 }
    );
  }
}

