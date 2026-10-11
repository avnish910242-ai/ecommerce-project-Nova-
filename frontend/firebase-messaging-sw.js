
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyAV2BH5auPh4RJeyU_dqp-YOG_2JtXKaxo",
    authDomain: "sheshop99.firebaseapp.com",
    projectId: "sheshop99",
    storageBucket: "sheshop99.firebasestorage.app",
    messagingSenderId: "172487693630",
    appId: "1:172487693630:web:93be7d1a29f9f1ea5ac86f"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    const data = payload.data || {};

    const title = payload.notification?.title || "SEASHOP";

    const options = {
        body: payload.notification?.body ||
            (data.productPrice ? "Price: ₹" + data.productPrice : "New product available!"),
        icon: "/images/log.png",
        badge: "/images/log.png",
        image: data.productImage || undefined,
        data: {
            productUrl: data.productUrl || "/"
        }
    };

    if (!payload.notification) {
        return self.registration.showNotification(title, options);
    }
});

self.addEventListener("notificationclick", function(event) {
    event.notification.close();

    const productUrl = event.notification.data?.productUrl || "/";

    event.waitUntil(
        clients.openWindow(productUrl)
    );
});
