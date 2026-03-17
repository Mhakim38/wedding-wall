import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Check Database Connection
    // Try to count sessions (simple read query)
    const sessionCount = await prisma.weddingSession.count();

    // 2. Check Environment Variables (Masked)
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'Set' : 'Missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      sessionCount,
      env: envStatus,
    }, { status: 200 });

  } catch (error) {
    console.error('Health Check Error:', error);
    return NextResponse.json({
      status: 'error',
      database: 'failed',
      error: error instanceof Error ? error.message : String(error),
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      }
    }, { status: 500 });
  }
}
