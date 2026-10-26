"use client";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { PRIORITIES, PROJECT_STATUSES } from "@/lib/ops/constants";
import type { Person } from "@/lib/ops/types";

export function Field({ label, htmlFor, children, hint, className }: { label: string; htmlFor?: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="ops-label">{label}</label>
      {children}
      {hint && <p className="ops-faint mt-1 text-[11.5px]">{hint}</p>}
    </div>
  );
}

export function PeopleSelect({ id, name, people, defaultValue, allowNone = true, noneLabel = "Unassigned" }: { id: string; name: string; people: Person[]; defaultValue?: string | null; allowNone?: boolean; noneLabel?: string }) {
  return (
    <select id={id} name={name} className="ops-select" defaultValue={defaultValue ?? ""}>
      {allowNone && <option value="">{noneLabel}</option>}
      {people.map((p) => <option key={p.id} value={p.id}>{p.display_name}</option>)}
    </select>
  );
}

export function ProjectSelect({ id, name, projects, defaultValue }: { id: string; name: string; projects: { id: string; name: string }[]; defaultValue?: string | null }) {
  return (
    <select id={id} name={name} className="ops-select" defaultValue={defaultValue ?? ""}>
      <option value="">No project</option>
      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

export const PrioritySelect = ({ id, name, defaultValue = "medium" }: { id: string; name: string; defaultValue?: string }) => (
  <select id={id} name={name} className="ops-select" defaultValue={defaultValue}>{PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
);
export const ProjectStatusSelect = ({ id, name, defaultValue = "planning" }: { id: string; name: string; defaultValue?: string }) => (
  <select id={id} name={name} className="ops-select" defaultValue={defaultValue}>{PROJECT_STATUSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select>
);

export function SubmitButton({ pending, children, pendingText = "Saving…", className = "ops-btn ops-btn-primary" }: { pending: boolean; children: ReactNode; pendingText?: string; className?: string }) {
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <><Loader2 size={15} className="animate-spin" /> {pendingText}</> : children}
    </button>
  );
}

/** Reads a <form> into a plain object (blank strings stay blank; the server normalises them). */
export function formToObject(form: HTMLFormElement): Record<string, FormDataEntryValue> {
  return Object.fromEntries(new FormData(form).entries());
}
