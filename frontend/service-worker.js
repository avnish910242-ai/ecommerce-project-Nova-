
const CACHE_NAME = "nova-v4";

// ==========================================
// BASE PATH
// Local:   /frontend/
// Deployed: /
// ==========================================

const BASE_PATH = new URL(".", self.location.href).pathname;

const FILES_TO_CACHE = [
    BASE_PATH,
    `${BASE_PATH}index.html`,
    `${BASE_PATH}style.css`,
    `${BASE_PATH}script.js`
];

// ==========================================
// FIREBASE MESSAGING
// ==========================================

importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyAV2BH5auPh4RJeyU_dqp-YOG_2JtXKaxo",
    authDomain: "sheshop99.firebaseapp.com",
    projectId: "sheshop99",
    storageBucket: "sheshop99.firebasestorage.app",
    messagingSenderId: "172487693630",
    appId: "1:172487693630:web:93be7d1a29f9f1ea5ac86f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

    console.log("Background notification received:", payload);

    // Notification payload ko Firebase SDK handle karne de.
    if (payload.notification) {
        return;
    }

    // Data-only payload ke liye notification.
    const data = payload.data || {};

    const notificationTitle = data.title || "SEASHOP";
const notificationOptions = {
    body: data.body || "New order received",
    icon: "/frontend/svg/seashop.svg",
    badge: "/frontend/svg/seashop.svg"
};
   

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

// ==========================================
// INSTALL AND CACHE
// ==========================================

self.addEventListener("install", event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );

});

// ==========================================
// ACTIVATE
// ==========================================

self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.map(key => {
                    // Sirf NOVA ke purane caches delete karo.
                    if (
                        key.startsWith("nova-") &&
                        key !== CACHE_NAME
                    ) {
                        return caches.delete(key);
                    }
                })
            ))
            .then(() => self.clients.claim())
    );

});

// ==========================================
// NETWORK + OFFLINE CACHE
// ==========================================

self.addEventListener("fetch", event => {

    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const requestURL = new URL(request.url);

    // Sirf isi website ki requests handle karo.
    if (requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then(response => {

                // Sirf successful responses cache karo.
                if (response.ok) {
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, responseClone))
                        .catch(error => {
                            console.error("Cache save failed:", error);
                        });
                }

                return response;
            })
            .catch(async () => {

                const cachedResponse = await caches.match(request);

                if (cachedResponse) {
                    return cachedResponse;
                }

                // Offline page fallback.
                if (request.mode === "navigate") {
                    const offlinePage = await caches.match(
                        `${BASE_PATH}index.html`
                    );

                    if (offlinePage) {
                        return offlinePage;
                    }
                }

                return new Response(
                    "Internet connection nahi hai aur yeh file offline available nahi hai.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type": "text/plain; charset=utf-8"
                        }
                    }
                );
            })
    );

});
