import { ArrowLeft, MessageSquare, Paperclip } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityList } from "@/components/ops/ActivityList";
import { ProjectHeader } from "@/components/ops/ProjectHeader";
import { ProjectTasks } from "@/components/ops/ProjectTasks";
import { EmptyState, SectionCard } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import { formatBytes, formatDate, timeAgo } from "@/lib/ops/format";
import { uuid } from "@/lib/ops/actions/schemas";
import type { ActivityEvent, Project, Task } from "@/lib/ops/types";
import { FileDownloadButton } from "@/components/ops/FileDownloadButton";
import { Avatar } from "@/components/ops/ui";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const { supabase, userId, people, byId, projects } = await getBasics();
  const [projectRes, tasksRes, filesRes, eventsRes, commentsRes] = await Promise.all([
    supabase.from("projects").select("id,name,description,owner_id,status,priority,start_date,deadline,progress,progress_mode,created_at,updated_at").eq("id", id).maybeSingle(),
    supabase.from("tasks").select("id,project_id,title,description,assignee_id,created_by,status,priority,start_date,due_date,completed_at,created_at,updated_at").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("attachments").select("id,file_name,size_bytes,created_at,uploaded_by").eq("project_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("activity_events").select("id,actor_id,type,entity_type,entity_id,entity_title,project_id,meta,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(15),
    supabase.from("task_comments").select("id,task_id,author_id,body,created_at,tasks!inner(project_id)").eq("tasks.project_id", id).order("created_at", { ascending: false }).limit(8),
  ]);
  const project = projectRes.data;
  if (!project) notFound();
  const comments = commentsRes.data;
  const tasks = ((tasksRes.data ?? []) as Task[]).map((t) => ({ ...t, project: { id, name: project.name as string } }));
  const titleOf = new Map(tasks.map((t) => [t.id, t.title]));
  const events = ((eventsRes.data ?? []) as ActivityEvent[]).map((e) => ({ ...e, project: null }));

  return (
    <div className="space-y-6">
      <Link href="/ops/projects" className="ops-muted inline-flex items-center gap-1.5 text-[13px] hover:underline"><ArrowLeft size={14} /> All projects</Link>
      <ProjectHeader project={project as Project} people={people} owner={project.owner_id ? byId.get(project.owner_id as string) ?? null : null} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ProjectTasks projectId={id} projectName={project.name as string} tasks={tasks} people={people} projects={projects.map(({ id, name }) => ({ id, name }))} meId={userId} />
        <div className="space-y-6">
          <SectionCard title="Files" padded={false}>
            {(filesRes.data ?? []).length === 0 ? <EmptyState compact icon={<Paperclip size={22} />} title="No files linked" body="Upload from the Files page and choose this project." /> : (
              <ul>{(filesRes.data ?? []).map((f) => (
                <li key={f.id as string} className="flex items-center gap-3 border-t px-5 py-3 first:border-t-0">
                  <Paperclip size={15} className="ops-faint shrink-0" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13.5px] font-medium">{f.file_name as string}</p><p className="ops-faint text-[11.5px]">{byId.get(f.uploaded_by as string)?.display_name ?? "Someone"} · {formatBytes(f.size_bytes as number)} · {formatDate(f.created_at as string)}</p></div>
                  <FileDownloadButton id={f.id as string} name={f.file_name as string} />
                </li>))}</ul>
            )}
          </SectionCard>
          <SectionCard title="Discussion" padded={false}>
            {(comments ?? []).length === 0 ? <EmptyState compact icon={<MessageSquare size={22} />} title="No discussion yet" body="Comments on this project's tasks appear here." /> : (
              <ul>{(comments ?? []).map((c) => (
                <li key={c.id as string} className="flex gap-3 border-t px-5 py-3 first:border-t-0">
                  <Avatar person={byId.get(c.author_id as string)} size={26} />
                  <div className="min-w-0 text-[13.5px]"><p><span className="font-medium">{byId.get(c.author_id as string)?.display_name ?? "Someone"}</span> <span className="ops-faint">on</span> <Link href={`/ops/tasks?task=${c.task_id}`} className="hover:underline">{titleOf.get(c.task_id as string)}</Link></p><p className="ops-muted break-words">{c.body as string}</p><p className="ops-faint text-[11.5px]">{timeAgo(c.created_at as string)}</p></div>
                </li>))}</ul>
            )}
          </SectionCard>
          <SectionCard title="Activity">
            {events.length === 0 ? <p className="ops-muted text-[13px]">Nothing yet.</p> : <ActivityList events={events} byId={byId} showProject={false} />}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
