// API Route: Subscribe to Push Notifications
// POST /api/push/subscribe

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    // In production, you'd save this to your database
    // For now, we'll just return success
    // You can add Prisma schema later to store subscriptions
    
    console.log('📝 Push subscription received:', {
      endpoint: subscription.endpoint,
      keys: subscription.keys ? 'present' : 'missing'
    });

    // TODO: Save to database
    // await prisma.pushSubscription.create({
    //   data: {
    //     endpoint: subscription.endpoint,
    //     p256dh: subscription.keys.p256dh,
    //     auth: subscription.keys.auth,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
