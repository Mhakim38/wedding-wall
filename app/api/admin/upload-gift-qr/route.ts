import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3-upload';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const adminPassword = formData.get('adminPassword') as string;
    const file = formData.get('file') as File;

    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid admin password' },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate S3 key
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `photos/gift-qr-${timestamp}-${sanitizedFileName}`;

    // Upload to S3
    await uploadToS3(s3Key, fileBuffer, file.type || 'image/png');
    
    // Return a proxied URL that works with our private bucket
    const proxiedUrl = `/api/image?key=${s3Key}`;

    return NextResponse.json({ url: proxiedUrl, key: s3Key }, { status: 201 });
  } catch (error) {
    console.error('Error uploading gift QR:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
