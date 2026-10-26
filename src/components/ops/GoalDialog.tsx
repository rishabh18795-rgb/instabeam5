"use client";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { createGoal, updateGoal } from "@/lib/ops/actions/goals";
import { GOAL_STATUSES } from "@/lib/ops/constants";
import type { Goal, Person } from "@/lib/ops/types";
import { Dialog } from "./Dialog";
import { Field, formToObject, PeopleSelect, ProjectSelect, SubmitButton } from "./forms";
import { useAction } from "./useAction";

export function GoalDialog({ open, onClose, people, projects, goal, meId }: {
  open: boolean; onClose: () => void; people: Person[]; projects: { id: string; name: string }[]; goal?: Goal | null; meId?: string;
}) {
  const { run, pending } = useAction();
  const editing = !!goal;
  const [kind, setKind] = useState<"numeric" | "milestone">(goal?.kind ?? "numeric");
  const [milestones, setMilestones] = useState<string[]>(["", ""]);
  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit goal" : "Set a target"} description={editing ? undefined : "Track a number you're aiming for, or a set of milestones."}>
      <form
        key={goal?.id ?? "new"}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const input = { ...formToObject(e.currentTarget), kind, milestones: milestones.map((m) => m.trim()).filter(Boolean) };
          run(() => (editing ? updateGoal(goal!.id, input) : createGoal(input)), { onDone: (r) => r.ok && onClose() });
        }}
      >
        <Field label="Goal" htmlFor="g-title"><input id="g-title" name="title" className="ops-input" required maxLength={160} defaultValue={goal?.title} placeholder="e.g. Generate qualified sales leads" autoFocus /></Field>
        {!editing && (
          <div className="ops-seg" role="group" aria-label="Goal type">
            <button type="button" aria-pressed={kind === "numeric"} onClick={() => setKind("numeric")}>Numeric target</button>
            <button type="button" aria-pressed={kind === "milestone"} onClick={() => setKind("milestone")}>Milestones</button>
          </div>
        )}
        {kind === "numeric" ? (
          <div className="grid grid-cols-3 gap-3">
            <Field label="Target" htmlFor="g-target"><input id="g-target" name="target_value" type="number" step="any" min="0" className="ops-input" required defaultValue={goal?.target_value ?? ""} /></Field>
            <Field label="Current" htmlFor="g-current"><input id="g-current" name="current_value" type="number" step="any" min="0" className="ops-input" defaultValue={goal?.current_value ?? 0} /></Field>
            <Field label="Unit" htmlFor="g-unit"><input id="g-unit" name="unit" className="ops-input" maxLength={24} placeholder="leads, ₹, %" defaultValue={goal?.unit ?? ""} /></Field>
          </div>
        ) : !editing ? (
          <div>
            <span className="ops-label">Milestones</span>
            <div className="space-y-2">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <input className="ops-input" value={m} maxLength={160} placeholder={`Milestone ${i + 1}`} aria-label={`Milestone ${i + 1}`} onChange={(e) => setMilestones((x) => x.map((v, j) => (j === i ? e.target.value : v)))} />
                  {milestones.length > 1 && <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon" aria-label="Remove milestone" onClick={() => setMilestones((x) => x.filter((_, j) => j !== i))}><X size={16} /></button>}
                </div>
              ))}
            </div>
            <button type="button" className="ops-btn ops-btn-ghost ops-btn-sm mt-2" onClick={() => setMilestones((x) => [...x, ""])}><Plus size={14} /> Add milestone</button>
          </div>
        ) : null}
        <Field label="Description" htmlFor="g-desc"><textarea id="g-desc" name="description" className="ops-textarea" maxLength={5000} defaultValue={goal?.description ?? ""} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Owner" htmlFor="g-owner"><PeopleSelect id="g-owner" name="owner_id" people={people} defaultValue={goal?.owner_id ?? meId} allowNone={false} /></Field>
          <Field label="Linked project" htmlFor="g-project"><ProjectSelect id="g-project" name="project_id" projects={projects} defaultValue={goal?.project_id} /></Field>
          <Field label="Start date" htmlFor="g-start"><input id="g-start" name="start_date" type="date" className="ops-input" defaultValue={goal?.start_date ?? ""} /></Field>
          <Field label="Deadline" htmlFor="g-deadline"><input id="g-deadline" name="deadline" type="date" className="ops-input" defaultValue={goal?.deadline ?? ""} /></Field>
          <Field label="Status" htmlFor="g-status">
            <select id="g-status" name="status" className="ops-select" defaultValue={goal?.status ?? "active"}>{GOAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </Field>
        </div>
        <Field label="Notes" htmlFor="g-notes"><textarea id="g-notes" name="notes" className="ops-textarea" maxLength={5000} defaultValue={goal?.notes ?? ""} /></Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ops-btn" onClick={onClose}>Cancel</button>
          <SubmitButton pending={pending}>{editing ? "Save changes" : "Create goal"}</SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
