export const TASK_STATUSES = [
  { value: "todo", label: "To Do", tone: "neutral" },
  { value: "in_progress", label: "In Progress", tone: "cyan" },
  { value: "blocked", label: "Blocked", tone: "danger" },
  { value: "in_review", label: "In Review", tone: "warn" },
  { value: "completed", label: "Completed", tone: "lime" },
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", tone: "neutral" },
  { value: "active", label: "Active", tone: "cyan" },
  { value: "on_hold", label: "On Hold", tone: "warn" },
  { value: "completed", label: "Completed", tone: "lime" },
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];

export const PRIORITIES = [
  { value: "low", label: "Low", tone: "neutral" },
  { value: "medium", label: "Medium", tone: "cyan" },
  { value: "high", label: "High", tone: "warn" },
  { value: "urgent", label: "Urgent", tone: "danger" },
] as const;
export type Priority = (typeof PRIORITIES)[number]["value"];

export const GOAL_STATUSES = [
  { value: "active", label: "On track", tone: "cyan" },
  { value: "at_risk", label: "At risk", tone: "warn" },
  { value: "achieved", label: "Achieved", tone: "lime" },
  { value: "paused", label: "Paused", tone: "neutral" },
] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number]["value"];

export type Tone = "neutral" | "cyan" | "lime" | "warn" | "danger";

export const labelOf = (list: readonly { value: string; label: string }[], v: string | null | undefined) =>
  list.find((x) => x.value === v)?.label ?? v ?? "";
export const toneOf = (list: readonly { value: string; tone: Tone }[], v: string | null | undefined): Tone =>
  list.find((x) => x.value === v)?.tone ?? "neutral";

// ── files ──────────────────────────────────────────────────────────────
/** Default per-file cap. The private bucket enforces the same number server-side
 *  (see migration 0002); raise both together. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** extension → accepted MIME types. The bucket's allow-list is the enforcing copy. */
export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  csv: ["text/csv"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  zip: ["application/zip", "application/x-zip-compressed"],
};
export const FILE_ACCEPT = Object.keys(ALLOWED_FILE_TYPES).map((e) => `.${e}`).join(",");

export const SIGNED_URL_TTL_SECONDS = 60;
