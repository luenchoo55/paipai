"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";

/** 籤詩照片縮圖，點開看大圖 */
export function FortunePhoto({ photo, number }: { photo: Blob; number?: number }) {
  const [url, setUrl] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const u = URL.createObjectURL(photo);
    queueMicrotask(() => setUrl(u));
    return () => URL.revokeObjectURL(u);
  }, [photo]);

  if (!url) return null;
  const label = number !== undefined ? `籤詩第 ${number} 首` : "籤詩";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`看${label}照片`}
        className="block overflow-hidden rounded-frame border border-line"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 本機 blob，不經圖片最佳化 */}
        <img src={url} alt="" className="h-16 w-auto" />
      </button>
      {open && (
        <Dialog open onClose={() => setOpen(false)} title={label}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 本機 blob，不經圖片最佳化 */}
          <img src={url} alt={`${label}照片`} className="w-full rounded-frame" />
        </Dialog>
      )}
    </>
  );
}
