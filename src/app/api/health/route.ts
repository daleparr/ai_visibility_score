import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;
    
    try {
      const dbStartTime = Date.now();
      // Test database connection using Drizzle ORM
      if (db && typeof db.select === 'function') {
        // Try a simple select query
        await db.select().from({ dummy: 'information_schema.tables' }).limit(1);
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
      } else {
        // Mock database - still functional
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
    
    // Return 503 if critical services are down
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