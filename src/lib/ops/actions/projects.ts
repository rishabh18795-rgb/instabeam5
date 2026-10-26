"use server";
import { revalidatePath } from "next/cache";
import { requireSessionForAction } from "../auth";
import { dbError, fail, ok, zodMessage, type Result } from "./common";
import { projectInput, projectStatus, uuid } from "./schemas";

const refresh = () => { revalidatePath("/ops", "layout"); };

function shape(p: ReturnType<typeof projectInput.parse>) {
  // In auto mode the database derives progress from tasks; ignore any client value.
  const { progress, progress_mode, ...rest } = p;
  return progress_mode === "manual" ? { ...rest, progress_mode, progress } : { ...rest, progress_mode };
}

export async function createProject(input: unknown): Promise<Result<{ id: string }>> {
  const { supabase, userId } = await requireSessionForAction();
  const p = projectInput.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { data, error } = await supabase.from("projects").insert({ ...shape(p.data), owner_id: p.data.owner_id ?? userId }).select("id").single();
  if (error) return fail(dbError(error));
  refresh();
  return ok({ id: data.id as string }, "Project created");
}

export async function updateProject(id: string, input: unknown): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown project.");
  const p = projectInput.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { error } = await supabase.from("projects").update(shape(p.data)).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Project updated");
}

export async function setProjectStatus(id: string, status: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const s = projectStatus.safeParse(status);
  if (!uuid.safeParse(id).success || !s.success) return fail("Unknown project or status.");
  const { error } = await supabase.from("projects").update({ status: s.data }).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Status updated");
}

export async function deleteProject(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown project.");
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Project deleted");
}

export async function setCollaborator(projectId: string, userId: string, on: boolean): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(projectId).success || !uuid.safeParse(userId).success) return fail("Unknown project or person.");
  const { error } = on
    ? await supabase.from("project_members").upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id", ignoreDuplicates: true })
    : await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}
