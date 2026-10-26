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
  const { data: convo } = await supabase.from("conversations").select("id").limit(1).maybeSingle();

  if (!convo || !other) {
    return (
      <>
        <PageHeader title="Co-Founder Chat" subtitle="A private conversation between the two of you." />
        <div className="ops-card"><EmptyState icon={<MessageCircleOff size={22} />} title="Waiting for your co-founder"
          body="Chat opens as soon as both co-founders have accepted their invitations and signed in." /></div>
      </>
    );
  }

  const [{ data: rows }, { data: members }] = await Promise.all([
    supabase.from("messages").select("id,conversation_id,sender_id,body,reply_to,attachment_id,created_at").eq("conversation_id", convo.id).order("created_at", { ascending: false }).limit(200),
    supabase.from("conversation_members").select("user_id,last_read_at").eq("conversation_id", convo.id),
  ]);
  const messages = ((rows ?? []) as Message[]).reverse();
  const ids = [...new Set(messages.map((m) => m.attachment_id).filter(Boolean))] as string[];
  const { data: atts } = ids.length ? await supabase.from("attachments").select("id,file_name,size_bytes,mime_type").in("id", ids) : { data: [] };
  const attMap = new Map((atts ?? []).map((a) => [a.id as string, a]));
  const hydrated = messages.map((m) => ({ ...m, attachment: m.attachment_id ? (attMap.get(m.attachment_id) as Message["attachment"]) ?? null : null }));
  const me = people.find((p) => p.id === userId) ?? { id: userId, display_name: profile.display_name, avatar_path: profile.avatar_path, avatar_url: profile.avatar_url };

  return (
    <>
      <PageHeader title="Co-Founder Chat" subtitle="Private, saved and in real time — only you and your co-founder can read this." />
      <ChatClient conversationId={convo.id as string} me={me} other={other} initialMessages={hydrated}
        otherLastRead={(members ?? []).find((m) => m.user_id === other.id)?.last_read_at as string | null ?? null} />
    </>
  );
}
