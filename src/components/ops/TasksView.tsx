"use client";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, KanbanSquare, ListChecks, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { setTaskStatus } from "@/lib/ops/actions/tasks";
import { labelOf, PRIORITIES, TASK_STATUSES, toneOf, type TaskStatus } from "@/lib/ops/constants";
import { deadlineLabel, formatDate, todayISO } from "@/lib/ops/format";
import type { Person, Task } from "@/lib/ops/types";
import { cn } from "@/lib/utils";
import { TaskDetail } from "./TaskDetail";
import { TaskDialog } from "./TaskDialog";
import { UploadDialog } from "./UploadDialog";
import { useAction } from "./useAction";
import { Avatar, Badge, EmptyState } from "./ui";

type View = "mine" | "all" | "board" | "calendar" | "completed";
const VIEWS: { value: View; label: string; Icon: typeof ListChecks }[] = [
  { value: "mine", label: "My Tasks", Icon: ListChecks },
  { value: "all", label: "All Tasks", Icon: Users },
  { value: "board", label: "Board", Icon: KanbanSquare },
  { value: "calendar", label: "Calendar", Icon: CalendarDays },
  { value: "completed", label: "Completed", Icon: CheckCircle2 },
];

export function TasksView({ initialTasks, people, projects, meId, initialView, initialTaskId }: {
  initialTasks: Task[]; people: Person[]; projects: { id: string; name: string }[]; meId: string; initialView: View; initialTaskId?: string;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<View>(initialView);
  const [project, setProject] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialTaskId ?? null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadFor, setUploadFor] = useState<Task | null>(null);
  const { run } = useAction();
  useEffect(() => setTasks(initialTasks), [initialTasks]);

  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const filtered = tasks.filter((t) => !project || t.project_id === project);

  function changeView(v: View) {
    setView(v);
    const u = new URL(window.location.href);
    u.searchParams.set("view", v);
    window.history.replaceState(null, "", u);
  }
  function openTask(id: string | null) {
    setSelectedId(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("task", id); else u.searchParams.delete("task");
    window.history.replaceState(null, "", u);
  }
  function move(id: string, status: TaskStatus) {
    const prev = tasks;
    setTasks((x) => x.map((t) => (t.id === id ? { ...t, status } : t))); // optimistic
    run(() => setTaskStatus(id, status), { onDone: (r) => { if (!r.ok) setTasks(prev); } });
  }

  const open = filtered.filter((t) => t.status !== "completed");
  const list =
    view === "mine" ? open.filter((t) => t.assignee_id === meId)
    : view === "all" ? open
    : view === "completed" ? filtered.filter((t) => t.status === "completed").sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
    : [];
  const sortedList = [...list].sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="ops-seg overflow-x-auto" role="group" aria-label="Task views">
          {VIEWS.map(({ value, label, Icon }) => (
            <button key={value} aria-pressed={view === value} onClick={() => changeView(value)}><Icon size={14} /> {label}</button>
          ))}
        </div>
        <select aria-label="Filter by project" className="ops-select ops-input-sm !w-auto" value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">All projects</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button className="ops-btn ops-btn-primary ml-auto" onClick={() => setCreating(true)}><Plus size={16} /> New task</button>
      </div>

      {view === "board" ? (
        <Board tasks={filtered} byId={byId} onOpen={openTask} onMove={move} />
      ) : view === "calendar" ? (
        <CalendarView tasks={filtered} byId={byId} onOpen={openTask} />
      ) : sortedList.length === 0 ? (
        <div className="ops-card">
          <EmptyState icon={view === "completed" ? <CheckCircle2 size={22} /> : <ListChecks size={22} />}
            title={view === "completed" ? "Nothing completed yet" : view === "mine" ? "You're all clear" : "No open tasks"}
            body={view === "completed" ? "Finished tasks will be kept here." : "Create a task and assign it to yourself or your co-founder."}
            action={view !== "completed" && <button className="ops-btn ops-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New task</button>} />
        </div>
      ) : (
        <div className="ops-card overflow-hidden">
          <ul>
            {sortedList.map((t) => <TaskRow key={t.id} t={t} byId={byId} onOpen={openTask} onMove={move} />)}
          </ul>
        </div>
      )}

      <TaskDetail task={selected} byId={byId} onClose={() => openTask(null)} onEdit={(t) => { setEditing(t); }} onUpload={(t) => setUploadFor(t)} />
      <TaskDialog open={creating} onClose={() => setCreating(false)} people={people} projects={projects} meId={meId} defaults={{ project_id: project || null }} />
      <TaskDialog open={!!editing} onClose={() => setEditing(null)} people={people} projects={projects} task={editing} meId={meId} />
      <UploadDialog open={!!uploadFor} onClose={() => setUploadFor(null)} projects={projects} defaults={{ task_id: uploadFor?.id, project_id: uploadFor?.project_id }} tasks={uploadFor ? [{ id: uploadFor.id, title: uploadFor.title }] : []} />
    </>
  );
}

function TaskRow({ t, byId, onOpen, onMove }: { t: Task; byId: Record<string, Person>; onOpen: (id: string) => void; onMove: (id: string, s: TaskStatus) => void }) {
  const done = t.status === "completed";
  const dl = deadlineLabel(t.due_date, done);
  return (
    <li className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-[var(--ops-surface-2)]">
      <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={done ? `Reopen ${t.title}` : `Complete ${t.title}`} onClick={() => onMove(t.id, done ? "todo" : "completed")}>
        {done ? <CheckCircle2 size={19} style={{ color: "var(--ops-lime-text)" }} /> : <Circle size={19} className="ops-faint" />}
      </button>
      <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(t.id)}>
        <span className={cn("block truncate text-[14px] font-medium", done && "ops-muted line-through")}>{t.title}</span>
        <span className="ops-faint block truncate text-[12px]">{t.project?.name ?? "No project"}</span>
      </button>
      <span className="hidden sm:block"><Badge tone={toneOf(PRIORITIES, t.priority)}>{labelOf(PRIORITIES, t.priority)}</Badge></span>
      <span className="hidden md:block"><Badge tone={toneOf(TASK_STATUSES, t.status)} dot>{labelOf(TASK_STATUSES, t.status)}</Badge></span>
      {dl && <Badge tone={dl.tone}>{dl.text}</Badge>}
      <Avatar person={t.assignee_id ? byId[t.assignee_id] : null} size={26} />
    </li>
  );
}

function Board({ tasks, byId, onOpen, onMove }: { tasks: Task[]; byId: Record<string, Person>; onOpen: (id: string) => void; onMove: (id: string, s: TaskStatus) => void }) {
  const [over, setOver] = useState<TaskStatus | null>(null);
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
      <div className="grid min-w-[1000px] grid-cols-5 gap-3">
        {TASK_STATUSES.map((col) => {
          const items = tasks.filter((t) => t.status === col.value);
          return (
            <section key={col.value} aria-label={col.label}
              className="rounded-2xl border p-2.5 transition-colors"
              style={{ background: over === col.value ? "var(--ops-cyan-soft)" : "var(--ops-surface)", borderColor: over === col.value ? "var(--ops-cyan)" : undefined }}
              onDragOver={(e) => { e.preventDefault(); setOver(col.value); }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData("text/task"); if (id) onMove(id, col.value); }}>
              <header className="mb-2.5 flex items-center justify-between px-1.5 pt-1"><Badge tone={col.tone} dot>{col.label}</Badge><span className="ops-faint text-[12px]">{items.length}</span></header>
              <ul className="min-h-16 space-y-2">
                {items.map((t) => {
                  const dl = deadlineLabel(t.due_date, t.status === "completed");
                  return (
                    <li key={t.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/task", t.id)} className="ops-card cursor-grab p-3 active:cursor-grabbing">
                      <button className="block w-full text-left" onClick={() => onOpen(t.id)}>
                        <span className="block text-[13.5px] font-medium leading-snug">{t.title}</span>
                        {t.project && <span className="ops-faint mt-0.5 block truncate text-[11.5px]">{t.project.name}</span>}
                      </button>
                      <div className="mt-2.5 flex items-center gap-2">
                        <Badge tone={toneOf(PRIORITIES, t.priority)}>{labelOf(PRIORITIES, t.priority)}</Badge>
                        {dl && <Badge tone={dl.tone}>{dl.text}</Badge>}
                        <span className="ml-auto"><Avatar person={t.assignee_id ? byId[t.assignee_id] : null} size={22} /></span>
                      </div>
                      <select aria-label={`Move ${t.title} to`} className="ops-select ops-input-sm mt-2.5" value={t.status} onChange={(e) => onMove(t.id, e.target.value as TaskStatus)}>
                        {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({ tasks, byId, onOpen }: { tasks: Task[]; byId: Record<string, Person>; onOpen: (id: string) => void }) {
  const today = todayISO();
  const [cursor, setCursor] = useState(today.slice(0, 7)); // YYYY-MM
  const [y, m] = cursor.split("-").map(Number);
  const firstDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((firstDow + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - firstDow + 1;
    return day < 1 || day > daysInMonth ? null : `${cursor}-${String(day).padStart(2, "0")}`;
  });
  const byDate = new Map<string, Task[]>();
  for (const t of tasks) if (t.due_date) byDate.set(t.due_date, [...(byDate.get(t.due_date) ?? []), t]);
  const shift = (n: number) => setCursor(new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7));
  const undated = tasks.filter((t) => !t.due_date && t.status !== "completed").length;

  return (
    <div className="ops-card overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="ops-h2">{formatDate(`${cursor}-01`, { month: "long", year: "numeric" })}</h2>
        <div className="flex items-center gap-1">
          <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button className="ops-btn ops-btn-sm" onClick={() => setCursor(today.slice(0, 7))}>Today</button>
          <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b text-center">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="ops-eyebrow py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const items = d ? byDate.get(d) ?? [] : [];
          return (
            <div key={i} className={cn("min-h-[84px] border-b border-r p-1.5 sm:min-h-[104px]", i % 7 === 6 && "border-r-0")} style={{ background: d ? undefined : "var(--ops-surface-2)" }}>
              {d && (
                <>
                  <span className={cn("mb-1 inline-grid h-6 w-6 place-items-center rounded-full text-[12px]", d === today ? "font-bold" : "ops-muted")} style={d === today ? { background: "var(--ops-lime)", color: "var(--ops-on-accent)" } : undefined}>{Number(d.slice(8))}</span>
                  <ul className="space-y-1">
                    {items.slice(0, 3).map((t) => (
                      <li key={t.id}>
                        <button onClick={() => onOpen(t.id)} className="w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11.5px] font-medium"
                          style={{ background: t.status === "completed" ? "var(--ops-lime-soft)" : d < today ? "var(--ops-danger-soft)" : "var(--ops-cyan-soft)", color: t.status === "completed" ? "var(--ops-lime-text)" : d < today ? "var(--ops-danger)" : "var(--ops-cyan-text)" }}
                          title={`${t.title}${t.assignee_id ? ` — ${byId[t.assignee_id]?.display_name}` : ""}`}>{t.title}</button>
                      </li>
                    ))}
                    {items.length > 3 && <li className="ops-faint px-1.5 text-[11px]">+{items.length - 3} more</li>}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>
      {undated > 0 && <p className="ops-muted border-t px-4 py-2.5 text-[12.5px]">{undated} open {undated === 1 ? "task has" : "tasks have"} no due date and {undated === 1 ? "isn't" : "aren't"} shown here.</p>}
    </div>
  );
}
