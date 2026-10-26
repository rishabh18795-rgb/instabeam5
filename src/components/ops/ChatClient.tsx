"use client";
import { ArrowDown, CornerUpLeft, Download, Loader2, Paperclip, Search, SendHorizonal, Smile, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { deleteAttachment, getDownloadUrl } from "@/lib/ops/actions/files";
import { markConversationRead, searchMessages, sendMessage } from "@/lib/ops/actions/chat";
import { FILE_ACCEPT } from "@/lib/ops/constants";
import { formatBytes, formatDate, formatTime, todayISO } from "@/lib/ops/format";
import { linkify } from "@/lib/ops/linkify";
import { getBrowserSupabase } from "@/lib/ops/supabase/client";
import type { Message, Person } from "@/lib/ops/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";
import { uploadFile } from "./upload";
import { Avatar } from "./ui";

type Msg = Message & { pending?: boolean };
const EMOJI = ["👍", "🙏", "🔥", "✅", "🎉", "😂", "😊", "🚀", "👀", "💡", "❤️", "👏", "🤝", "😅", "🤔", "⚡", "📌", "📈", "🥳", "😎"];

export function ChatClient({ conversationId, me, other, initialMessages, otherLastRead: initialSeen }: {
  conversationId: string; me: Person; other: Person; initialMessages: Msg[]; otherLastRead: string | null;
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [seenAt, setSeenAt] = useState(initialSeen);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [attached, setAttached] = useState<{ id: string; name: string; size: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [live, setLive] = useState<"connecting" | "live" | "polling">("connecting");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; body: string; sender_id: string | null; created_at: string }[] | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const people = useMemo<Record<string, Person>>(() => ({ [me.id]: me, [other.id]: other }), [me, other]);
  const byId = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages]);

  const scrollDown = useCallback((smooth = true) => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);
  const markRead = useCallback(() => { if (document.visibilityState === "visible") void markConversationRead(conversationId); }, [conversationId]);

  // Attach file metadata to a message that arrived over realtime.
  const hydrate = useCallback(async (m: Msg): Promise<Msg> => {
    if (!m.attachment_id) return m;
    const { data } = await getBrowserSupabase().from("attachments").select("id,file_name,size_bytes,mime_type").eq("id", m.attachment_id).maybeSingle();
    return { ...m, attachment: data ?? null };
  }, []);

  const merge = useCallback((incoming: Msg[]) => {
    setMessages((prev) => {
      const map = new Map(prev.filter((p) => !(p.pending && incoming.some((i) => i.sender_id === p.sender_id && i.body === p.body && !p.attachment_id))).map((p) => [p.id, p]));
      for (const m of incoming) map.set(m.id, { ...map.get(m.id), ...m });
      return [...map.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  }, []);

  useEffect(() => { scrollDown(false); markRead(); }, [scrollDown, markRead]);

  // Realtime (RLS-filtered). Falls back to polling when the channel can't connect.
  useEffect(() => {
    const supabase = getBrowserSupabase();
    let poll: ReturnType<typeof setInterval> | undefined;
    const catchUp = async () => {
      const since = messages.at(-1)?.created_at;
      let q = supabase.from("messages").select("id,conversation_id,sender_id,body,reply_to,attachment_id,created_at").eq("conversation_id", conversationId).order("created_at").limit(100);
      if (since) q = q.gt("created_at", since);
      const { data } = await q;
      if (data?.length) { merge(await Promise.all((data as Msg[]).map(hydrate))); markRead(); }
      const { data: cm } = await supabase.from("conversation_members").select("last_read_at").eq("conversation_id", conversationId).eq("user_id", other.id).maybeSingle();
      if (cm) setSeenAt(cm.last_read_at as string);
    };
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, async (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const m = await hydrate(p.new as unknown as Msg);
        merge([m]);
        if (m.sender_id !== me.id) markRead();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversation_members", filter: `conversation_id=eq.${conversationId}` }, (p: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        const row = p.new as { user_id?: string; last_read_at?: string };
        if (row.user_id === other.id && row.last_read_at) setSeenAt(row.last_read_at);
      })
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") { setLive("live"); if (poll) { clearInterval(poll); poll = undefined; } void catchUp(); }
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setLive("polling");
          poll ??= setInterval(() => { void catchUp(); }, 8000);
        }
      });
    const onVisible = () => { if (document.visibilityState === "visible") { markRead(); void catchUp(); } };
    document.addEventListener("visibilitychange", onVisible);
    return () => { document.removeEventListener("visibilitychange", onVisible); if (poll) clearInterval(poll); void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once per conversation
  }, [conversationId]);

  // Keep pinned to the newest message unless the reader scrolled up.
  useEffect(() => { if (atBottom) scrollDown(); }, [messages.length, atBottom, scrollDown]);

  async function send() {
    const body = text.trim();
    if ((!body && !attached) || sending || uploading) return;
    setSending(true);
    const tempId = `tmp-${Date.now()}`;
    const optimistic: Msg = { id: tempId, conversation_id: conversationId, sender_id: me.id, body, reply_to: replyTo?.id ?? null, attachment_id: attached?.id ?? null, created_at: new Date().toISOString(), pending: true,
      attachment: attached ? { id: attached.id, file_name: attached.name, size_bytes: attached.size, mime_type: "" } : null };
    setMessages((m) => [...m, optimistic]);
    setAtBottom(true);
    const draft = { text, replyTo, attached };
    setText(""); setReplyTo(null); setAttached(null); setEmoji(false);
    const r = await sendMessage({ conversation_id: conversationId, body, reply_to: draft.replyTo?.id, attachment_id: draft.attached?.id });
    setSending(false);
    if (!r.ok) {
      setMessages((m) => m.filter((x) => x.id !== tempId));
      setText(draft.text); setReplyTo(draft.replyTo); setAttached(draft.attached);
      toast.error(r.error);
      return;
    }
    if (r.data) setMessages((m) => m.map((x) => (x.id === tempId ? { ...x, id: r.data!.id, created_at: r.data!.created_at, pending: false } : x)).filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i));
    input.current?.focus();
  }

  async function onPickFile(f: File | undefined) {
    if (!f) return;
    setUploading(true);
    const r = await uploadFile(f, { context: "chat" });
    setUploading(false);
    if (file.current) file.current.value = "";
    if (r.ok) setAttached({ id: r.id, name: f.name, size: f.size }); else toast.error(r.error);
  }

  async function download(id: string) {
    const r = await getDownloadUrl(id);
    if (r.ok && r.data) window.location.assign(r.data.url); else toast.error(r.ok ? "Couldn't download." : r.error);
  }

  useEffect(() => {
    if (!searching || query.trim().length < 2) { setResults(null); return; }
    const t = setTimeout(async () => { const r = await searchMessages(conversationId, query); setResults(r.ok ? r.data ?? [] : []); }, 300);
    return () => clearTimeout(t);
  }, [query, searching, conversationId]);

  function jumpTo(id: string) {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return toast.error("That message is older than what's loaded here.");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.animate([{ background: "var(--ops-cyan-soft)" }, { background: "transparent" }], { duration: 1800 });
  }

  const lastMine = [...messages].reverse().find((m) => m.sender_id === me.id && !m.pending);
  const seen = !!(lastMine && seenAt && seenAt >= lastMine.created_at);
  const today = todayISO();

  return (
    <div className="ops-card flex h-[calc(100dvh-13.5rem)] min-h-[420px] flex-col overflow-hidden lg:h-[calc(100dvh-10rem)]">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Avatar person={other} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold">{other.display_name}</p>
          <p className="ops-faint flex items-center gap-1.5 text-[12px]">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: live === "live" ? "var(--ops-lime)" : live === "polling" ? "var(--ops-warn)" : "var(--ops-faint)" }} />
            {live === "live" ? "Live · private to you two" : live === "polling" ? "Refreshing every few seconds" : "Connecting…"}
          </p>
        </div>
        <button className="ops-btn ops-btn-ghost ops-btn-icon" aria-label="Search messages" aria-pressed={searching} onClick={() => { setSearching((s) => !s); setQuery(""); setResults(null); }}><Search size={17} /></button>
      </header>

      {searching && (
        <div className="border-b px-4 py-3">
          <input className="ops-input ops-input-sm" autoFocus placeholder="Search this conversation" aria-label="Search this conversation" value={query} onChange={(e) => setQuery(e.target.value)} />
          {results && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {results.length === 0 && <li className="ops-muted text-[13px]">No messages found.</li>}
              {results.map((r) => (
                <li key={r.id}><button className="w-full rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-[var(--ops-surface-2)]" onClick={() => jumpTo(r.id)}>
                  <span className="font-medium">{people[r.sender_id ?? ""]?.display_name}</span> <span className="ops-faint">· {formatDate(r.created_at)}</span><span className="ops-muted block truncate">{r.body}</span></button></li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div ref={scroller} className="relative flex-1 overflow-y-auto px-4 py-4" onScroll={(e) => { const el = e.currentTarget; setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80); }} role="log" aria-live="polite" aria-label="Messages">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center"><div><p className="text-[15px] font-medium">Say hello to {other.display_name.split(" ")[0]} 👋</p><p className="ops-muted mt-1 text-[13px]">Messages are saved, private, and only visible to the two of you.</p></div></div>
        ) : (
          <ul className="space-y-0.5">
            {messages.map((m, i) => {
              const mine = m.sender_id === me.id;
              const prev = messages[i - 1];
              const newDay = !prev || todayISO(new Date(prev.created_at)) !== todayISO(new Date(m.created_at));
              const grouped = !newDay && prev?.sender_id === m.sender_id && new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60_000;
              const quoted = m.reply_to ? byId.get(m.reply_to) : null;
              return (
                <li key={m.id}>
                  {newDay && <div className="my-4 flex items-center gap-3"><hr className="ops-divider flex-1" /><span className="ops-faint text-[11.5px] font-medium">{todayISO(new Date(m.created_at)) === today ? "Today" : formatDate(m.created_at, { weekday: "short", day: "numeric", month: "short" })}</span><hr className="ops-divider flex-1" /></div>}
                  <div id={`msg-${m.id}`} className={cn("group flex gap-2.5 rounded-xl px-1 py-0.5", mine && "flex-row-reverse", !grouped && "mt-3")}>
                    <div className="w-8 shrink-0">{!grouped && <Avatar person={people[m.sender_id ?? ""]} size={32} />}</div>
                    <div className={cn("flex max-w-[78%] flex-col", mine && "items-end")}>
                      {!grouped && <p className="ops-faint mb-1 px-1 text-[11.5px]"><span className="font-medium" style={{ color: "var(--ops-text)" }}>{mine ? "You" : people[m.sender_id ?? ""]?.display_name}</span> · {formatTime(m.created_at)}</p>}
                      <div className={cn("relative rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed", m.pending && "opacity-60")}
                        style={mine ? { background: "var(--ops-cyan)", color: "#0b0b0b", borderTopRightRadius: grouped ? undefined : 6 } : { background: "var(--ops-surface-3)", borderTopLeftRadius: grouped ? undefined : 6 }}>
                        {quoted && <button className="mb-1.5 block w-full rounded-lg border-l-2 px-2 py-1 text-left text-[12px] opacity-80" style={{ borderColor: mine ? "#0b0b0b" : "var(--ops-cyan)", background: "rgb(0 0 0 / .1)" }} onClick={() => jumpTo(quoted.id)}>
                          <span className="font-semibold">{people[quoted.sender_id ?? ""]?.display_name}</span><span className="line-clamp-2 block">{quoted.body || "File"}</span></button>}
                        {m.body && <p className="whitespace-pre-wrap break-words">{linkify(m.body).map((p, k) => p.type === "link"
                          ? <a key={k} href={p.href} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2" style={{ color: mine ? "#04303a" : "var(--ops-cyan-text)" }}>{p.text}</a>
                          : <span key={k}>{p.text}</span>)}</p>}
                        {m.attachment && (
                          <button className="mt-1.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px]" style={{ background: "rgb(0 0 0 / .14)" }} onClick={() => download(m.attachment!.id)} aria-label={`Download ${m.attachment.file_name}`}>
                            <Paperclip size={14} /><span className="min-w-0 flex-1 truncate font-medium">{m.attachment.file_name}</span><span className="opacity-70">{formatBytes(m.attachment.size_bytes)}</span><Download size={14} /></button>)}
                      </div>
                      {mine && lastMine?.id === m.id && !m.pending && <p className="ops-faint mt-0.5 px-1 text-[11px]">{seen ? "Seen" : "Delivered"}</p>}
                      {m.pending && <p className="ops-faint mt-0.5 px-1 text-[11px]">Sending…</p>}
                    </div>
                    {!m.pending && <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm self-center opacity-0 transition group-hover:opacity-100 focus:opacity-100" aria-label="Reply" onClick={() => { setReplyTo(m); input.current?.focus(); }}><CornerUpLeft size={14} /></button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!atBottom && messages.length > 0 && <button className="ops-btn ops-btn-sm sticky bottom-2 left-full ml-auto shadow-lg" onClick={() => { scrollDown(); setAtBottom(true); }} aria-label="Jump to newest"><ArrowDown size={14} /> New</button>}
      </div>

      <form className="border-t p-3" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        {replyTo && <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px]" style={{ background: "var(--ops-surface-2)" }}><CornerUpLeft size={13} /><span className="min-w-0 flex-1 truncate">Replying to <b>{people[replyTo.sender_id ?? ""]?.display_name}</b>: {replyTo.body || "file"}</span><button type="button" aria-label="Cancel reply" onClick={() => setReplyTo(null)}><X size={14} /></button></div>}
        {(attached || uploading) && <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px]" style={{ background: "var(--ops-surface-2)" }}>{uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : <><Paperclip size={13} /><span className="min-w-0 flex-1 truncate">{attached!.name} · {formatBytes(attached!.size)}</span>
          <button type="button" aria-label="Remove attachment" onClick={() => { void deleteAttachment(attached!.id); setAttached(null); }}><X size={14} /></button></>}</div>}
        <div className="relative flex items-end gap-2">
          <input ref={file} type="file" accept={FILE_ACCEPT} className="sr-only" onChange={(e) => onPickFile(e.target.files?.[0])} aria-label="Attach a file" />
          <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon" aria-label="Attach a file" onClick={() => file.current?.click()} disabled={uploading}><Paperclip size={18} /></button>
          <button type="button" className="ops-btn ops-btn-ghost ops-btn-icon" aria-label="Add emoji" aria-expanded={emoji} onClick={() => setEmoji((e) => !e)}><Smile size={18} /></button>
          {emoji && (
            <div className="ops-card ops-in absolute bottom-12 left-10 z-10 grid w-64 grid-cols-5 gap-1 p-2" role="menu" aria-label="Emoji">
              {EMOJI.map((e) => <button key={e} type="button" role="menuitem" className="rounded-lg p-1.5 text-xl hover:bg-[var(--ops-surface-3)]" onClick={() => { setText((t) => t + e); input.current?.focus(); }}>{e}</button>)}
            </div>
          )}
          <textarea ref={input} rows={1} className="ops-textarea !min-h-[40px] max-h-36 flex-1 !py-2.5" placeholder={`Message ${other.display_name.split(" ")[0]}…`} aria-label="Message" value={text} maxLength={4000}
            onChange={(e) => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
          <button className="ops-btn ops-btn-primary ops-btn-icon" aria-label="Send message" disabled={(!text.trim() && !attached) || sending || uploading}><SendHorizonal size={17} /></button>
        </div>
      </form>
    </div>
  );
}
