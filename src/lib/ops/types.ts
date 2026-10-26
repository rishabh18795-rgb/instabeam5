import type { GoalStatus, Priority, ProjectStatus, TaskStatus } from "./constants";

export type Person = { id: string; display_name: string; avatar_path: string | null; avatar_url?: string | null };

export type Profile = Person & {
  email: string;
  theme: "dark" | "light" | "system";
  notify_prefs: Record<"chat" | "tasks" | "comments" | "goals" | "files" | "deadlines", boolean>;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  status: ProjectStatus;
  priority: Priority;
  start_date: string | null;
  deadline: string | null;
  progress: number;
  progress_mode: "auto" | "manual";
  created_at: string;
  updated_at: string;
  owner?: Person | null;
};

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string | null;
  status: TaskStatus;
  priority: Priority;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Person | null;
  creator?: Person | null;
  project?: { id: string; name: string } | null;
};

export type ChecklistItem = { id: string; task_id: string; title: string; done: boolean; position: number };
export type TaskComment = { id: string; task_id: string; author_id: string | null; body: string; created_at: string; author?: Person | null };

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  project_id: string | null;
  kind: "numeric" | "milestone";
  target_value: number | null;
  current_value: number;
  unit: string | null;
  start_date: string | null;
  deadline: string | null;
  status: GoalStatus;
  progress: number;
  notes: string | null;
  created_at: string;
  owner?: Person | null;
  goal_milestones?: { id: string; goal_id: string; title: string; done: boolean; position: number }[];
};
export type GoalUpdate = {
  id: string; goal_id: string; note: string | null; previous_value: number | null; new_value: number | null;
  created_at: string; author?: Person | null;
};

export type Attachment = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  description: string | null;
  context: "files" | "task" | "project" | "chat";
  project_id: string | null;
  task_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  uploader?: Person | null;
  project?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  body: string;
  reply_to: string | null;
  attachment_id: string | null;
  created_at: string;
  attachment?: Pick<Attachment, "id" | "file_name" | "size_bytes" | "mime_type"> | null;
};

export type ActivityEvent = {
  id: string;
  actor_id: string | null;
  type: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  project_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  actor?: Person | null;
  project?: { id: string; name: string } | null;
};

export type Notification = {
  id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string;
};

export type TeamMember = { email: string; display_name: string; state: "not_invited" | "invited" | "active"; last_sign_in_at: string | null; user_id: string | null };
