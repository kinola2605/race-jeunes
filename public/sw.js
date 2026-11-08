// Service worker minimal (FR-160) : ressources statiques en cache, page hors ligne.
// Les pages, l'API et toute réponse authentifiée ne sont JAMAIS mises en cache :
// seules les ressources statiques publiques ci-dessous le sont, et seulement si la réponse est cachable.
const CACHE = "race-v1.2.0";
const STATIC = ["/hors-ligne", "/icon.svg", "/fonts/poppins-latin-400.woff2", "/fonts/poppins-latin-500.woff2", "/fonts/poppins-latin-600.woff2", "/fonts/poppins-latin-700.woff2"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // réseau uniquement, jamais de cache
  if (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/logo/") || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (cacheable(res)) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/hors-ligne")));
  }
});

/** Réponse statique réussie, de même origine, sans directive l'interdisant. */
function cacheable(res) {
  const cc = res.headers.get("Cache-Control") || "";
  return res.ok && res.type === "basic" && !/no-store|private/i.test(cc);
}
