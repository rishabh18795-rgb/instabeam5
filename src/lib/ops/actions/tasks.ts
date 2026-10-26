"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionForAction } from "../auth";
import { dbError, fail, nullable, ok, zodMessage, type Result } from "./common";
import { taskInput, taskStatus, uuid } from "./schemas";

const refresh = () => { revalidatePath("/ops", "layout"); };

export async function createTask(input: unknown): Promise<Result<{ id: string }>> {
  const { supabase } = await requireSessionForAction();
  const p = taskInput.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { data, error } = await supabase.from("tasks").insert(p.data).select("id").single();
  if (error) return fail(dbError(error));
  refresh();
  return ok({ id: data.id as string }, "Task created");
}

export async function updateTask(id: string, input: unknown): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown task.");
  const p = taskInput.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { error } = await supabase.from("tasks").update(p.data).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Task updated");
}

export async function setTaskStatus(id: string, status: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const s = taskStatus.safeParse(status);
  if (!uuid.safeParse(id).success || !s.success) return fail("Unknown task or status.");
  const { error } = await supabase.from("tasks").update({ status: s.data }).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, s.data === "completed" ? "Task completed 🎉" : "Status updated");
}

export async function deleteTask(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown task.");
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Task deleted");
}

export async function addChecklistItem(taskId: string, title: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const t = z.string().trim().min(1, "Write the checklist item.").max(200).safeParse(title);
  if (!uuid.safeParse(taskId).success) return fail("Unknown task.");
  if (!t.success) return fail(zodMessage(t.error));
  const { count } = await supabase.from("task_checklist_items").select("id", { count: "exact", head: true }).eq("task_id", taskId);
  const { error } = await supabase.from("task_checklist_items").insert({ task_id: taskId, title: t.data, position: count ?? 0 });
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}

export async function toggleChecklistItem(id: string, done: boolean): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown item.");
  const { error } = await supabase.from("task_checklist_items").update({ done: !!done }).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}

export async function deleteChecklistItem(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown item.");
  const { error } = await supabase.from("task_checklist_items").delete().eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok();
}

export async function addComment(taskId: string, body: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const b = z.string().trim().min(1, "Write a comment first.").max(4000).safeParse(body);
  if (!uuid.safeParse(taskId).success) return fail("Unknown task.");
  if (!b.success) return fail(zodMessage(b.error));
  const { error } = await supabase.from("task_comments").insert({ task_id: taskId, body: b.data });
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "Comment added");
}

export async function getTaskDetail(id: string) {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return null;
  const [checklist, comments, files] = await Promise.all([
    supabase.from("task_checklist_items").select("id,task_id,title,done,position").eq("task_id", id).order("position"),
    supabase.from("task_comments").select("id,task_id,author_id,body,created_at,author:profiles!task_comments_author_id_fkey(id,display_name,avatar_path)").eq("task_id", id).order("created_at"),
    supabase.from("attachments").select("id,file_name,size_bytes,created_at").eq("task_id", id).order("created_at", { ascending: false }),
  ]);
  return { checklist: checklist.data ?? [], comments: comments.data ?? [], files: files.data ?? [], note: nullable("") };
}
