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
            console.log("NOVA app अभी installed नहीं है।");
            return;
        }

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission नहीं मिली।");
            return;
        }

        const registration =
    await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
            scope: "/"
        }
    );

await navigator.serviceWorker.ready;

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

setupSellerPushNotifications();
messaging.onMessage((payload) => {

    console.log("FCM foreground message received:", payload);

    const title =
        payload.notification?.title || "NOVA";

    const body =
        payload.notification?.body || "New notification";

    if (Notification.permission === "granted") {

        new Notification(title, {
            body: body,
            icon: "/favicon.ico"
        });

    }

});