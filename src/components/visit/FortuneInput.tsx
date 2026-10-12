"use client";

import { Camera, ScrollText, X } from "lucide-react";
import { useEffect, useState } from "react";

/** 選填：籤號與籤詩照片 */
export function FortuneInput({
  number,
  photo,
  onChange,
}: {
  number?: number;
  photo?: Blob;
  onChange: (next: { fortuneNumber?: number; fortunePhoto?: Blob }) => void;
}) {
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    queueMicrotask(() => setPreview(url));
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  return (
    <details className="group rounded-frame border border-night-surface" open={number !== undefined || Boolean(photo)}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 text-sm tracking-widest text-night-text/80 [&::-webkit-details-marker]:hidden">
        <ScrollText size={18} strokeWidth={1.5} aria-hidden />
        記錄籤詩（選填）
      </summary>
      <div className="flex flex-wrap items-center gap-3 px-4 pb-4">
        <label className="flex items-center gap-2 text-sm text-night-text/80">
          第
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={number ?? ""}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              onChange({ fortuneNumber: Number.isNaN(n) ? undefined : n, fortunePhoto: photo });
            }}
            className="min-h-11 w-20 rounded-frame border border-night-surface bg-night px-3 text-center text-[16px] text-night-text focus:border-gold focus:outline-none"
          />
          首
        </label>

        {photo && preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- 本機 blob 預覽，不經圖片最佳化 */}
            <img src={preview} alt="籤詩照片" className="h-20 w-auto rounded-frame border border-night-surface" />
            <button
              type="button"
              aria-label="移除籤詩照片"
              onClick={() => {
                setPreview(undefined);
                onChange({ fortuneNumber: number, fortunePhoto: undefined });
              }}
              className="absolute -right-3 -top-3 flex size-11 items-center justify-center"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-night-surface text-night-text">
                <X size={14} aria-hidden />
              </span>
            </button>
          </div>
        ) : (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-frame border border-night-surface px-4 text-sm text-night-text/80 has-focus-visible:outline-2 has-focus-visible:outline-gold-bright">
            <Camera size={18} strokeWidth={1.5} aria-hidden />
            拍籤詩
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ fortuneNumber: number, fortunePhoto: file });
              }}
            />
          </label>
        )}
      </div>
    </details>
  );
}
