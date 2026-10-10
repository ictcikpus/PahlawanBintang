const CACHE_NAME = 'pahlawan-bintang-v21.2.0';
const CACHE_VERSION = '21.2.0';
const CORE_FILES = [
  './',
  './index.html',
  './style.css?v=21.2.0',
  './game.js?v=21.2.0',
  './multiplayer.js?v=20.9',
  './achievements.json',
  './levels.json',
  './manifest.json'
];
self.addEventListener('install', (event) => {
  console.log('[SW] Install v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(
      CORE_FILES.map((url) => cache.add(url).catch((err) => console.warn('[SW] Fail:', url)))
    )).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => { if (key !== CACHE_NAME) { console.log('[SW] Delete old:', key); return caches.delete(key); } })))
    .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  if (url.includes('firebase') || url.includes('gstatic.com') || url.includes('googleapis.com') || url.includes('firebaseio.com') || url.includes('metered.ca') || url.startsWith('chrome-extension')) return;
  if (!url.startsWith(self.location.origin) && !url.startsWith('http')) return;
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const rc = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, rc).catch(() => {}));
      }
      return res;
    }).catch(() => caches.match(req).then((cached) => {
      if (cached) return cached;
      if (req.destination === 'document' || req.mode === 'navigate') return caches.match('./index.html');
      return new Response('Offline', { status: 503 });
    }))
  );
});
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'GET_VERSION') event.ports[0].postMessage({ version: CACHE_VERSION });
});
console.log('[SW] loaded v' + CACHE_VERSION);
