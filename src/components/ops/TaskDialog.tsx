"use client";
import { createTask, updateTask } from "@/lib/ops/actions/tasks";
import { TASK_STATUSES } from "@/lib/ops/constants";
import type { Person, Task } from "@/lib/ops/types";
import { Dialog } from "./Dialog";
import { Field, formToObject, PeopleSelect, PrioritySelect, ProjectSelect, SubmitButton } from "./forms";
import { useAction } from "./useAction";

export function TaskDialog({ open, onClose, people, projects, task, defaults, meId }: {
  open: boolean; onClose: () => void; people: Person[]; projects: { id: string; name: string }[];
  task?: Task | null; defaults?: { project_id?: string | null; assignee_id?: string | null }; meId?: string;
}) {
  const { run, pending } = useAction();
  const editing = !!task;
  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit task" : "New task"} description={editing ? undefined : "Create a task and assign it to either co-founder."}>
      <form
        key={task?.id ?? "new"}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const input = formToObject(e.currentTarget);
          run(() => (editing ? updateTask(task!.id, input) : createTask(input)), { onDone: (r) => r.ok && onClose() });
        }}
      >
        <Field label="Title" htmlFor="t-title"><input id="t-title" name="title" className="ops-input" required maxLength={200} defaultValue={task?.title} placeholder="What needs to happen?" autoFocus /></Field>
        <Field label="Description" htmlFor="t-desc"><textarea id="t-desc" name="description" className="ops-textarea" maxLength={5000} defaultValue={task?.description ?? ""} placeholder="Context, links, acceptance criteria…" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Assign to" htmlFor="t-assignee"><PeopleSelect id="t-assignee" name="assignee_id" people={people} defaultValue={task ? task.assignee_id : (defaults?.assignee_id ?? meId)} /></Field>
          <Field label="Project" htmlFor="t-project"><ProjectSelect id="t-project" name="project_id" projects={projects} defaultValue={task?.project_id ?? defaults?.project_id} /></Field>
          <Field label="Priority" htmlFor="t-prio"><PrioritySelect id="t-prio" name="priority" defaultValue={task?.priority} /></Field>
          <Field label="Status" htmlFor="t-status">
            <select id="t-status" name="status" className="ops-select" defaultValue={task?.status ?? "todo"}>{TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </Field>
          <Field label="Start date" htmlFor="t-start"><input id="t-start" name="start_date" type="date" className="ops-input" defaultValue={task?.start_date ?? ""} /></Field>
          <Field label="Due date" htmlFor="t-due"><input id="t-due" name="due_date" type="date" className="ops-input" defaultValue={task?.due_date ?? ""} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="ops-btn" onClick={onClose}>Cancel</button>
          <SubmitButton pending={pending}>{editing ? "Save changes" : "Create task"}</SubmitButton>
        </div>
      </form>
    </Dialog>
  );
}
