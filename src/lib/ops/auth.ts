import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getServerSupabase } from "./supabase/server";
import { isWorkspaceConfigured, STORAGE_BUCKET } from "./supabase/config";
import type { Person, Profile } from "./types";

export type Session = {
  supabase: Awaited<ReturnType<typeof getServerSupabase>>;
  userId: string;
  profile: Profile & { avatar_url: string | null };
};

/**
 * The single authorisation gate for the workspace. Every page AND every
 * server action calls this: it validates the JWT with the auth server, then
 * proves workspace membership through RLS (workspace_members is only visible
 * to its own members). Hiding UI is never the control.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isWorkspaceConfigured) return null;
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const [{ data: membership }, { data: profile }] = await Promise.all([
    supabase.from("workspace_members").select("user_id").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("profiles").select("id,email,display_name,avatar_path,theme,notify_prefs").eq("id", auth.user.id).maybeSingle(),
  ]);
  if (!membership || !profile) return null;

  const avatar_url = await signedAvatarUrl(supabase, profile.avatar_path);
  return { supabase, userId: auth.user.id, profile: { ...(profile as Profile), avatar_url } };
});

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/ops/login");
  return s;
}

/** For server actions: throws instead of redirecting so the client gets a clean error. */
export async function requireSessionForAction(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Your session has expired. Please sign in again.");
  return s;
}

async function signedAvatarUrl(supabase: Session["supabase"], path: string | null) {
  if (!path) return null;
  const { data } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** Both founders, with short-lived signed avatar URLs. */
export const getPeople = cache(async (): Promise<Person[]> => {
  const s = await getSession();
  if (!s) return [];
  const { data } = await s.supabase.from("profiles").select("id,display_name,avatar_path").order("display_name");
  const rows = (data ?? []) as Person[];
  return Promise.all(rows.map(async (p) => ({ ...p, avatar_url: await signedAvatarUrl(s.supabase, p.avatar_path) })));
});
