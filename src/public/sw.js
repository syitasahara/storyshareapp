const CACHE_NAME = "shareyourstory-v2.1.0";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/styles/auth.css",
  "/styles/stories.css",
  "/styles/story-detail.css",
  "/styles/story-map.css",
  "/styles/create-story.css",
  "/styles/settings.css",
  "/styles/about.css",
  "/styles/responsive.css",
  "/scripts/index.js",
  "/scripts/app.js",
  "/scripts/data/api.js",
  "/scripts/utils/camera.js",
  "/scripts/utils/notification.js",
  "/scripts/utils/install-manager.js",
  "/scripts/utils/offline-storage.js",
  "/scripts/utils/indexedDB.js",
  "/scripts/utils/transition.js",
  "/scripts/utils/ui-helpers.js",
  "/scripts/routes/routes.js",
  "/scripts/routes/url-parser.js",
  "/scripts/pages/home-page.js",
  "/scripts/pages/auth/login-page.js",
  "/scripts/pages/auth/register-page.js",
  "/scripts/pages/stories/stories-page.js",
  "/scripts/pages/stories/story-detail-page.js",
  "/scripts/pages/story-map-page.js",
  "/scripts/pages/create-story-page.js",
  "/scripts/pages/settings-page.js",
  "/scripts/pages/about-page.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static assets termasuk JavaScript modules
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache, adding URLs...");
        return cache.addAll(urlsToCache).catch((error) => {
          console.log(
            "Cache addAll error (some files might be missing):",
            error
          );
          // Continue even if some files fail to cache
        });
      })
      .then(() => {
        console.log("All resources cached successfully");
        return self.skipWaiting();
      })
  );
});

// Enhanced fetch event dengan handling untuk JavaScript modules
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip Chrome extensions
  if (event.request.url.startsWith("chrome-extension://")) return;

  // Handle different types of requests
  if (
    event.request.destination === "script" ||
    event.request.url.includes(".js")
  ) {
    // JavaScript files - cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log("Serving from cache:", event.request.url);
          return response;
        }

        // Jika tidak ada di cache, fetch dari network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response
            if (networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Jika fetch gagal dan file JavaScript, coba berikan fallback
            if (event.request.url.includes(".js")) {
              return new Response(
                `console.log('Module ${event.request.url} failed to load'); export default {};`,
                { headers: { "Content-Type": "application/javascript" } }
              );
            }
          });
      })
    );
  } else if (event.request.url.includes("/v1/")) {
    // API requests - network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  } else {
    // Static assets - cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
    );
  }
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes("/v1/")) {
    // For API requests, try network first, then cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  } else {
    // For static assets, try cache first, then network
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
    );
  }
});

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || "Ada cerita baru yang menunggu untuk dibaca!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "story-notification",
    data: {
      url: data.url || "/#/stories",
    },
    actions: [
      {
        action: "view",
        title: "Lihat Cerita",
      },
      {
        action: "dismiss",
        title: "Tutup",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "ShareYourStory", options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  if (event.action === "view") {
    // Open the app to view stories
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || "/");
        }
      })
    );
  } else if (event.action === "dismiss") {
    // Notification dismissed, do nothing
    console.log("Notification dismissed");
  } else {
    // Default click behavior
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});

// Background sync for offline story submissions
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event);

  if (event.tag === "sync-stories") {
    event.waitUntil(syncOfflineStories());
  }
});

// Function to sync offline stories when back online
async function syncOfflineStories() {
  try {
    // Get offline stories from IndexedDB
    const db = await openDB();
    const stories = await getOfflineStories(db);

    for (const story of stories) {
      try {
        // Convert base64 photo back to file if needed
        let photoFile = story.photo;
        if (
          typeof story.photo === "string" &&
          story.photo.startsWith("data:")
        ) {
          photoFile = dataURLtoFile(story.photo, "offline-photo.jpg");
        }

        // Submit story to API
        const response = await fetch(`${self.location.origin}/v1/stories`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${story.token}`,
          },
          body: createFormData(
            story.description,
            photoFile,
            story.lat,
            story.lon
          ),
        });

        if (response.ok) {
          // Remove from offline storage on success
          await removeOfflineStory(db, story.id);
          console.log("Successfully synced story:", story.id);
        }
      } catch (error) {
        console.error("Error syncing story:", story.id, error);
      }
    }
  } catch (error) {
    console.error("Error in background sync:", error);
  }
}

// Helper functions for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ShareYourStoryDB", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getOfflineStories(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["outbox"], "readonly");
    const store = transaction.objectStore("outbox");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function removeOfflineStory(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["outbox"], "readwrite");
    const store = transaction.objectStore("outbox");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime });
}

function createFormData(description, photo, lat, lon) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);
  return formData;
}
