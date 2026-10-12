"use client";

import { Check, CornerDownRight, RotateCcw, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDeities, useProfile } from "@/lib/db/hooks";
import {
  EMPTY_PROFILE,
  clearVisitDraft,
  finishVisit,
  getVisitDraft,
  listSelectedQuestions,
  saveVisitDraft,
} from "@/lib/db/repo";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import type { Question, ThrowResult, VisitDraft } from "@/lib/types";
import { THROW_LABEL, consecutiveSheng, hintOf, hintText, isGranted, requiredSheng } from "@/lib/visit/throwLogic";
import { FortuneInput } from "./FortuneInput";
import { ReportCard } from "./ReportCard";
import { ShengCounter } from "./ShengCounter";
import { ThrowPanel } from "./ThrowPanel";
import { VisitProgress } from "./VisitProgress";
import { VisitSummary } from "./VisitSummary";

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; draft: VisitDraft; restored: boolean };

const newDraft = (questions: Question[]): VisitDraft => ({
  startedAt: new Date().toISOString(),
  questions,
  index: 0,
  entries: {},
  finishing: false,
});

/** 讀取未完成的參拜；沒有的話用目前勾選的問題開始新的一次 */
async function loadState(): Promise<State> {
  const existing = await getVisitDraft();
  if (existing) return { status: "ready", draft: existing, restored: true };
  const questions = await listSelectedQuestions();
  if (questions.length === 0) return { status: "empty" };
  const draft = newDraft(questions);
  await saveVisitDraft(draft);
  return { status: "ready", draft, restored: false };
}

export function VisitSession() {
  const router = useRouter();
  const deityList = useDeities();
  const profile = useProfile() ?? EMPTY_PROFILE;
  const wakeLock = useWakeLock();
  const [state, setState] = useState<State>({ status: "loading" });

  const deities = useMemo(() => new Map(deityList?.map((d) => [d.id, d])), [deityList]);

  useEffect(() => {
    let alive = true;
    loadState().then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback(
    (fn: (d: VisitDraft) => VisitDraft) => {
      if (state.status !== "ready") return;
      const draft = fn(state.draft);
      setState({ ...state, draft });
      void saveVisitDraft(draft);
    },
    [state],
  );

  async function restart() {
    await clearVisitDraft();
    setState({ status: "loading" });
    setState(await loadState());
  }

  if (state.status === "loading") {
    return <p className="pt-24 text-center text-sm text-muted">準備中…</p>;
  }

  if (state.status === "empty") {
    return (
      <div className="pt-24 text-center">
        <p className="font-serif text-2xl tracking-[0.3em]">還沒有要問的事</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">先到問事清單寫下問題，勾選這次要帶去問的。</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-frame bg-gold px-5 font-bold tracking-widest text-ground"
        >
          前往問事清單
        </Link>
      </div>
    );
  }

  const { draft, restored } = state;
  const total = draft.questions.length;

  if (draft.finishing) {
    return (
      <div className="space-y-6 pt-4">
        <VisitProgress index={total - 1} total={total} />
        <VisitSummary
          draft={draft}
          deities={deities}
          onBack={() => update((d) => ({ ...d, finishing: false }))}
          onSave={async (templeName) => {
            await finishVisit(draft, templeName);
            router.push("/records");
          }}
        />
      </div>
    );
  }

  const question = draft.questions[draft.index];
  const entry = draft.entries[question.id] ?? { throws: [] };
  const { throws } = entry;
  const deityName = deities.get(question.deityId)?.name ?? "神明";
  const important = entry.important ?? question.important ?? false;
  const required = requiredSheng(important);
  const hint = hintOf(throws, required);
  const followUp =
    hint === "xiao" ? question.followUps?.onXiao : hint === "yin" ? question.followUps?.onYin : undefined;
  const isLast = draft.index === total - 1;

  const setEntry = (changes: Partial<typeof entry>) =>
    update((d) => ({ ...d, entries: { ...d.entries, [question.id]: { ...entry, ...changes } } }));

  return (
    <div className="space-y-6 pb-72 pt-4">
      <VisitProgress index={draft.index} total={total} />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Sun size={14} strokeWidth={1.5} aria-hidden />
          {wakeLock === "active"
            ? "螢幕會保持開啟"
            : wakeLock === "unsupported"
              ? "此瀏覽器無法保持螢幕開啟，請暫時調長自動鎖定時間"
              : "正在申請保持螢幕開啟…"}
        </span>
        {restored && (
          <button
            type="button"
            onClick={restart}
            className="inline-flex min-h-11 items-center gap-1 text-gold/90 underline-offset-4 hover:underline"
          >
            <RotateCcw size={14} strokeWidth={1.5} aria-hidden />
            已接續上次的進度・重新開始
          </button>
        )}
      </div>

      <ReportCard deityName={deityName} profile={profile} background={question.background} />

      <section aria-labelledby="question-text" className="space-y-2 pt-2">
        <p className="text-sm tracking-[0.3em] text-gold/90">向 {deityName} 請示</p>
        <h1 id="question-text" className="font-serif text-[30px] font-bold leading-snug tracking-wider">
          {question.text}
        </h1>
        {question.note && <p className="text-sm text-muted">{question.note}</p>}
      </section>

      <div className="space-y-4 py-2">
        <label className="mx-auto flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-night-text/80">
          <input
            type="checkbox"
            checked={important}
            onChange={(e) => setEntry({ important: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded-[2px] border border-gold/70 text-ground transition-colors peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-bright"
          >
            {important && <Check size={14} strokeWidth={3} />}
          </span>
          重大的事，需連續三個聖筊
        </label>
        <ShengCounter count={consecutiveSheng(throws)} required={required} />
        <div aria-live="polite" className="space-y-3 text-center">
          <p className={`leading-relaxed ${hint === "granted" ? "font-bold text-gold-bright" : "text-night-text/90"}`}>
            {hintText(hint, required)}
          </p>
          {followUp && (
            <div className="rounded-frame border border-gold/40 bg-night-surface/60 p-4 text-left">
              <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold/90">
                <CornerDownRight size={14} strokeWidth={1.5} aria-hidden />
                可以接著問
              </p>
              <p className="mt-2 font-serif text-lg leading-relaxed">{followUp}</p>
            </div>
          )}
        </div>
      </div>

      {throws.length > 0 && (
        <ol aria-label="擲筊紀錄" className="flex flex-wrap gap-2">
          {throws.map((t, i) => (
            <li
              key={i}
              className={`rounded-frame px-2.5 py-1 text-sm ${
                t === "sheng" ? "bg-vermilion-soft text-gold-bright" : "bg-night-surface text-night-text/80"
              }`}
            >
              {i + 1}．{THROW_LABEL[t]}
            </li>
          ))}
        </ol>
      )}

      <FortuneInput
        key={question.id}
        number={entry.fortuneNumber}
        photo={entry.fortunePhoto}
        onChange={(f) => setEntry(f)}
      />

      <ThrowPanel
        canThrow={!isGranted(throws, required)}
        canUndo={throws.length > 0}
        isLast={isLast}
        onThrow={(r: ThrowResult) => setEntry({ throws: [...throws, r] })}
        onUndo={() => setEntry({ throws: throws.slice(0, -1) })}
        onNext={() => {
          update((d) => (isLast ? { ...d, finishing: true } : { ...d, index: d.index + 1 }));
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
}
