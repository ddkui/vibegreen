// App assets are cache-first within each release; documents remain network-first.
const CACHE_NAME = 'greenluzern-v10';
const PRECACHE = ['/', '/index.html', '/about.html', '/privacy.html', '/style.css', '/guide.css', '/pages.css', '/app.js', '/routing.js', '/navigation.js', '/map-loader.js', '/landing-motion.js', '/data.js', '/logo.png', '/manifest.json'];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
    self.skipWaiting();
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('greenluzern-') && key !== CACHE_NAME).map(key => caches.delete(key)))));
    self.clients.claim();
});
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method !== 'GET' || url.origin !== self.location.origin || !PRECACHE.includes(url.pathname)) return;
    const isDocument = event.request.mode === 'navigate' || /(?:\/|\.html)$/.test(url.pathname);
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url.pathname);
        if (!isDocument && cached) return cached;
        try {
            const response = await fetch(event.request);
            if (response.ok) await cache.put(url.pathname, response.clone());
            return response;
        } catch {
            return cached || new Response('This page is unavailable offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        }
    })());
});
