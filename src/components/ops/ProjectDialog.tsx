"use client";
import { useState } from "react";
import { createProject, updateProject } from "@/lib/ops/actions/projects";
import type { Person, Project } from "@/lib/ops/types";
import { Dialog } from "./Dialog";
import { Field, formToObject, PeopleSelect, PrioritySelect, ProjectStatusSelect, SubmitButton } from "./forms";
import { useAction } from "./useAction";

export function ProjectDialog({ open, onClose, people, project, meId }: { open: boolean; onClose: () => void; people: Person[]; project?: Project | null; meId?: string }) {
  const { run, pending } = useAction();
  const [mode, setMode] = useState<"auto" | "manual">(project?.progress_mode ?? "auto");
  const editing = !!project;
  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit project" : "New project"}>
      <form
        key={project?.id ?? "new"}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const input = formToObject(e.currentTarget);
          run(() => (editing ? updateProject(project!.id, input) : createProject(input)), { onDone: (r) => r.ok && onClose() });
        }}
      >
        <Field label="Project name" htmlFor="p-name"><input id="p-name" name="name" className="ops-input" required maxLength={120} defaultValue={project?.name} autoFocus /></Field>
        <Field label="Description" htmlFor="p-desc"><textarea id="p-desc" name="description" className="ops-textarea" maxLength={5000} defaultValue={project?.description ?? ""} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Owner" htmlFor="p-owner"><PeopleSelect id="p-owner" name="owner_id" people={people} defaultValue={project?.owner_id ?? meId} allowNone={false} /></Field>
          <Field label="Status" htmlFor="p-status"><ProjectStatusSelect id="p-status" name="status" defaultValue={project?.status} /></Field>
          <Field label="Priority" htmlFor="p-prio"><PrioritySelect id="p-prio" name="priority" defaultValue={project?.priority} /></Field>
          <Field label="Progress" htmlFor="p-mode" hint={mode === "auto" ? "Calculated from completed tasks." : "You set the percentage."}>
            <select id="p-mode" name="progress_mode" className="ops-select" value={mode} onChange={(e) => setMode(e.target.value as "auto" | "manual")}>
              <option value="auto">Automatic (from tasks)</option><option value="manual">Manual</option>
            </select>
          </Field>
          <Field label="Start date" htmlFor="p-start"><input id="p-start" name="start_date" type="date" className="ops-input" defaultValue={project?.start_date ?? ""} /></Field>
          <Field label="Deadline" htmlFor="p-deadline"><input id="p-deadline" name="deadline" type="date" className="ops-input" defaultValue={project?.deadline ?? ""} /></Field>
          {mode === "manual" && <Field label="Progress %" htmlFor="p-progress"><input id="p-progress" name="progress" type="number" min={0} max={100} className="ops-input" defaultValue={project?.progress ?? 0} /></Field>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ops-btn" onClick={onClose}>Cancel</button>
          <SubmitButton pending={pending}>{editing ? "Save changes" : "Create project"}</SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
