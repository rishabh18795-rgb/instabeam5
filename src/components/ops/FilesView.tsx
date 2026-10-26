"use client";
import { FileArchive, FileImage, FileSpreadsheet, FileText, FileUp, Paperclip, Pencil, Presentation, Search, Trash2, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteAttachment, updateAttachment } from "@/lib/ops/actions/files";
import { ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/ops/constants";
import { extOf } from "@/lib/ops/files";
import { formatBytes, formatDate } from "@/lib/ops/format";
import type { Attachment, Person } from "@/lib/ops/types";
import { Dialog } from "./Dialog";
import { FileDownloadButton } from "./FileDownloadButton";
import { Field, ProjectSelect, SubmitButton } from "./forms";
import { UploadDialog } from "./UploadDialog";
import { useAction } from "./useAction";
import { Avatar, Badge, EmptyState } from "./ui";

const ICONS: Record<string, LucideIcon> = { pdf: FileText, docx: FileText, csv: FileSpreadsheet, xlsx: FileSpreadsheet, pptx: Presentation, png: FileImage, jpg: FileImage, jpeg: FileImage, zip: FileArchive };

export function FilesView({ files, people, projects, tasks, meId }: { files: Attachment[]; people: Person[]; projects: { id: string; name: string }[]; tasks: { id: string; title: string }[]; meId: string }) {
  const [q, setQ] = useState("");
  const [project, setProject] = useState("");
  const [type, setType] = useState("");
  const [by, setBy] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<Attachment | null>(null);
  const [deleting, setDeleting] = useState<Attachment | null>(null);
  const { run, pending } = useAction();
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);

  const shown = files.filter((f) => {
    if (q && !`${f.file_name} ${f.description ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (project && f.project_id !== project) return false;
    if (type && extOf(f.file_name) !== type && !(type === "jpg" && extOf(f.file_name) === "jpeg")) return false;
    if (by && f.uploaded_by !== by) return false;
    return true;
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search size={15} className="ops-faint pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="ops-input !pl-9" placeholder="Search files" aria-label="Search files" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="ops-select ops-input-sm !w-auto" aria-label="Filter by project" value={project} onChange={(e) => setProject(e.target.value)}><option value="">All projects</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select className="ops-select ops-input-sm !w-auto" aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{Object.keys(ALLOWED_FILE_TYPES).filter((e) => e !== "jpeg").map((e) => <option key={e} value={e}>{e.toUpperCase()}</option>)}</select>
        <select className="ops-select ops-input-sm !w-auto" aria-label="Filter by uploader" value={by} onChange={(e) => setBy(e.target.value)}><option value="">Anyone</option>{people.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}</select>
        <button className="ops-btn ops-btn-primary ml-auto" onClick={() => setUploading(true)}><FileUp size={16} /> Upload</button>
      </div>

      {shown.length === 0 ? (
        <div className="ops-card"><EmptyState icon={<Paperclip size={22} />} title={files.length ? "No files match" : "No files yet"} body={files.length ? "Try a different search or filter." : `Upload plans, proposals and assets. Files are private to the two of you and can be up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`}
          action={!files.length && <button className="ops-btn ops-btn-primary" onClick={() => setUploading(true)}><FileUp size={16} /> Upload a file</button>} /></div>
      ) : (
        <div className="ops-card overflow-x-auto">
          <table className="ops-table min-w-[720px]">
            <thead><tr><th>Name</th><th>Project</th><th>Uploaded by</th><th>Size</th><th>Uploaded</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {shown.map((f) => {
                const Icon = ICONS[extOf(f.file_name)] ?? Paperclip;
                const mine = f.uploaded_by === meId;
                return (
                  <tr key={f.id}>
                    <td><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "var(--ops-cyan-soft)", color: "var(--ops-cyan-text)" }}><Icon size={17} /></span>
                      <div className="min-w-0"><p className="max-w-[260px] truncate text-[13.5px] font-medium">{f.file_name}</p>{f.description && <p className="ops-faint max-w-[260px] truncate text-[12px]">{f.description}</p>}</div></div></td>
                    <td>{f.project ? <Badge tone="cyan">{f.project.name}</Badge> : <span className="ops-faint">—</span>}</td>
                    <td><span className="flex items-center gap-2"><Avatar person={f.uploaded_by ? byId.get(f.uploaded_by) : null} size={22} />{f.uploaded_by ? byId.get(f.uploaded_by)?.display_name : "—"}</span></td>
                    <td className="ops-muted whitespace-nowrap">{formatBytes(f.size_bytes)}</td>
                    <td className="ops-muted whitespace-nowrap">{formatDate(f.created_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td><div className="flex justify-end gap-1">
                      <FileDownloadButton id={f.id} name={f.file_name} />
                      <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={`Edit ${f.file_name}`} onClick={() => setEditing(f)}><Pencil size={14} /></button>
                      {mine && <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm ops-btn-danger" aria-label={`Delete ${f.file_name}`} onClick={() => setDeleting(f)}><Trash2 size={14} /></button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <UploadDialog open={uploading} onClose={() => setUploading(false)} projects={projects} tasks={tasks} />

      <Dialog open={!!editing} onClose={() => setEditing(null)} title="Edit file details" description={editing?.file_name}>
        {editing && (
          <form key={editing.id} className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => updateAttachment(editing.id, { description: (fd.get("description") as string) || null, project_id: fd.get("project_id"), task_id: fd.get("task_id") }), { onDone: (r) => r.ok && setEditing(null) });
          }}>
            <Field label="Description" htmlFor="f-desc"><input id="f-desc" name="description" className="ops-input" maxLength={1000} defaultValue={editing.description ?? ""} /></Field>
            <Field label="Project" htmlFor="f-project"><ProjectSelect id="f-project" name="project_id" projects={projects} defaultValue={editing.project_id} /></Field>
            <Field label="Task" htmlFor="f-task"><select id="f-task" name="task_id" className="ops-select" defaultValue={editing.task_id ?? ""}><option value="">No task</option>{tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></Field>
            <div className="flex justify-end gap-2"><button type="button" className="ops-btn" onClick={() => setEditing(null)}>Cancel</button><SubmitButton pending={pending}>Save</SubmitButton></div>
          </form>
        )}
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete this file?" description="This permanently removes it for both of you. It can't be undone.">
        {deleting && (
          <div className="space-y-4"><p className="rounded-xl border p-3 text-[13.5px] font-medium">{deleting.file_name}</p>
            <div className="flex justify-end gap-2"><button className="ops-btn" onClick={() => setDeleting(null)}>Keep file</button>
              <button className="ops-btn ops-btn-danger" style={{ background: "var(--ops-danger-soft)" }} disabled={pending} onClick={() => run(() => deleteAttachment(deleting.id), { onDone: (r) => r.ok && setDeleting(null) })}>Delete permanently</button></div></div>
        )}
      </Dialog>
    </>
  );
}
