import { NextResponse } from 'next/server';
import { testConnection, getDatabaseStats } from '@/lib/db';

// ===================================================================
// HEALTH CHECK API ENDPOINT
// ===================================================================

/**
 * GET /api/health
 * Health check endpoint for the Next.js API
 */
export async function GET() {
  try {
    // Test database connection
    const dbHealthy = await testConnection();
    const status = dbHealthy ? 'healthy' : 'unhealthy';
    const statusCode = dbHealthy ? 200 : 503;

    let stats = {};
    if (dbHealthy) {
      try {
        stats = await getDatabaseStats();
      } catch (error) {
        console.error('Failed to get database stats:', error);
      }
    }

    const response = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      api_type: 'Next.js API Routes',
      database: {
        connected: dbHealthy,
        stats: dbHealthy ? stats : null
      }
    };

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        api_type: 'Next.js API Routes'
      },
      { status: 503 }
    );
  }
}