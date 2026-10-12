"use client";

import { BellRing, HandHeart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { lunarLabel, solarLabel } from "@/lib/dates";
import { useDeities, usePreferences, useVisits, useVows } from "@/lib/db/hooks";
import { DEFAULT_PREFERENCES, removeVisit } from "@/lib/db/repo";
import type { Visit } from "@/lib/types";
import { TimelineEntry, isReviewDue } from "./TimelineEntry";
import { VowCard } from "./VowCard";
import { VowDialog } from "./VowDialog";

type VowDialogState = { open: false } | { open: true; key: number; deityId?: string; text?: string };

export function RecordsView() {
  const visits = useVisits();
  const vows = useVows();
  const deityList = useDeities();
  const prefs = usePreferences() ?? DEFAULT_PREFERENCES;
  const [vowDialog, setVowDialog] = useState<VowDialogState>({ open: false });

  const deities = useMemo(() => new Map(deityList?.map((d) => [d.id, d])), [deityList]);

  if (!visits || !vows || !deityList) {
    return <div aria-busy className="h-40 animate-pulse rounded-frame bg-surface" />;
  }

  const openVow = (opts: { deityId?: string; text?: string } = {}) =>
    setVowDialog({ open: true, key: Date.now(), ...opts });

  const pendingVows = vows.filter((v) => !v.done);
  const dueEntries = visits.flatMap((v) =>
    v.entries.flatMap((e, i) => (isReviewDue(e) ? [{ visit: v, index: i, entry: e }] : [])),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        {prefs.vowReminders && pendingVows.length > 0 && <VowCard vows={pendingVows} deities={deities} />}

        {prefs.reviewReminders && dueEntries.length > 0 && (
          <Frame as="section" aria-labelledby="due-heading" className="border-gold/60 p-5 sm:p-6">
            <h2 id="due-heading" className="flex items-center gap-2 font-serif text-lg font-bold tracking-[0.2em]">
              <BellRing size={18} strokeWidth={1.5} className="text-gold" aria-hidden />
              該回顧了
            </h2>
            <ul className="mt-2">
              {dueEntries.map(({ visit, index, entry }) => (
                <li key={`${visit.id}-${index}`}>
                  <a
                    href={`#entry-${visit.id}-${index}`}
                    className="flex min-h-11 items-center leading-relaxed text-ink underline-offset-4 hover:text-gold-bright hover:underline"
                  >
                    {entry.questionText}
                  </a>
                </li>
              ))}
            </ul>
          </Frame>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold tracking-widest">
          時間軸
          <span className="ml-2 font-sans text-sm font-normal text-muted">共 {visits.length} 次參拜</span>
        </h2>
        <Button variant="outline" onClick={() => openVow()}>
          <HandHeart size={18} strokeWidth={1.5} aria-hidden />
          記下還願承諾
        </Button>
      </div>

      {visits.length === 0 ? (
        <Frame className="px-6 py-10 text-center">
          <p className="font-serif text-lg tracking-widest">還沒有參拜紀錄</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">在參拜模式按下「完成，存成紀錄」後，就會出現在這裡。</p>
          <Link href="/" className={buttonClass("primary", "mt-5")}>
            前往問事清單
          </Link>
        </Frame>
      ) : (
        <ol className="relative">
          {visits.map((visit, i) => (
            <TimelineVisit
              key={visit.id}
              visit={visit}
              last={i === visits.length - 1}
              deityName={(id) => deities.get(id)?.name ?? "神明"}
              onAddVow={(deityId, question) => openVow({ deityId, text: `「${question}」如願後回來答謝` })}
            />
          ))}
        </ol>
      )}

      {vowDialog.open && (
        <VowDialog
          key={vowDialog.key}
          open
          onClose={() => setVowDialog({ open: false })}
          deities={deityList}
          defaultDeityId={vowDialog.deityId}
          defaultText={vowDialog.text}
        />
      )}
    </div>
  );
}

/** 一次參拜：左側圓點與直線，右側日期、廟名與各題 */
function TimelineVisit({
  visit,
  last,
  deityName,
  onAddVow,
}: {
  visit: Visit;
  last: boolean;
  deityName: (id: string) => string;
  onAddVow: (deityId: string, question: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const date = new Date(visit.date);
  const deityNames = [...new Set(visit.entries.map((e) => deityName(e.deityId)))].join("、");

  return (
    <li className="relative pb-10 pl-8 last:pb-0">
      <span aria-hidden className="absolute left-[5px] top-2 size-3 rounded-full border-2 border-gold bg-ground" />
      {!last && <span aria-hidden className="absolute bottom-0 left-[10px] top-6 w-px bg-line" />}

      <header>
        <p className="font-serif text-lg font-semibold tracking-wider">
          <time dateTime={visit.date}>{solarLabel(date)}</time>
        </p>
        <p className="text-sm text-muted">{lunarLabel(date)}</p>
        <p className="mt-1 text-sm tracking-widest text-gold">
          {visit.templeName ? `${visit.templeName}・` : ""}
          {deityNames}
        </p>
      </header>

      <Frame className="mt-3 p-4 sm:p-5">
        <ul className="divide-y divide-line/50">
          {visit.entries.map((entry, i) => (
            <TimelineEntry
              key={i}
              visitId={visit.id}
              index={i}
              entry={entry}
              deityName={deityName(entry.deityId)}
              onAddVow={() => onAddVow(entry.deityId, entry.questionText)}
            />
          ))}
        </ul>
      </Frame>

      <button
        type="button"
        onClick={() => (confirmDelete ? removeVisit(visit.id) : setConfirmDelete(true))}
        onBlur={() => setConfirmDelete(false)}
        className={`mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs tracking-wider ${
          confirmDelete ? "text-gold-bright" : "text-muted hover:text-ink"
        }`}
      >
        <Trash2 size={14} strokeWidth={1.5} aria-hidden />
        {confirmDelete ? "確定刪除這次紀錄？再按一次" : "刪除這次紀錄"}
      </button>
    </li>
  );
}
