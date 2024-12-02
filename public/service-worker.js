const CACHE_NAME = 'qr-capture-bright-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/offline.html',
  '/node_modules/vite/deps/react-dom_client.js',
  '/node_modules/vite/deps/@tanstack_react-query.js',
  '/node_modules/vite/deps/react-router-dom.js',
  '/node_modules/vite/deps/react_jsx-dev-runtime.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).catch(() => caches.match('/offline.html'));
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
