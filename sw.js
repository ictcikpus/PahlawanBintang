// ============================================================
// PAHLAWAN BINTANG — sw.js v20.9.1
// Service Worker — Cache Manager
// ------------------------------------------------------------
// WAJIB BUMP CACHE_NAME setiap kali ada file yang berubah!
// Cara: v20.9 → v20.9.1 → v20.9.2 → dst.
// ============================================================

const CACHE_NAME = 'pahlawan-bintang-v20.9.1';
const CACHE_VERSION = '20.9.1';

// File yang harus di-cache saat install
const CORE_FILES = [
  './',
  './index.html',
  './style.css?v=20.9.1',
  './game.js?v=20.9.1',
  './multiplayer.js?v=20.9',
  './achievements.json',
  './levels.json',
  './manifest.json'
];

// ------------------------------------------------------------
// INSTALL — cache core files
// ------------------------------------------------------------
self.addEventListener('install', (event) => {
  console.log('[SW] Install v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core files');
        // Gunakan addAll dengan error handling per file
        return Promise.all(
          CORE_FILES.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Failed to cache:', url, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Install complete, activating...');
        return self.skipWaiting();
      })
  );
});

// ------------------------------------------------------------
// ACTIVATE — hapus cache lama
// ------------------------------------------------------------
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v' + CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// ------------------------------------------------------------
// FETCH — Network First (bisa offline), fallback ke cache
// Strategi: Network first → jika offline / gagal, ambil dari cache
// ------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Skip non-GET
  if (req.method !== 'GET') return;

  // Skip Firebase, Google Fonts, external API (biarkan langsung)
  const url = req.url;
  if (
    url.includes('firebase') ||
    url.includes('gstatic.com') ||
    url.includes('googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('metered.ca') ||
    url.startsWith('chrome-extension')
  ) {
    return;
  }

  // Skip cross-origin non-cache
  if (!url.startsWith(self.location.origin) && !url.startsWith('http')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Simpan ke cache jika response OK
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone).catch(() => {});
          });
        }
        return res;
      })
      .catch(() => {
        // Offline / network error → ambil dari cache
        return caches.match(req).then((cached) => {
          if (cached) {
            console.log('[SW] Serving from cache (offline):', url);
            return cached;
          }
          // Fallback khusus HTML → index.html
          if (req.destination === 'document' || req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // Fallback terakhir: response kosong
          return new Response('Offline — resource tidak tersedia', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// ------------------------------------------------------------
// MESSAGE — handle skipWaiting dari client
// ------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service Worker loaded v' + CACHE_VERSION);
