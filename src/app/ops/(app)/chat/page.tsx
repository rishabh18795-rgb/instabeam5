import { MessageCircleOff } from "lucide-react";
import type { Metadata } from "next";
import { ChatClient } from "@/components/ops/ChatClient";
import { EmptyState, PageHeader } from "@/components/ops/ui";
import { getBasics } from "@/lib/ops/data";
import type { Message } from "@/lib/ops/types";

export const metadata: Metadata = { title: "Co-Founder Chat" };

export default async function ChatPage() {
  const { supabase, userId, people, profile } = await getBasics();
  const other = people.find((p) => p.id !== userId);

  // Everything in one parallel round trip. RLS limits all three to the caller's own conversation.
  const [{ data: convo }, { data: rows }, { data: members }] = await Promise.all([
    supabase.from("conversations").select("id").limit(1).maybeSingle(),
    supabase.from("messages").select("id,conversation_id,sender_id,body,reply_to,attachment_id,created_at,attachment:attachments(id,file_name,size_bytes,mime_type)").order("created_at", { ascending: false }).limit(200),
    supabase.from("conversation_members").select("user_id,last_read_at"),
  ]);

  if (!convo || !other) {
    return (
      <>
        <PageHeader title="Co-Founder Chat" subtitle="A private conversation between the two of you." />
        <div className="ops-card"><EmptyState icon={<MessageCircleOff size={22} />} title="Waiting for your co-founder"
          body="Chat opens as soon as both co-founders have accepted their invitations and signed in." /></div>
      </>
    );
  }

  const hydrated = ((rows ?? []) as unknown as Message[]).reverse();
  const me = people.find((p) => p.id === userId) ?? { id: userId, display_name: profile.display_name, avatar_path: profile.avatar_path, avatar_url: profile.avatar_url };

  return (
    <>
      <PageHeader title="Co-Founder Chat" subtitle="Private, saved and in real time — only you and your co-founder can read this." />
      <ChatClient conversationId={convo.id as string} me={me} other={other} initialMessages={hydrated}
        otherLastRead={(members ?? []).find((m) => m.user_id === other.id)?.last_read_at as string | null ?? null} />
    </>
  );
}
