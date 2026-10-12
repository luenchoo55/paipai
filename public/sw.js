/*
 * Paipai service worker：讓網站在沒有網路時也能打開，特別是參拜模式（廟裡常收訊不好）。
 *
 * - 安裝時預先快取各頁 HTML，以及 HTML 裡引用的 /_next/static 檔案（JS、CSS）
 * - 頁面：先連網路拿最新版，失敗才用快取（並把最新版存回快取）
 * - /_next/static：檔名含雜湊、內容不變，快取優先
 * - 其他同網域的 GET（圖片、字型、圖示）：先回快取、背景更新
 */

const VERSION = "v2";
const PAGE_CACHE = `paipai-pages-${VERSION}`;
const STATIC_CACHE = `paipai-static-${VERSION}`;
const ASSET_CACHE = `paipai-assets-${VERSION}`;
const CACHES = [PAGE_CACHE, STATIC_CACHE, ASSET_CACHE];

const PAGES = ["/", "/visit", "/records", "/settings"];
const EXTRA = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

/** 從 HTML 找出 /_next/static 的檔案網址 */
const staticUrls = (html) => [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) ?? [])];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGE_CACHE);
      const statics = await caches.open(STATIC_CACHE);
      const assets = new Set();
      for (const path of PAGES) {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) continue;
        const html = await res.clone().text();
        await pages.put(path, res);
        staticUrls(html).forEach((u) => assets.add(u));
      }
      await Promise.all([...assets].map((u) => statics.add(u).catch(() => undefined)));
      await caches.open(ASSET_CACHE).then((c) => c.addAll(EXTRA).catch(() => undefined));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("paipai-") && !CACHES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function networkFirstPage(request) {
  const url = new URL(request.url);
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) await cache.put(url.pathname, res.clone());
    return res;
  } catch {
    return (await cache.match(url.pathname)) ?? (await cache.match("/")) ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(ASSET_CACHE);
  const hit = await cache.match(event.request);
  const update = fetch(event.request)
    .then(async (res) => {
      if (res.ok) await cache.put(event.request, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (hit) {
    event.waitUntil(update);
    return hit;
  }
  return (await update) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // 站內換頁的 RSC 資料：不快取（內容依路由狀態而不同）。離線時失敗，Next.js 會改用整頁載入，再由下面的頁面快取接手
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
