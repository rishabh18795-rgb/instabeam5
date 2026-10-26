import { ArrowRight, CalendarClock, CheckCircle2, Circle, FolderKanban, ListChecks, Paperclip, TimerOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/ops/ActivityList";
import { QuickActions } from "@/components/ops/QuickActions";
import { Avatar, Badge, Donut, EmptyState, MiniBars, SectionCard, StatTile } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import { addDaysISO, deadlineLabel, formatBytes, formatDate, greeting, timeAgo, todayISO } from "@/lib/ops/format";
import type { ActivityEvent, Message } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { supabase, userId, profile, people, byId, projects } = await getBasics();
  const today = todayISO();
  const weekStart = addDaysISO(today, -6);
  const horizon = addDaysISO(today, 14);
  const first = profile.display_name.split(" ")[0];
  const head = { count: "exact", head: true } as const;

  const [
    activeProjects, dueToday, overdue, completedWeek, goalsRes, upcomingTasks, upcomingProjects, upcomingGoals,
    convo, filesRes, activityRes, tasksTotal, goalsTotal, filesTotal, messagesTotal,
  ] = await Promise.all([
    supabase.from("projects").select("id", head).eq("status", "active"),
    supabase.from("tasks").select("id", head).eq("assignee_id", userId).eq("due_date", today).neq("status", "completed"),
    supabase.from("tasks").select("id", head).eq("assignee_id", userId).lt("due_date", today).neq("status", "completed"),
    supabase.from("tasks").select("completed_at").eq("status", "completed").gte("completed_at", new Date(Date.parse(`${weekStart}T00:00:00+05:30`)).toISOString()),
    supabase.from("goals").select("progress,status").neq("status", "paused"),
    supabase.from("tasks").select("id,title,due_date,assignee_id,priority").neq("status", "completed").not("due_date", "is", null).lte("due_date", horizon).order("due_date").limit(6),
    supabase.from("projects").select("id,name,deadline").neq("status", "completed").not("deadline", "is", null).lte("deadline", horizon).order("deadline").limit(4),
    supabase.from("goals").select("id,title,deadline").neq("status", "achieved").not("deadline", "is", null).lte("deadline", horizon).order("deadline").limit(4),
    supabase.from("conversations").select("id").limit(1).maybeSingle(),
    supabase.from("attachments").select("id,file_name,size_bytes,created_at,uploaded_by").neq("context", "chat").order("created_at", { ascending: false }).limit(4),
    supabase.from("activity_events").select("id,actor_id,type,entity_type,entity_id,entity_title,project_id,meta,created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("tasks").select("id", head),
    supabase.from("goals").select("id", head),
    supabase.from("attachments").select("id", head).neq("context", "chat"),
    supabase.from("messages").select("id", head),
  ]);

  const messages: Message[] = convo.data
    ? ((await supabase.from("messages").select("id,conversation_id,sender_id,body,reply_to,attachment_id,created_at").eq("conversation_id", convo.data.id).order("created_at", { ascending: false }).limit(4)).data ?? [])
    : [];

  const goalRows = goalsRes.data ?? [];
  const goalProgress = goalRows.length ? Math.round(goalRows.reduce((s, g) => s + (g.progress as number), 0) / goalRows.length) : null;

  // Completed per day (workspace timezone) for the last 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const perDay = new Map(days.map((d) => [d, 0]));
  for (const r of completedWeek.data ?? []) {
    const d = todayISO(new Date(r.completed_at as string));
    if (perDay.has(d)) perDay.set(d, (perDay.get(d) ?? 0) + 1);
  }
  const bars = days.map((d) => ({ label: new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)).slice(0, 2), value: perDay.get(d) ?? 0 }));
  const completedCount = (completedWeek.data ?? []).length;

  type Deadline = { key: string; title: string; date: string; href: string; kind: "Task" | "Project" | "Goal"; assignee?: string | null };
  const deadlines: Deadline[] = [
    ...(upcomingTasks.data ?? []).map((t) => ({ key: `t${t.id}`, title: t.title as string, date: t.due_date as string, href: `/ops/tasks?task=${t.id}`, kind: "Task" as const, assignee: t.assignee_id as string | null })),
    ...(upcomingProjects.data ?? []).map((p) => ({ key: `p${p.id}`, title: p.name as string, date: p.deadline as string, href: `/ops/projects/${p.id}`, kind: "Project" as const })),
    ...(upcomingGoals.data ?? []).map((g) => ({ key: `g${g.id}`, title: g.title as string, date: g.deadline as string, href: "/ops/goals", kind: "Goal" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);

  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const events = ((activityRes.data ?? []) as ActivityEvent[]).map((e) => ({ ...e, project: e.project_id ? { id: e.project_id, name: projectName.get(e.project_id) ?? "Project" } : null }));

  const checklist = [
    { done: (tasksTotal.count ?? 0) > 0, label: "Create your first task", sub: "Assign it to yourself or your co-founder.", href: "/ops/tasks" },
    { done: (goalsTotal.count ?? 0) > 0, label: "Set a target", sub: "Pick one number you want to move this quarter.", href: "/ops/goals" },
    { done: (filesTotal.count ?? 0) > 0, label: "Upload a working document", sub: "Plans, proposals, decks — stored privately.", href: "/ops/files" },
    { done: (messagesTotal.count ?? 0) > 0, label: "Say hello in Co-Founder Chat", sub: "Private, saved, and in real time.", href: "/ops/chat" },
  ];
  const showOnboarding = checklist.some((c) => !c.done);

  return (
    <div className="space-y-6">
      <header className="ops-in flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ops-h1">{greeting()}, <span style={{ color: "var(--ops-cyan-text)" }}>{first}</span></h1>
          <p className="ops-muted mt-1.5">Here&apos;s what&apos;s happening at InstaBeam today.</p>
        </div>
      </header>
      <div className="ops-in ops-in-2"><QuickActions people={people} projects={projects} meId={userId} /></div>

      <div className="ops-in ops-in-2 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Active projects" value={activeProjects.count ?? 0} icon={<FolderKanban size={16} />} tone="cyan" />
        <StatTile label="Due today" value={dueToday.count ?? 0} hint="Assigned to you" icon={<ListChecks size={16} />} tone={(dueToday.count ?? 0) > 0 ? "warn" : "neutral"} />
        <StatTile label="Overdue" value={overdue.count ?? 0} hint="Assigned to you" icon={<TimerOff size={16} />} tone={(overdue.count ?? 0) > 0 ? "danger" : "neutral"} />
        <StatTile label="Done this week" value={completedCount} hint="Both co-founders" icon={<CheckCircle2 size={16} />} tone="lime" />
        <div className="ops-card ops-card-pad col-span-2 flex items-center gap-4 lg:col-span-1 lg:flex-col lg:items-start lg:gap-2">
          <span className="ops-eyebrow hidden lg:block">Target progress</span>
          {goalProgress === null ? (
            <div><p className="text-[30px] font-semibold leading-none">—</p><p className="ops-muted mt-2 text-[12.5px]">No targets yet</p></div>
          ) : (
            <div className="flex items-center gap-3"><Donut value={goalProgress} size={64} stroke={8} label={`${goalProgress}%`} /><p className="ops-muted text-[12.5px]">{goalRows.length} active {goalRows.length === 1 ? "target" : "targets"}</p></div>
          )}
          <span className="ops-eyebrow lg:hidden">Target progress</span>
        </div>
      </div>

      {showOnboarding && (
        <section className="ops-card ops-card-pad ops-in ops-in-3" aria-label="Getting started">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="ops-h2">Getting started</h2>
            <Badge tone="cyan">{checklist.filter((c) => c.done).length} of {checklist.length} done</Badge>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-[var(--ops-surface-2)]">
                  {c.done ? <CheckCircle2 size={18} style={{ color: "var(--ops-lime-text)" }} className="mt-0.5 shrink-0" /> : <Circle size={18} className="ops-faint mt-0.5 shrink-0" />}
                  <span><span className={`block text-[13.5px] font-medium ${c.done ? "ops-muted line-through" : ""}`}>{c.label}</span><span className="ops-muted block text-[12.5px]">{c.sub}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="ops-in ops-in-3 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Upcoming deadlines" action={<Link href="/ops/tasks" className="ops-muted inline-flex items-center gap-1 text-[12.5px] hover:underline">All tasks <ArrowRight size={13} /></Link>} padded={false}>
            {deadlines.length === 0 ? (
              <EmptyState compact icon={<CalendarClock size={22} />} title="Nothing due in the next two weeks" body="Deadlines for tasks, projects and goals will appear here." />
            ) : (
              <ul>
                {deadlines.map((d) => {
                  const lbl = deadlineLabel(d.date);
                  return (
                    <li key={d.key} className="border-t first:border-t-0">
                      <Link href={d.href} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--ops-surface-2)]">
                        <Badge>{d.kind}</Badge>
                        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{d.title}</span>
                        {d.assignee && <Avatar person={byId.get(d.assignee)} size={22} />}
                        {lbl && <Badge tone={lbl.tone}>{lbl.text}</Badge>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent activity" action={<Link href="/ops/activity" className="ops-muted inline-flex items-center gap-1 text-[12.5px] hover:underline">View all <ArrowRight size={13} /></Link>}>
            {events.length === 0 ? <EmptyState compact icon={<ListChecks size={22} />} title="No activity yet" body="Creating tasks, uploading files and updating goals will show up here." /> : <ActivityList events={events} byId={byId} />}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Completed this week">
            <MiniBars data={bars} />
            <p className="ops-muted mt-3 text-[12.5px]">{completedCount === 0 ? "No tasks completed in the last 7 days." : `${completedCount} ${completedCount === 1 ? "task" : "tasks"} completed in the last 7 days.`}</p>
          </SectionCard>

          <SectionCard title="Co-founder messages" action={<Link href="/ops/chat" className="ops-muted inline-flex items-center gap-1 text-[12.5px] hover:underline">Open chat <ArrowRight size={13} /></Link>}>
            {messages.length === 0 ? <EmptyState compact icon={<ListChecks size={22} />} title="No messages yet" body="Start the conversation — it's private to the two of you." /> : (
              <ul className="space-y-3">
                {messages.map((m) => (
                  <li key={m.id} className="flex gap-3">
                    <Avatar person={byId.get(m.sender_id ?? "")} size={28} />
                    <div className="min-w-0"><p className="truncate text-[13.5px]"><span className="font-medium">{byId.get(m.sender_id ?? "")?.display_name ?? "Someone"}</span> <span className="ops-muted">{m.body || "Sent a file"}</span></p><p className="ops-faint text-[11.5px]">{timeAgo(m.created_at)}</p></div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent files" action={<Link href="/ops/files" className="ops-muted inline-flex items-center gap-1 text-[12.5px] hover:underline">All files <ArrowRight size={13} /></Link>}>
            {(filesRes.data ?? []).length === 0 ? <EmptyState compact icon={<Paperclip size={22} />} title="No files yet" body="Upload a document to share it privately." /> : (
              <ul className="space-y-2.5">
                {(filesRes.data ?? []).map((f) => (
                  <li key={f.id as string} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "var(--ops-cyan-soft)", color: "var(--ops-cyan-text)" }}><Paperclip size={15} /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-[13.5px] font-medium">{f.file_name as string}</p><p className="ops-faint text-[11.5px]">{byId.get(f.uploaded_by as string)?.display_name ?? "Someone"} · {formatBytes(f.size_bytes as number)} · {formatDate(f.created_at as string)}</p></div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
