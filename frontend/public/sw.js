const CACHE_NAME = 'uni-edu-static-v3';
const STATIC_ASSETS = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ).then(() => self.clients.claim())
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Network-First strategy for the main HTML page to always load new asset hashes when online
      if (event.request.mode === 'navigate') {
        return fetch(event.request).catch(() => cached);
      }
      return cached || fetch(event.request);
    })
  );
});
