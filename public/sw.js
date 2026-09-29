// Time Planner Web — Service Worker v2 (Production Ready + Dev Friendly)
// Strategy:
//   - Localhost / Dev: Network-First to prevent stale component caching
//   - Static assets (fonts/icons): Cache-First in production
//   - API calls (/api/*): Network-First (always fresh data)
//   - Navigation (HTML pages): Network-First with offline fallback

const CACHE_NAME = 'tp-cache-v2';
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/tasks',
  '/schedule',
  '/calendar',
  '/habits',
  '/goals',
  '/statistics',
  '/notes',
  '/settings',
  '/tracking',
  '/focus',
  '/integrations',
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache failed for some URLs:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // On localhost/127.0.0.1 development, always fetch from network first so code updates reflect instantly
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  // API calls: Network-First (no caching)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Offline', message: 'No internet connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // If localhost dev or webpack HMR hot update, always go directly to network
  if (isLocalhost || url.pathname.includes('webpack') || url.pathname.includes('hot-update')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Navigation / page requests: Network-First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Static assets: Cache-First in production
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
