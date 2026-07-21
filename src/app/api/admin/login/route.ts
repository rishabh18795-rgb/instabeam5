import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, createSessionToken, safeEqual } from "@/lib/admin-auth";
import { getRequestMeta } from "@/lib/request-meta";

export const runtime = "nodejs";

const loginSchema = z.object({ password: z.string().min(1) });

// Stricter than the public forms — this guards a login endpoint.
const attemptsByIp = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (attemptsByIp.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  attemptsByIp.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const { ip } = getRequestMeta(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "Admin panel is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const { password } = loginSchema.parse(await request.json());

    if (!safeEqual(password, adminPassword)) {
      return NextResponse.json(
        { ok: false, error: "Incorrect password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
}
