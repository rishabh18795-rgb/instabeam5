import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/ops/AuthShell";
import { getSession } from "@/lib/ops/auth";
import { safeNext } from "@/lib/ops/safe-next";
import { isWorkspaceConfigured } from "@/lib/ops/supabase/config";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  if (await getSession()) redirect(safeNext(sp.next));

  const notice = sp.error === "link" ? "That link is invalid or has expired. Use “Forgot password?” to get a new one." : undefined;
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your co-founder workspace.">
      {!isWorkspaceConfigured && (
        <p role="alert" className="mb-4 rounded-xl p-3 text-[13px]" style={{ background: "var(--ops-warn-soft)", color: "var(--ops-warn)" }}>
          The workspace database isn&apos;t connected yet. Set the NEXT_PUBLIC_WORKSPACE_SUPABASE_* environment variables to enable sign-in.
        </p>
      )}
      <LoginForm next={sp.next} notice={notice} />
    </AuthShell>
  );
}
