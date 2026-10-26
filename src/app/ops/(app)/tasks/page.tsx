import type { Metadata } from "next";
import { PageHeader } from "@/components/ops/ui";
import { TasksView } from "@/components/ops/TasksView";
import { getBasics } from "@/lib/ops/data";
import type { Task } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Tasks" };
const VIEWS = ["mine", "all", "board", "calendar", "completed"] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string; task?: string }> }) {
  const sp = await searchParams;
  const { supabase, userId, people, projects } = await getBasics();
  const { data } = await supabase
    .from("tasks")
    .select("id,project_id,title,description,assignee_id,created_by,status,priority,start_date,due_date,completed_at,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  const pname = new Map(projects.map((p) => [p.id, p.name]));
  const tasks = ((data ?? []) as Task[]).map((t) => ({ ...t, project: t.project_id ? { id: t.project_id, name: pname.get(t.project_id) ?? "Project" } : null }));
  const view = (VIEWS as readonly string[]).includes(sp.view ?? "") ? (sp.view as (typeof VIEWS)[number]) : "mine";

  return (
    <>
      <PageHeader title="Tasks" subtitle="Create, assign and track work between the two of you." />
      <TasksView initialTasks={tasks} people={people} projects={projects.map(({ id, name }) => ({ id, name }))} meId={userId} initialView={view} initialTaskId={sp.task} />
    </>
  );
}
