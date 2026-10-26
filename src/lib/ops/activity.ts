import { labelOf, PROJECT_STATUSES, TASK_STATUSES } from "./constants";
import { formatDate } from "./format";
import type { ActivityEvent, Person } from "./types";

export const ACTIVITY_GROUPS = [
  { value: "task", label: "Tasks" },
  { value: "project", label: "Projects" },
  { value: "file", label: "Files" },
  { value: "goal", label: "Goals" },
] as const;

/** Human sentence (after the actor's name) for a stored event. Titles are snapshots taken when it happened. */
export function describeEvent(e: ActivityEvent, byId: Map<string, Person>): string {
  const t = e.entity_title ? `“${e.entity_title}”` : "an item";
  const m = e.meta ?? {};
  switch (e.type) {
    case "task.created": return `created task ${t}`;
    case "task.completed": return `completed task ${t}`;
    case "task.status_changed": return `moved ${t} to ${labelOf(TASK_STATUSES, String(m.to))}`;
    case "task.assigned": {
      const who = typeof m.assignee_id === "string" ? byId.get(m.assignee_id)?.display_name : null;
      return who ? `assigned ${t} to ${who}` : `unassigned ${t}`;
    }
    case "task.rescheduled": return m.to ? `set the due date of ${t} to ${formatDate(String(m.to), { day: "numeric", month: "short", year: "numeric" })}` : `cleared the due date of ${t}`;
    case "task.commented": return `commented on ${t}`;
    case "project.created": return `created project ${t}`;
    case "project.status_changed": return `moved project ${t} to ${labelOf(PROJECT_STATUSES, String(m.to))}`;
    case "project.updated": return `updated project ${t}`;
    case "file.uploaded": return `uploaded ${t}`;
    case "goal.created": return `set a new goal ${t}`;
    case "goal.achieved": return `achieved goal ${t} 🎯`;
    case "goal.updated": {
      if (typeof m.note === "string" && m.note) return `updated goal ${t}: ${m.note}`;
      const unit = typeof m.unit === "string" && m.unit ? ` ${m.unit}` : "";
      return m.to != null ? `updated goal ${t} to ${m.to}${unit}` : `updated goal ${t}`;
    }
    default: return `${e.type.replace(".", " ")} ${t}`;
  }
}

export function eventHref(e: ActivityEvent): string | null {
  switch (e.entity_type) {
    case "task": return e.entity_id ? `/ops/tasks?task=${e.entity_id}` : "/ops/tasks";
    case "project": return e.entity_id ? `/ops/projects/${e.entity_id}` : "/ops/projects";
    case "file": return "/ops/files";
    case "goal": return "/ops/goals";
    default: return null;
  }
}
