/* Firebase Cloud Messaging background service worker.
 *
 * Config is passed via the registration URL's query string (all public values),
 * so there are no hardcoded credentials here. See src/lib/firebase/messaging.ts
 * (registerServiceWorker) for how it's registered.
 */
/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || "",
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || "",
};

if (firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Show a notification for data-only messages. (Messages that include a
  // `notification` block are auto-displayed by the browser, so we skip those to
  // avoid duplicates.)
  messaging.onBackgroundMessage((payload) => {
    if (payload.notification) return;
    const data = payload.data || {};
    const title = data.title || "Yet Bota";
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/images/logo.jpg",
      data,
    });
  });
}

// Focus or open the app when a notification is clicked.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.link) || "/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
