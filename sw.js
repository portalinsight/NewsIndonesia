self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  // Bisa ditambahkan cache strategy nanti, untuk sekarang biarkan fetch normal
  event.respondWith(fetch(event.request));
});