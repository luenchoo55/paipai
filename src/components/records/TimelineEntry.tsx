"use client";

import { BellRing, CalendarClock, HandHeart, PenLine } from "lucide-react";
import { useState } from "react";
import { addMonths, shortDate } from "@/lib/dates";
import { updateVisitEntry } from "@/lib/db/repo";
import type { VisitEntry } from "@/lib/types";
import { outcomeLabel } from "@/lib/visit/throwLogic";
import { FortunePhoto } from "./FortunePhoto";
import { ReflectionForm } from "./ReflectionForm";

const REVIEW_OPTIONS = [1, 3, 6, 12];

export const isReviewDue = (e: VisitEntry, now = new Date()) =>
  Boolean(e.reviewAt && !e.reflection && new Date(e.reviewAt) <= now);

const linkButton =
  "inline-flex min-h-11 items-center gap-1.5 text-sm tracking-wider text-gold underline-offset-4 hover:underline";

/** 時間軸上的一題：神明、問題、結果標籤、回顧設定與「後來怎麼樣了」 */
export function TimelineEntry({
  visitId,
  index,
  entry,
  deityName,
  onAddVow,
}: {
  visitId: string;
  index: number;
  entry: VisitEntry;
  deityName: string;
  onAddVow: () => void;
}) {
  const [writing, setWriting] = useState(false);
  const due = isReviewDue(entry);
  const update = (changes: Partial<VisitEntry>) => updateVisitEntry(visitId, index, changes);

  return (
    <li id={`entry-${visitId}-${index}`} className="scroll-mt-24 py-4 first:pt-0 last:pb-0">
      <p className="text-sm tracking-widest text-gold">{deityName}</p>
      <p className="mt-1 leading-relaxed">{entry.questionText}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-frame px-2 py-1 ${
            entry.outcome === "granted" ? "bg-vermilion-soft text-gold-bright" : "bg-ground text-muted"
          }`}
        >
          {outcomeLabel(entry.outcome, entry.requiredSheng)}
        </span>
        {entry.fortuneNumber !== undefined && (
          <span className="rounded-frame bg-ground px-2 py-1 text-muted">籤詩第 {entry.fortuneNumber} 首</span>
        )}
      </div>

      {entry.fortunePhoto && (
        <div className="mt-3">
          <FortunePhoto photo={entry.fortunePhoto} number={entry.fortuneNumber} />
        </div>
      )}

      {entry.outcome !== "skipped" && (
        <div className="mt-3 space-y-2">
          {writing ? (
            <ReflectionForm
              initial={entry.reflection}
              onCancel={() => setWriting(false)}
              onSave={async (reflection) => {
                await update({ reflection });
                setWriting(false);
              }}
            />
          ) : entry.reflection ? (
            <div className="rounded-frame border border-line/70 bg-ground/50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs tracking-widest text-gold">後來怎麼樣了</p>
                <button type="button" onClick={() => setWriting(true)} className={linkButton}>
                  <PenLine size={14} strokeWidth={1.5} aria-hidden />
                  修改
                </button>
              </div>
              <p className="mt-1 whitespace-pre-line leading-relaxed">{entry.reflection}</p>
            </div>
          ) : due ? (
            <div className="rounded-frame border border-gold/60 bg-vermilion-soft/40 p-4">
              <p className="flex items-center gap-1.5 text-sm font-medium tracking-wider text-gold-bright">
                <BellRing size={16} strokeWidth={1.5} aria-hidden />
                該回顧了：這件事後來怎麼樣？
              </p>
              <button type="button" onClick={() => setWriting(true)} className={linkButton}>
                <PenLine size={14} strokeWidth={1.5} aria-hidden />
                補寫後續
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {entry.reviewAt ? (
                <span className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted">
                  <CalendarClock size={16} strokeWidth={1.5} aria-hidden />
                  {shortDate(new Date(entry.reviewAt))} 回顧
                  <button
                    type="button"
                    onClick={() => update({ reviewAt: undefined })}
                    className="ml-1 inline-flex min-h-11 items-center text-gold underline-offset-4 hover:underline"
                  >
                    取消
                  </button>
                </span>
              ) : (
                <label className="inline-flex min-h-11 items-center gap-2 text-sm text-muted">
                  <CalendarClock size={16} strokeWidth={1.5} aria-hidden />
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const months = Number(e.target.value);
                      if (months) update({ reviewAt: addMonths(new Date(), months).toISOString() });
                    }}
                    className="min-h-11 rounded-frame border border-line bg-ground px-2 text-[16px] text-ink focus:border-gold focus:outline-none"
                  >
                    <option value="" disabled>
                      設定回顧時間
                    </option>
                    {REVIEW_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} 個月後回顧
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button type="button" onClick={() => setWriting(true)} className={linkButton}>
                <PenLine size={14} strokeWidth={1.5} aria-hidden />
                現在就寫後續
              </button>
            </div>
          )}
          {entry.outcome === "granted" && !writing && (
            <button type="button" onClick={onAddVow} className={linkButton}>
              <HandHeart size={14} strokeWidth={1.5} aria-hidden />
              許了願？記下還願
            </button>
          )}
        </div>
      )}
    </li>
  );
}
