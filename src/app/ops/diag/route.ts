// TEMPORARY performance diagnostic — requires a signed-in session (middleware gate) and
// returns timings only, no data. Deleted once the measurement is done.
import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/ops/supabase/server";

export const dynamic = "force-dynamic";

async function time<T>(fn: () => PromiseLike<T>) {
  const s = performance.now();
  await fn();
  return Math.round(performance.now() - s);
}

export async function GET() {
  const supabase = await getServerSupabase();
  const q = () => supabase.from("workspaces").select("id").limit(1);
  const out: Record<string, unknown> = { functionRegion: process.env.VERCEL_REGION ?? "?" };
  out.claims_1st_ms = await time(() => supabase.auth.getClaims());
  out.claims_2nd_ms = await time(() => supabase.auth.getClaims());
  out.getUser_network_ms = await time(() => supabase.auth.getUser());
  out.query_1_ms = await time(q);
  out.query_2_ms = await time(q);
  out.query_3_ms = await time(q);
  out.three_queries_parallel_ms = await time(() => Promise.all([q(), q(), q()]));
  out.six_queries_parallel_ms = await time(() => Promise.all([q(), q(), q(), q(), q(), q()]));
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
