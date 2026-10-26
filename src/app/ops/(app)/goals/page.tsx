import type { Metadata } from "next";
import { GoalsView } from "@/components/ops/GoalsView";
import { PageHeader } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import type { Goal, GoalUpdate } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Goals & Targets" };

export default async function GoalsPage() {
  const { supabase, userId, people, byId, projects } = await getBasics();
  const [{ data: goals }, { data: updates }] = await Promise.all([
    supabase.from("goals").select("id,title,description,owner_id,project_id,kind,target_value,current_value,unit,start_date,deadline,status,progress,notes,created_at,goal_milestones(id,goal_id,title,done,position)").order("created_at", { ascending: false }),
    supabase.from("goal_updates").select("id,goal_id,note,previous_value,new_value,created_at,author_id").order("created_at", { ascending: false }).limit(200),
  ]);
  const grouped: Record<string, GoalUpdate[]> = {};
  for (const u of updates ?? []) {
    const row = { ...(u as unknown as GoalUpdate & { author_id: string | null }), author: u.author_id ? byId.get(u.author_id as string) ?? null : null };
    (grouped[u.goal_id as string] ??= []).push(row);
  }
  return (
    <>
      <PageHeader title="Goals & Targets" subtitle="Numbers and milestones you're both working towards. Every figure here is one you entered." />
      <GoalsView goals={(goals ?? []) as unknown as Goal[]} updates={grouped} people={people} projects={projects.map(({ id, name }) => ({ id, name }))} meId={userId} />
    </>
  );
}
