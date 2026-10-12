"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getMusicEnabled, getMusicEnabledServer, subscribeMusic, toggleMusic } from "@/lib/music";

/** 頂部列的背景音樂開關 */
export function MusicToggle() {
  const on = useSyncExternalStore(subscribeMusic, getMusicEnabled, getMusicEnabledServer);
  const Icon = on ? Volume2 : VolumeX;

  return (
    <button
      type="button"
      className={`inline-flex size-11 items-center justify-center transition-colors ${
        on ? "text-gold-bright" : "text-muted hover:text-gold"
      }`}
      aria-label={on ? "關閉背景音樂" : "播放背景音樂"}
      aria-pressed={on}
      title={on ? "關閉背景音樂" : "播放背景音樂"}
      onClick={toggleMusic}
    >
      <Icon size={22} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
