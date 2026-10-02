// Green Luzern — Service Worker for offline support & PWA
const CACHE_NAME = 'greenluzern-v2';
const PRECACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/guide.css',
    '/app.js',
    '/data.js',
    '/logo.png',
    '/manifest.json'
];

// Install: pre-cache critical assets
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', e => {
    // Skip non-GET and cross-origin requests
    if (e.request.method !== 'GET') return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Cache successful same-origin responses
                if (res.ok && e.request.url.startsWith(self.location.origin)) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                }
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});
