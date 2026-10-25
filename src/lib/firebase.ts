import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

for (const key of ["apiKey", "projectId", "appId"] as const) {
  if (!firebaseConfig[key]) {
    throw new Error(
      `Missing Firebase configuration: ${key}. Check your NEXT_PUBLIC_FIREBASE_* environment variables.`,
    );
  }
}

// Reuse the default app during development hot reloads.
export const app = getApps().some((app) => app.name === "[DEFAULT]")
  ? getApp()
  : initializeApp(firebaseConfig);

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) {
    return null;
  }

  const { getAnalytics, isSupported } = await import("firebase/analytics");

  return (await isSupported()) ? getAnalytics(app) : null;
}
