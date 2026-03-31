// Push Notification Utilities for Wedding Wall
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

// VAPID keys file path
const VAPID_KEYS_PATH = path.join(process.cwd(), 'vapid-keys.json');

// Get or generate VAPID keys
export function getVapidKeys() {
  try {
    if (fs.existsSync(VAPID_KEYS_PATH)) {
      const data = fs.readFileSync(VAPID_KEYS_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading VAPID keys:', error);
  }

  // Generate new keys if file doesn't exist
  const vapidKeys = webpush.generateVAPIDKeys();
  
  try {
    fs.writeFileSync(VAPID_KEYS_PATH, JSON.stringify(vapidKeys, null, 2));
    console.log('✅ Generated new VAPID keys');
  } catch (error) {
    console.error('Error saving VAPID keys:', error);
  }

  return vapidKeys;
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
