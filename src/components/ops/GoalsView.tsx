"use client";
import { CheckSquare, Pencil, Plus, Square, Target, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { addMilestone, deleteGoal, deleteMilestone, logProgress, toggleMilestone } from "@/lib/ops/actions/goals";
import { GOAL_STATUSES, labelOf, toneOf } from "@/lib/ops/constants";
import { deadlineLabel, formatDate } from "@/lib/ops/format";
import type { Goal, GoalUpdate, Person } from "@/lib/ops/types";
import { GoalDialog } from "./GoalDialog";
import { useAction } from "./useAction";
import { Avatar, Badge, EmptyState, ProgressBar } from "./ui";

const fmt = (n: number | null | undefined) => (n == null ? "—" : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n));

export function GoalsView({ goals, updates, people, projects, meId }: {
  goals: Goal[]; updates: Record<string, GoalUpdate[]>; people: Person[]; projects: { id: string; name: string }[]; meId: string;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [filter, setFilter] = useState("all");
  const shown = goals.filter((g) => filter === "all" || g.status === filter);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="ops-seg overflow-x-auto" role="group" aria-label="Filter goals">
          {[{ value: "all", label: "All" }, ...GOAL_STATUSES].map((s) => <button key={s.value} aria-pressed={filter === s.value} onClick={() => setFilter(s.value)}>{s.label}</button>)}
        </div>
        <button className="ops-btn ops-btn-primary ml-auto" onClick={() => setCreating(true)}><Plus size={16} /> Set a target</button>
      </div>
      {shown.length === 0 ? (
        <div className="ops-card"><EmptyState icon={<Target size={22} />} title={goals.length ? "No goals with this status" : "No targets yet"}
          body="Set a number you want to reach — like qualified leads — or break a goal into milestones. Nothing here is pre-filled."
          action={<button className="ops-btn ops-btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Set a target</button>} /></div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {shown.map((g) => <li key={g.id}><GoalCard goal={g} updates={updates[g.id] ?? []} people={people} onEdit={() => setEditing(g)} /></li>)}
        </ul>
      )}
      <GoalDialog open={creating} onClose={() => setCreating(false)} people={people} projects={projects} meId={meId} />
      <GoalDialog open={!!editing} onClose={() => setEditing(null)} people={people} projects={projects} goal={editing} meId={meId} />
    </>
  );
}

function GoalCard({ goal: g, updates, people, onEdit }: { goal: Goal; updates: GoalUpdate[]; people: Person[]; onEdit: () => void }) {
  const { run, pending } = useAction();
  const [value, setValue] = useState(String(g.current_value));
  const [note, setNote] = useState("");
  const [ms, setMs] = useState("");
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setValue(String(g.current_value)), [g.current_value]);
  const owner = people.find((p) => p.id === g.owner_id);
  const dl = deadlineLabel(g.deadline, g.status === "achieved");
  const milestones = [...(g.goal_milestones ?? [])].sort((a, b) => a.position - b.position);
  const last = updates[0];

  return (
    <article className="ops-card ops-card-pad h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 className="text-[16px] font-semibold leading-snug tracking-tight">{g.title}</h2>{g.description && <p className="ops-muted mt-1 line-clamp-2 text-[13px]">{g.description}</p>}</div>
        <Badge tone={toneOf(GOAL_STATUSES, g.status)} dot>{labelOf(GOAL_STATUSES, g.status)}</Badge>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-end justify-between">
          <span className="text-[26px] font-semibold leading-none tracking-tight">{g.progress}%</span>
          {g.kind === "numeric" && <span className="ops-muted text-[13px]">{fmt(g.current_value)} of {fmt(g.target_value)} {g.unit}</span>}
          {g.kind === "milestone" && <span className="ops-muted text-[13px]">{milestones.filter((m) => m.done).length} of {milestones.length} milestones</span>}
        </div>
        <ProgressBar value={g.progress} label={`${g.title} progress`} />
      </div>

      {g.kind === "numeric" ? (
        <form className="mt-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); run(() => logProgress(g.id, Number(value), note), { onDone: (r) => r.ok && setNote("") }); }}>
          <input className="ops-input ops-input-sm !w-28" type="number" step="any" min="0" aria-label={`Current value for ${g.title}`} value={value} onChange={(e) => setValue(e.target.value)} />
          <input className="ops-input ops-input-sm min-w-[120px] flex-1" placeholder="Note (optional)" aria-label="Update note" maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="ops-btn ops-btn-cyan ops-btn-sm" disabled={pending || value === "" || Number(value) === g.current_value}>Update</button>
        </form>
      ) : (
        <div className="mt-4">
          <ul className="space-y-0.5">
            {milestones.map((m) => (
              <li key={m.id} className="group flex items-center gap-2 rounded-lg px-1 py-0.5 hover:bg-[var(--ops-surface-2)]">
                <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={m.done ? `Reopen ${m.title}` : `Complete ${m.title}`} onClick={() => run(() => toggleMilestone(m.id, !m.done))}>
                  {m.done ? <CheckSquare size={17} style={{ color: "var(--ops-lime-text)" }} /> : <Square size={17} />}</button>
                <span className={`flex-1 text-[13.5px] ${m.done ? "ops-muted line-through" : ""}`}>{m.title}</span>
                <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label={`Remove ${m.title}`} onClick={() => run(() => deleteMilestone(m.id))}><Trash2 size={13} /></button>
              </li>
            ))}
          </ul>
          <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (ms.trim()) run(() => addMilestone(g.id, ms), { onDone: (r) => r.ok && setMs("") }); }}>
            <input className="ops-input ops-input-sm" placeholder="Add milestone" aria-label="New milestone" maxLength={160} value={ms} onChange={(e) => setMs(e.target.value)} />
            <button className="ops-btn ops-btn-sm" disabled={pending || !ms.trim()}><Plus size={14} /></button>
          </form>
        </div>
      )}

      {last && <p className="ops-faint mt-3 text-[12px]">Last update by {people.find((p) => p.id === last.author?.id)?.display_name ?? "a co-founder"}{last.note ? ` — “${last.note}”` : ""}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-[12.5px]">
        <Avatar person={owner} size={22} /><span className="ops-muted">{owner?.display_name ?? "No owner"}</span>
        {dl ? <Badge tone={dl.tone}>{dl.text}</Badge> : <span className="ops-faint">No deadline</span>}
        {g.deadline && <span className="ops-faint">· {formatDate(g.deadline, { day: "numeric", month: "short", year: "numeric" })}</span>}
        <span className="ml-auto flex items-center gap-1">
          {confirm ? <><button className="ops-btn ops-btn-sm ops-btn-danger" onClick={() => run(() => deleteGoal(g.id))}>Delete</button><button className="ops-btn ops-btn-sm" onClick={() => setConfirm(false)}>Keep</button></>
            : <><button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={`Edit ${g.title}`} onClick={onEdit}><Pencil size={14} /></button>
              <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm ops-btn-danger" aria-label={`Delete ${g.title}`} onClick={() => setConfirm(true)}><Trash2 size={14} /></button></>}
        </span>
      </div>
      {g.notes && <p className="ops-muted mt-3 whitespace-pre-wrap rounded-xl p-3 text-[12.5px]" style={{ background: "var(--ops-surface-2)" }}>{g.notes}</p>}
    </article>
  );
}
