import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, guestId } = await request.json();

    if (!sessionId || !guestId) {
      return NextResponse.json(
        { error: 'Missing sessionId or guestId' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.weddingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Generate pre-signed URL token (placeholder for Phase 7)
    // In Phase 7, this will integrate with AWS S3
    const token = Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const uploadToken = await prisma.uploadToken.create({
      data: {
        sessionId,
        guestId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    return NextResponse.json(uploadToken, { status: 201 });
  } catch (error) {
    console.error('Error creating upload token:', error);
    return NextResponse.json(
      { error: 'Failed to create upload token' },
      { status: 500 }
    );
  }
}
