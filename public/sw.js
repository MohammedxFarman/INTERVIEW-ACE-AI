/**
 * InterviewAce AI Service Worker for Offline Accompanying Support
 * Handles pre-caching of app layout/shell, dynamic caching of static compiled assets,
 * and persistent fallback support for playground code challenges and visualizers.
 */

const CACHE_NAME = "interviewace-core-v1";
const DYNAMIC_CACHE_NAME = "interviewace-dynamic-v1";
const API_CACHE_NAME = "interviewace-api-v1";

// Simple core shell paths to prioritize for instant loading
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/index.css"
];

// Install Event - Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching Core Shell...");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (
            cache !== CACHE_NAME &&
            cache !== DYNAMIC_CACHE_NAME &&
            cache !== API_CACHE_NAME
          ) {
            console.log(`[Service Worker] Pruning Stale Cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Core routing caching strategy
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Bypass API requests that mutate state
  if (
    event.request.method !== "GET" &&
    !requestUrl.pathname.includes("/api/playground/import-problem")
  ) {
    return;
  }

  // 1. API Caching Strategy (Network-First, with instant Offline Fallback)
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, update API cache
          if (response && response.status === 200) {
            const responseCopy = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseCopy);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network is unreachable
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback JSON for offline requests
            if (requestUrl.pathname.includes("/api/playground/autosave")) {
              return new Response(
                JSON.stringify({ code: "", language: "javascript" }),
                { headers: { "Content-Type": "application/json" } }
              );
            }
            return new Response(
              JSON.stringify({
                error: "You are currently offline. This action requires an active network connection.",
                offline: true
              }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // 2. Static Assets & Pages Caching Strategy (Stale-While-Revalidate / Cache-First fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            /* Suppress background update error when offline */
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in dynamic cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is for a layout page, serve index
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
