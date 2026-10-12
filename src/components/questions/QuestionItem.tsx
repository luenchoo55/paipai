"use client";

import { Check, CornerDownRight, Pencil } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { setQuestionSelected } from "@/lib/db/repo";
import type { Question } from "@/lib/types";

export function QuestionItem({
  question,
  step,
  onEdit,
}: {
  question: Question;
  step?: number; // AI 問題組裡的第幾步
  onEdit: () => void;
}) {
  const { text, note, selected, followUps, important } = question;
  const hasFollowUps = Boolean(followUps?.onXiao || followUps?.onYin);

  return (
    <li className="flex items-start gap-2">
      <label className="flex min-h-11 flex-1 cursor-pointer items-start gap-3 py-2.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => setQuestionSelected(question.id, e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[2px] border border-gold/70 text-ground transition-colors peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-bright"
        >
          {selected && <Check size={14} strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          {step !== undefined && (
            <span className="mb-1 block text-xs tracking-widest text-gold">第 {step + 1} 問</span>
          )}
          <span className={`block leading-relaxed ${selected ? "text-ink" : "text-muted"}`}>{text}</span>
          {important && <span className="mt-1 block text-xs tracking-widest text-gold">重大的事・需三聖筊</span>}
          {note && <span className="mt-1 block text-sm text-muted">{note}</span>}
          {hasFollowUps && (
            <span className="mt-1 flex items-center gap-1 text-xs text-muted">
              <CornerDownRight size={14} strokeWidth={1.5} aria-hidden />
              沒有聖筊時有後續問法
            </span>
          )}
        </span>
      </label>
      <IconButton label={`編輯：${text}`} onClick={onEdit} className="border-transparent text-muted">
        <Pencil size={18} strokeWidth={1.5} aria-hidden />
      </IconButton>
    </li>
  );
}
