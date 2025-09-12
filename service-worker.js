// Robust SW for GitHub Pages (works under /<repo>/ scope)
const VERSION = 'v1.1.1';
const CACHE = 'wa-reminders-' + VERSION;

const base = self.registration.scope; // e.g., https://user.github.io/repo/
const abs = (p) => new URL(p, base).toString();

const ASSETS = [
  abs('./'),
  abs('index.html'),
  abs('manifest.webmanifest'),
  abs('icons/icon-192.png'),
  abs('icons/icon-512.png'),
  abs('icons/maskable-512.png')
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Network-first for navigations; cache-first for same-origin static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Handle only same-origin requests within our scope
  if (url.origin !== location.origin || url.href.indexOf(base) !== 0) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(abs('./'), fresh.clone());
        cache.put(abs('index.html'), fresh.clone());
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE);
        return (await cache.match(abs('./'))) || (await cache.match(abs('index.html'))) || Response.error();
      }
    })());
    return;
  }

  // Static assets: cache-first
  if (ASSETS.indexOf(url.href) !== -1) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      cache.put(req, fresh.clone());
      return fresh;
    })());
  }
});
