"use client";

import { Check } from "lucide-react";
import { setVowDone } from "@/lib/db/repo";
import type { Deity, Vow } from "@/lib/types";

/** 朱紅底的還願提醒：列出還沒完成的承諾 */
export function VowCard({ vows, deities }: { vows: Vow[]; deities: Map<string, Deity> }) {
  return (
    <section aria-labelledby="vow-heading" className="rounded-frame bg-vermilion p-5 text-ink sm:p-6">
      <h2 id="vow-heading" className="font-serif text-lg font-bold tracking-[0.2em]">
        還願提醒
      </h2>
      <ul className="mt-3 divide-y divide-ink/20">
        {vows.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-sm tracking-widest text-ink/85">{deities.get(v.deityId)?.name ?? "神明"}</p>
              <p className="mt-0.5 leading-relaxed">{v.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setVowDone(v.id, true)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-frame bg-ink px-4 text-sm font-bold tracking-widest text-ground transition-opacity hover:opacity-90"
            >
              <Check size={16} strokeWidth={2.5} aria-hidden />
              已還願
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
