"use client";
import { registerAttachment } from "@/lib/ops/actions/files";
import { safeFileName, validateFileMeta } from "@/lib/ops/files";
import { STORAGE_BUCKET, WORKSPACE_ID } from "@/lib/ops/supabase/config";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";

export type UploadResult = { ok: true; id: string } | { ok: false; error: string };

/** Direct-to-storage upload (the browser's session is authorised by storage RLS), then server-side registration. */
export async function uploadFile(
  file: File,
  opts: { context: "files" | "task" | "project" | "chat"; project_id?: string | null; task_id?: string | null; description?: string },
): Promise<UploadResult> {
  const bad = validateFileMeta(file.name, file.size, file.type);
  if (bad) return { ok: false, error: bad };
  const supabase = getBrowserSupabase();
  const folder = opts.context === "chat" ? "chat" : "files";
  const path = `${WORKSPACE_ID}/${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false, cacheControl: "0" });
  if (error) return { ok: false, error: /exceeded|size/i.test(error.message) ? "That file is too large." : /mime|type/i.test(error.message) ? "That file type isn't allowed." : "Upload failed. Please try again." };
  const r = await registerAttachment({ path, name: file.name, ...opts });
  return r.ok && r.data ? { ok: true, id: r.data.id } : { ok: false, error: r.ok ? "Upload failed." : r.error };
}
