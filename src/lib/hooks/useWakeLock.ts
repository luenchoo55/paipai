"use client";

import { useEffect, useState } from "react";

export type WakeLockStatus = "pending" | "active" | "unsupported";

/**
 * 參拜時避免螢幕自動關閉。切到別的 App 再回來時，瀏覽器會自動釋放，需要重新申請。
 * Wake Lock 只在 HTTPS 或 localhost 可用；用區網 IP 連開發伺服器時會是 unsupported。
 */
export function useWakeLock(): WakeLockStatus {
  const [status, setStatus] = useState<WakeLockStatus>("pending");

  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      // 放到下一輪事件，避免在 effect 中同步觸發重新渲染
      queueMicrotask(() => setStatus("unsupported"));
      return;
    }
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const s = await navigator.wakeLock.request("screen");
        if (cancelled) return void s.release();
        sentinel = s;
        setStatus("active");
      } catch {
        setStatus("unsupported");
      }
    };

    const onVisible = () => document.visibilityState === "visible" && request();

    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release();
    };
  }, []);

  return status;
}
