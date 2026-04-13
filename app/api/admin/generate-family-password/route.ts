import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateFamilyPassword } from '@/lib/password';
import { sendFamilyInvitation } from '@/lib/email';

/**
 * Generate Family Password for a Wedding
 * POST /api/admin/generate-family-password
 * 
 * Body:
 * - sessionId: Wedding session ID
 * - familyPassword: (optional) Custom password. If not provided, will be auto-generated
 * - familyEmail: (optional) Email to send invitation
 * - adminPassword: Super admin password for verification
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, familyPassword, familyEmail, adminPassword } = await request.json();

    if (!sessionId || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, adminPassword' },
        { status: 400 }
      );
    }

    // Verify super admin password
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

    // Find session
    const session = await prisma.weddingSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Wedding session not found' },
        { status: 404 }
      );
    }

    // Use provided password or generate one
    const passwordToUse = familyPassword || generateFamilyPassword();

    // Hash the password with bcrypt
    const hashedPassword = await hashPassword(passwordToUse);

    // Update family password in database
    const updatedSession = await prisma.weddingSession.update({
      where: { id: sessionId },
      data: {
        familyPassword: hashedPassword,
        familyPasswordKey: `bcrypt-${Date.now()}`, // Track that it's hashed
      },
    });

    // Send email invitation if email provided
    let emailSent = false;
    if (familyEmail) {
      try {
        emailSent = await sendFamilyInvitation(
          familyEmail,
          session.eventName,
          session.code,
          passwordToUse, // Send plain text password in email (only time it's seen)
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://wedding-wall.com'}/family-panel`
        );
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Continue even if email fails - password is still generated
      }
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: updatedSession.id,
        eventName: updatedSession.eventName,
        code: updatedSession.code,
        generatedPassword: familyPassword ? null : passwordToUse, // Only show generated password if we created it
        familyPasswordSet: true,
        emailSent: emailSent,
        message: emailSent
          ? 'Family password generated and invitation email sent'
          : 'Family password generated. No email sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating family password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate family password' },
      { status: 500 }
    );
  }
}
