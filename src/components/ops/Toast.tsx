"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type Toast = { id: number; kind: "ok" | "error"; text: string };
const Ctx = createContext<{ ok: (t: string) => void; error: (t: string) => void }>({ ok: () => {}, error: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x.slice(-3), { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);
  const api = useMemo(() => ({ ok: (t: string) => push("ok", t), error: (t: string) => push("error", t) }), [push]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="ops-toast pointer-events-auto flex max-w-sm items-center gap-2.5 text-[13.5px]">
            {t.kind === "ok"
              ? <CheckCircle2 size={16} style={{ color: "var(--ops-lime-text)" }} />
              : <AlertCircle size={16} style={{ color: "var(--ops-danger)" }} />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
