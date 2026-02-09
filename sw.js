/* Pulse & Pattern service worker
   Provides optional offline caching when served over http(s).
*/

const CACHE_NAME = 'pp-cache-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/state.js',
  './js/ui.js',
  './js/data.js',
  './manifest.webmanifest',
  './assets/icons/favicon.svg',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/img/hero-ai-medicine.jpg',
  './assets/img/fig-pipeline.png',
  './assets/img/fig-device-landscape.jpg',
  './assets/img/thumb-synthetic-data.jpg',
  './assets/img/thumb-policy.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if(cached) return cached;
      return fetch(req)
        .then((res) => {
          const url = new URL(req.url);
          // Cache same-origin GETs (best effort)
          if(url.origin === self.location.origin && res && res.ok){
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached || new Response('Offline.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    })
  );
});
