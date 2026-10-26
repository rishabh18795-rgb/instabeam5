import "server-only";
import { requireSession } from "./auth";
import { getServerSupabase } from "./supabase/server";
import type { Person } from "./types";

/**
 * Everything most pages need: session, both founders and the project list.
 * The project list is fetched in the same round trip as the session check (RLS
 * already limits it to members), so a page costs two sequential database round
 * trips in total: this one, then its own queries.
 */
export async function getBasics() {
  const supabase = await getServerSupabase();
  const [session, { data: projects }] = await Promise.all([
    requireSession(),
    supabase.from("projects").select("id,name,status").order("name"),
  ]);
  const byId = new Map<string, Person>(session.people.map((p) => [p.id, p]));
  return { ...session, byId, projects: (projects ?? []) as { id: string; name: string; status: string }[] };
}

export const person = (byId: Map<string, Person>, id: string | null | undefined): Person | null => (id ? byId.get(id) ?? null : null);
