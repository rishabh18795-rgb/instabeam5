"use client";
import {
  Activity, FolderKanban, LayoutDashboard, ListChecks, LogOut, Menu, MessageCircle, Paperclip, Settings, Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { signOut } from "@/lib/ops/actions/auth";
import type { Notification, Person } from "@/lib/ops/types";
import { cn } from "@/lib/utils";
import { Dialog } from "./Dialog";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui";

const NAV = [
  { href: "/ops", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/ops/chat", label: "Co-Founder Chat", Icon: MessageCircle, badge: "chat" },
  { href: "/ops/projects", label: "Projects", Icon: FolderKanban },
  { href: "/ops/tasks", label: "Tasks", Icon: ListChecks, badge: "tasks" },
  { href: "/ops/files", label: "Files", Icon: Paperclip },
  { href: "/ops/goals", label: "Goals & Targets", Icon: Target },
  { href: "/ops/activity", label: "Activity", Icon: Activity },
  { href: "/ops/settings", label: "Settings", Icon: Settings },
] as const;
const MOBILE_PRIMARY = ["/ops", "/ops/chat", "/ops/tasks", "/ops/files"];

export function AppShell({ me, theme, unreadChat, openTasks, notifications, children }: {
  me: Person & { email: string }; theme: "dark" | "light" | "system"; unreadChat: number; openTasks: number;
  notifications: Notification[]; children: ReactNode;
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const badgeFor = (b?: string) => (b === "chat" ? unreadChat : b === "tasks" ? openTasks : 0);

  const link = (n: (typeof NAV)[number], onClick?: () => void) => {
    const count = badgeFor("badge" in n ? n.badge : undefined);
    return (
      <Link key={n.href} href={n.href} className="ops-nav-link" aria-current={isActive(n.href, "exact" in n ? n.exact : false) ? "page" : undefined} onClick={onClick}>
        <n.Icon size={18} aria-hidden />
        <span className="flex-1 truncate">{n.label}</span>
        {count > 0 && "badge" in n && n.badge === "chat" && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold" style={{ background: "var(--ops-lime)", color: "var(--ops-on-accent)" }}>{count > 99 ? "99+" : count}</span>
        )}
        {count > 0 && "badge" in n && n.badge === "tasks" && <span className="ops-faint text-[12px]">{count}</span>}
      </Link>
    );
  };

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r px-4 py-5 lg:flex" style={{ background: "color-mix(in srgb, var(--ops-surface) 70%, transparent)", backdropFilter: "blur(10px)" }}>
        <Link href="/ops" className="mb-7 flex items-center gap-2.5 px-2" aria-label="InstaBeam Workspace home">
          <LogoMark className="h-7 w-7" />
          <span className="leading-tight">
            <span className="block text-[15.5px] font-semibold tracking-tight">InstaBeam</span>
            <span className="ops-faint block text-[11px]">Workspace</span>
          </span>
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1">{NAV.map((n) => link(n))}</nav>
        <div className="mt-4 flex items-center gap-3 rounded-xl border p-2.5" style={{ background: "var(--ops-surface-2)" }}>
          <Avatar person={me} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{me.display_name}</p>
            <p className="ops-faint truncate text-[11.5px]">Co-Founder</p>
          </div>
          <form action={signOut}><button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label="Sign out"><LogOut size={15} /></button></form>
        </div>
      </aside>

      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 backdrop-blur-md lg:px-8" style={{ background: "color-mix(in srgb, var(--ops-bg) 80%, transparent)" }}>
          <Link href="/ops" className="flex items-center gap-2 lg:invisible" aria-label="Home"><LogoMark className="h-6 w-6" /><span className="text-[15px] font-semibold">InstaBeam</span></Link>
          <div className="flex items-center gap-1">
            <ThemeToggle initial={theme} compact />
            <NotificationBell userId={me.id} initial={notifications} />
            <Link href="/ops/settings" className="ml-1 lg:hidden" aria-label="Profile"><Avatar person={me} size={30} /></Link>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" style={{ background: "color-mix(in srgb, var(--ops-surface) 88%, transparent)" }}>
        {NAV.filter((n) => MOBILE_PRIMARY.includes(n.href)).map((n) => {
          const active = isActive(n.href, "exact" in n ? n.exact : false);
          const count = badgeFor("badge" in n ? n.badge : undefined);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
              className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium", active ? "" : "ops-muted")} style={active ? { color: "var(--ops-cyan-text)" } : undefined}>
              <n.Icon size={21} />
              {n.label.replace("Co-Founder ", "").replace("Overview", "Home")}
              {"badge" in n && n.badge === "chat" && count > 0 && <span className="absolute right-[26%] top-2 h-2.5 w-2.5 rounded-full" style={{ background: "var(--ops-lime)" }} />}
            </Link>
          );
        })}
        <button className="ops-muted flex h-16 flex-col items-center justify-center gap-1 text-[10.5px] font-medium" onClick={() => setMenu(true)} aria-label="More">
          <Menu size={21} />More
        </button>
      </nav>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Menu">
        <nav className="flex flex-col gap-1">{NAV.map((n) => link(n, () => setMenu(false)))}</nav>
        <hr className="ops-divider my-4" />
        <form action={signOut}><button className="ops-btn w-full"><LogOut size={16} /> Sign out</button></form>
      </Dialog>
    </div>
  );
}
