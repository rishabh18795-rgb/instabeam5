import type { Metadata } from "next";
import { PageHeader } from "@/components/ops/ui";
import { ProjectsView } from "@/components/ops/ProjectsView";
import { getBasics } from "@/lib/ops/data";
import type { Project } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { supabase, userId, people } = await getBasics();
  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("id,name,description,owner_id,status,priority,start_date,deadline,progress,progress_mode,created_at,updated_at").order("created_at", { ascending: true }),
    supabase.from("tasks").select("project_id,status").not("project_id", "is", null),
  ]);
  const counts = new Map<string, { open: number; total: number }>();
  for (const t of tasks ?? []) {
    const c = counts.get(t.project_id as string) ?? { open: 0, total: 0 };
    c.total++; if (t.status !== "completed") c.open++;
    counts.set(t.project_id as string, c);
  }
  const rows = ((projects ?? []) as Project[]).map((p) => ({ ...p, open_tasks: counts.get(p.id)?.open ?? 0, total_tasks: counts.get(p.id)?.total ?? 0 }));
  return (
    <>
      <PageHeader title="Projects" subtitle="Everything InstaBeam is working on, with live progress from its tasks." />
      <ProjectsView projects={rows} people={people} meId={userId} />
    </>
  );
}
