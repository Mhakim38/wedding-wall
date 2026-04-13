import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

/**
 * Family Panel Authentication
 * POST /api/family-auth
 * 
 * Authenticates family members using wedding code + family password
 */
export async function POST(request: NextRequest) {
  try {
    const { code, familyPassword } = await request.json();

    if (!code || !familyPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: code, familyPassword' },
        { status: 400 }
      );
    }

    // Find session by code
    const session = await prisma.weddingSession.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Wedding code not found' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Wedding session has expired' },
        { status: 410 }
      );
    }

    // Check if family password is set
    if (!session.familyPassword) {
      return NextResponse.json(
        { error: 'Family panel not configured for this wedding' },
        { status: 403 }
      );
    }

    // Verify password using bcrypt
    const passwordMatch = await verifyPassword(familyPassword, session.familyPassword);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid family password' },
        { status: 401 }
      );
    }

    // Authentication successful
    return NextResponse.json(
      {
        sessionId: session.id,
        eventName: session.eventName,
        code: session.code,
        role: 'family',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in family auth:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
