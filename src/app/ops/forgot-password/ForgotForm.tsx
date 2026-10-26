"use client";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";
import { isWorkspaceConfigured } from "@/lib/ops/supabase/config";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isWorkspaceConfigured) return setState("error");
    setState("sending");
    // PKCE: the verifier is stored by the browser client, so the link in the
    // e-mail can only be redeemed in this browser.
    const { error } = await getBrowserSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/ops/set-password`,
    });
    // Same confirmation whether or not the address exists (no account enumeration).
    setState(error && error.status !== 400 ? "error" : "sent");
  }

  if (state === "sent")
    return (
      <div className="text-center" role="status">
        <MailCheck className="mx-auto mb-3" style={{ color: "var(--ops-lime-text)" }} />
        <p className="font-medium">Check your inbox</p>
        <p className="ops-muted mt-1 text-[13px]">If that address belongs to a workspace member, a reset link is on its way. Open it in this same browser.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className="ops-label">Email</label>
        <input id="email" type="email" required autoComplete="username" className="ops-input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {state === "error" && <p role="alert" className="ops-error">Couldn&apos;t send the email right now. Please try again shortly.</p>}
      <button className="ops-btn ops-btn-primary w-full !h-11" disabled={state === "sending"}>
        {state === "sending" ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send reset link"}
      </button>
    </form>
  );
}
