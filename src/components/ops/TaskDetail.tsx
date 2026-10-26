"use client";
import { CheckSquare, Download, Paperclip, Pencil, Plus, Send, Square, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { addChecklistItem, addComment, deleteChecklistItem, deleteTask, getTaskDetail, setTaskStatus, toggleChecklistItem } from "@/lib/ops/actions/tasks";
import { getDownloadUrl } from "@/lib/ops/actions/files";
import { labelOf, PRIORITIES, TASK_STATUSES, toneOf } from "@/lib/ops/constants";
import { deadlineLabel, formatBytes, formatDate, timeAgo } from "@/lib/ops/format";
import type { ChecklistItem, Person, Task, TaskComment } from "@/lib/ops/types";
import { Dialog } from "./Dialog";
import { useToast } from "./Toast";
import { useAction } from "./useAction";
import { Avatar, Badge, ProgressBar } from "./ui";

type Detail = { checklist: ChecklistItem[]; comments: TaskComment[]; files: { id: string; file_name: string; size_bytes: number; created_at: string }[] };

export function TaskDetail({ task, byId, onClose, onEdit, onUpload }: {
  task: Task | null; byId: Record<string, Person>; onClose: () => void; onEdit: (t: Task) => void; onUpload: (t: Task) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [item, setItem] = useState("");
  const [comment, setComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { run, pending } = useAction();
  const toast = useToast();
  const id = task?.id;

  const load = useCallback(async () => {
    if (!id) return;
    const d = await getTaskDetail(id);
    if (d) setDetail({ checklist: d.checklist as ChecklistItem[], comments: d.comments as unknown as TaskComment[], files: d.files as Detail["files"] });
  }, [id]);
  useEffect(() => { setDetail(null); setConfirmDelete(false); void load(); }, [load]);

  const act = <T,>(fn: () => Promise<import("./useAction").ActionResult<T>>, opts?: Parameters<typeof run>[1]) =>
    run(fn, { ...opts, onDone: (r) => { if (r.ok) void load(); opts?.onDone?.(r as never); } });

  async function download(fileId: string) {
    const r = await getDownloadUrl(fileId);
    if (r.ok && r.data) window.location.assign(r.data.url); else toast.error(r.ok ? "Couldn't download." : r.error);
  }

  const done = task?.status === "completed";
  const checklist = detail?.checklist ?? [];
  const checked = checklist.filter((c) => c.done).length;
  const dl = task ? deadlineLabel(task.due_date, done) : null;

  return (
    <Dialog open={!!task} onClose={onClose} title={task?.title ?? ""} wide>
      {task && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={toneOf(TASK_STATUSES, task.status)} dot>{labelOf(TASK_STATUSES, task.status)}</Badge>
            <Badge tone={toneOf(PRIORITIES, task.priority)}>{labelOf(PRIORITIES, task.priority)} priority</Badge>
            {dl && <Badge tone={dl.tone}>{dl.text}</Badge>}
            <div className="ml-auto flex items-center gap-2">
              <select aria-label="Change status" className="ops-select ops-input-sm !w-auto" value={task.status} disabled={pending}
                onChange={(e) => act(() => setTaskStatus(task.id, e.target.value))}>
                {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button className="ops-btn ops-btn-sm" onClick={() => onEdit(task)} disabled={done} title={done ? "Reopen the task to edit it" : undefined}><Pencil size={14} /> Edit</button>
            </div>
          </div>

          {task.description && <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{task.description}</p>}

          <dl className="grid gap-3 rounded-xl border p-4 text-[13px] sm:grid-cols-3" style={{ background: "var(--ops-surface-2)" }}>
            <div><dt className="ops-eyebrow mb-1">Assigned to</dt><dd className="flex items-center gap-2">{task.assignee_id && byId[task.assignee_id] ? <><Avatar person={byId[task.assignee_id]} size={22} />{byId[task.assignee_id].display_name}</> : <span className="ops-muted">Unassigned</span>}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Created by</dt><dd className="flex items-center gap-2">{task.created_by && byId[task.created_by] ? <><Avatar person={byId[task.created_by]} size={22} />{byId[task.created_by].display_name}</> : "—"}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Project</dt><dd>{task.project?.name ?? <span className="ops-muted">None</span>}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Starts</dt><dd>{formatDate(task.start_date, { day: "numeric", month: "short", year: "numeric" })}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Due</dt><dd>{formatDate(task.due_date, { day: "numeric", month: "short", year: "numeric" })}</dd></div>
            <div><dt className="ops-eyebrow mb-1">Completed</dt><dd>{task.completed_at ? formatDate(task.completed_at, { day: "numeric", month: "short", year: "numeric" }) : "—"}</dd></div>
          </dl>

          <section aria-label="Checklist">
            <div className="mb-2 flex items-center justify-between"><h3 className="ops-h2">Checklist</h3>{checklist.length > 0 && <span className="ops-muted text-[12.5px]">{checked}/{checklist.length}</span>}</div>
            {checklist.length > 0 && <div className="mb-3"><ProgressBar value={(checked / checklist.length) * 100} small label="Checklist progress" /></div>}
            <ul className="space-y-1">
              {checklist.map((c) => (
                <li key={c.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-[var(--ops-surface-2)]">
                  <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={c.done ? "Mark not done" : "Mark done"} disabled={done} onClick={() => act(() => toggleChecklistItem(c.id, !c.done), { refresh: false })}>
                    {c.done ? <CheckSquare size={17} style={{ color: "var(--ops-lime-text)" }} /> : <Square size={17} />}
                  </button>
                  <span className={`flex-1 text-[13.5px] ${c.done ? "ops-muted line-through" : ""}`}>{c.title}</span>
                  <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Remove item" disabled={done} onClick={() => act(() => deleteChecklistItem(c.id), { refresh: false })}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
            {!done && (
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!item.trim()) return; act(() => addChecklistItem(task.id, item), { refresh: false, onDone: (r) => r.ok && setItem("") }); }}>
                <input className="ops-input ops-input-sm" placeholder="Add a checklist item" aria-label="New checklist item" value={item} maxLength={200} onChange={(e) => setItem(e.target.value)} />
                <button className="ops-btn ops-btn-sm" disabled={pending}><Plus size={14} /> Add</button>
              </form>
            )}
          </section>

          <section aria-label="Attachments">
            <div className="mb-2 flex items-center justify-between"><h3 className="ops-h2">Attachments</h3><button className="ops-btn ops-btn-sm" onClick={() => onUpload(task)}><Paperclip size={14} /> Attach file</button></div>
            {(detail?.files ?? []).length === 0 ? <p className="ops-muted text-[13px]">No files attached.</p> : (
              <ul className="space-y-1.5">
                {detail!.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 text-[13.5px]"><Paperclip size={14} className="ops-faint" /><span className="flex-1 truncate">{f.file_name}</span><span className="ops-faint text-[12px]">{formatBytes(f.size_bytes)}</span>
                    <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={`Download ${f.file_name}`} onClick={() => download(f.id)}><Download size={14} /></button></li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Comments">
            <h3 className="ops-h2 mb-3">Comments</h3>
            <ul className="space-y-3">
              {(detail?.comments ?? []).map((c) => (
                <li key={c.id} className="flex gap-3"><Avatar person={byId[c.author_id ?? ""]} size={28} />
                  <div className="min-w-0 flex-1 rounded-xl px-3.5 py-2.5" style={{ background: "var(--ops-surface-2)" }}>
                    <p className="text-[12.5px]"><span className="font-medium">{byId[c.author_id ?? ""]?.display_name ?? "Someone"}</span> <span className="ops-faint">· {timeAgo(c.created_at)}</span></p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-[13.5px]">{c.body}</p></div></li>
              ))}
              {detail && detail.comments.length === 0 && <li className="ops-muted text-[13px]">No comments yet.</li>}
            </ul>
            <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!comment.trim()) return; act(() => addComment(task.id, comment), { refresh: false, onDone: (r) => r.ok && setComment("") }); }}>
              <input className="ops-input" placeholder="Write a comment…" aria-label="New comment" value={comment} maxLength={4000} onChange={(e) => setComment(e.target.value)} />
              <button className="ops-btn ops-btn-cyan" disabled={pending} aria-label="Send comment"><Send size={15} /></button>
            </form>
          </section>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="ops-faint text-[12px]">Created {timeAgo(task.created_at)}</span>
            {confirmDelete ? (
              <span className="flex items-center gap-2 text-[13px]">Delete this task for both of you?
                <button className="ops-btn ops-btn-sm ops-btn-danger" onClick={() => act(() => deleteTask(task.id), { onDone: (r) => r.ok && onClose() })}>Delete</button>
                <button className="ops-btn ops-btn-sm" onClick={() => setConfirmDelete(false)}>Keep</button></span>
            ) : <button className="ops-btn ops-btn-ghost ops-btn-sm ops-btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Delete task</button>}
          </div>
        </div>
      )}
    </Dialog>
  );
}
