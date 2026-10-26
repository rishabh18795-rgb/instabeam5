"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { signIn, type AuthState } from "@/lib/ops/actions/auth";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, undefined);
  const error = state?.error ?? notice;
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label htmlFor="email" className="ops-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="ops-input" placeholder="you@instabeam.site" autoFocus />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="ops-label !mb-0">Password</label>
          <Link href="/ops/forgot-password" className="text-[12.5px]" style={{ color: "var(--ops-cyan-text)" }}>Forgot password?</Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="ops-input" />
      </div>
      {error && <p role="alert" className="ops-error">{error}</p>}
      <button type="submit" disabled={pending} className="ops-btn ops-btn-primary w-full !h-11">
        {pending ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign in"}
      </button>
    </form>
  );
}
