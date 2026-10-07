// ============================================================
// PAHLAWAN BINTANG — Service Worker v18.2
// Strategy:
//   - App shell (HTML/CSS/JS lokal) → Cache First (offline ready)
//   - JSON data (levels/stickers) → Stale-While-Revalidate
//   - Firebase & Google Fonts → Network Only (jangan di-cache)
//   - Fallback ke cache kalau network gagal
// ============================================================

const CACHE_VERSION = 'v20.3';
const CACHE_NAME = `pahlawan-bintang-${CACHE_VERSION}`;

// Daftar asset yang wajib tersedia offline
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css?v=20.3',
  './multiplayer.js?v=20.2',
  './game.js?v=20.3',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Asset data yang sering berubah (pakai SWR)
const DATA_ASSETS = [
  './levels.json?v=18.0',
  './achievements.json?v=20.0'
];

// Domain yang HARUS bypass cache (jangan pernah di-cache)
const BYPASS_HOSTS = [
  'firebaseio.com',
  'firebasedatabase.app',
  'googleapis.com',
  'gstatic.com',
  'firebaseapp.com',
  'firebase.google.com'
];

// ============================================================
// INSTALL — Precache app shell
// ============================================================
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Cache satu per satu agar kalau salah satu gagal, sisanya tetap masuk
        await Promise.all(
          PRECACHE_ASSETS.map(async (url) => {
            try {
              const req = new Request(url, { cache: 'reload' });
              const res = await fetch(req);
              if (res && res.ok) {
                await cache.put(url, res.clone());
              }
            } catch (e) {
              console.warn('[SW] Precache miss:', url, e);
            }
          })
        );
        // Data assets — silent fail (tidak wajib)
        await Promise.all(
          DATA_ASSETS.map(async (url) => {
            try {
              const req = new Request(url, { cache: 'reload' });
              const res = await fetch(req);
              if (res && res.ok) {
                await cache.put(url, res.clone());
              }
            } catch (e) {}
          })
        );
        console.log('[SW] Install complete — cache:', CACHE_NAME);
      } catch (e) {
        console.warn('[SW] Install error:', e);
      }
    })()
  );
});

// ============================================================
// ACTIVATE — Hapus cache lama
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        );
        // Enable navigation preload kalau didukung
        if (self.registration.navigationPreload) {
          try { await self.registration.navigationPreload.enable(); } catch (e) {}
        }
        await self.clients.claim();
        console.log('[SW] Activate complete — old caches cleared');
      } catch (e) {
        console.warn('[SW] Activate error:', e);
      }
    })()
  );
});

// ============================================================
// FETCH — Routing strategy
// ============================================================
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Hanya handle GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip: cross-origin non-GET, browser extension, dsb.
  if (!url.protocol.startsWith('http')) return;

  // 1) BYPASS — Firebase, Google Fonts, dsb. (network only)
  if (BYPASS_HOSTS.some((host) => url.hostname.includes(host))) {
    event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }

  // 2) Cross-origin lain → network only
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }

  // 3) Data JSON (levels, stickers) → Stale-While-Revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 4) HTML navigation → Network First, fallback ke cache
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 5) Asset statis (CSS/JS/PNG/SVG) → Cache First, fallback ke network
  event.respondWith(cacheFirst(req));
});

// ============================================================
// STRATEGY IMPLEMENTATIONS
// ============================================================

/**
 * Cache First — untuk asset statis (CSS/JS/gambar)
 * Cek cache dulu; kalau tidak ada, fetch network & simpan.
 */
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
    // Offline & tidak ada di cache → coba ignoreSearch
    const fallback = await caches.match(request, { ignoreSearch: true });
    if (fallback) return fallback;
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

/**
 * Network First — untuk HTML navigation (biar selalu fresh)
 * Fallback ke cache kalau offline.
 */
async function networkFirst(request) {
  try {
    // Navigation Preload (Chrome)
    if (self.registration.navigationPreload) {
      try {
        const preloadRes = await event?.preloadResponse?.catch?.(() => null);
        // (event tidak tersedia di sini — tetap lanjut fetch biasa)
      } catch (e) {}
    }

    const res = await fetch(request);
    if (res && res.ok && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback ke index.html (SPA style)
    const indexCached = await caches.match('./index.html');
    if (indexCached) return indexCached;

    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/**
 * Stale-While-Revalidate — untuk data JSON
 * Kembalikan cache dulu, lalu update di background.
 */
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

// ============================================================
// MESSAGE — Komunikasi dari halaman
// ============================================================
self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(keys.map((k) => caches.delete(k)))
      ).then(() => {
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

// ============================================================
// PUSH & NOTIFICATION (opsional, biar siap kalau nanti dipakai)
// ============================================================
self.addEventListener('push', (event) => {
  let payload = { title: 'Pahlawan Bintang', body: 'Ada misi baru!' };
  try {
    if (event.data) payload = Object.assign(payload, event.data.json());
  } catch (e) {}

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
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./');
      }
    })()
  );
});

console.log('[SW] Service Worker loaded —', CACHE_VERSION);
