"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { requireSessionForAction } from "../auth";
import { STORAGE_BUCKET, WORKSPACE_ID } from "../supabase/config";
import { dbError, fail, ok, zodMessage, type Result } from "./common";

const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Enter a display name.").max(80),
  notify_prefs: z.object({
    chat: z.boolean(), tasks: z.boolean(), comments: z.boolean(), goals: z.boolean(), files: z.boolean(), deadlines: z.boolean(),
  }),
});

export async function updateProfile(input: unknown): Promise<Result> {
  const { supabase, userId } = await requireSessionForAction();
  const p = profileSchema.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { error } = await supabase.from("profiles").update(p.data).eq("id", userId);
  if (error) return fail(dbError(error));
  revalidatePath("/ops", "layout");
  return ok(undefined, "Profile saved");
}

export async function setTheme(theme: "dark" | "light" | "system"): Promise<Result> {
  const { supabase, userId } = await requireSessionForAction();
  if (!["dark", "light", "system"].includes(theme)) return fail("Unknown theme.");
  (await cookies()).set("ops-theme", theme, { path: "/ops", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  await supabase.from("profiles").update({ theme }).eq("id", userId); // best-effort sync across devices
  return ok();
}

/** Called after the browser uploaded an avatar straight to the private bucket. */
export async function saveAvatar(path: string): Promise<Result> {
  const { supabase, userId } = await requireSessionForAction();
  // Only paths inside this user's own avatar folder are accepted.
  if (!path.startsWith(`${WORKSPACE_ID}/avatars/${userId}/`) || path.includes("..")) return fail("Invalid avatar location.");
  const { data: obj } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 30);
  if (!obj) return fail("That image didn't upload. Please try again.");
  const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
  if (error) return fail(dbError(error));
  revalidatePath("/ops", "layout");
  return ok(undefined, "Avatar updated");
}
