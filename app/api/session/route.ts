import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { eventName, eventDate } = await request.json();

    if (!eventName || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields: eventName, eventDate' },
        { status: 400 }
      );
    }

    // Generate unique 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const session = await prisma.weddingSession.create({
      data: {
        code,
        eventName,
        eventDate: new Date(eventDate),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const sessionId = searchParams.get('sessionId');

    if (!code && !sessionId) {
      return NextResponse.json(
        { error: 'Missing code or sessionId parameter' },
        { status: 400 }
      );
    }

    let session;

    if (code) {
      session = await prisma.weddingSession.findUnique({
        where: { code },
        include: {
          photos: {
            orderBy: { uploadedAt: 'desc' },
          },
        },
      });
    } else if (sessionId) {
      session = await prisma.weddingSession.findUnique({
        where: { id: sessionId },
        include: {
          photos: {
            orderBy: { uploadedAt: 'desc' },
          },
        },
      });
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
