import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePresignedUploadUrl } from '@/lib/s3-helpers';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, guestId, guestName, fileName, contentType } = await request.json();

    if (!sessionId || !fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, fileName, contentType' },
        { status: 400 }
      );
    }

    // Verify session exists and is not expired
    const session = await prisma.weddingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (new Date() > session.expiresAt) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    // If guestName provided, find or create guest
    let finalGuestId = guestId;
    if (guestName && !guestId) {
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
      finalGuestId = guest.id;
    }

    if (!finalGuestId) {
      return NextResponse.json(
        { error: 'Guest ID or guest name required' },
        { status: 400 }
      );
    }

    // Generate real AWS S3 pre-signed URL
    let uploadUrl, s3Key;
    try {
      const result = await generatePresignedUploadUrl(
        sessionId,
        fileName,
        contentType
      );
      uploadUrl = result.uploadUrl;
      s3Key = result.s3Key;
    } catch (s3Error) {
      console.error('S3 pre-signed URL generation error:', s3Error);
      return NextResponse.json(
        { error: `Failed to generate upload URL: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Store upload token in database for tracking
    const uploadToken = await prisma.uploadToken.create({
      data: {
        sessionId,
        guestId: finalGuestId,
        token: s3Key, // Use S3 key as token for reference
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    return NextResponse.json({
      ...uploadToken,
      uploadUrl, // Real S3 pre-signed URL
      s3Key,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating upload token:', error);
    return NextResponse.json(
      { error: 'Failed to create upload token' },
      { status: 500 }
    );
  }
}
