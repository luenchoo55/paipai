"use client";

import { useEffect } from "react";

/** 只在正式版註冊 service worker；開發模式下快取會干擾熱更新 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch((err) => {
      console.warn("離線功能啟用失敗", err);
    });
  }, []);
  return null;
}
