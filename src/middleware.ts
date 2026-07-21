import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login"]);

// Defense-in-depth beyond robots.txt's "Disallow: /admin" — a disallow
// rule only stops crawling, it doesn't guarantee a URL stays out of the
// index if it's ever linked from elsewhere. This header guarantees it.
function withNoindex(response: NextResponse, pathname: string) {
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return withNoindex(NextResponse.next(), pathname);

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (authed) return withNoindex(NextResponse.next(), pathname);

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return withNoindex(NextResponse.redirect(loginUrl), pathname);
}
