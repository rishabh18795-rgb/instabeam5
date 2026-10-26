"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionForAction } from "../auth";
import { dbError, fail, ok, zodMessage, type Result } from "./common";
import { goalInput, uuid } from "./schemas";

const refresh = () => { revalidatePath("/ops", "layout"); };

export async function createGoal(input: unknown): Promise<Result<{ id: string }>> {
  const { supabase, userId } = await requireSessionForAction();
  const p = goalInput.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { milestones, ...g } = p.data;
  const row = g.kind === "milestone" ? { ...g, target_value: null, current_value: 0 } : g;
  const { data, error } = await supabase.from("goals").insert({ ...row, owner_id: g.owner_id ?? userId }).select("id").single();
  if (error) return fail(dbError(error));
  if (g.kind === "milestone" && milestones.length) {
    const { error: mErr } = await supabase.from("goal_milestones").insert(milestones.map((title, position) => ({ goal_id: data.id, title, position })));
    if (mErr) return fail(dbError(mErr));
  }
  refresh();
  return ok({ id: data.id as string }, "Goal created");
}

export async function updateGoal(id: string, input: unknown): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown goal.");
  const p = goalInput.safeParse({ ...(input as object), milestones: ["_"] }); // milestones are edited separately
  if (!p.success) return fail(zodMessage(p.error));
  const { milestones: _m, kind: _k, ...g } = p.data;
  void _m; void _k;
  const { error } = await supabase.from("goals").update(g).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Goal updated");
}

/** Records a numeric update (and its history row) atomically via the log_goal_progress RPC. */
export async function logProgress(id: string, value: number, note?: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const v = z.number().min(0, "The value can't be negative.").max(1e12).safeParse(Number(value));
  const n = z.string().trim().max(2000).optional().safeParse(note);
  if (!uuid.safeParse(id).success) return fail("Unknown goal.");
  if (!v.success) return fail(zodMessage(v.error));
  if (!n.success) return fail("That note is too long.");
  const { error } = await supabase.rpc("log_goal_progress", { p_goal: id, p_value: v.data, p_note: n.data ?? null });
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Progress updated");
}

export async function toggleMilestone(id: string, done: boolean): Promise<Result> {
  const { supabase, userId } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown milestone.");
  const { data, error } = await supabase.from("goal_milestones").update({ done: !!done }).eq("id", id).select("goal_id,title").single();
  if (error) return fail(dbError(error));
  // Leave a history entry so the activity feed shows milestone progress.
  await supabase.from("goal_updates").insert({ goal_id: data.goal_id, author_id: userId, note: `${done ? "Completed" : "Reopened"} milestone: ${data.title}` });
  refresh();
  return ok();
}

export async function addMilestone(goalId: string, title: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const t = z.string().trim().min(1, "Write the milestone.").max(160).safeParse(title);
  if (!uuid.safeParse(goalId).success) return fail("Unknown goal.");
  if (!t.success) return fail(zodMessage(t.error));
  const { count } = await supabase.from("goal_milestones").select("id", { count: "exact", head: true }).eq("goal_id", goalId);
  const { error } = await supabase.from("goal_milestones").insert({ goal_id: goalId, title: t.data, position: count ?? 0 });
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}

export async function deleteMilestone(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown milestone.");
  const { error } = await supabase.from("goal_milestones").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}

export async function deleteGoal(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown goal.");
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Goal deleted");
}
