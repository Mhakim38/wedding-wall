import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('key');
    const photoId = searchParams.get('id');

    let keyToFetch = s3Key;

    // If ID is provided, look up the key from the database (more secure)
    if (photoId) {
      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
        select: { s3Key: true }
      });
      
      if (!photo) {
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        );
      }
      keyToFetch = photo.s3Key;
    } 
    if (!keyToFetch) {
       return NextResponse.json(
        { error: 'Missing id or key parameter' },
        { status: 400 }
      );
    }

    // Security: Only allow photos/ prefix to prevent directory traversal
    if (!keyToFetch.startsWith('photos/')) {
      return NextResponse.json(
        { error: 'Invalid photo key' },
        { status: 403 }
      );
    }

    // Fetch object from S3
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: keyToFetch,
    });

    const response = await s3Client.send(getCommand);

    // Convert stream to buffer
    const buffer = await response.Body!.transformToByteArray();

    // Determine content type from metadata or guess from extension
    const contentType = response.ContentType || 'image/jpeg';

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year since S3 keys are immutable
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}
