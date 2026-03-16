import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('key');

    if (!s3Key) {
      return NextResponse.json(
        { error: 'Missing s3Key parameter' },
        { status: 400 }
      );
    }

    // Security: Only allow photos/ prefix to prevent directory traversal
    if (!s3Key.startsWith('photos/')) {
      return NextResponse.json(
        { error: 'Invalid s3Key' },
        { status: 403 }
      );
    }

    // Fetch object from S3
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
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
