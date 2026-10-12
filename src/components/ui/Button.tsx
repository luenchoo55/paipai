import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-gold text-ground hover:bg-gold-bright font-bold",
  outline: "border border-gold text-gold hover:border-gold-bright hover:text-gold-bright font-medium",
  ghost: "text-muted hover:text-ink font-medium",
};

export const buttonClass = (variant: Variant = "primary", className = "") =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-frame px-5 tracking-wider transition-colors disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`;

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}
