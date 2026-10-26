"use client";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Accessible modal built on the native <dialog> (focus trap, Esc, backdrop). */
export function Dialog({ open, onClose, title, description, children, wide }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn("ops-dialog", wide && "ops-dialog-wide")}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      aria-labelledby="ops-dialog-title"
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
            <div>
              <h2 id="ops-dialog-title" className="text-[17px] font-semibold tracking-tight">{title}</h2>
              {description && <p className="ops-muted mt-1 text-[13px]">{description}</p>}
            </div>
            <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" onClick={onClose} aria-label="Close dialog"><X size={16} /></button>
          </div>
          <div className="overflow-y-auto px-6 pb-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
