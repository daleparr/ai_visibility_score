import { NextRequest, NextResponse} from 'next/server';
import { jobManager } from '@/lib/cms/cms-client';
import { getServerSession } from 'next-auth/next';

// GET /api/cms/jobs - Get all job postings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as any;
    const department = searchParams.get('department') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const jobs = await jobManager.getJobs({ status, department, limit });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to get jobs:', error);
    return NextResponse.json(
      { error: 'Failed to load jobs' },
      { status: 500 }
    );
  }
}

// POST /api/cms/jobs - Create new job posting
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const jobId = await jobManager.createJob(body);

    return NextResponse.json({ id: jobId, success: true });
  } catch (error) {
    console.error('Failed to create job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

