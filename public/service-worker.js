const CACHE_NAME = "pf-app-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./script.js",
  "./style.css",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap"
];

// Install Event: Cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching all assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Strategy implementation
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests (like Gemini API) to avoid opaque response issues
  // or handle them with Network Only/First
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.includes("fonts.googleapis.com") && !event.request.url.includes("fonts.gstatic.com") && !event.request.url.includes("cdnjs.cloudflare.com")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache First for static assets, Network First for others
      if (response) {
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        // Don't cache non-successful responses or non-GET requests
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' || event.request.method !== 'GET') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for offline mode if network fails and not in cache
        if (event.request.mode === 'navigate') {
          return caches.match("./index.html");
        }
      });
    })
  );
});
