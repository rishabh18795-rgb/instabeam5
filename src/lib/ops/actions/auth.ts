"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getServerSupabase } from "../supabase/server";
import { isWorkspaceConfigured } from "../supabase/config";

export type AuthState = { error?: string } | undefined;

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

/** Only same-site /ops paths — blocks open redirects via ?next=. */
export function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/ops";
  if (!next.startsWith("/ops") || next.startsWith("//") || next.includes("\\") || next.includes("://")) return "/ops";
  return next;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isWorkspaceConfigured) return { error: "The workspace database isn't configured yet." };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details." };

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  // One generic message for every failure: never reveal whether an address has an account.
  if (error || !data.user) return { error: "Incorrect email or password." };

  // A valid Supabase account is not enough — it must also be a workspace member.
  const { data: member } = await supabase.from("workspace_members").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!member) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the InstaBeam workspace." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  if (isWorkspaceConfigured) {
    const supabase = await getServerSupabase();
    await supabase.auth.signOut();
  }
  redirect("/ops/login");
}
