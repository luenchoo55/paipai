"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { getMusicServerState, getMusicState, setMusicVolume, subscribeMusic, toggleMusic } from "@/lib/music";

/** 背景音樂：喇叭按鈕打開小面板，可播放／暫停、調整音量 */
export function MusicToggle({ className = "" }: { className?: string }) {
  const { enabled, volume } = useSyncExternalStore(subscribeMusic, getMusicState, getMusicServerState);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const sliderId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Icon = !enabled || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const percent = Math.round(volume * 100);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className={`inline-flex size-11 items-center justify-center transition-colors ${
          enabled ? "text-gold-bright" : "text-muted hover:text-gold"
        }`}
        aria-label={`背景音樂（${enabled ? "播放中" : "已關閉"}）`}
        aria-expanded={open}
        aria-controls={panelId}
        title="背景音樂"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon size={22} strokeWidth={1.5} aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-frame border border-line bg-surface p-4 text-ink shadow-xl shadow-black/40"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif tracking-widest text-gold">背景音樂</p>
            <button
              type="button"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-frame border px-3 text-sm tracking-widest transition-colors ${
                enabled
                  ? "border-gold bg-gold text-ground"
                  : "border-line text-ink hover:border-gold hover:text-gold-bright"
              }`}
              aria-pressed={enabled}
              onClick={toggleMusic}
            >
              {enabled ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
              {enabled ? "暫停" : "播放"}
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-muted">
              <label htmlFor={sliderId}>音量</label>
              <span aria-hidden>{percent}%</span>
            </div>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={100}
              step={5}
              value={percent}
              aria-valuetext={`${percent}%`}
              onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              className="h-11 w-full cursor-pointer accent-gold"
            />
          </div>
        </div>
      )}
    </div>
  );
}
