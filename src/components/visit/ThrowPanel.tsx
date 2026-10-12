import { ArrowRight, Check, Undo2 } from "lucide-react";
import { JiaobeiIcon } from "@/components/icons/JiaobeiIcon";
import type { ThrowResult } from "@/lib/types";
import { THROW_LABEL } from "@/lib/visit/throwLogic";

const throwStyles: Record<ThrowResult, string> = {
  sheng: "bg-vermilion text-night-text border-vermilion active:brightness-110",
  xiao: "border-night-text/30 text-night-text active:bg-night-surface",
  yin: "border-night-text/30 text-night-text active:bg-night-surface",
};

/** 底部固定操作區：復原／下一題，以及三顆擲筊結果按鈕 */
export function ThrowPanel({
  canThrow,
  canUndo,
  isLast,
  onThrow,
  onUndo,
  onNext,
}: {
  canThrow: boolean;
  canUndo: boolean;
  isLast: boolean;
  onThrow: (r: ThrowResult) => void;
  onUndo: () => void;
  onNext: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-night-surface bg-night/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto max-w-lg space-y-3 px-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm tracking-widest text-night-text/80 disabled:opacity-30"
          >
            <Undo2 size={18} strokeWidth={1.5} aria-hidden />
            復原
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-frame border border-gold/60 px-4 text-sm font-medium tracking-widest text-gold"
          >
            {isLast ? (
              <>
                <Check size={18} strokeWidth={1.5} aria-hidden />
                完成，存成紀錄
              </>
            ) : (
              <>
                下一個問題
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["sheng", "xiao", "yin"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onThrow(r)}
              disabled={!canThrow}
              className={`flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-frame border text-lg font-bold tracking-[0.2em] transition disabled:opacity-30 ${throwStyles[r]}`}
            >
              <JiaobeiIcon result={r} className="h-5 w-10" />
              {THROW_LABEL[r]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
