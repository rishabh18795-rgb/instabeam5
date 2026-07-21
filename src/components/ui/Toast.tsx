"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error";
type ToastItem = { id: number; type: ToastType; message: string };
type ToastContextValue = { show: (type: ToastType, message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, type, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-ink px-4 py-3 text-sm text-paper shadow-[0_20px_40px_-12px_rgba(11,11,11,0.4)] backdrop-blur-xl",
                t.type === "success" ? "border-beam-400/30" : "border-red-400/30"
              )}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-beam-400" />
              ) : (
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              )}
              <span className="flex-1 leading-relaxed">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="text-mist-400 transition-colors hover:text-paper"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
