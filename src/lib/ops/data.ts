import "server-only";
import { getPeople, requireSession } from "./auth";
import type { Person } from "./types";

/** Everything most pages need: session, both founders (with signed avatar URLs) and the project list. */
export async function getBasics() {
  const session = await requireSession();
  const [people, { data: projects }] = await Promise.all([
    getPeople(),
    session.supabase.from("projects").select("id,name,status").order("name"),
  ]);
  const byId = new Map<string, Person>(people.map((p) => [p.id, p]));
  return { ...session, people, byId, projects: (projects ?? []) as { id: string; name: string; status: string }[] };
}

export const person = (byId: Map<string, Person>, id: string | null | undefined): Person | null => (id ? byId.get(id) ?? null : null);
