import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicS3Url } from '@/lib/s3-helpers';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, guestName, s3Key, width, height, fileSize, mimeType } =
      await request.json();

    if (!sessionId || !guestName || !s3Key) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, guestName, s3Key' },
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

    // Generate public S3 URL from key
    const s3Url = getPublicS3Url(s3Key);

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        sessionId,
        guestId: guest.id,
        s3Url,
        s3Key,
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
    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get('sessionId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12'); // Fetch 12 at a time

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
      skip: (page - 1) * limit,
      take: limit,
    });

    // Sanitize response: Remove raw S3 URLs and keys
    // Frontend should use /api/image?id=PHOTO_ID instead of key
    const sanitizedPhotos = photos.map(photo => ({
      id: photo.id,
      guest: photo.guest,
      width: photo.width,
      height: photo.height,
      uploadedAt: photo.uploadedAt
    }));

    // Return photos and pagination metadata
    return NextResponse.json({
      photos: sanitizedPhotos,
      pagination: {
        page,
        limit,
        hasMore: photos.length === limit,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
