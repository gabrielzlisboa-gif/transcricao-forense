const CACHE = 'transforense-v2';
const ASSETS = [
  '/transcricao-forense/',
  '/transcricao-forense/index.html',
  '/transcricao-forense/manifest.json',
  '/transcricao-forense/icon-192.png',
  '/transcricao-forense/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Requisições para a API Groq sempre vão para a rede
  if (e.request.url.includes('api.groq.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/transcricao-forense/index.html'));
    })
  );
});
