"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { IconButton } from "./IconButton";

/** 原生 <dialog> 包裝：Esc 關閉、焦點鎖定由瀏覽器處理；手機上貼底，寬螢幕置中 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="dialog-title"
      className="mt-auto mb-0 w-full max-w-none rounded-t-[6px] border border-line bg-surface p-0 text-ink backdrop:bg-black/70 sm:m-auto sm:max-w-lg sm:rounded-frame"
    >
      <div className="max-h-[85svh] overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="dialog-title" className="font-serif text-xl font-bold tracking-widest">
            {title}
          </h2>
          <IconButton label="關閉" onClick={onClose} className="border-transparent">
            <X size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}
