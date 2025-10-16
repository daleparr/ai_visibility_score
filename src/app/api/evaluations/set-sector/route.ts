// API: Save sector and competitor information for an evaluation

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveCompetitors } from '@/lib/industry-reports/competitor-matcher';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { evaluationId, sectorId, competitors, brandDomain } = body;

    if (!evaluationId || !sectorId) {
      return NextResponse.json(
        { success: false, error: 'evaluationId and sectorId are required' },
        { status: 400 }
      );
    }

    // Update evaluation with sector info
    await db.execute(sql`
      UPDATE evaluations
      SET industry_sector_id = ${sectorId},
          primary_competitors = ${JSON.stringify(competitors || [])},
          sector_confirmed_at = now()
      WHERE id = ${evaluationId}
        AND user_id = ${session.user.id}
    `);

    // Save competitor relationships if provided
    if (brandDomain && competitors && competitors.length > 0) {
      await saveCompetitors(
        session.user.id,
        brandDomain,
        sectorId,
        competitors
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sector and competitors saved',
    });
  } catch (error) {
    console.error('Error saving sector and competitors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save sector information' },
      { status: 500 }
    );
  }
}

// GET: Retrieve sector and competitor info for an evaluation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const evaluationId = searchParams.get('evaluationId');

    if (!evaluationId) {
      return NextResponse.json(
        { success: false, error: 'evaluationId is required' },
        { status: 400 }
      );
    }

    const result = await db.execute(sql`
      SELECT 
        e.industry_sector_id,
        e.primary_competitors,
        e.sector_confirmed_at,
        s.name as sector_name,
        s.slug as sector_slug
      FROM evaluations e
      LEFT JOIN industry_sectors s ON e.industry_sector_id = s.id
      WHERE e.id = ${evaluationId}
        AND e.user_id = ${session.user.id}
      LIMIT 1
    `);

    const data = result.rows[0];

    return NextResponse.json({
      success: true,
      sectorId: data?.industry_sector_id,
      sectorName: data?.sector_name,
      sectorSlug: data?.sector_slug,
      competitors: data?.primary_competitors || [],
      confirmedAt: data?.sector_confirmed_at,
    });
  } catch (error) {
    console.error('Error fetching sector info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sector information' },
      { status: 500 }
    );
  }
}

