"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, chipClass } from "@/components/ui/Field";
import { saveProfile } from "@/lib/db/repo";
import type { Birthday, Profile } from "@/lib/types";
import { reportText } from "@/lib/visit/report";

const toNumber = (s: string) => (s.trim() === "" ? undefined : Number.parseInt(s, 10));

/**
 * 稟報資料：姓名、生日（農曆或國曆、民國年）、地址。
 * 父層以儲存的資料當 key，匯入備份後會重新掛載帶入新值；「已儲存」狀態由父層保管，才不會在重新掛載時消失。
 */
export function ProfileForm({
  initial,
  saved,
  onSavedChange,
}: {
  initial: Profile;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [address, setAddress] = useState(initial.address);
  const [calendar, setCalendar] = useState<Birthday["calendar"]>(initial.birthday?.calendar ?? "lunar");
  const [year, setYear] = useState(initial.birthday?.year.toString() ?? "");
  const [month, setMonth] = useState(initial.birthday?.month.toString() ?? "");
  const [day, setDay] = useState(initial.birthday?.day.toString() ?? "");
  const [error, setError] = useState("");

  const y = toNumber(year);
  const m = toNumber(month);
  const d = toNumber(day);
  const anyDate = y !== undefined || m !== undefined || d !== undefined;
  const birthday: Birthday | undefined =
    y !== undefined && m !== undefined && d !== undefined ? { calendar, year: y, month: m, day: d } : undefined;

  function validate(): string {
    if (!anyDate) return "";
    if (!birthday) return "生日請把年、月、日都填上，或全部留空";
    if (birthday.year < 1 || birthday.year > 200) return "年份請填民國年，例如 80";
    if (birthday.month < 1 || birthday.month > 12) return "月份請填 1 到 12";
    if (birthday.day < 1 || birthday.day > (calendar === "lunar" ? 30 : 31)) return `日期請填 1 到 ${calendar === "lunar" ? 30 : 31}`;
    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const message = validate();
    setError(message);
    if (message) return;
    await saveProfile({ name: name.trim(), address: address.trim(), birthday });
    onSavedChange(true);
  }

  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    onSavedChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="姓名">
          <TextInput value={name} onChange={(e) => touch(setName)(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="地址" hint="稟報用，寫到區或里即可">
          <TextInput value={address} onChange={(e) => touch(setAddress)(e.target.value)} placeholder="例如：台中市大甲區" />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium tracking-wider text-gold">生日</legend>
        <div className="mb-3 flex gap-2">
          {(["lunar", "solar"] as const).map((c) => (
            <label key={c} className={chipClass}>
              <input
                type="radio"
                name="calendar"
                checked={calendar === c}
                onChange={() => touch(setCalendar)(c)}
                className="sr-only"
              />
              {c === "lunar" ? "農曆" : "國曆"}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          民國
          <TextInput aria-label="民國年" inputMode="numeric" value={year} onChange={(e) => touch(setYear)(e.target.value)} className="max-w-16 px-1 text-center" />
          年
          <TextInput aria-label="月" inputMode="numeric" value={month} onChange={(e) => touch(setMonth)(e.target.value)} className="max-w-13 px-1 text-center" />
          月
          <TextInput aria-label="日" inputMode="numeric" value={day} onChange={(e) => touch(setDay)(e.target.value)} className="max-w-13 px-1 text-center" />
          日
        </div>
      </fieldset>

      <div className="rounded-frame bg-ground/60 p-4">
        <p className="text-xs tracking-widest text-gold">稟報時會這樣念</p>
        <p className="mt-1 leading-loose">{reportText("媽祖", { name, address, birthday: validate() ? undefined : birthday })}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-gold-bright">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span role="status" className="inline-flex items-center gap-1 text-sm text-gold">
            <Check size={16} strokeWidth={2} aria-hidden />
            已儲存
          </span>
        )}
        <Button type="submit">儲存稟報資料</Button>
      </div>
    </form>
  );
}
