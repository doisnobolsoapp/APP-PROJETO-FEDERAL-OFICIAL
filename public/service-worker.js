const CACHE_NAME = "pf-app-v3";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativado");

  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// 🔥 FETCH CORRIGIDO (NETWORK FIRST PRA HTML)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ignora externos
  if (!req.url.startsWith(self.location.origin)) return;

  // 🔥 HTML → sempre tenta rede primeiro
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", clone);
          });
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 🔥 outros arquivos → cache first
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });
          return res;
        })
      );
    })
  );
});
