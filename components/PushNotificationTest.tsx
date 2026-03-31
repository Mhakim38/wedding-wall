// Push Notification Test Component
// Add this to any page to test push notifications

'use client';

import { useState, useEffect } from 'react';

export function PushNotificationTest() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [status, setStatus] = useState('Checking support...');

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setStatus('Push notifications supported!');
      checkSubscription();
    } else {
      setStatus('Push notifications not supported in this browser');
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        setSubscription(existingSub);
        setStatus('Already subscribed');
      } else {
        setStatus('Click to enable notifications');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function enableNotifications() {
    try {
      setStatus('Requesting permission...');
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Permission denied');
        return;
      }

      setStatus('Getting VAPID key...');
      const vapidResponse = await fetch('/api/push/vapid');
      const { publicKey } = await vapidResponse.json();

      setStatus('Creating subscription...');
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      setStatus('Saving subscription...');
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      setSubscription(sub);
      setStatus('✅ Notifications enabled!');
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setStatus('❌ Error: ' + (error as Error).message);
    }
  }

  async function sendTestNotification() {
    if (!subscription) return;

    try {
      setStatus('Sending test notification...');
      
      await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          title: '💕 Wedding Wall',
          message: 'Test notification from Hakim & Hori!',
          icon: '/favicon-192x192.png',
        }),
      });

      setStatus('✅ Notification sent! Check your notifications.');
    } catch (error) {
      console.error('Error sending notification:', error);
      setStatus('❌ Failed to send');
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-4 max-w-xs border border-orange-200">
      <h3 className="font-semibold text-gray-800 mb-2">🔔 Push Notifications</h3>
      
      <p className="text-sm text-gray-600 mb-3">{status}</p>
      
      <div className="space-y-2">
        {!subscription && isSupported && (
          <button
            onClick={enableNotifications}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Enable Notifications
          </button>
        )}
        
        {subscription && (
          <button
            onClick={sendTestNotification}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Send Test Notification
          </button>
        )}
      </div>
    </div>
  );
}
