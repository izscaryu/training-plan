// Offline support: network first for the site's own files, cached copy when the gym has no signal.
// Requests to other origins (GitHub API for sync) are never cached.
const VERSION = 'tp-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/js/app.js',
  './assets/js/calc.js',
  './assets/js/charts.js',
  './assets/js/content.js',
  './assets/js/md.js',
  './assets/js/model.js',
  './assets/js/plan.js',
  './assets/js/store.js',
  './assets/js/ui.js',
  './assets/js/view-log.js',
  './assets/js/view-plan.js',
  './assets/js/view-progress.js',
  './assets/js/view-settings.js',
  './assets/js/view-today.js',
  './assets/fonts/archivo-latin-wdth-normal.woff2',
  './assets/fonts/archivo-latin-ext-wdth-normal.woff2',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))),
  );
});
