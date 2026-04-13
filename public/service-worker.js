const CACHE_NAME = "pf-app-v2";

// ✅ SOMENTE arquivos que EXISTEM no build
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[SW] Cacheando arquivos essenciais");

      // 🔥 CORREÇÃO: não quebra se algum falhar
      await Promise.all(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url);

            if (!response.ok) throw new Error("Erro no fetch");

            await cache.put(url, response);
          } catch (err) {
            console.warn("[SW] Ignorado:", url);
          }
        })
      );
    })
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativado");

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[SW] Deletando cache antigo:", cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {

  // 🔥 IGNORA APIs externas (Gemini, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {

          // Só cacheia GET válido
          if (
            !response ||
            response.status !== 200 ||
            event.request.method !== "GET"
          ) {
            return response;
          }

          const clone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });

          return response;
        })
        .catch(() => {
          // fallback SPA
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
