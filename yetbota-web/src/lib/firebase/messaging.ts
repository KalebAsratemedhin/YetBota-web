// Client-only FCM web-push helpers. All functions are safe to call when Firebase
// is unconfigured or the browser lacks push support — they resolve to null.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging";
import { firebaseConfig, firebaseVapidKey, isFirebaseConfigured } from "@/lib/firebase/config";

const SW_URL = "/firebase-messaging-sw.js";

function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let messagingPromise: Promise<Messaging | null> | null = null;

// Resolves to a Messaging instance, or null when unconfigured / unsupported
// (e.g. SSR, Safari without the right flags, no service-worker support).
export function getMessagingIfSupported(): Promise<Messaging | null> {
  if (messagingPromise) return messagingPromise;
  messagingPromise = (async () => {
    if (typeof window === "undefined") return null;
    if (!isFirebaseConfigured()) {
      console.warn("[push] Firebase not configured (missing env vars / VAPID key) — push disabled.");
      return null;
    }
    try {
      if (!(await isSupported())) {
        console.warn("[push] FCM not supported in this browser.");
        return null;
      }
      return getMessaging(getFirebaseApp());
    } catch (err) {
      console.error("[push] messaging init failed:", err);
      return null;
    }
  })();
  return messagingPromise;
}

// Register (or reuse) the background service worker, passing the public config
// via query string so the SW can initialize itself without hardcoded creds.
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
  return navigator.serviceWorker.register(`${SW_URL}?${params.toString()}`);
}

// Requests notification permission (if not already decided) and returns the FCM
// registration token, or null if denied/unsupported. Only call from a user
// gesture the first time, since it may prompt.
export async function requestAndGetFcmToken(): Promise<string | null> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;
  if (typeof Notification === "undefined") return null;

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    console.warn("[push] notification permission not granted:", permission);
    return null;
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      console.error("[push] service worker registration failed (no secure context / unsupported).");
      return null;
    }
    // Make sure the SW is active before requesting a token.
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) {
      console.error("[push] getToken returned empty token.");
      return null;
    }
    return token;
  } catch (err) {
    // Firebase errors carry a `.code` like "messaging/token-subscribe-failed".
    const code = (err as { code?: string })?.code;
    console.error(`[push] getToken failed${code ? ` (${code})` : ""}:`, err);
    return null;
  }
}

// Returns the token only if permission is ALREADY granted — never prompts.
// Use on app load to silently refresh a previously-granted token.
export async function getFcmTokenIfPermitted(): Promise<string | null> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return null;
  return requestAndGetFcmToken();
}

// Subscribe to messages received while the app is in the foreground.
export async function onForegroundMessage(
  cb: (payload: MessagePayload) => void
): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
