import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, guestName, photoUrl, width, height, fileSize, mimeType } =
      await request.json();

    if (!sessionId || !guestName || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Find or create guest
    let guest = await prisma.guest.findFirst({
      where: {
        sessionId,
        name: guestName,
      },
    });

    if (!guest) {
      guest = await prisma.guest.create({
        data: {
          sessionId,
          name: guestName,
        },
      });
    }

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        sessionId,
        guestId: guest.id,
        s3Url: photoUrl,
        s3Key: `photos/${sessionId}/${Date.now()}.jpg`,
        width,
        height,
        fileSize,
        mimeType,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json(
      { error: 'Failed to create photo record' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
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

    const photos = await prisma.photo.findMany({
      where: { sessionId },
      include: {
        guest: {
          select: { name: true },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(photos, { status: 200 });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
