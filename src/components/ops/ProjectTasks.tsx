"use client";
import { CheckCircle2, Circle, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { setTaskStatus } from "@/lib/ops/actions/tasks";
import { deadlineLabel } from "@/lib/ops/format";
import type { Person, Task } from "@/lib/ops/types";
import { cn } from "@/lib/utils";
import { TaskDialog } from "./TaskDialog";
import { useAction } from "./useAction";
import { Avatar, Badge, EmptyState, SectionCard } from "./ui";

export function ProjectTasks({ projectId, tasks, people, projects, meId }: { projectId: string; projectName: string; tasks: Task[]; people: Person[]; projects: { id: string; name: string }[]; meId: string }) {
  const [creating, setCreating] = useState(false);
  const { run } = useAction();
  const byId = new Map(people.map((p) => [p.id, p]));
  const open = tasks.filter((t) => t.status !== "completed");
  const done = tasks.filter((t) => t.status === "completed");
  const row = (t: Task) => {
    const isDone = t.status === "completed";
    const dl = deadlineLabel(t.due_date, isDone);
    return (
      <li key={t.id} className="flex items-center gap-3 border-t px-5 py-3 first:border-t-0">
        <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={isDone ? `Reopen ${t.title}` : `Complete ${t.title}`} onClick={() => run(() => setTaskStatus(t.id, isDone ? "todo" : "completed"))}>
          {isDone ? <CheckCircle2 size={18} style={{ color: "var(--ops-lime-text)" }} /> : <Circle size={18} className="ops-faint" />}
        </button>
        <Link href={`/ops/tasks?task=${t.id}`} className={cn("min-w-0 flex-1 truncate text-[13.5px] font-medium hover:underline", isDone && "ops-muted line-through")}>{t.title}</Link>
        {dl && <Badge tone={dl.tone}>{dl.text}</Badge>}
        <Avatar person={t.assignee_id ? byId.get(t.assignee_id) : null} size={24} />
      </li>
    );
  };
  return (
    <>
      <SectionCard title={`Tasks (${open.length} open)`} padded={false} action={<button className="ops-btn ops-btn-sm" onClick={() => setCreating(true)}><Plus size={14} /> Add task</button>}>
        {tasks.length === 0 ? <EmptyState compact icon={<ListChecks size={22} />} title="No tasks in this project" body="Add the first one — progress updates automatically as tasks are completed." /> : (
          <ul>{open.map(row)}{done.map(row)}</ul>
        )}
      </SectionCard>
      <TaskDialog open={creating} onClose={() => setCreating(false)} people={people} projects={projects} meId={meId} defaults={{ project_id: projectId }} />
    </>
  );
}
