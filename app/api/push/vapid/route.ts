// API Route: Get VAPID Public Key
// GET /api/push/vapid

import { NextResponse } from 'next/server';
import { getVapidKeys } from '@/lib/push-notifications';

export async function GET() {
  try {
    const vapidKeys = getVapidKeys();
    
    return NextResponse.json({
      publicKey: vapidKeys.publicKey,
    });
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return NextResponse.json(
      { error: 'Failed to get VAPID key' },
      { status: 500 }
    );
  }
}
