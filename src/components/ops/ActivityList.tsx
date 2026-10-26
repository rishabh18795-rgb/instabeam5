import { CheckCircle2, FileUp, FolderKanban, ListChecks, MessageSquare, Target, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { describeEvent, eventHref } from "@/lib/ops/activity";
import { timeAgo } from "@/lib/ops/format";
import type { ActivityEvent, Person } from "@/lib/ops/types";
import { Avatar } from "./ui";

function iconFor(type: string): LucideIcon {
  if (type === "task.completed") return CheckCircle2;
  if (type === "task.commented") return MessageSquare;
  if (type.startsWith("task")) return ListChecks;
  if (type.startsWith("project")) return FolderKanban;
  if (type.startsWith("file")) return FileUp;
  return Target;
}

export function ActivityList({ events, byId, showProject = true }: { events: ActivityEvent[]; byId: Map<string, Person>; showProject?: boolean }) {
  return (
    <ul className="space-y-0">
      {events.map((e) => {
        const actor = e.actor_id ? byId.get(e.actor_id) : null;
        const Icon = iconFor(e.type);
        const href = eventHref(e);
        const body = (
          <>
            <span className="font-medium">{actor?.display_name ?? "Someone"}</span>{" "}
            <span className="ops-muted">{describeEvent(e, byId)}</span>
          </>
        );
        return (
          <li key={e.id} className="relative flex gap-3 py-3 [&:not(:last-child)]:border-b">
            <div className="relative">
              <Avatar person={actor} size={32} />
              <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border" style={{ background: "var(--ops-surface)", color: "var(--ops-cyan-text)" }}><Icon size={10} /></span>
            </div>
            <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
              {href ? <Link href={href} className="hover:underline">{body}</Link> : body}
              <p className="ops-faint mt-0.5 text-[12px]">
                <time dateTime={e.created_at}>{timeAgo(e.created_at)}</time>
                {showProject && e.project_id && e.project && <> · <Link href={`/ops/projects/${e.project_id}`} className="hover:underline">{e.project.name}</Link></>}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
