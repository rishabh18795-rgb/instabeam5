import { Activity } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/ops/ActivityList";
import { EmptyState, PageHeader } from "@/components/ops/ui";
import { ACTIVITY_GROUPS } from "@/lib/ops/activity";
import { uuid } from "@/lib/ops/actions/schemas";
import { getBasics } from "@/lib/ops/data";
import type { ActivityEvent } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Activity" };
const PAGE = 30;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ project?: string; user?: string; type?: string; limit?: string }> }) {
  const sp = await searchParams;
  const { supabase, people, byId, projects } = await getBasics();
  const limit = Math.min(Math.max(Number(sp.limit) || PAGE, PAGE), 300);
  const project = uuid.safeParse(sp.project).success ? sp.project! : "";
  const user = uuid.safeParse(sp.user).success ? sp.user! : "";
  const type = ACTIVITY_GROUPS.some((g) => g.value === sp.type) ? sp.type! : "";

  let q = supabase.from("activity_events").select("id,actor_id,type,entity_type,entity_id,entity_title,project_id,meta,created_at").order("created_at", { ascending: false }).limit(limit + 1);
  if (project) q = q.eq("project_id", project);
  if (user) q = q.eq("actor_id", user);
  if (type) q = q.eq("entity_type", type);
  const { data } = await q;
  const pname = new Map(projects.map((p) => [p.id, p.name]));
  const rows = ((data ?? []) as ActivityEvent[]).slice(0, limit).map((e) => ({ ...e, project: e.project_id ? { id: e.project_id, name: pname.get(e.project_id) ?? "Project" } : null }));
  const more = (data?.length ?? 0) > limit;
  const filtered = !!(project || user || type);
  const next = new URLSearchParams({ ...(project && { project }), ...(user && { user }), ...(type && { type }), limit: String(limit + PAGE) });

  return (
    <>
      <PageHeader title="Activity" subtitle="A record of what changed, who changed it and when. It can't be edited." />
      <form className="mb-5 flex flex-wrap items-center gap-3" method="get">
        <select name="user" aria-label="Filter by person" className="ops-select ops-input-sm !w-auto" defaultValue={user}><option value="">Everyone</option>{people.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}</select>
        <select name="type" aria-label="Filter by type" className="ops-select ops-input-sm !w-auto" defaultValue={type}><option value="">All activity</option>{ACTIVITY_GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</select>
        <select name="project" aria-label="Filter by project" className="ops-select ops-input-sm !w-auto" defaultValue={project}><option value="">All projects</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <button className="ops-btn ops-btn-sm">Apply</button>
        {filtered && <Link href="/ops/activity" className="ops-btn ops-btn-ghost ops-btn-sm">Clear</Link>}
      </form>
      <div className="ops-card ops-card-pad">
        {rows.length === 0 ? <EmptyState icon={<Activity size={22} />} title={filtered ? "No activity matches these filters" : "No activity yet"} body={filtered ? "Try clearing a filter." : "Creating tasks, uploading files and updating goals will be recorded here."} />
          : <ActivityList events={rows} byId={byId} />}
        {more && <div className="mt-4 text-center"><Link href={`/ops/activity?${next}`} className="ops-btn">Load more</Link></div>}
      </div>
    </>
  );
}
