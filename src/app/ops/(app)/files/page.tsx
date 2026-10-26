import type { Metadata } from "next";
import { FilesView } from "@/components/ops/FilesView";
import { PageHeader } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import type { Attachment } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Files" };

export default async function FilesPage() {
  const { supabase, userId, people, projects } = await getBasics();
  const [{ data }, { data: tasks }] = await Promise.all([
    supabase.from("attachments").select("id,storage_path,file_name,mime_type,size_bytes,description,context,project_id,task_id,uploaded_by,created_at").neq("context", "chat").order("created_at", { ascending: false }).limit(500),
    supabase.from("tasks").select("id,title").neq("status", "completed").order("created_at", { ascending: false }).limit(200),
  ]);
  const pname = new Map(projects.map((p) => [p.id, p.name]));
  const files = ((data ?? []) as Attachment[]).map((f) => ({ ...f, project: f.project_id ? { id: f.project_id, name: pname.get(f.project_id) ?? "Project" } : null }));
  return (
    <>
      <PageHeader title="Files" subtitle="Work documents, shared privately between the two of you. Downloads use short-lived secure links." />
      <FilesView files={files} people={people} projects={projects.map(({ id, name }) => ({ id, name }))} tasks={(tasks ?? []) as { id: string; title: string }[]} meId={userId} />
    </>
  );
}
