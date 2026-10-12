import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const iconButtonClass =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-frame border border-line text-gold transition-colors hover:border-gold hover:text-gold-bright";

type Common = { label: string; children: ReactNode; className?: string };

/** 44×44 圖示按鈕；label 給螢幕閱讀器 */
export function IconButton({
  label,
  children,
  className = "",
  type = "button",
  ...rest
}: Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button type={type} aria-label={label} className={`${iconButtonClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function IconLink({ label, children, className = "", href }: Common & { href: string }) {
  return (
    <Link href={href} aria-label={label} className={`${iconButtonClass} ${className}`}>
      {children}
    </Link>
  );
}
