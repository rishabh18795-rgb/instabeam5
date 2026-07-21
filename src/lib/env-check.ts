/** Temporary diagnostic — logs which integration env vars Vercel actually
 * loaded for this invocation. One line per request, server-only. Safe to
 * remove once production env vars are confirmed working; logs presence
 * only, never values. */
export function logEnvStatus(context: string) {
  const checks: Record<string, boolean> = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    SUPABASE_URL: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GOOGLE_SHEETS_WEBHOOK_URL: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL,
    GOOGLE_SHEETS_WEBHOOK_SECRET: !!process.env.GOOGLE_SHEETS_WEBHOOK_SECRET,
  };

  const summary = Object.entries(checks)
    .map(([key, present]) => `${key}=${present ? "✔" : "✘missing"}`)
    .join(" ");

  console.log(`[env-check:${context}] ${summary}`);
}
