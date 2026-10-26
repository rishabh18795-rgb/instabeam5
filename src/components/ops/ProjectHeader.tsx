"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject, setProjectStatus } from "@/lib/ops/actions/projects";
import { PRIORITIES, PROJECT_STATUSES, labelOf, toneOf } from "@/lib/ops/constants";
import { deadlineLabel, formatDate } from "@/lib/ops/format";
import type { Person, Project } from "@/lib/ops/types";
import { ProjectDialog } from "./ProjectDialog";
import { useAction } from "./useAction";
import { Avatar, Badge, ProgressBar } from "./ui";

export function ProjectHeader({ project, people, owner }: { project: Project; people: Person[]; owner: Person | null }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { run, pending } = useAction();
  const router = useRouter();
  const dl = deadlineLabel(project.deadline, project.status === "completed");
  return (
    <div className="ops-card ops-card-pad ops-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={toneOf(PROJECT_STATUSES, project.status)} dot>{labelOf(PROJECT_STATUSES, project.status)}</Badge>
            <Badge tone={toneOf(PRIORITIES, project.priority)}>{labelOf(PRIORITIES, project.priority)} priority</Badge>
            {dl && <Badge tone={dl.tone}>{dl.text}</Badge>}
          </div>
          <h1 className="ops-h1 mt-3">{project.name}</h1>
          <p className="ops-muted mt-2 max-w-2xl whitespace-pre-wrap">{project.description || "No description yet."}</p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Project status" className="ops-select ops-input-sm !w-auto" value={project.status} disabled={pending} onChange={(e) => run(() => setProjectStatus(project.id, e.target.value))}>
            {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button className="ops-btn ops-btn-sm" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>
        </div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-4">
        <div className="sm:col-span-2"><div className="mb-1.5 flex justify-between text-[12.5px]"><span className="ops-muted">Progress {project.progress_mode === "auto" && "(from tasks)"}</span><span className="font-semibold">{project.progress}%</span></div><ProgressBar value={project.progress} label="Project progress" /></div>
        <div><p className="ops-eyebrow mb-1">Owner</p><p className="flex items-center gap-2 text-[13.5px]">{owner ? <><Avatar person={owner} size={22} />{owner.display_name}</> : "—"}</p></div>
        <div><p className="ops-eyebrow mb-1">Timeline</p><p className="text-[13.5px]">{formatDate(project.start_date)} → {formatDate(project.deadline)}</p></div>
      </div>
      <div className="mt-5 flex justify-end">
        {confirm ? (
          <span className="flex items-center gap-2 text-[13px]">Delete this project? Its tasks and files are kept but unlinked.
            <button className="ops-btn ops-btn-sm ops-btn-danger" onClick={() => run(() => deleteProject(project.id), { onDone: (r) => r.ok && router.replace("/ops/projects") })}>Delete</button>
            <button className="ops-btn ops-btn-sm" onClick={() => setConfirm(false)}>Keep</button></span>
        ) : <button className="ops-btn ops-btn-ghost ops-btn-sm ops-btn-danger" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete project</button>}
      </div>
      <ProjectDialog open={editing} onClose={() => setEditing(false)} people={people} project={project} />
    </div>
  );
}
