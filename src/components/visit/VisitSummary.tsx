"use client";

import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import type { Deity, VisitDraft } from "@/lib/types";
import { outcomeLabel, outcomeOf, requiredSheng } from "@/lib/visit/throwLogic";

/** 完成前的總覽：確認每題結果、填廟名，存成紀錄 */
export function VisitSummary({
  draft,
  deities,
  onBack,
  onSave,
}: {
  draft: VisitDraft;
  deities: Map<string, Deity>;
  onBack: () => void;
  onSave: (templeName: string) => Promise<void>;
}) {
  const [templeName, setTempleName] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6 pb-10">
      <h1 className="font-serif text-2xl font-bold tracking-[0.3em]">這次參拜</h1>

      <ol className="space-y-3">
        {draft.questions.map((q, i) => {
          const e = draft.entries[q.id];
          const required = requiredSheng(e?.important ?? q.important);
          const outcome = outcomeOf(e?.throws ?? [], required);
          return (
            <li key={q.id} className="rounded-frame border border-night-surface bg-night-surface/50 p-4">
              <p className="text-xs tracking-widest text-muted">
                {i + 1}．{deities.get(q.deityId)?.name ?? "神明"}
                {q.parentId && `・接續第 ${draft.questions.findIndex((p) => p.id === q.parentId) + 1} 題`}
              </p>
              <p className="mt-1 leading-relaxed">{q.text}</p>
              <p className="mt-2 flex flex-wrap gap-2 text-xs">
                <span
                  className={`rounded-frame px-2 py-1 ${
                    outcome === "granted" ? "bg-vermilion-soft text-gold-bright" : "bg-night text-night-text/80"
                  }`}
                >
                  {outcomeLabel(outcome, required)}
                </span>
                {e?.fortuneNumber !== undefined && (
                  <span className="rounded-frame bg-night px-2 py-1 text-night-text/80">籤詩第 {e.fortuneNumber} 首</span>
                )}
              </p>
            </li>
          );
        })}
      </ol>

      <label className="block">
        <span className="mb-1.5 block text-sm tracking-widest text-gold/90">廟名（選填）</span>
        <input
          value={templeName}
          onChange={(e) => setTempleName(e.target.value)}
          placeholder="例如：大甲鎮瀾宮"
          className="min-h-11 w-full rounded-frame border border-night-surface bg-night-surface/60 px-3 text-[16px] text-night-text placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-frame border border-night-text/30 px-4 tracking-widest"
        >
          <ArrowLeft size={18} strokeWidth={1.5} aria-hidden />
          回去繼續問
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(templeName);
            } finally {
              setSaving(false);
            }
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-frame bg-gold px-5 font-bold tracking-widest text-ground disabled:opacity-50"
        >
          <Check size={18} strokeWidth={2} aria-hidden />
          存成紀錄
        </button>
      </div>
    </div>
  );
}
