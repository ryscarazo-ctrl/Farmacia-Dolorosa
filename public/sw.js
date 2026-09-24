const CACHE_NAME = 'farmacia-v9-network-first';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first: Siempre busca la última versión en vivo en internet
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guarda copia en segundo plano por si se va la red
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay internet (offline), carga de la memoria local
        return caches.match(event.request);
      })
  );
});
