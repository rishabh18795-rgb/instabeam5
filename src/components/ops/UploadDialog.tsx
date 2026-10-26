"use client";
import { FileUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FILE_ACCEPT, MAX_UPLOAD_BYTES } from "@/lib/ops/constants";
import { formatBytes } from "@/lib/ops/format";
import { Dialog } from "./Dialog";
import { Field, ProjectSelect } from "./forms";
import { useToast } from "./Toast";
import { uploadFile } from "./upload";

export function UploadDialog({ open, onClose, projects, tasks, defaults }: {
  open: boolean; onClose: () => void; projects: { id: string; name: string }[]; tasks?: { id: string; title: string }[];
  defaults?: { project_id?: string | null; task_id?: string | null };
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!files.length) return toast.error("Choose a file first.");
    const fd = new FormData(e.currentTarget);
    const project_id = (fd.get("project_id") as string) || null;
    const task_id = (fd.get("task_id") as string) || null;
    const description = ((fd.get("description") as string) || "").trim();
    setBusy(true);
    let okCount = 0;
    for (const f of files) {
      const r = await uploadFile(f, { context: task_id ? "task" : project_id ? "project" : "files", project_id, task_id, description });
      if (r.ok) okCount++; else toast.error(`${f.name}: ${r.error}`);
    }
    setBusy(false);
    if (okCount) { toast.ok(okCount === 1 ? "File uploaded" : `${okCount} files uploaded`); router.refresh(); setFiles([]); onClose(); }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Upload files" description={`PDF, DOCX, XLSX, PPTX, CSV, PNG, JPG or ZIP · up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB each. Stored privately.`}>
      <form onSubmit={submit} className="space-y-4">
        <div
          className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors"
          style={{ borderColor: drag ? "var(--ops-cyan)" : "var(--ops-border-strong)", background: drag ? "var(--ops-cyan-soft)" : "transparent" }}
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); setFiles(Array.from(e.dataTransfer.files).slice(0, 10)); }}
          role="button" tabIndex={0} aria-label="Choose files to upload"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }}
        >
          <FileUp size={26} style={{ color: "var(--ops-cyan-text)" }} />
          <p className="mt-2 text-[13.5px] font-medium">Drop files here or click to browse</p>
          <input ref={input} type="file" multiple accept={FILE_ACCEPT} className="sr-only" onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 10))} />
        </div>
        {files.length > 0 && (
          <ul className="space-y-1.5 text-[13px]">
            {files.map((f) => <li key={f.name + f.size} className="flex justify-between gap-3"><span className="truncate">{f.name}</span><span className="ops-muted shrink-0">{formatBytes(f.size)}</span></li>)}
          </ul>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project" htmlFor="u-project"><ProjectSelect id="u-project" name="project_id" projects={projects} defaultValue={defaults?.project_id} /></Field>
          {tasks && (
            <Field label="Task" htmlFor="u-task">
              <select id="u-task" name="task_id" className="ops-select" defaultValue={defaults?.task_id ?? ""}>
                <option value="">No task</option>{tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </Field>
          )}
        </div>
        <Field label="Description (optional)" htmlFor="u-desc"><input id="u-desc" name="description" className="ops-input" maxLength={1000} placeholder="What is this file?" /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ops-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="ops-btn ops-btn-primary" disabled={busy}>{busy ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : "Upload"}</button>
        </div>
      </form>
    </Dialog>
  );
}
