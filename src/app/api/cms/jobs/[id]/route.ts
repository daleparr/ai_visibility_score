import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { jobManager } from '@/lib/cms/cms-client';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/cms/jobs/[id] - Get single job posting by slug or ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // The 'id' parameter is actually a slug from the URL (e.g., /careers/ai-discoverability-analyst)
    const job = await jobManager.getJob(params.id);

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

// PUT /api/cms/jobs/[id] - Update job posting
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
    const { id } = params;

    await db.execute(
      sql`
        UPDATE job_postings
        SET 
          title = ${body.title},
          department = ${body.department},
          location = ${body.location},
          employment_type = ${body.employment_type},
          experience_level = ${body.experience_level},
          salary_range = ${body.salary_range || ''},
          description = ${body.description},
          requirements = ${body.requirements || []},
          nice_to_have = ${body.nice_to_have || []},
          status = ${body.status},
          apply_url = ${body.apply_url || ''},
          apply_email = ${body.apply_email || ''},
          updated_at = NOW()
        WHERE id = ${id}
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/cms/jobs/[id] - Delete job posting
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.execute(
      sql`DELETE FROM job_postings WHERE id = ${params.id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

