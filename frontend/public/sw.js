// ============================================================
// Service Worker — TNPSC HUB PWA
// Version: v5 — Cross-origin safe, production-ready
// ============================================================
//
// Caching strategies by request type:
//
//  CROSS-ORIGIN requests (Railway API)  → Pass-through (no respondWith)
//  /auth/login, /auth/register          → Network Only (never cached)
//  /api/**  (same-origin dev proxy)     → Network Only (never cached)
//  JS / CSS / fonts / images / icons    → Cache First, network fallback
//  SPA navigation (mode: navigate)      → Network First, cache fallback
//  Everything else                      → Network First
//
// ============================================================

const CACHE_VERSION = 'v5';
const SHELL_CACHE   = `tngov-shell-${CACHE_VERSION}`;
const STATIC_CACHE  = `tngov-static-${CACHE_VERSION}`;
const PDF_CACHE     = `tngov-pdf-${CACHE_VERSION}`;

// App shell files to precache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ============================================================
// INSTALL — precache app shell
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate immediately — don't wait for old SW to be released
  self.skipWaiting();
});

// ============================================================
// ACTIVATE — clean up outdated caches
// ============================================================
self.addEventListener('activate', (event) => {
  const validCaches = [SHELL_CACHE, STATIC_CACHE, PDF_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ============================================================
// FETCH — caching strategies
// ============================================================
self.addEventListener('fetch', (event) => {
  const request    = event.request;
  const requestUrl = new URL(request.url);

  // ----------------------------------------------------------
  // GUARD 1: Cross-origin requests → browser handles natively
  // ----------------------------------------------------------
  // In production, API calls go to https://railway-domain.up.railway.app
  // which is a DIFFERENT origin from this SW (https://vercel-app.vercel.app).
  // If we call respondWith() on cross-origin requests, the browser
  // re-evaluates CORS for the SW fetch context, which breaks
  // credentialed/custom-header requests → "Failed to fetch".
  // Solution: return immediately — do NOT call respondWith().
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // ----------------------------------------------------------
  // GUARD 2: Non-GET requests → browser handles natively
  // ----------------------------------------------------------
  // POST/PUT/DELETE/PATCH must never be intercepted by the SW.
  // This covers login, register, form submissions, etc.
  if (request.method !== 'GET') {
    return;
  }

  const pathname = requestUrl.pathname;

  // ----------------------------------------------------------
  // STRATEGY 1: Auth endpoints → Network Only (never cache)
  // ----------------------------------------------------------
  // /auth/login and /auth/register must always go to the
  // network. Stale cached auth responses would be a security
  // and CORS risk.
  if (
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register') ||
    pathname.startsWith('/auth/')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // ----------------------------------------------------------
  // STRATEGY 2: Same-origin /api/** → Network Only (never cache)
  // ----------------------------------------------------------
  // In local development, the Vite proxy forwards /api/* to
  // localhost:8080. These must never be served from cache to
  // avoid stale user data or stale auth responses.
  if (pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Network error. Please check your connection.' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      )
    );
    return;
  }

  // ----------------------------------------------------------
  // STRATEGY 3: Static assets → Cache First, network fallback
  // ----------------------------------------------------------
  // JS, CSS, fonts, images, icons are content-hashed by Vite
  // at build time — safe to serve from cache indefinitely.
  const isStaticAsset = /\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp|ico)$/.test(pathname);
  if (isStaticAsset) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ----------------------------------------------------------
  // STRATEGY 4: PDF proxy (same-origin only) → Cache First
  // ----------------------------------------------------------
  // Only reached if the PDF proxy is served from same origin.
  // Cross-origin PDF fetches are already handled by GUARD 1.
  if (pathname.startsWith('/pdf-proxy')) {
    event.respondWith(
      caches.open(PDF_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() =>
            new Response('PDF unavailable offline', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          );
        })
      )
    );
    return;
  }

  // ----------------------------------------------------------
  // STRATEGY 5: SPA navigation → Network First, shell fallback
  // ----------------------------------------------------------
  // React Router handles all navigation client-side.
  // Try network first; if offline, serve the cached index.html
  // shell so the SPA can still render its offline state.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html').then((cached) => cached || caches.match('/'))
      )
    );
    return;
  }

  // ----------------------------------------------------------
  // STRATEGY 6: Everything else → Network First
  // ----------------------------------------------------------
  // Safe default — always try network, fall back to cache.
  // Avoids the pitfalls of stale-while-revalidate on unknown
  // resource types.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
