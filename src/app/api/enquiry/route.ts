import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { enquirySchema } from "@/lib/validations";
import { sendEnquiryConfirmation, sendEnquiryNotification } from "@/lib/email";

export const runtime = "nodejs";

// Minimal in-memory rate limit — good enough for Phase 1. Phase 3 swaps
// this for a Supabase-backed limiter shared across serverless instances.
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
    const data = enquirySchema.parse(body);

    // Honeypot tripped — silently pretend success so bots don't learn.
    if (data.company_website) {
      return NextResponse.json({ ok: true });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[enquiry] RESEND_API_KEY is not configured — enquiry not delivered:",
        data
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Email delivery isn't configured yet. Please reach us on WhatsApp instead.",
        },
        { status: 503 }
      );
    }

    await sendEnquiryNotification(data);
    // Confirmation email is best-effort — a failure here shouldn't fail
    // the whole request since the team already has the lead.
    await sendEnquiryConfirmation(data).catch((err) =>
      console.error("[enquiry] confirmation email failed:", err)
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "Please check the form and try again.", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[enquiry] unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
