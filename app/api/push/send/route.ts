// API Route: Send Push Notification
// POST /api/push/send

import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification, type PushSubscription } from '@/lib/push-notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, title, message, icon, url } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription is required' },
        { status: 400 }
      );
    }

    // Send the notification
    const result = await sendPushNotification(subscription as PushSubscription, {
      title: title || '📸 Wedding Wall',
      body: message || 'New photo uploaded!',
      icon: icon || '/favicon-192x192.png',
      url: url || '/',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
