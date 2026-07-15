import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterSignupNotification } from "@/lib/email";

export const runtime = "nodejs";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

// Minimal in-memory rate limit — same pattern as /api/enquiry.
const submissionsByIp = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[newsletter] RESEND_API_KEY is not configured — signup not recorded:",
        email
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Newsletter signup isn't configured yet. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Notify the team of the new subscriber. Phase 3 swaps this for a
    // proper list/DB (e.g. Resend Audiences or a Supabase table) — for
    // now, every signup lands as an email so nothing is silently lost.
    await sendNewsletterSignupNotification(email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message ?? "Invalid input." },
        { status: 400 }
      );
    }
    console.error("[newsletter] Unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
