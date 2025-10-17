import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// GET /api/admin/costs/stats - Get cost statistics and budget info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's spend
    const todayResult = await db.execute(
      sql`
        SELECT COALESCE(SUM(total_cost), 0) as total
        FROM api_cost_tracking
        WHERE date_key = CURRENT_DATE
      `
    );

    // Get month's spend
    const monthResult = await db.execute(
      sql`
        SELECT COALESCE(SUM(total_cost), 0) as total
        FROM api_cost_tracking
        WHERE date_key >= DATE_TRUNC('month', CURRENT_DATE)
      `
    );

    // Get budgets
    const budgetsResult = await db.execute(
      sql`
        SELECT budget_type, budget_limit
        FROM cost_budgets
        WHERE is_active = true
      `
    );

    const budgets = budgetsResult.rows.reduce((acc: any, row: any) => {
      acc[row.budget_type] = Number(row.budget_limit);
      return acc;
    }, {});

    // Cost by model this month
    const byModelResult = await db.execute(
      sql`
        SELECT 
          c.model_key,
          m.model_name,
          SUM(c.total_cost) as total_cost,
          COUNT(*) as call_count
        FROM api_cost_tracking c
        LEFT JOIN ai_model_configurations m ON m.model_key = c.model_key
        WHERE c.date_key >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.model_key, m.model_name
        ORDER BY total_cost DESC
      `
    );

    // Cost by agent this month
    const byAgentResult = await db.execute(
      sql`
        SELECT 
          c.agent_key,
          a.agent_name,
          SUM(c.total_cost) as total_cost,
          COUNT(*) as call_count
        FROM api_cost_tracking c
        LEFT JOIN agent_configurations a ON a.agent_key = c.agent_key
        WHERE c.date_key >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY c.agent_key, a.agent_name
        ORDER BY total_cost DESC
      `
    );

    return NextResponse.json({
      stats: {
        today_spend: Number(todayResult.rows[0]?.total || 0),
        month_spend: Number(monthResult.rows[0]?.total || 0),
        daily_budget: budgets.daily || 100,
        monthly_budget: budgets.monthly || 3000,
        by_model: byModelResult.rows,
        by_agent: byAgentResult.rows
      }
    });
  } catch (error) {
    console.error('Failed to get cost stats:', error);
    return NextResponse.json(
      { error: 'Failed to load cost stats', details: String(error) },
      { status: 500 }
    );
  }
}

