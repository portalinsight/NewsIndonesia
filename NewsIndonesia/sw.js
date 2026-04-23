const CACHE_NAME = 'insight-news-v1';
const urlsToCache = [
  '/NewsIndonesia/',
  '/NewsIndonesia/index.html',
  '/NewsIndonesia/detail.html',
  '/NewsIndonesia/style.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});