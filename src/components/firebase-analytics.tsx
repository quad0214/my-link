"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

export function FirebaseAnalytics() {
  useEffect(() => {
    getFirebaseAnalytics().catch((error: unknown) => {
      console.warn("Firebase Analytics initialization failed:", error);
    });
  }, []);

  return null;
}
