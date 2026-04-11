/**
 * sw.js — Service Worker for Journal de Tir PWA
 * Strategy: Cache-first for all app assets, offline-first
 */

const CACHE_NAME = 'journal-tir-v3';

// All assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/parser.js',
  '/js/schematic.js',
  '/js/pdf-import.js',
  '/lib/pdf.min.js',
  '/lib/pdf.worker.min.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: pre-cache all app assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install - caching app shell');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, don't fail on individual errors
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Failed to cache:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Pre-cache complete');
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and non-http requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Cache hit - return cached response
        // Also update cache in background for non-PDF.js files
        if (!event.request.url.includes('/lib/')) {
          fetch(event.request).then(response => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {}); // Silently fail network update
        }
        return cached;
      }

      // Cache miss - fetch from network
      return fetch(event.request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Cache the fetched response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(err => {
        console.warn('[SW] Network fetch failed:', event.request.url, err);

        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }

        // Return empty response for other failed requests
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
