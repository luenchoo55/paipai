import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const inputClass =
  "w-full min-h-11 rounded-frame border border-line bg-ground/60 px-3 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none";

/** 單選標籤：包住 sr-only 的 radio／checkbox */
export const chipClass =
  "inline-flex min-h-11 cursor-pointer items-center rounded-frame border border-line px-3.5 text-[15px] transition-colors hover:border-gold has-checked:border-gold has-checked:bg-vermilion-soft has-checked:text-gold-bright has-focus-visible:outline-2 has-focus-visible:outline-gold-bright";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium tracking-wider text-gold">
        {label}
        {hint && <span className="ml-2 font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputClass} ${props.className ?? ""}`} />
);

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={3} {...props} className={`${inputClass} resize-y leading-relaxed ${props.className ?? ""}`} />
);
