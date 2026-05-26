// Firebase web config — all values are public (they ship in the client bundle).
// Populate via .env.local; see .env.example for the full list.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Web Push certificate public key (Cloud Messaging → Web Push certificates).
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

// True only when the essential fields are present. Used to no-op the whole push
// path when the project isn't configured (e.g. local dev without creds), so the
// app still builds and runs.
export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      firebaseVapidKey
  );
}
