import type { ReactNode } from "react";

/** 頁首：金色小標、明體大標、副標，右側可放操作按鈕 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium tracking-[0.4em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-[34px] font-bold leading-tight tracking-[0.12em]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2 pt-1">{actions}</div>}
    </header>
  );
}
