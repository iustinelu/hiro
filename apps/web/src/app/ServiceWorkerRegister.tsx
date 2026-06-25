"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("[SW] Registration failed:", err));
      return;
    }

    // Development: a cache-first SW serves stale (non-hashed) dev chunks, which
    // breaks HMR and surfaces as "originalFactory is undefined". Make sure none
    // is active and purge any caches it left behind so dev self-heals.
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => void r.unregister());
    });
    if (typeof caches !== "undefined") {
      void caches.keys().then((keys) => keys.forEach((k) => void caches.delete(k)));
    }
  }, []);

  return null;
}
