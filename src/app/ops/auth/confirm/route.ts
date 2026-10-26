import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/ops/supabase/server";
import { isWorkspaceConfigured } from "@/lib/ops/supabase/config";

/**
 * Landing route for e-mail links that carry a `token_hash` (invite, password
 * recovery, magic link) when the Supabase e-mail templates are pointed at
 *   {{ .SiteURL }}/ops/auth/confirm?token_hash={{ .TokenHash }}&type=invite
 * The token is consumed server-side and never rendered or logged.
 */
export const preferredRegion = "hnd1";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const fail = new URL("/ops/login?error=link", request.url);

  if (!isWorkspaceConfigured || !tokenHash || !type) return NextResponse.redirect(fail);

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(fail);

  // Invites and recoveries must choose a password before entering the app.
  const dest = type === "invite" || type === "recovery" ? "/ops/set-password" : "/ops";
  return NextResponse.redirect(new URL(dest, request.url));
}
