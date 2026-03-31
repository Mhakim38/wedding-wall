# 🔔 Push Notifications - Wedding Wall

Push notification system integrated into Wedding Wall PWA.

## ✅ What's Implemented

1. **Service Worker** (`public/service-worker.js`)
   - Push event handler
   - Notification click handler
   - Offline support

2. **API Routes**
   - `GET /api/push/vapid` - Get VAPID public key
   - `POST /api/push/subscribe` - Save push subscription
   - `POST /api/push/send` - Send push notification

3. **Helper Utilities** (`lib/push-notifications.ts`)
   - VAPID key generation
   - Push notification sending

4. **Test Component** (`components/PushNotificationTest.tsx`)
   - Enable notifications button
   - Send test notification button

---

## 🚀 How to Test

### Option 1: Add Test Component to Any Page

Add to `app/page.tsx` or any page:

```tsx
import { PushNotificationTest } from '@/components/PushNotificationTest';

export default function Page() {
  return (
    <div>
      {/* Your existing content */}
      
      <PushNotificationTest />
    </div>
  );
}
```

### Option 2: Use the API Directly

```javascript
// 1. Get VAPID public key
const { publicKey } = await fetch('/api/push/vapid').then(r => r.json());

// 2. Subscribe to push
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey)
});

// 3. Save subscription
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify(subscription)
});

// 4. Send test notification
await fetch('/api/push/send', {
  method: 'POST',
  body: JSON.stringify({
    subscription,
    title: '💕 Wedding Wall',
    message: 'New photo uploaded!',
  })
});
```

---

## 📱 Testing on iOS

1. **Deploy to Vercel** (has HTTPS automatically)
2. **Open on iPhone** in Safari
3. **Add to Home Screen**
4. **Open from home screen** (standalone mode)
5. **Enable notifications**
6. **Test!**

---

## 🎯 Real Use Cases

### Use Case 1: Notify When New Photo Uploaded

In your photo upload API (`app/api/upload/route.ts`):

```typescript
import { sendPushNotification } from '@/lib/push-notifications';

// After photo is uploaded...
const subscriptions = await getSubscriptionsFromDatabase();

subscriptions.forEach(async (sub) => {
  await sendPushNotification(sub, {
    title: '📸 New Photo!',
    body: `${guestName} just uploaded a photo!`,
    icon: '/favicon-192x192.png',
    url: '/',
  });
});
```

### Use Case 2: Notify Wall Creator

```typescript
// Only notify the couple (wall creator)
const creatorSubscription = await getCreatorSubscription(wallId);

await sendPushNotification(creatorSubscription, {
  title: '💕 Wedding Wall Activity',
  body: 'Someone uploaded a photo to your wedding wall!',
  url: `/wall/${wallId}`,
});
```

### Use Case 3: Notify When Wall Expires Soon

```typescript
// Cron job or scheduled function
const expiringSoon = await getWallsExpiringSoon();

expiringSoon.forEach(async (wall) => {
  await sendPushNotification(wall.creatorSubscription, {
    title: '⏰ Wall Expiring Soon',
    body: `Your wedding wall "${wall.name}" expires in 24 hours!`,
    url: `/wall/${wall.code}`,
  });
});
```

---

## 💾 Add Database Storage (Recommended)

### 1. Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String?  // Optional: link to user/guest
  wallId    String?  // Optional: link to specific wall
  endpoint  String   @unique
  p256dh    String   // Encryption key
  auth      String   // Authentication secret
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([wallId])
}
```

### 2. Update Subscribe API

In `app/api/push/subscribe/route.ts`:

```typescript
await prisma.pushSubscription.create({
  data: {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    wallId: wallId, // if specific to a wall
  },
});
```

### 3. Query Subscriptions

```typescript
// Get all subscriptions for a wall
const subscriptions = await prisma.pushSubscription.findMany({
  where: { wallId: 'some-wall-id' }
});

// Send to all
subscriptions.forEach(async (sub) => {
  await sendPushNotification({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    }
  }, {
    title: 'Hello!',
    body: 'Message',
  });
});
```

---

## 🔐 Environment Variables

Add to `.env.local`:

```env
ADMIN_EMAIL=hakim@example.com
```

---

## ✅ Deployment Checklist

- [  ] Push to GitHub
- [ ] Deploy to Vercel (auto-HTTPS)
- [ ] Test on iOS (Add to Home Screen)
- [ ] Test on Android (works immediately)
- [ ] (Optional) Add Prisma schema for subscriptions
- [ ] (Optional) Integrate with photo upload flow

---

## 🎓 How It Works

1. **User enables notifications** → Browser creates subscription
2. **Subscription saved** to database (or memory for now)
3. **Event happens** (photo upload, wall expiry, etc)
4. **Server sends push** → Google/Apple push service → User device
5. **Service Worker receives** → Shows notification
6. **User clicks** → Opens app

---

**Built by Hakim & Yappy 💜**
