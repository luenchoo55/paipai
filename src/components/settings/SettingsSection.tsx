import type { ReactNode } from "react";
import { Frame } from "@/components/ui/Frame";

export function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Frame as="section" aria-labelledby={id} className="p-5 sm:p-6">
      <h2 id={id} className="font-serif text-xl font-bold tracking-[0.2em]">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </Frame>
  );
}
