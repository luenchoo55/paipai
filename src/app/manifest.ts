import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paipai 參拜小幫手",
    short_name: "Paipai",
    description: "出門前寫下問事清單，在廟裡一步步請示，回家後留下參拜紀錄。",
    lang: "zh-Hant-TW",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a100d",
    theme_color: "#1a100d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "參拜模式", url: "/visit", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "參拜紀錄", url: "/records", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
