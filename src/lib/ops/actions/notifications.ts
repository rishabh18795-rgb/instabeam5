"use server";
import { revalidatePath } from "next/cache";
import { requireSessionForAction } from "../auth";
import { dbError, fail, ok, type Result } from "./common";

export async function markNotificationsRead(ids?: string[]): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  let q = supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (ids?.length) q = q.in("id", ids.slice(0, 100));
  const { error } = await q;
  if (error) return fail(dbError(error));
  revalidatePath("/ops", "layout");
  return ok();
}

export async function dismissNotification(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) return fail(dbError(error));
  revalidatePath("/ops", "layout");
  return ok();
}
