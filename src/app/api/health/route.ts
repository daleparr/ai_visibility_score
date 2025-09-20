import { NextRequest, NextResponse } from 'next/server';
import { db, sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      if (sql) {
        // Use raw tagged SQL to avoid invalid identifier parameterization
        await sql`SET search_path TO production, public`;
        await sql`SELECT 1 as test`;
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
      } else if (db && typeof db.select === 'function') {
        // Fallback simple ORM query if sql is not available
        const { evaluations } = await import('@/lib/db/schema');
        await db.select().from(evaluations).limit(1);
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
      } else {
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'mock_connected';
      }
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      dbStatus = 'error';
    }
    
    const totalResponseTime = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.3',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: {
          status: 'healthy',
          responseTime: totalResponseTime
        },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime
        },
        auth: {
          status: process.env.NEXTAUTH_SECRET ? 'configured' : 'not_configured'
        },
        stripe: {
          status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured'
        }
      },
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        responseTime: totalResponseTime
      }
    };
    
    const isHealthy = dbStatus === 'connected' && totalResponseTime < 5000;
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(healthData, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        api: { status: 'error' },
        database: { status: 'unknown' }
      }
    }, { status: 503 });
  }
}