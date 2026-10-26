import { WORKSPACE_TZ } from "./supabase/config";

/** Today's date (YYYY-MM-DD) in the workspace timezone, matching public.workspace_today(). */
export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: WORKSPACE_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86_400_000);
}

export function greeting(now = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: WORKSPACE_TZ, hour: "2-digit", hour12: false }).format(now));
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  if (!iso) return "—";
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00Z`) : new Date(iso);
  return new Intl.DateTimeFormat("en-GB", { timeZone: iso.length === 10 ? "UTC" : WORKSPACE_TZ, ...opts }).format(d);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: WORKSPACE_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86_400) return `${Math.round(s / 3600)}h ago`;
  if (s < 7 * 86_400) return `${Math.round(s / 86_400)}d ago`;
  return formatDate(iso);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

/** "due today", "2 days overdue", "in 3 days" for a date-only deadline. */
export function deadlineLabel(due: string | null, done = false): { text: string; tone: "neutral" | "warn" | "danger" | "lime" } | null {
  if (!due) return null;
  if (done) return { text: formatDate(due), tone: "neutral" };
  const diff = daysBetween(todayISO(), due);
  if (diff < 0) return { text: `${-diff}d overdue`, tone: "danger" };
  if (diff === 0) return { text: "Due today", tone: "warn" };
  if (diff === 1) return { text: "Due tomorrow", tone: "warn" };
  if (diff <= 7) return { text: `In ${diff} days`, tone: "neutral" };
  return { text: formatDate(due), tone: "neutral" };
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
}
