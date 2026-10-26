import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/ops/AuthShell";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send a reset link if it belongs to a workspace member."
      footer={<Link href="/ops/login" style={{ color: "var(--ops-cyan-text)" }}>Back to sign in</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
