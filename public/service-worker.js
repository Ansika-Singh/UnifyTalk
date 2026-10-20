/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'unifytalk-v2'; // ← bumped version

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for everything
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP(S) schemes (e.g. chrome-extension://) — Cache API rejects them
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (request.method !== 'GET') return;

  // ── API calls: network-first, cache on success, 503 JSON on total failure ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try { cache.put(request, clone); } catch (err) {
                console.warn('[SW] cache.put failed (api):', err);
              }
            });
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached ||
            new Response(
              JSON.stringify({ error: 'You are offline. Please check your connection.' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            )
          )
        )
    );
    return;
  }

  // ── Navigation requests (SPA): serve index.html from network → cache → shell ──
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .then((response) => {
          // Refresh the cache with the latest index.html
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try { cache.put('/index.html', clone); } catch (err) {
                console.warn('[SW] cache.put failed (index.html):', err);
              }
            });
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then(
            (cached) =>
              cached ||
              new Response(
                '<!doctype html><html><head><title>Offline</title></head>' +
                '<body style="font-family:sans-serif;text-align:center;padding:4rem">' +
                '<h1>You are offline</h1>' +
                '<p>Please check your connection and try again.</p>' +
                '</body></html>',
                { status: 200, headers: { 'Content-Type': 'text/html' } }
              )
          )
        )
    );
    return;
  }

  // ── Static assets: network-first, cache on success, cache fallback on failure ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(request, clone); } catch (err) {
              console.warn('[SW] cache.put failed (static):', err);
            }
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) =>
            cached ||
            new Response('', { status: 408, statusText: 'Offline — resource unavailable' })
        )
      )
  );
});