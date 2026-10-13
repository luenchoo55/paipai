import { Check } from "lucide-react";

/** 重大的事需連續三個聖筊；一般的事一個聖筊即可 */
export function ImportantCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="mx-auto flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-night-text/80">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center rounded-[2px] border border-gold/70 text-ground transition-colors peer-checked:border-gold peer-checked:bg-gold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-bright"
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      重大的事，需連續三個聖筊
    </label>
  );
}
