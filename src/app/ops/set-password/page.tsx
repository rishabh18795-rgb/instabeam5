import type { Metadata } from "next";
import { AuthShell } from "@/components/ops/AuthShell";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata: Metadata = { title: "Set your password" };

export default function SetPasswordPage() {
  return (
    <AuthShell title="Choose your password" subtitle="Use at least 12 characters. A passphrase works well.">
      <SetPasswordForm />
    </AuthShell>
  );
}
