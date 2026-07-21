import type { EnquiryInput } from "./validations";
import { adSpendLabels } from "./validations";
import type { RequestMeta } from "./request-meta";

const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 400;
const REQUEST_TIMEOUT_MS = 8000;

const serviceLabels: Record<string, string> = {
  "website-shopify": "Website & Shopify",
  "meta-google-ads": "Meta & Google Ads",
  "ga4-tracking": "GA4 & Tracking",
  "whatsapp-ai-bots": "WhatsApp & AI Bots",
  "not-sure": "Not sure yet",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postOnce(payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(WEBHOOK_URL as string, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Google Sheets webhook responded with HTTP ${res.status}`);
    }

    const json = await res.json().catch(() => null);
    if (!json || !json.ok) {
      throw new Error(json?.error ?? "Google Sheets webhook returned an unrecognized response.");
    }

    return json;
  } finally {
    clearTimeout(timeout);
  }
}

/** Appends one row to the InstaBeam enquiries Google Sheet via an Apps
 * Script Web App webhook — the URL and shared secret are server-only env
 * vars, never sent to the client. Retries transient failures up to
 * MAX_ATTEMPTS times using a stable requestId so the Apps Script side can
 * de-duplicate and never create two rows for one submission. Best-effort
 * overall: callers should not let a failure here block email delivery,
 * CRM insert, or the user-facing success response. */
export async function appendLeadToSheet(data: EnquiryInput, meta: RequestMeta) {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    throw new Error("Google Sheets webhook is not configured.");
  }

  const serviceInterested =
    data.servicesInterested && data.servicesInterested.length > 0
      ? data.servicesInterested.map((s) => serviceLabels[s] ?? s).join(", ")
      : (serviceLabels[data.service] ?? data.service);

  const requestId = crypto.randomUUID();
  const payload = {
    token: WEBHOOK_SECRET,
    requestId,
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
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await postOnce(payload);
    } catch (err) {
      lastError = err;
      console.error(
        `[google-sheets] attempt ${attempt}/${MAX_ATTEMPTS} failed (requestId=${requestId}):`,
        err
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
