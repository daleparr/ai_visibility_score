import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/pricing/sectors - Get industry report sector pricing
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const isAuthenticated = !!session?.user;

    // Get all sectors with availability status
    const result = await db.execute(
      sql`
        SELECT 
          id,
          sector_slug,
          sector_name,
          sector_description,
          is_available,
          has_content,
          brand_count,
          monthly_price,
          annual_price,
          badge_text,
          demo_cta_text,
          demo_cta_url,
          display_order,
          last_report_date
        FROM industry_report_sectors
        ORDER BY display_order, sector_name
      `
    );

    // Get bundle packages
    const bundles = await db.execute(
      sql`
        SELECT *
        FROM industry_report_bundles
        WHERE is_active = true
          AND is_visible_public = true
        ORDER BY display_order
      `
    );

    return NextResponse.json({ 
      sectors: result.rows,
      bundles: bundles.rows,
      user_authenticated: isAuthenticated
    });
  } catch (error) {
    console.error('Failed to get sector pricing:', error);
    return NextResponse.json(
      { error: 'Failed to load sector pricing' },
      { status: 500 }
    );
  }
}

