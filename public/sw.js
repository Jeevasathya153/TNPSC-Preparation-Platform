// Service Worker for TN Gov Exam Prep PWA
const CACHE_NAME = 'tn-exam-prep-v3';
const PDF_CACHE = 'tn-exam-prep-pdfs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
          .catch(err => {
            console.log('Cache addAll error:', err);
            // Don't fail if some resources can't be cached
          });
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for POST, PUT, DELETE requests
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle navigation requests (HTML pages) - return index.html for SPA routing
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && event.request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put('/', responseClone);
          });
          return response;
        })
        .catch(() => {
          // If fetch fails, return cached index.html
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // Special handling for PDF proxy requests
  if (url.pathname.includes('/api/pdf-proxy')) {
    event.respondWith(
      caches.open(PDF_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            console.log('Serving PDF from cache:', event.request.url);
            return response;
          }
          
          return fetch(event.request).then(fetchResponse => {
            // Only cache successful PDF responses
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => {
            // Return cached version if fetch fails
            return cache.match(event.request);
          });
        });
      })
    );
    return;
  }

  // Default caching strategy for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return offline page or fallback
          return caches.match('/index.html');
        });
      })
  );
});

// Update Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
