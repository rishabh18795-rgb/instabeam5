import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { adSpendLabels, enquirySchema } from "@/lib/validations";
import { sendEnquiryConfirmation, sendEnquiryNotification } from "@/lib/email";
import { insertLead } from "@/lib/supabase";
import { appendLeadToSheet } from "@/lib/google-sheets";
import { getRequestMeta } from "@/lib/request-meta";

export const runtime = "nodejs";

// Minimal in-memory rate limit — good enough for a single warm serverless
// instance. Phase 3 swaps this for a Supabase-backed limiter shared
// across instances.
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
    const data = enquirySchema.parse(body);

    // Honeypot tripped — silently pretend success so bots don't learn.
    if (data.company_website) {
      return NextResponse.json({ ok: true });
    }

    // The lead is captured in the CRM, appended to Google Sheets, and
    // emailed independently — a failure in one channel never blocks the
    // others, and never surfaces a "not configured" error to the visitor.
    await insertLead({
      name: data.name,
      company: data.company || null,
      website: data.websiteUrl || null,
      email: data.email,
      phone: data.phone || null,
      budget: data.adSpend ? adSpendLabels[data.adSpend] : null,
      message: data.message,
      page: meta.sourcePage,
      source: data.source ?? "contact-page",
      ip: meta.ip,
      user_agent: meta.userAgent,
    }).catch((err) => console.error("[enquiry] CRM insert failed:", err));

    await appendLeadToSheet(data, meta).catch((err) =>
      console.error("[enquiry] Google Sheets append failed:", err)
    );

    await sendEnquiryNotification(data, meta).catch((err) =>
      console.error("[enquiry] notification email failed:", err)
    );
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
