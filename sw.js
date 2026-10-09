// ============================================================
// PAHLAWAN BINTANG — Service Worker v20.8
// ============================================================

const CACHE_VERSION = 'v20.8';
const CACHE_NAME = `pahlawan-bintang-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  './',
  './index.html?v=20.8',
  './style.css?v=20.8',
  './multiplayer.js?v=20.8',
  './game.js?v=20.8',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const DATA_ASSETS = [
  './levels.json?v=20.8',
  './achievements.json?v=20.8'
];

const BYPASS_HOSTS = [
  'firebaseio.com',
  'firebasedatabase.app',
  'googleapis.com',
  'gstatic.com',
  'firebaseapp.com',
  'firebase.google.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(PRECACHE_ASSETS.map(async (url) => {
        try {
          const req = new Request(url, { cache: 'reload' });
          const res = await fetch(req);
          if (res && res.ok) await cache.put(url, res.clone());
        } catch (e) {
          console.warn('[SW] Precache miss:', url);
        }
      }));
      await Promise.all(DATA_ASSETS.map(async (url) => {
        try {
          const req = new Request(url, { cache: 'reload' });
          const res = await fetch(req);
          if (res && res.ok) await cache.put(url, res.clone());
        } catch (e) {}
      }));
      console.log('[SW] Install complete — cache:', CACHE_NAME);
    } catch (e) {
      console.warn('[SW] Install error:', e);
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (e) {}
      }
      await self.clients.claim();
      console.log('[SW] Activate complete — old caches cleared');
    } catch (e) {
      console.warn('[SW] Activate error:', e);
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) return;

  if (BYPASS_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }

  if (url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const indexCached = await caches.match('./index.html?v=20.8') ||
                        await caches.match('./index.html');
    if (indexCached) return indexCached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request, { ignoreSearch: false });
    if (cached) return cached;
    const res = await fetch(request);
    if (res && res.ok && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  } catch (e) {
    const fallback = await caches.match(request, { ignoreSearch: true });
    if (fallback) return fallback;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request).then((res) => {
    if (res && res.ok && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  }).catch(() => null);
  return cached || networkPromise || new Response('{}', {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => {
          if (event.source && event.source.postMessage) {
            event.source.postMessage({ type: 'CACHE_CLEARED' });
          }
        })
    );
    return;
  }
  if (data.type === 'GET_VERSION') {
    if (event.source && event.source.postMessage) {
      event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
    }
    return;
  }
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Pahlawan Bintang', body: 'Ada misi baru!' };
  try { if (event.data) payload = Object.assign(payload, event.data.json()); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: './icon-192.png',
      badge: './icon-192.png'
    }).catch(() => {})
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) if ('focus' in client) return client.focus();
    if (self.clients.openWindow) return self.clients.openWindow('./');
  })());
});

console.log('[SW] Service Worker loaded —', CACHE_VERSION);
