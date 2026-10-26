-- Stamp the chat read marker with the DATABASE clock.
--
-- Messages are timestamped by Postgres (created_at default now()). Setting
-- last_read_at from the web server's clock could, under clock skew, hide a
-- message that arrived just before opening the chat, or leave a read message
-- looking unread. clock_timestamp() also moves past now() within a transaction.
create or replace function public.mark_conversation_read(p_conversation uuid) returns void
language sql security invoker set search_path = '' as $$
  update public.conversation_members
     set last_read_at = clock_timestamp()
   where conversation_id = p_conversation and user_id = (select auth.uid());
$$;

revoke all on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

notify pgrst, 'reload schema';
