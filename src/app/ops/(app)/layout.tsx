import { AppShell } from "@/components/ops/AppShell";
import { requireSession } from "@/lib/ops/auth";
import type { Notification } from "@/lib/ops/types";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId, profile } = await requireSession();

  // Generate "due soon" / "overdue" notifications (deduped per task per day) before reading them.
  await supabase.rpc("refresh_deadline_notifications");

  const [{ data: notes }, { data: unread }, { count: openTasks }] = await Promise.all([
    supabase.from("notifications").select("id,kind,title,body,link,read_at,created_at").order("created_at", { ascending: false }).limit(20),
    supabase.rpc("unread_message_count"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("assignee_id", userId).neq("status", "completed"),
  ]);

  return (
    <AppShell
      me={{ id: userId, display_name: profile.display_name, avatar_path: profile.avatar_path, avatar_url: profile.avatar_url, email: profile.email }}
      theme={profile.theme}
      unreadChat={typeof unread === "number" ? unread : 0}
      openTasks={openTasks ?? 0}
      notifications={(notes ?? []) as Notification[]}
    >
      {children}
    </AppShell>
  );
}
