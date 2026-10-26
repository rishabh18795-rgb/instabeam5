import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { workspaceSupabaseAnonKey, workspaceSupabaseUrl } from "./config";

/** Server client bound to the request's session cookies. Never uses the service role. */
export async function getServerSupabase() {
  const store = await cookies();
  return createServerClient(workspaceSupabaseUrl, workspaceSupabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, which cannot set cookies. The
          // middleware refreshes the session on every request, so this is safe.
        }
      },
    },
  });
}
