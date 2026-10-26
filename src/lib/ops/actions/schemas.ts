import { z } from "zod";

export const uuid = z.string().uuid();
const date = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.").nullable(),
);
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v), z.string().max(max).nullable().optional());
const optionalUuid = z.preprocess((v) => (v === "" || v === undefined ? null : v), uuid.nullable());

export const priority = z.enum(["low", "medium", "high", "urgent"]);
export const taskStatus = z.enum(["todo", "in_progress", "blocked", "in_review", "completed"]);
export const projectStatus = z.enum(["planning", "active", "on_hold", "completed"]);

export const taskInput = z.object({
  title: z.string().trim().min(1, "Give the task a title.").max(200, "Keep the title under 200 characters."),
  description: optionalText(5000),
  assignee_id: optionalUuid,
  project_id: optionalUuid,
  priority: priority.default("medium"),
  status: taskStatus.default("todo"),
  start_date: date,
  due_date: date,
}).refine((t) => !t.start_date || !t.due_date || t.due_date >= t.start_date, { message: "The due date can't be before the start date.", path: ["due_date"] });

export const projectInput = z.object({
  name: z.string().trim().min(1, "Give the project a name.").max(120),
  description: optionalText(5000),
  owner_id: optionalUuid,
  status: projectStatus.default("planning"),
  priority: priority.default("medium"),
  start_date: date,
  deadline: date,
  progress_mode: z.enum(["auto", "manual"]).default("auto"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
}).refine((p) => !p.start_date || !p.deadline || p.deadline >= p.start_date, { message: "The deadline can't be before the start date.", path: ["deadline"] });

export const goalInput = z.object({
  title: z.string().trim().min(1, "Give the goal a title.").max(160),
  description: optionalText(5000),
  owner_id: optionalUuid,
  project_id: optionalUuid,
  kind: z.enum(["numeric", "milestone"]),
  target_value: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().positive("The target must be greater than zero.").nullable()),
  current_value: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().min(0, "The current value can't be negative.")),
  unit: optionalText(24),
  start_date: date,
  deadline: date,
  status: z.enum(["active", "at_risk", "achieved", "paused"]).default("active"),
  notes: optionalText(5000),
  milestones: z.array(z.string().trim().min(1).max(160)).max(30).default([]),
}).refine((g) => g.kind !== "numeric" || g.target_value !== null, { message: "Set a target value for a numeric goal.", path: ["target_value"] })
  .refine((g) => g.kind !== "milestone" || g.milestones.length > 0, { message: "Add at least one milestone.", path: ["milestones"] })
  .refine((g) => !g.start_date || !g.deadline || g.deadline >= g.start_date, { message: "The deadline can't be before the start date.", path: ["deadline"] });
