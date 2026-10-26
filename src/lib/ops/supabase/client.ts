import { createBrowserClient } from "@supabase/ssr";
import { workspaceSupabaseAnonKey, workspaceSupabaseUrl } from "./config";

let client: ReturnType<typeof createBrowserClient> | undefined;

/** Browser client (singleton). Uses the signed-in user's session; RLS decides what it can see. */
export function getBrowserSupabase() {
  client ??= createBrowserClient(workspaceSupabaseUrl, workspaceSupabaseAnonKey);
  return client;
}
