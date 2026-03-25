import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3-upload';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const guestName = formData.get('guestName') as string;
    const file = formData.get('file') as File;

    if (!sessionId || !guestName || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, guestName, file' },
        { status: 400 }
      );
    }

    // Verify session exists and not expired
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

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate secure random filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const s3Key = `photos/${sessionId}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to S3
    const s3Url = await uploadToS3(s3Key, fileBuffer, file.type);

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        sessionId,
        guestId: guest.id,
        s3Url,
        s3Key,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
