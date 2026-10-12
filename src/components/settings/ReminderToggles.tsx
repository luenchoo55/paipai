"use client";

import { savePreferences } from "@/lib/db/repo";
import type { Preferences } from "@/lib/types";

const items: { key: keyof Preferences; label: string; hint: string }[] = [
  { key: "reviewReminders", label: "回顧提醒", hint: "到了設定的回顧時間，在參拜紀錄頁提醒你補寫後續" },
  { key: "vowReminders", label: "還願提醒", hint: "在參拜紀錄頁列出還沒完成的還願承諾" },
];

export function ReminderToggles({ prefs }: { prefs: Preferences }) {
  return (
    <ul className="divide-y divide-line/50">
      {items.map(({ key, label, hint }) => {
        const on = prefs[key];
        const id = `pref-${key}`;
        return (
          <li key={key} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p id={id} className="font-medium tracking-wider">
                {label}
              </p>
              <p className="text-sm text-muted">{hint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-labelledby={id}
              onClick={() => savePreferences({ ...prefs, [key]: !on })}
              className="inline-flex min-h-11 shrink-0 items-center"
            >
              <span
                className={`relative h-7 w-12 rounded-full border transition-colors ${on ? "border-gold bg-gold" : "border-line bg-ground"}`}
              >
                <span
                  className={`absolute top-0.5 size-5.5 rounded-full transition-all ${on ? "left-[22px] bg-ground" : "left-0.5 bg-muted"}`}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
