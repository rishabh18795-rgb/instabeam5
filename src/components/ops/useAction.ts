"use client";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useToast } from "./Toast";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Runs a server action, toasts the outcome and refreshes server data on success. */
export function useAction() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = useCallback(
    <T,>(fn: () => Promise<ActionResult<T>>, opts?: { success?: string; onDone?: (r: ActionResult<T>) => void; refresh?: boolean }) => {
      start(async () => {
        try {
          const r = await fn();
          if (r.ok) {
            const msg = opts?.success ?? r.message;
            if (msg) toast.ok(msg);
            if (opts?.refresh !== false) router.refresh();
          } else toast.error(r.error);
          opts?.onDone?.(r);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Something went wrong. Please try again.");
        }
      });
    },
    [router, toast],
  );
  return { run, pending };
}
