const CACHE_NAME = 'insight-news-v2';
const urlsToCache = [
  '/NewsIndonesia/',
  '/NewsIndonesia/index.html',
  '/NewsIndonesia/style.css',
  '/NewsIndonesia/script.js',
  '/NewsIndonesia/manifest.json',
  '/NewsIndonesia/breaking.html',
  '/NewsIndonesia/trending.html',
  '/NewsIndonesia/hot.html',
  '/NewsIndonesia/politik.html',
  '/NewsIndonesia/daerah.html',
  '/NewsIndonesia/ekonomi.html',
  '/NewsIndonesia/detail.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        // Jika gagal, arahkan ke halaman beranda
        return caches.match('/NewsIndonesia/index.html');
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
