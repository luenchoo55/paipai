import { X } from "lucide-react";
import { MusicToggle } from "@/components/music/MusicToggle";
import { IconLink } from "@/components/ui/IconButton";

/** 頂部：關閉、題號、分段進度條（完成金色、目前朱紅、未開始暗色）、背景音樂 */
export function VisitProgress({ index, total }: { index: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <IconLink href="/" label="暫停參拜，回到問事清單（進度會保留）" className="border-night-surface text-gold/80">
        <X size={22} strokeWidth={1.5} aria-hidden />
      </IconLink>
      <div className="flex-1">
        <p className="mb-1.5 text-sm tracking-widest text-night-text/80">
          問題 {index + 1} / {total}
        </p>
        <div
          role="progressbar"
          aria-label="參拜進度"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={index + 1}
          className="flex gap-1"
        >
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < index ? "bg-gold" : i === index ? "bg-vermilion" : "bg-night-surface"
              }`}
            />
          ))}
        </div>
      </div>
      <MusicToggle className="-mr-2" />
    </div>
  );
}
