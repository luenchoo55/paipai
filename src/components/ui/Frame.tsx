import type { ComponentPropsWithoutRef, ElementType } from "react";

type FrameProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

const corner = "pointer-events-none absolute size-2.5 border-gold/70";

/** 暗金細框卡片，四角有小折角裝飾 */
export function Frame<T extends ElementType = "div">({
  as,
  className = "",
  children,
  ...rest
}: FrameProps<T>) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={`relative rounded-frame border border-line bg-surface/90 ${className}`}
      {...rest}
    >
      <span aria-hidden className={`${corner} -left-px -top-px border-l border-t`} />
      <span aria-hidden className={`${corner} -right-px -top-px border-r border-t`} />
      <span aria-hidden className={`${corner} -bottom-px -left-px border-b border-l`} />
      <span aria-hidden className={`${corner} -bottom-px -right-px border-b border-r`} />
      {children}
    </Tag>
  );
}
