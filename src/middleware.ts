import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}
