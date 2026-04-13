import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromS3 } from '@/lib/s3-upload';
import { verifyPassword } from '@/lib/password';

/**
 * Delete a photo from gallery
 * DELETE /api/photos/[photoId]
 * 
 * Query params:
 * - guestId: (optional) Guest ID making the deletion request
 * - role: (optional) User role ('guest' or 'family')
 * - familyPassword: (optional) Family password for family-level deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;
    const { searchParams } = new URL(request.url);
    
    const guestId = searchParams.get('guestId');
    const role = searchParams.get('role') || 'guest';
    const familyPassword = searchParams.get('familyPassword');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Find the photo
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        session: true,
        guest: true,
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Authorization check
    let isAuthorized = false;

    if (role === 'guest' && guestId) {
      // Guest can only delete their own photos
      isAuthorized = photo.guestId === guestId;
    } else if (role === 'family' && familyPassword) {
      // Family members can delete any photo if they provide correct password
      if (photo.session.familyPassword) {
        isAuthorized = await verifyPassword(familyPassword, photo.session.familyPassword);
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Not authorized to delete this photo' },
        { status: 403 }
      );
    }

    // Delete from S3
    try {
      await deleteFromS3(photo.s3Key);
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue even if S3 deletion fails
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id: photoId },
    });

    // Photo deleted silently - just return success
    return NextResponse.json(
      { success: true, message: 'Photo deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
