import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/ops/format";
import type { Tone } from "@/lib/ops/constants";
import type { Person } from "@/lib/ops/types";

export function Avatar({ person, size = 32, className }: { person?: Person | null; size?: number; className?: string }) {
  const name = person?.display_name ?? "?";
  return (
    <span className={cn("ops-avatar", className)} style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }} title={name}>
      {person?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL; next/image would cache it past expiry
        <img src={person.avatar_url} alt={name} referrerPolicy="no-referrer" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

const badgeTone: Record<Tone, string> = {
  neutral: "", cyan: "ops-badge-cyan", lime: "ops-badge-lime", warn: "ops-badge-warn", danger: "ops-badge-danger",
};
export function Badge({ tone = "neutral", dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("ops-badge", badgeTone[tone], className)}>
      {dot && <span className="ops-dot" />}
      {children}
    </span>
  );
}

export function ProgressBar({ value, small, label }: { value: number; small?: boolean; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("ops-progress", small && "ops-progress-sm")} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="ops-in mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="ops-h1">{title}</h1>
        {subtitle && <p className="ops-muted mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon, title, body, action, compact }: { icon: ReactNode; title: string; body?: string; action?: ReactNode; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "px-4 py-8" : "px-6 py-14")}>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "var(--ops-cyan-soft)", color: "var(--ops-cyan-text)" }}>
        {icon}
      </div>
      <p className="ops-h2">{title}</p>
      {body && <p className="ops-muted mt-1.5 max-w-sm text-[13.5px]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionCard({ title, action, children, className, padded = true }: { title: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn("ops-card", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="ops-h2">{title}</h2>
        {action}
      </div>
      <div className={cn(padded ? "px-5 pb-5" : "")}>{children}</div>
    </section>
  );
}

export function StatTile({ label, value, hint, tone = "neutral", icon }: { label: string; value: ReactNode; hint?: string; tone?: Tone; icon?: ReactNode }) {
  const color = tone === "danger" ? "var(--ops-danger)" : tone === "lime" ? "var(--ops-lime-text)" : tone === "cyan" ? "var(--ops-cyan-text)" : tone === "warn" ? "var(--ops-warn)" : "var(--ops-text)";
  return (
    <div className="ops-card ops-card-pad">
      <div className="flex items-center justify-between">
        <span className="ops-eyebrow">{label}</span>
        {icon && <span className="ops-faint">{icon}</span>}
      </div>
      <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight" style={{ color }}>{value}</div>
      {hint && <p className="ops-muted mt-2 text-[12.5px]">{hint}</p>}
    </div>
  );
}

/** Circular progress. No data library — one SVG circle. */
export function Donut({ value, size = 132, stroke = 12, label, sub }: { value: number; size?: number; stroke?: number; label?: ReactNode; sub?: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(v)} percent`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="ops-donut" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ops-cyan)" />
            <stop offset="100%" stopColor="var(--ops-lime)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ops-surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ops-donut)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-[26px] font-semibold leading-none tracking-tight">{label ?? `${Math.round(v)}%`}</div>
        {sub && <div className="ops-muted mt-1 text-[11px]">{sub}</div>}
      </div>
    </div>
  );
}

/** Seven small bars (e.g. tasks completed per day). */
export function MiniBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-24 items-end gap-2" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-md"
              style={{
                height: `${Math.max(d.value ? 14 : 5, (d.value / max) * 100)}%`,
                background: d.value ? "linear-gradient(var(--ops-lime), var(--ops-cyan))" : "var(--ops-surface-3)",
                transition: "height .6s cubic-bezier(.16,1,.3,1)",
              }}
              title={`${d.value}`}
            />
          </div>
          <span className="ops-faint text-[10.5px]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
