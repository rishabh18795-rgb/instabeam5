import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getServerSupabase } from "./supabase/server";
import { isWorkspaceConfigured, STORAGE_BUCKET } from "./supabase/config";
import type { Person, Profile } from "./types";

type Supabase = Awaited<ReturnType<typeof getServerSupabase>>;

export type Session = {
  supabase: Supabase;
  userId: string;
  profile: Profile & { avatar_url: string | null };
  /** Both co-founders (public fields only), avatars already signed. */
  people: Person[];
};

/**
 * The single authorisation gate for the workspace. Every page AND every server
 * action calls this.
 *
 *  1. The JWT is verified locally (signature + expiry) with getClaims().
 *  2. Workspace membership is proven through RLS: workspace_members is only
 *     visible to its own members, so a valid token for a non-member finds no row.
 *
 * Steps 2 and the profile read run in ONE parallel round trip, and the same
 * profile query supplies both founders, so no page needs a second lookup.
 * Hiding UI is never the control.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isWorkspaceConfigured) return null;
  const supabase = await getServerSupabase();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return null;

  const [{ data: membership }, { data: rows }] = await Promise.all([
    supabase.from("workspace_members").select("user_id").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("id,email,display_name,avatar_path,theme,notify_prefs").order("display_name"),
  ]);
  const me = (rows ?? []).find((p) => p.id === userId);
  if (!membership || !me) return null;

  const urls = await signedAvatarUrls(supabase, (rows ?? []).map((p) => p.avatar_path as string | null));
  const people: Person[] = (rows ?? []).map((p, i) => ({
    id: p.id as string, display_name: p.display_name as string, avatar_path: p.avatar_path as string | null, avatar_url: urls[i],
  }));
  const idx = (rows ?? []).findIndex((p) => p.id === userId);
  return { supabase, userId, profile: { ...(me as unknown as Profile), avatar_url: urls[idx] ?? null }, people };
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

/** One batched call (and none at all while nobody has an avatar). */
async function signedAvatarUrls(supabase: Supabase, paths: (string | null)[]): Promise<(string | null)[]> {
  const wanted = [...new Set(paths.filter((p): p is string => !!p))];
  if (!wanted.length) return paths.map(() => null);
  const { data } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrls(wanted, 3600);
  const byPath = new Map((data ?? []).map((d) => [d.path, d.signedUrl]));
  return paths.map((p) => (p ? byPath.get(p) ?? null : null));
}

/** Both founders, with short-lived signed avatar URLs (already loaded with the session). */
export const getPeople = cache(async (): Promise<Person[]> => (await getSession())?.people ?? []);
