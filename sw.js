const CACHE_NAME = 'abella-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/cart_checkout_premium.html',
  '/categoria.html',
  '/galvanicas.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
