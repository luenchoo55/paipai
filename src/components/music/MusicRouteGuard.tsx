"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { setMusicSuspended } from "@/lib/music";

/** 參拜模式在廟裡使用，背景音樂先暫停；離開後自動續播 */
export function MusicRouteGuard() {
  const pathname = usePathname();
  useEffect(() => {
    setMusicSuspended(pathname.startsWith("/visit"));
  }, [pathname]);
  return null;
}
