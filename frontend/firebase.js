// ==========================================
// NOVA - FIREBASE PUSH NOTIFICATION
// ==========================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyAV2BH5auPh4RJeyU_dqp-YOG_2JtXKaxo",
    authDomain: "sheshop99.firebaseapp.com",
    projectId: "sheshop99",
    storageBucket: "sheshop99.firebasestorage.app",
    messagingSenderId: "172487693630",
    appId: "1:172487693630:web:93be7d1a29f9f1ea5ac86f",
    measurementId: "G-1XNWR1SMBQ"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const messaging = firebase.messaging();

async function setupSellerPushNotifications() {

    try {

        const savedUser = localStorage.getItem("novaUser");

        if (!savedUser) {
            return;
        }

        const user = JSON.parse(savedUser);

        // केवल seller के लिए

if (!Array.isArray(user.roles) || !user.roles.includes("seller")) {
    return;
}

        // केवल installed app के लिए
        const isInstalled =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;

        if (!isInstalled) {
            console.log("SEASHOP app is not install.");
            return;
        }
const registration = await navigator.serviceWorker.ready;

        const token = await messaging.getToken({
            vapidKey:
                "BGHzGmyuOqEbzfeddcNAx1fa38qlGkXOM_FUdQEK1q4GPI78pkl1M6lxMot50FQLzYiczphVwY5mXQlHIUURrl0",

            serviceWorkerRegistration: registration
        });

        if (!token) {
            console.log("FCM token नहीं मिला।");
            return;
        }

        console.log("Seller FCM Token:", token);
        await fetch(
    "https://nova-backend-7i1l.onrender.com/api/seller/fcm-token",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: user.email,
            token: token
        })
    }
);

    } catch (error) {

        console.error(
            "Firebase notification setup error:",
            error
        );
    }
}

/* ==========================================
   SEASHOP CUSTOMER PUSH NOTIFICATIONS
   Browser + Installed PWA
========================================== */

async function enableCustomerPushNotifications() {
    try {
        const savedUser = localStorage.getItem("novaUser");

        if (!savedUser) {
            alert("Please login to SEASHOP first.");
            return;
        }

        const user = JSON.parse(savedUser);

        if (!user.email) {
            alert("User email not found. Please login again.");
            return;
        }

        if (
            !Array.isArray(user.roles) ||
            !user.roles.includes("customer")
        ) {
            alert("A customer account is required.");
            return;
        }

        if (!("Notification" in window)) {
            alert("This browser does not support notifications.");
            return;
        }

        if (!("serviceWorker" in navigator)) {
            alert("Service workers are not supported.");
            return;
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            alert("Notification permission was not granted.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;

        const token = await messaging.getToken({
            vapidKey:
                "BGHzGmyuOqEbzfeddcNAx1fa38qlGkXOM_FUdQEK1q4GPI78pkl1M6lxMot50FQLzYiczphVwY5mXQlHIUURrl0",
            serviceWorkerRegistration: registration
        });

        if (!token) {
            alert("Could not get the notification token.");
            return;
        }

        const response = await fetch(
            "https://nova-backend-7i1l.onrender.com/api/customer/fcm-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: user.email,
                    token: token
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Could not register notifications."
            );
        }

        alert("SEASHOP notifications enabled successfully!");

    } catch (error) {
        console.error(
            "Customer notification setup error:",
            error
        );

        alert("Could not enable notifications. Please try again.");
    }
}


setupSellerPushNotifications();


messaging.onMessage(async (payload) => {
    console.log("SEASHOP foreground notification:", payload);

    try {
        const data = payload.data || {};
        const notification = payload.notification || {};

        const title =
            data.title ||
            notification.title ||
            "SEASHOP";

        const body =
            data.body ||
            notification.body ||
            "New notification";

        // Notification permission check
        if (Notification.permission !== "granted") {
            console.log("Notification permission not granted");
            return;
        }

        // Service Worker registration
        const registration = await navigator.serviceWorker.ready;

        // Product image (optional)
        const image =
            data.image ||
            notification.image ||
            undefined;

        // Click karne par khulne wala URL
        const targetUrl =
            data.url ||
            "/";

        // Show notification
        await registration.showNotification(title, {
            body: body,

            // SEASHOP logo
            icon: "/svg/seashop.svg",

            // Optional small status-bar icon
            badge: "/seashop-badge.png",

            // Product/banner image
            image: image,

            // Notification click data
            data: {
                url: targetUrl
            },

            // Android par notification ko group karne ke liye
            tag: "seashop-notification",

            // Nayi notification aane par purani ko replace na kare
            renotify: false
        });

        console.log("SEASHOP notification displayed");

    } catch (error) {
        console.error("SEASHOP notification error:", error);
    }
});

