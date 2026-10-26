import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isWorkspaceConfigured, workspaceSupabaseAnonKey, workspaceSupabaseUrl } from "./config";

// Reachable without a session. Everything else under /ops requires one.
const PUBLIC_OPS_PATHS = ["/ops/login", "/ops/forgot-password", "/ops/set-password", "/ops/auth/"];

function isPublicOpsPath(pathname: string) {
  return PUBLIC_OPS_PATHS.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p));
}

/** Refreshes the Supabase session cookie and gates /ops. */
export async function opsMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let response = NextResponse.next({ request });

  if (!isWorkspaceConfigured) {
    // Nothing can be authenticated. Let only the login page render (it explains why).
    if (pathname === "/ops/login") return harden(response);
    return harden(NextResponse.redirect(new URL("/ops/login", request.url)));
  }

  const supabase = createServerClient(workspaceSupabaseUrl, workspaceSupabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT signature and expiry locally against the project's
  // cached public keys (no round trip to the auth server on every click or prefetch)
  // and refreshes the session when it has expired. It never trusts an unsigned cookie.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? { id: data.claims.sub } : null;

  if (!user && !isPublicOpsPath(pathname)) {
    const url = new URL("/ops/login", request.url);
    if (pathname !== "/ops") url.searchParams.set("next", pathname + search);
    return harden(NextResponse.redirect(url));
  }
  if (user && (pathname === "/ops/login" || pathname === "/ops/forgot-password")) {
    return harden(NextResponse.redirect(new URL("/ops", request.url)));
  }
  return harden(response);
}

/** Private pages must never be indexed or cached by a shared cache. */
function harden(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
