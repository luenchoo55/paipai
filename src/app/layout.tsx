import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { MusicRouteGuard } from "@/components/music/MusicRouteGuard";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

// 中文字體檔很大，Google Fonts 會切成多段按需載入，因此不預載
const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["600", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paipai 參拜小幫手",
  description: "出門前寫下問事清單，在廟裡一步步請示，回家後留下參拜紀錄。",
  applicationName: "Paipai",
  appleWebApp: { capable: true, title: "Paipai", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#1a100d",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${notoSans.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <ServiceWorkerRegister />
        <MusicRouteGuard />
      </body>
    </html>
  );
}
