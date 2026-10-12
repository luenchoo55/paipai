import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/lib/types";
import { isProfileComplete, reportText } from "@/lib/visit/report";

/** 可展開的稟報內容；問題若有 AI 整理的稟報背景，一併列出 */
export function ReportCard({
  deityName,
  profile,
  background,
}: {
  deityName: string;
  profile: Profile;
  background?: string;
}) {
  return (
    <details className="group rounded-frame border border-night-surface bg-night-surface/60">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm tracking-widest text-gold/90 [&::-webkit-details-marker]:hidden">
        稟報內容
        <ChevronDown size={18} strokeWidth={1.5} className="transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="space-y-3 px-4 pb-4 leading-loose text-night-text/90">
        <p>{reportText(deityName, profile)}</p>
        {background && <p>{background}</p>}
        {!isProfileComplete(profile) && (
          <p className="text-sm text-muted">
            方括號的地方可以到
            <Link href="/settings" className="mx-1 inline-flex min-h-11 items-center text-gold underline underline-offset-4">
              設定
            </Link>
            填好，之後會自動帶入。
          </p>
        )}
      </div>
    </details>
  );
}
