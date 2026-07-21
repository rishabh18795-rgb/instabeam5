import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazily instantiate so builds/dev never crash when the env vars aren't
// set yet — callers treat a null client as "CRM not configured" and fall
// back to logging, the same pattern used for Resend in lib/email.ts.
// Server-only: this uses the service role key and must never be imported
// from a client component.
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Won" | "Lost";

export const leadStatuses: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Won",
  "Lost",
];

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  budget: string | null;
  message: string | null;
  page: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  ip: string | null;
  user_agent: string | null;
};

export type NewLead = {
  name: string;
  company?: string | null;
  website?: string | null;
  email: string;
  phone?: string | null;
  budget?: string | null;
  message?: string | null;
  page?: string | null;
  source?: string | null;
  ip?: string | null;
  user_agent?: string | null;
};

/** Inserts one row per form submission. Best-effort: callers should not
 * let a CRM failure block the user-facing success response. */
export async function insertLead(lead: NewLead) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabaseAdmin.from("leads").insert({
    ...lead,
    status: "New",
  });

  if (error) throw error;
}

export type ListLeadsParams = {
  q?: string;
  status?: LeadStatus | "all";
  page?: number;
  pageSize?: number;
};

export async function listLeads({ q, status, page = 1, pageSize = 20 }: ListLeadsParams) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabaseAdmin
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q && q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%,phone.ilike.%${term}%,website.ilike.%${term}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) throw error;
  return { leads: (data ?? []) as Lead[], total: count ?? 0 };
}

/** Used by CSV export — same filters as listLeads but no pagination cap. */
export async function listAllLeads({ q, status }: Omit<ListLeadsParams, "page" | "pageSize">) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  let query = supabaseAdmin
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (q && q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%,phone.ilike.%${term}%,website.ilike.%${term}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "notes">>) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
  if (error) throw error;
}
