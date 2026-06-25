// Hiro PWA Service Worker — cache-first static, network-first navigation
// Version bump this string to force cache invalidation on deploy.
const CACHE_NAME = "hiro-v1";
const STATIC_EXTENSIONS = [".js", ".css", ".woff", ".woff2", ".ttf", ".svg", ".png", ".ico", ".webp"];

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

self.addEventListener("install", () => {
  // Activate immediately — don't wait for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete stale caches from previous versions.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept same-origin GET requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    // Cache-first: serve from cache, populate cache on miss.
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
  } else if (request.mode === "navigate") {
    // Network-first for HTML: fall back to cached root shell when offline.
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.match("/"))
          .then((cached) => cached ?? Response.error())
      )
    );
  }
  // All other requests: no interception — let the browser handle them normally.
});
