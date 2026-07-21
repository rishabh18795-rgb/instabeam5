import type { EnquiryInput } from "./validations";
import { adSpendLabels } from "./validations";
import type { RequestMeta } from "./request-meta";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

const serviceLabels: Record<string, string> = {
  "website-shopify": "Website & Shopify",
  "meta-google-ads": "Meta & Google Ads",
  "ga4-tracking": "GA4 & Tracking",
  "whatsapp-ai-bots": "WhatsApp & AI Bots",
  "not-sure": "Not sure yet",
};

/** Appends one row to the InstaBeam enquiries Google Sheet via an Apps
 * Script Web App webhook — the URL and shared secret are server-only env
 * vars, never sent to the client. Best-effort: callers should not let a
 * failure here block email delivery, CRM insert, or the user-facing
 * success response. */
export async function appendLeadToSheet(data: EnquiryInput, meta: RequestMeta) {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    throw new Error("Google Sheets webhook is not configured.");
  }

  const serviceInterested =
    data.servicesInterested && data.servicesInterested.length > 0
      ? data.servicesInterested.map((s) => serviceLabels[s] ?? s).join(", ")
      : (serviceLabels[data.service] ?? data.service);

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: WEBHOOK_SECRET,
      timestamp: meta.timestamp,
      name: data.name,
      company: data.company || "",
      email: data.email,
      phone: data.phone || "",
      serviceInterested,
      budget: data.adSpend ? adSpendLabels[data.adSpend] : "",
      message: data.message,
      websiteUrl: data.websiteUrl || "",
      sourcePage: meta.sourcePage,
      ip: meta.ip,
      userAgent: meta.userAgent,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Sheets webhook responded with ${res.status}`);
  }

  const json = await res.json().catch(() => ({ ok: false }));
  if (!json.ok) {
    throw new Error(json.error ?? "Google Sheets webhook returned an error.");
  }
}
