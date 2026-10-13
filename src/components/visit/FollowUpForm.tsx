"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { ImportantCheckbox } from "./ImportantCheckbox";

/** 當場追加衍生問題：寫好後插在這一題後面，馬上接著問 */
export function FollowUpForm({
  suggestion,
  onAdd,
}: {
  suggestion?: string;
  onAdd: (text: string, important: boolean) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [important, setImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setText(suggestion ?? "");
          setOpen(true);
        }}
        className="mx-auto flex min-h-11 items-center gap-1.5 rounded-frame border border-dashed border-gold/50 px-4 text-sm tracking-widest text-gold/90"
      >
        <Plus size={16} strokeWidth={1.5} aria-hidden />
        追加衍生問題
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSaving(true);
        try {
          await onAdd(text.trim(), important);
        } finally {
          setSaving(false);
        }
      }}
      className="space-y-3 rounded-frame border border-gold/40 bg-night-surface/60 p-4"
    >
      <label className="block">
        <span className="mb-1.5 block text-sm tracking-widest text-gold/90">衍生問題</span>
        <textarea
          autoFocus
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例如：是不是要等到明年再說？"
          className="w-full resize-y rounded-frame border border-night-surface bg-night px-3 py-2.5 text-[16px] leading-relaxed text-night-text placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
      </label>
      <ImportantCheckbox checked={important} onChange={setImportant} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex min-h-11 items-center rounded-frame border border-night-text/30 px-4 text-sm tracking-widest"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={!text.trim() || saving}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-frame bg-gold px-4 text-sm font-bold tracking-widest text-ground disabled:opacity-40"
        >
          加入並馬上問
          <ArrowRight size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </form>
  );
}
