// Workspace Supabase project. Deliberately separate env names from the
// public-site CRM (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) so the two can
// point at different projects. The anon key is public by design — every
// table is protected by Row Level Security — and the service-role key is
// never read by the running app (only by scripts/provision-founders.mjs).
export const workspaceSupabaseUrl = process.env.NEXT_PUBLIC_WORKSPACE_SUPABASE_URL ?? "";
export const workspaceSupabaseAnonKey = process.env.NEXT_PUBLIC_WORKSPACE_SUPABASE_ANON_KEY ?? "";

export const isWorkspaceConfigured = Boolean(workspaceSupabaseUrl && workspaceSupabaseAnonKey);

export const STORAGE_BUCKET = "workspace-files";
export const WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";
export const WORKSPACE_TZ = "Asia/Kolkata";
