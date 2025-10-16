import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

