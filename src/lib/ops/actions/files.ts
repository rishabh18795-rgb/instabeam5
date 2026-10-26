"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionForAction } from "../auth";
import { SIGNED_URL_TTL_SECONDS } from "../constants";
import { extOf, matchesMagic, validateFileMeta } from "../files";
import { STORAGE_BUCKET, WORKSPACE_ID } from "../supabase/config";
import { dbError, fail, ok, zodMessage, type Result } from "./common";
import { uuid } from "./schemas";

const refresh = () => { revalidatePath("/ops", "layout"); };

const register = z.object({
  path: z.string().min(1).max(400),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  context: z.enum(["files", "task", "project", "chat"]).default("files"),
  project_id: z.preprocess((v) => v || null, uuid.nullable()).optional(),
  task_id: z.preprocess((v) => v || null, uuid.nullable()).optional(),
});

/**
 * Step 2 of an upload. The browser sent the bytes straight to the private
 * bucket (Vercel functions cap request bodies at 4.5 MB, far below 25 MB).
 * Here the server decides whether that object is acceptable, trusting what
 * Storage reports about it — never what the client claims.
 */
export async function registerAttachment(input: unknown): Promise<Result<{ id: string }>> {
  const { supabase, userId } = await requireSessionForAction();
  const p = register.safeParse(input);
  if (!p.success) return fail(zodMessage(p.error));
  const { path, name } = p.data;

  const discard = async () => { await supabase.storage.from(STORAGE_BUCKET).remove([path]); };

  if (!path.startsWith(`${WORKSPACE_ID}/`) || path.includes("..") || path.includes("//")) return fail("Invalid file location.");
  const slash = path.lastIndexOf("/");
  const folder = path.slice(0, slash);
  const object = path.slice(slash + 1);

  // What does Storage actually hold?
  const { data: listed, error: listErr } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { search: object, limit: 5 });
  const info = listed?.find((o) => o.name === object);
  if (listErr || !info) return fail("The upload didn't finish. Please try again.");
  const size = Number((info.metadata as { size?: number } | null)?.size ?? 0);
  const mime = String((info.metadata as { mimetype?: string } | null)?.mimetype ?? "");

  const problem = validateFileMeta(name, size, mime);
  if (problem) { await discard(); return fail(problem); }

  // Sniff the first bytes of the stored object.
  const { data: signed } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 30);
  if (!signed) { await discard(); return fail("Couldn't verify the file. Please try again."); }
  const head = new Uint8Array(await (await fetch(signed.signedUrl, { headers: { Range: "bytes=0-15" }, cache: "no-store" })).arrayBuffer());
  if (!matchesMagic(extOf(name), head)) { await discard(); return fail("That file's contents don't match its type, so it was rejected."); }

  const { data, error } = await supabase
    .from("attachments")
    .insert({
      storage_path: path, file_name: name, mime_type: mime, size_bytes: size, uploaded_by: userId,
      description: p.data.description || null, context: p.data.context, project_id: p.data.project_id ?? null, task_id: p.data.task_id ?? null,
    })
    .select("id")
    .single();
  if (error) { await discard(); return fail(dbError(error)); }
  refresh();
  return ok({ id: data.id as string }, p.data.context === "chat" ? undefined : "File uploaded");
}

/** Short-lived, download-forcing signed URL. Authorised by RLS on the attachments row. */
export async function getDownloadUrl(id: string): Promise<Result<{ url: string }>> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown file.");
  const { data: row, error } = await supabase.from("attachments").select("storage_path,file_name").eq("id", id).maybeSingle();
  if (error) return fail(dbError(error));
  if (!row) return fail("That file doesn't exist or you don't have access.");
  const { data, error: sErr } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(row.storage_path, SIGNED_URL_TTL_SECONDS, { download: row.file_name });
  if (sErr || !data) return fail("Couldn't prepare the download. Please try again.");
  return ok({ url: data.signedUrl });
}

export async function updateAttachment(id: string, input: unknown): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  const p = z.object({
    description: z.string().trim().max(1000).nullable().optional(),
    project_id: z.preprocess((v) => v || null, uuid.nullable()).optional(),
    task_id: z.preprocess((v) => v || null, uuid.nullable()).optional(),
  }).safeParse(input);
  if (!uuid.safeParse(id).success) return fail("Unknown file.");
  if (!p.success) return fail(zodMessage(p.error));
  const { error } = await supabase.from("attachments").update(p.data).eq("id", id);
  if (error) return fail(dbError(error));
  refresh();
  return ok(undefined, "File updated");
}

/** Deletes metadata (RLS: uploader only) first, then the object. */
export async function deleteAttachment(id: string): Promise<Result> {
  const { supabase } = await requireSessionForAction();
  if (!uuid.safeParse(id).success) return fail("Unknown file.");
  const { data: row } = await supabase.from("attachments").select("storage_path,uploaded_by").eq("id", id).maybeSingle();
  if (!row) return fail("That file doesn't exist or you don't have access.");
  const { data: deleted, error } = await supabase.from("attachments").delete().eq("id", id).select("id");
  if (error) return fail(dbError(error));
  if (!deleted?.length) return fail("Only the person who uploaded a file can delete it.");
  await supabase.storage.from(STORAGE_BUCKET).remove([row.storage_path]);
  refresh();
  return ok(undefined, "File deleted");
}
