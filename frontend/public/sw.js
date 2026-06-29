// Service Worker for TN Gov Exam Prep PWA (Production Refined)
const CACHE_NAME = 'tngov-prep-cache-v4';
const STATIC_ASSET_CACHE = 'tngov-static-assets-v1';
const PDF_CACHE = 'tngov-pdf-cache-v1';

const URLS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: Open cache and cache shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, STATIC_ASSET_CACHE, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events: Caching strategies
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 1. PDF cache (Cache-first with network fallback)
  if (requestUrl.pathname.includes('/api/pdf-proxy')) {
    event.respondWith(
      caches.open(PDF_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Offline fallback
            return new Response('PDF unavailable offline', { status: 503, statusText: 'Service Unavailable' });
          });
        });
      })
    );
    return;
  }

  // 2. API requests (Network-first, don't cache standard api calls to avoid stale user data)
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error. Offline content unavailable.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Static assets: JS, CSS, Web Fonts (Cache-first, network fallback)
  const isStaticAsset = requestUrl.pathname.match(/\.(js|css|woff2|woff|ttf|png|jpg|jpeg|gif|svg)$/);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cacheResponseClone = networkResponse.clone();
            caches.open(STATIC_ASSET_CACHE).then((cache) => {
              cache.put(event.request, cacheResponseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. SPA routing navigation request (return index.html shell on network failure)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/') || caches.match('/index.html');
      })
    );
    return;
  }

  // 5. Default caching strategy (Stale-while-revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheResponseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheResponseClone);
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
