import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/sectors - Get all sectors with bundles (admin view)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [sectorsResult, bundlesResult] = await Promise.all([
      db.execute(
        sql`SELECT * FROM industry_report_sectors ORDER BY display_order, sector_name`
      ),
      db.execute(
        sql`SELECT * FROM industry_report_bundles ORDER BY display_order`
      )
    ]);

    return NextResponse.json({ 
      sectors: sectorsResult.rows,
      bundles: bundlesResult.rows
    });
  } catch (error) {
    console.error('Failed to get sectors:', error);
    return NextResponse.json(
      { error: 'Failed to load sectors' },
      { status: 500 }
    );
  }
}

