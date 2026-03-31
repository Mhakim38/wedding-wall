// Push Notification Utilities for Wedding Wall
import webpush from 'web-push';

// Get or generate VAPID keys from environment variables
export function getVapidKeys() {
  // Check if VAPID keys exist in environment variables
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (publicKey && privateKey) {
    return { publicKey, privateKey };
  }

  // If not in production, generate temporary keys for development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ VAPID keys not found in environment variables. Generating temporary keys for development.');
    const vapidKeys = webpush.generateVAPIDKeys();
    console.log('📋 Add these to your .env.local file:');
    console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
    return vapidKeys;
  }

  // In production, throw error if keys not configured
  throw new Error('VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
}

// Configure web-push with VAPID details
export function configureWebPush() {
  const vapidKeys = getVapidKeys();
  
  webpush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL || 'admin@weddingwall.com'}`,
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  return vapidKeys;
}

// Push subscription type
export interface PushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Send push notification
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }
) {
  configureWebPush();

  const notificationPayload = JSON.stringify(payload);

  try {
    await webpush.sendNotification(subscription, notificationPayload);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // If subscription is invalid (410 Gone), return error
    if (error.statusCode === 410) {
      return { success: false, error: 'Subscription expired', statusCode: 410 };
    }
    
    return { success: false, error: error.message };
  }
}

// Utility to generate new VAPID keys (for setup)
export function generateNewVapidKeys() {
  return webpush.generateVAPIDKeys();
}
