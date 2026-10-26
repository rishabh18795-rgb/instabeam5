"use client";
import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PROJECT_STATUSES, PRIORITIES, labelOf, toneOf } from "@/lib/ops/constants";
import { deadlineLabel } from "@/lib/ops/format";
import type { Person, Project } from "@/lib/ops/types";
import { ProjectDialog } from "./ProjectDialog";
import { Avatar, Badge, EmptyState, ProgressBar } from "./ui";

type Row = Project & { open_tasks: number; total_tasks: number };

export function ProjectsView({ projects, people, meId }: { projects: Row[]; people: Person[]; meId: string }) {
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const byId = new Map(people.map((p) => [p.id, p]));
  const shown = projects.filter((p) => filter === "all" || p.status === filter);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="ops-seg overflow-x-auto" role="group" aria-label="Filter projects">
          {[{ value: "all", label: "All" }, ...PROJECT_STATUSES].map((s) => <button key={s.value} aria-pressed={filter === s.value} onClick={() => setFilter(s.value)}>{s.label}</button>)}
        </div>
        <button className="ops-btn ops-btn-primary ml-auto" onClick={() => setCreating(true)}><Plus size={16} /> New project</button>
      </div>
      {shown.length === 0 ? (
        <div className="ops-card"><EmptyState icon={<FolderKanban size={22} />} title={projects.length ? "No projects with this status" : "No projects yet"} body="Projects group tasks, files and goals around one piece of work."
          action={<button className="ops-btn ops-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New project</button>} /></div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const dl = deadlineLabel(p.deadline, p.status === "completed");
            return (
              <li key={p.id}>
                <Link href={`/ops/projects/${p.id}`} className="ops-card ops-card-hover ops-card-pad block h-full">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[16px] font-semibold leading-snug tracking-tight">{p.name}</h2>
                    <Badge tone={toneOf(PROJECT_STATUSES, p.status)} dot>{labelOf(PROJECT_STATUSES, p.status)}</Badge>
                  </div>
                  <p className="ops-muted mt-1.5 line-clamp-2 min-h-[2.6em] text-[13.5px]">{p.description || "No description yet."}</p>
                  <div className="mt-4"><div className="mb-1.5 flex justify-between text-[12px]"><span className="ops-muted">Progress</span><span className="font-medium">{p.progress}%</span></div><ProgressBar value={p.progress} label={`${p.name} progress`} /></div>
                  <div className="mt-4 flex items-center gap-2 text-[12px]">
                    <Avatar person={p.owner_id ? byId.get(p.owner_id) : null} size={24} />
                    <span className="ops-muted">{p.open_tasks} open · {p.total_tasks} tasks</span>
                    <span className="ml-auto flex items-center gap-1.5"><Badge tone={toneOf(PRIORITIES, p.priority)}>{labelOf(PRIORITIES, p.priority)}</Badge>{dl && <Badge tone={dl.tone}>{dl.text}</Badge>}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <ProjectDialog open={creating} onClose={() => setCreating(false)} people={people} meId={meId} />
    </>
  );
}
