const CACHE_NAME = 'salonmoney-shell-v15';
const APP_VERSION = '2026-06-20-2';
const SHELL_ASSETS = ['/', '/manifest.json', '/icons/icon.svg?v=8'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => null)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(async (keys) => {
        const oldCaches = keys.filter((key) => key !== CACHE_NAME);
        await Promise.all(oldCaches.map((key) => caches.delete(key)));
        await self.clients.claim();

        if (oldCaches.length === 0) return;

        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clients.forEach((client) => {
          client.postMessage({ type: 'APP_UPDATE_READY', version: APP_VERSION });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cached) => cached || fetch(request))
  );
});
