"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";
import { isWorkspaceConfigured } from "@/lib/ops/supabase/config";

type Phase = "checking" | "ready" | "invalid" | "saving" | "done";

/**
 * Landing page for invitation and password-reset links. It establishes the
 * session from whichever shape the link takes (URL hash tokens from an invite,
 * a PKCE ?code= from a reset, or an already-verified session from
 * /ops/auth/confirm), then asks for a new password. Tokens are removed from
 * the address bar immediately and never stored or logged by this app.
 */
export function SetPasswordForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isWorkspaceConfigured) return setPhase("invalid");
    const supabase = getBrowserSupabase();
    (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = new URLSearchParams(window.location.search).get("code");
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token || code || hash.get("error")) window.history.replaceState(null, "", window.location.pathname);

      if (hash.get("error")) return setPhase("invalid");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        return setPhase(error ? "invalid" : "ready");
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return setPhase(error ? "invalid" : "ready");
      }
      const { data } = await supabase.auth.getUser();
      setPhase(data.user ? "ready" : "invalid");
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 12) return setError("Use at least 12 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setPhase("saving");
    const { error } = await getBrowserSupabase().auth.updateUser({ password });
    if (error) {
      setPhase("ready");
      return setError(error.message.toLowerCase().includes("weak") ? "That password is too easy to guess. Try a longer passphrase." : "Couldn't save the password. Please try again.");
    }
    setPhase("done");
    router.replace("/ops");
    router.refresh();
  }

  if (phase === "checking")
    return <div className="flex items-center justify-center gap-2 py-6 ops-muted" role="status"><Loader2 size={16} className="animate-spin" /> Verifying your link…</div>;

  if (phase === "invalid")
    return (
      <div className="text-center">
        <p className="font-medium">This link has expired or was already used</p>
        <p className="ops-muted mt-1.5 text-[13px]">For security, invitation and reset links work once and only for a short time.</p>
        <Link href="/ops/forgot-password" className="ops-btn ops-btn-primary mt-5">Get a new link</Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="pw" className="ops-label">New password</label>
        <input id="pw" type="password" autoComplete="new-password" required minLength={12} className="ops-input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
      </div>
      <div>
        <label htmlFor="pw2" className="ops-label">Confirm password</label>
        <input id="pw2" type="password" autoComplete="new-password" required minLength={12} className="ops-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {error && <p role="alert" className="ops-error">{error}</p>}
      <button className="ops-btn ops-btn-primary w-full !h-11" disabled={phase === "saving" || phase === "done"}>
        {phase === "saving" || phase === "done" ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : "Save and continue"}
      </button>
    </form>
  );
}
