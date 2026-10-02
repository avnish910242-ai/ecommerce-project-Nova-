const CACHE_NAME = "nova-v2";

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

    console.log(
        "Background notification received:",
        payload
    );

    const notificationTitle =
        payload.notification?.title ||
        "NOVA";

    const notificationOptions = {

        body:
            payload.notification?.body ||
            "New order received",

        icon: "/images/log.png",

        badge: "/images/log.png"
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

// ==========================================
// NOVA CACHE
// ==========================================

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/images/log.png"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache =>
                cache.addAll(FILES_TO_CACHE)
            )
            .then(() =>
                self.skipWaiting()
            )

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                    })

                );

            })
            .then(() =>
                self.clients.claim()
            )

    );

});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)

            .then(response => {

                const responseClone =
                    response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                return response;

            })

            .catch(() => {

                return caches.match(
                    event.request
                )
                .then(cachedResponse => {

                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return caches.match(
                        "/index.html"
                    );

                });

            })

    );

});