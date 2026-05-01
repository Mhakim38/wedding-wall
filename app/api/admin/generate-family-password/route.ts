import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateFamilyPassword } from '@/lib/password';

/**
 * Generate Family Password for a Wedding
 * POST /api/admin/generate-family-password
 * 
 * Body:
 * - weddingCode: Wedding code (e.g., "JOHN-JANE-2025")
 * - phoneNumber: Family member phone number (for admin reference)
 * - adminPassword: Super admin password for verification
 */
export async function POST(request: NextRequest) {
  try {
    const { weddingCode, phoneNumber, adminPassword } = await request.json();

    if (!weddingCode || !phoneNumber || !adminPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: weddingCode, phoneNumber, adminPassword' },
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

    // Find session by code
    const session = await prisma.weddingSession.findUnique({
      where: { code: weddingCode.toUpperCase() },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Wedding session not found' },
        { status: 404 }
      );
    }

    // Generate family password
    const passwordToUse = generateFamilyPassword();

    // Hash the password with bcrypt
    const hashedPassword = await hashPassword(passwordToUse);

    // Update family password in database
    const updatedSession = await prisma.weddingSession.update({
      where: { id: session.id },
      data: {
        familyPassword: hashedPassword,
        familyPasswordKey: `bcrypt-${Date.now()}`, // Track that it's hashed
      },
    });

    // Calculate access dates
    // From: Day before event (eventDate - 1 day)
    // To: Subscription end date (already calculated as eventDate + package duration)
    const validFromDate = new Date(updatedSession.eventDate);
    validFromDate.setDate(validFromDate.getDate() - 1);

    return NextResponse.json(
      {
        success: true,
        sessionId: updatedSession.id,
        eventName: updatedSession.eventName,
        code: updatedSession.code,
        generatedPassword: passwordToUse,
        phoneNumber: phoneNumber,
        validFromDate: validFromDate,
        validToDate: updatedSession.subscriptionEndDate,
        familyPasswordSet: true,
        message: 'Family password generated successfully. Share via WhatsApp manually.',
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
