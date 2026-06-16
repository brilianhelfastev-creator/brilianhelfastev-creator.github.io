// Minimal Service Worker for PWA Validation
const CACHE_NAME = 'brilian-dev-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/web-app-manifest-192x192.png',
  './assets/web-app-manifest-512x512.png',
  './assets/Foto_Brilian.jpeg'
];

self.addEventListener('install', (event) => {
  console.log('SW installed');
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', (event) => {
  console.log('SW activated');
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch events to the network (no caching for dynamic API)
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
