import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterSignupNotification } from "@/lib/email";
import { insertLead } from "@/lib/supabase";
import { getRequestMeta } from "@/lib/request-meta";

export const runtime = "nodejs";

const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  // Honeypot — real users never fill this in. Not empty-only (see
  // src/lib/validations.ts) so a filled-in value still validates and can
  // be silently faked as success rather than surfacing a 400.
  company_website: z.string().max(200).optional().or(z.literal("")),
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
    const meta = getRequestMeta(request);

    if (isRateLimited(meta.ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, company_website } = newsletterSchema.parse(body);

    // Honeypot tripped — silently pretend success so bots don't learn.
    if (company_website) {
      return NextResponse.json({ ok: true });
    }

    await insertLead({
      name: email.split("@")[0],
      email,
      message: "Newsletter signup",
      page: meta.sourcePage,
      source: "newsletter",
      ip: meta.ip,
      user_agent: meta.userAgent,
    }).catch((err) => console.error("[newsletter] CRM insert failed:", err));

    await sendNewsletterSignupNotification(email, meta).catch((err) =>
      console.error("[newsletter] notification email failed:", err)
    );

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
