// Service Worker for Wedding Wall PWA
// Handles offline support, caching, and push notifications

const CACHE_NAME = "wedding-wall-v1";
const RUNTIME_CACHE = "wedding-wall-runtime";

// Files to cache on install
const urlsToCache = [
  "/",
  "/manifest.json",
];

// Install: Cache essential assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching core files");
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // API requests: Network first
  if (request.url.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || new Response("Offline - API unavailable", { status: 503 });
          });
        })
    );
    return;
  }

  // Static assets: Cache first
  if (
    request.url.includes(".js") ||
    request.url.includes(".css") ||
    request.url.includes(".png") ||
    request.url.includes(".jpg")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Default: Network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return response || caches.match("/offline.html");
        });
      })
  );
});

// =====================================
// PUSH NOTIFICATIONS
// =====================================

// Push: Handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  let notificationData = {
    title: "Wedding Wall",
    body: "You have a new notification!",
    icon: "/favicon-192x192.png",
    badge: "/favicon-192x192.png",
  };

  // Parse notification payload
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error("[Service Worker] Failed to parse push data");
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || "/favicon-192x192.png",
    badge: notificationData.badge || "/favicon-192x192.png",
    vibrate: [200, 100, 200],
    tag: "wedding-wall-notification",
    requireInteraction: false,
    data: {
      url: notificationData.url || "/",
      timestamp: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification Click: Open app when notification clicked
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked");
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // If app not open, open it
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification Close: Track when notifications are dismissed
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification dismissed:", event.notification.tag);
});

console.log("Service Worker: Loaded with push notification support");

