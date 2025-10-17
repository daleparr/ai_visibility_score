import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// PATCH /api/admin/sectors/[id] - Update sector availability and pricing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const sectorId = params.id;

    console.log('[Sector Toggle] Updating sector:', sectorId, 'with:', body);

    // Use sql template literal (format that works)
    if (body.is_available !== undefined) {
      await db.execute(
        sql`
          UPDATE industry_report_sectors
          SET is_available = ${body.is_available},
              updated_at = NOW()
          WHERE id = ${sectorId}
        `
      );
    }
    
    if (body.monthly_price !== undefined) {
      await db.execute(
        sql`
          UPDATE industry_report_sectors
          SET monthly_price = ${body.monthly_price},
              annual_price = ${body.annual_price || body.monthly_price * 10},
              updated_at = NOW()
          WHERE id = ${sectorId}
        `
      );
    }
    
    if (body.badge_text !== undefined) {
      await db.execute(
        sql`
          UPDATE industry_report_sectors
          SET badge_text = ${body.badge_text || null},
              updated_at = NOW()
          WHERE id = ${sectorId}
        `
      );
    }
    
    if (body.demo_cta_text !== undefined) {
      await db.execute(
        sql`
          UPDATE industry_report_sectors
          SET demo_cta_text = ${body.demo_cta_text},
              updated_at = NOW()
          WHERE id = ${sectorId}
        `
      );
    }

    console.log('[Sector Toggle] ✅ Update successful');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update sector:', error);
    return NextResponse.json(
      { error: 'Failed to update sector' },
      { status: 500 }
    );
  }
}

