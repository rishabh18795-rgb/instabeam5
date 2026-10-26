"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionForAction } from "../auth";
import { dbError, fail, ok, zodMessage, type Result } from "./common";
import { uuid } from "./schemas";

const send = z.object({
  conversation_id: uuid,
  body: z.string().max(4000, "Messages can be up to 4,000 characters.").default(""),
  reply_to: z.preprocess((v) => v || null, uuid.nullable()).optional(),
  attachment_id: z.preprocess((v) => v || null, uuid.nullable()).optional(),
}).refine((m) => m.body.trim().length > 0 || m.attachment_id, { message: "Write a message or attach a file." });

export async function sendMessage(input: unknown): Promise<Result<{ id: string; created_at: string }>> {
  const { supabase } = await requireSessionForAction();
  const p = send.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  // sender_id is stamped from the JWT by a database trigger; whatever the client sends is ignored.
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: p.data.conversation_id, body: p.data.body.trim(), reply_to: p.data.reply_to ?? null, attachment_id: p.data.attachment_id ?? null })
    .select("id,created_at")
    .single();
  if (error) return fail(dbError(error));
  return ok({ id: data.id as string, created_at: data.created_at as string });
}

export async function markConversationRead(conversationId: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(conversationId).success) return fail("Unknown conversation.");
  // Stamped with the database clock (migration 0003), never the web server's.
  const { error } = await supabase.rpc("mark_conversation_read", { p_conversation: conversationId });
  if (error) return fail(dbError(error));
  revalidatePath("/ops", "layout");
  return ok();
}

export async function searchMessages(conversationId: string, query: string): Promise<Result<{ id: string; body: string; sender_id: string | null; created_at: string }[]>> {
  const { supabase } = await requireSessionForAction();
  const q = query.trim().slice(0, 100);
  if (!uuid.safeParse(conversationId).success) return fail("Unknown conversation.");
  if (q.length < 2) return ok([]);
  // Escape LIKE wildcards so the search is a literal substring match.
  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const { data, error } = await supabase.from("messages").select("id,body,sender_id,created_at").eq("conversation_id", conversationId).ilike("body", pattern).order("created_at", { ascending: false }).limit(30);
  if (error) return fail(dbError(error));
  return ok(data ?? []);
}
