"use client";
import { FileUp, FolderPlus, ListPlus, MessageCircle, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Person } from "@/lib/ops/types";
import { GoalDialog } from "./GoalDialog";
import { ProjectDialog } from "./ProjectDialog";
import { TaskDialog } from "./TaskDialog";
import { UploadDialog } from "./UploadDialog";

type Which = "task" | "project" | "upload" | "goal" | null;

export function QuickActions({ people, projects, meId }: { people: Person[]; projects: { id: string; name: string }[]; meId: string }) {
  const [open, setOpen] = useState<Which>(null);
  const close = () => setOpen(null);
  const btn = "ops-btn";
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick actions">
        <button className={`${btn} ops-btn-primary`} onClick={() => setOpen("task")}><ListPlus size={16} /> New Task</button>
        <button className={btn} onClick={() => setOpen("project")}><FolderPlus size={16} /> New Project</button>
        <button className={btn} onClick={() => setOpen("upload")}><FileUp size={16} /> Upload File</button>
        <button className={btn} onClick={() => setOpen("goal")}><Target size={16} /> Set Target</button>
        <Link href="/ops/chat" className={btn}><MessageCircle size={16} /> Message Co-Founder</Link>
      </div>
      <TaskDialog open={open === "task"} onClose={close} people={people} projects={projects} meId={meId} />
      <ProjectDialog open={open === "project"} onClose={close} people={people} meId={meId} />
      <UploadDialog open={open === "upload"} onClose={close} projects={projects} />
      <GoalDialog open={open === "goal"} onClose={close} people={people} projects={projects} meId={meId} />
    </>
  );
}
