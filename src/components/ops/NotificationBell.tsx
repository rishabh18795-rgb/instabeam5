"use client";
import { Bell, CheckCheck, X } from "lucide-react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { dismissNotification, markNotificationsRead } from "@/lib/ops/actions/notifications";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";
import { timeAgo } from "@/lib/ops/format";
import type { Notification } from "@/lib/ops/types";
import { useToast } from "./Toast";

export function NotificationBell({ userId, initial }: { userId: string; initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const box = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read_at).length;

  useEffect(() => setItems(initial), [initial]);

  // Live: RLS limits this channel to rows the signed-in user can already read.
  useEffect(() => {
    const supabase = getBrowserSupabase();
    const ch = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const n = payload.new as unknown as Notification;
        setItems((x) => [n, ...x.filter((y) => y.id !== n.id)].slice(0, 20));
        toast.ok(n.title);
        router.refresh();
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [userId, router, toast]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon relative" onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open}>
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold" style={{ background: "var(--ops-lime)", color: "var(--ops-on-accent)" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="ops-card ops-in absolute right-0 z-50 mt-2 w-[min(380px,calc(100vw-24px))] overflow-hidden" role="dialog" aria-label="Notifications">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="ops-h2">Notifications</span>
            {unread > 0 && (
              <button className="ops-btn ops-btn-ghost ops-btn-sm" onClick={() => { setItems((x) => x.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))); start(async () => { await markNotificationsRead(); }); }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <hr className="ops-divider" />
          <ul className="max-h-[420px] overflow-y-auto">
            {items.length === 0 && <li className="ops-muted px-4 py-10 text-center text-[13px]">You&apos;re all caught up.</li>}
            {items.map((n) => (
              <li key={n.id} className="group relative flex gap-3 border-b px-4 py-3 last:border-b-0" style={{ background: n.read_at ? undefined : "var(--ops-cyan-soft)" }}>
                <Link
                  href={n.link ?? "/ops"}
                  className="min-w-0 flex-1"
                  onClick={() => { setOpen(false); if (!n.read_at) start(async () => { await markNotificationsRead([n.id]); }); }}
                >
                  <p className="text-[13.5px] font-medium leading-snug">{n.title}</p>
                  {n.body && <p className="ops-muted mt-0.5 truncate text-[12.5px]">{n.body}</p>}
                  <p className="ops-faint mt-1 text-[11.5px]">{timeAgo(n.created_at)}</p>
                </Link>
                <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm opacity-0 transition group-hover:opacity-100 focus:opacity-100" aria-label="Dismiss notification"
                  onClick={() => { setItems((x) => x.filter((y) => y.id !== n.id)); start(async () => { await dismissNotification(n.id); }); }}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
