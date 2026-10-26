"use client";
import { Camera, KeyRound, LogOut, Loader2, MailCheck, MailQuestion, UserCheck } from "lucide-react";
import { useRef, useState } from "react";
import { signOut } from "@/lib/ops/actions/auth";
import { saveAvatar, updateProfile } from "@/lib/ops/actions/settings";
import { STORAGE_BUCKET, WORKSPACE_ID } from "@/lib/ops/supabase/config";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";
import { formatDate } from "@/lib/ops/format";
import type { Profile, TeamMember } from "@/lib/ops/types";
import { Field, SubmitButton } from "./forms";
import { ThemeToggle } from "./ThemeToggle";
import { useToast } from "./Toast";
import { useAction } from "./useAction";
import { Avatar, Badge, SectionCard } from "./ui";

const NOTIFY: { key: keyof Profile["notify_prefs"]; label: string; hint: string }[] = [
  { key: "chat", label: "Chat messages", hint: "When your co-founder messages you" },
  { key: "tasks", label: "Task assignments", hint: "When a task is assigned to you" },
  { key: "comments", label: "Task comments", hint: "When someone comments on your tasks" },
  { key: "goals", label: "Goal updates", hint: "When a target is updated" },
  { key: "files", label: "File uploads", hint: "When a file is shared" },
  { key: "deadlines", label: "Deadlines", hint: "Tasks due soon or overdue" },
];

export function SettingsView({ profile, avatarUrl, workspace, team }: {
  profile: Profile; avatarUrl: string | null; workspace: { name: string; tagline: string | null; timezone: string }; team: TeamMember[];
}) {
  const [name, setName] = useState(profile.display_name);
  const [prefs, setPrefs] = useState(profile.notify_prefs);
  const [busyAvatar, setBusyAvatar] = useState(false);
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { run, pending } = useAction();
  const toast = useToast();

  async function pickAvatar(f?: File) {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) return toast.error("Use a PNG or JPG image.");
    if (f.size > 2 * 1024 * 1024) return toast.error("Avatars can be up to 2 MB.");
    setBusyAvatar(true);
    const ext = f.type === "image/png" ? "png" : "jpg";
    const path = `${WORKSPACE_ID}/avatars/${profile.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await getBrowserSupabase().storage.from(STORAGE_BUCKET).upload(path, f, { contentType: f.type, cacheControl: "3600" });
    if (error) { setBusyAvatar(false); return toast.error("Couldn't upload that image."); }
    run(() => saveAvatar(path), { onDone: () => setBusyAvatar(false) });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 12) return toast.error("Use at least 12 characters.");
    if (pw.next !== pw.confirm) return toast.error("The two passwords don't match.");
    setPwBusy(true);
    const { error } = await getBrowserSupabase().auth.updateUser({ password: pw.next });
    setPwBusy(false);
    if (error) return toast.error("Couldn't change the password. Try a longer passphrase.");
    setPw({ next: "", confirm: "" });
    toast.ok("Password changed");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title="Profile">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative">
            <Avatar person={{ id: profile.id, display_name: name || profile.display_name, avatar_path: profile.avatar_path, avatar_url: avatarUrl }} size={64} />
            <button className="ops-btn ops-btn-icon ops-btn-sm absolute -bottom-1 -right-1 !rounded-full" aria-label="Change avatar" onClick={() => fileRef.current?.click()} disabled={busyAvatar}>
              {busyAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}</button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(e) => pickAvatar(e.target.files?.[0])} aria-label="Avatar image" />
          </div>
          <div><p className="font-medium">{profile.display_name}</p><p className="ops-muted text-[13px]">{profile.email}</p><Badge tone="cyan" className="mt-1.5">Co-Founder</Badge></div>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(() => updateProfile({ display_name: name, notify_prefs: prefs })); }}>
          <Field label="Display name" htmlFor="s-name"><input id="s-name" className="ops-input" value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} /></Field>
          <div>
            <p className="ops-label">Notifications</p>
            <ul className="divide-y rounded-xl border">
              {NOTIFY.map((n) => (
                <li key={n.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <label htmlFor={`n-${n.key}`} className="min-w-0 flex-1 cursor-pointer"><span className="block text-[13.5px] font-medium">{n.label}</span><span className="ops-faint block text-[12px]">{n.hint}</span></label>
                  <input id={`n-${n.key}`} type="checkbox" role="switch" className="h-5 w-9 cursor-pointer appearance-none rounded-full transition-colors checked:bg-[var(--ops-lime)]" style={{ background: prefs[n.key] ? undefined : "var(--ops-surface-3)", position: "relative" }}
                    checked={prefs[n.key]} onChange={(e) => setPrefs((p) => ({ ...p, [n.key]: e.target.checked }))} />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end"><SubmitButton pending={pending}>Save profile</SubmitButton></div>
        </form>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard title="Appearance"><ThemeToggle initial={profile.theme} /><p className="ops-muted mt-3 text-[12.5px]">Saved to your account and remembered on this device.</p></SectionCard>

        <SectionCard title="Workspace">
          <dl className="grid grid-cols-2 gap-3 text-[13.5px]">
            <div><dt className="ops-eyebrow mb-1">Name</dt><dd>{workspace.name}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Tagline</dt><dd>{workspace.tagline ?? "—"}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Timezone</dt><dd>{workspace.timezone}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Access</dt><dd>Invitation only</dd></div>
          </dl>
          <hr className="ops-divider my-4" />
          <p className="ops-eyebrow mb-2">Co-founders</p>
          <ul className="space-y-2">
            {team.map((t) => (
              <li key={t.email} className="flex items-center gap-3 text-[13.5px]">
                <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: "var(--ops-surface-3)" }}>{t.state === "active" ? <UserCheck size={15} style={{ color: "var(--ops-lime-text)" }} /> : t.state === "invited" ? <MailCheck size={15} style={{ color: "var(--ops-warn)" }} /> : <MailQuestion size={15} className="ops-faint" />}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{t.display_name}</p><p className="ops-faint truncate text-[12px]">{t.email}</p></div>
                {t.state === "active" ? <Badge tone="lime" dot>Active{t.last_sign_in_at ? ` · ${formatDate(t.last_sign_in_at)}` : ""}</Badge> : t.state === "invited" ? <Badge tone="warn" dot>Invitation pending</Badge> : <Badge dot>Not invited</Badge>}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Security">
          <form className="space-y-3" onSubmit={changePassword}>
            <Field label="New password" htmlFor="pw1" hint="At least 12 characters."><input id="pw1" type="password" autoComplete="new-password" className="ops-input" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} /></Field>
            <Field label="Confirm new password" htmlFor="pw2"><input id="pw2" type="password" autoComplete="new-password" className="ops-input" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} /></Field>
            <button className="ops-btn" disabled={pwBusy || !pw.next}>{pwBusy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Change password</button>
          </form>
          <hr className="ops-divider my-4" />
          <form action={signOut}><button className="ops-btn ops-btn-danger"><LogOut size={15} /> Sign out</button></form>
        </SectionCard>
      </div>
    </div>
  );
}
