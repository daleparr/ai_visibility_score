// Netlify scheduled function for monthly industry reports
// Runs on the 1st of each month at 2 AM UTC

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { scheduledMonthlyProbes } from '../../src/lib/industry-reports/scheduler';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log('[Netlify Function] Monthly reports scheduler triggered');
  
  // Verify this is a scheduled invocation
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. This function runs on a schedule.' }),
    };
  }
  
  try {
    const results = await scheduledMonthlyProbes();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
    };
  } catch (error) {
    console.error('[Netlify Function] Error running monthly probes:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

// Configure function to run on schedule
// Add to netlify.toml:
// [[functions]]
//   name = "monthly-reports"
//   schedule = "0 2 1 * *"  # 2 AM UTC on 1st of each month

