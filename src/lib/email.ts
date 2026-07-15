import { Resend } from "resend";
import type { EnquiryInput } from "./validations";
import { adSpendLabels } from "./validations";
import { siteConfig } from "./site-config";

const resendApiKey = process.env.RESEND_API_KEY;

// Lazily instantiate so builds never fail locally when the env var
// isn't set yet — the route handler checks for this and reports a
// clear 503 instead of crashing.
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const NOTIFY_TO = process.env.ENQUIRY_NOTIFY_EMAIL ?? siteConfig.email;
const FROM_ADDRESS =
  process.env.ENQUIRY_FROM_EMAIL ?? "InstaBeam <enquiries@instabeam.site>";

const serviceLabels: Record<string, string> = {
  "website-shopify": "Website & Shopify",
  "meta-google-ads": "Meta & Google Ads",
  "ga4-tracking": "GA4 & Tracking",
  "whatsapp-ai-bots": "WhatsApp & AI Bots",
  "not-sure": "Not sure yet",
};

/** Internal notification sent when someone subscribes to the blog newsletter. */
export async function sendNewsletterSignupNotification(email: string) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: NOTIFY_TO,
    replyTo: email,
    subject: `New newsletter signup: ${email}`,
    text: `New newsletter subscriber: ${email}`,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Internal notification sent to the InstaBeam inbox for every new enquiry. */
export async function sendEnquiryNotification(data: EnquiryInput) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const serviceLabel = serviceLabels[data.service] ?? data.service;
  const sourceLabel =
    data.source === "hero-audit" ? "Hero — Free Funnel Audit" : "Contact page";

  const extraRows = [
    data.websiteUrl
      ? `<tr><td style="padding:6px 0; color:#6b6b76;">Website</td><td style="padding:6px 0;">${escapeHtml(data.websiteUrl)}</td></tr>`
      : "",
    data.adSpend
      ? `<tr><td style="padding:6px 0; color:#6b6b76;">Monthly budget</td><td style="padding:6px 0;">${escapeHtml(adSpendLabels[data.adSpend])}</td></tr>`
      : "",
    data.servicesInterested && data.servicesInterested.length > 0
      ? `<tr><td style="padding:6px 0; color:#6b6b76;">Interested in</td><td style="padding:6px 0;">${escapeHtml(data.servicesInterested.map((s) => serviceLabels[s] ?? s).join(", "))}</td></tr>`
      : "",
  ].join("");

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: NOTIFY_TO,
    replyTo: data.email,
    subject: `New enquiry: ${data.name} — ${serviceLabel}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#0b0b0b; max-width:560px;">
        <h2 style="margin:0 0 16px;">New enquiry from instabeam.site</h2>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:6px 0; color:#6b6b76; width:140px;">Source</td><td style="padding:6px 0;">${escapeHtml(sourceLabel)}</td></tr>
          <tr><td style="padding:6px 0; color:#6b6b76;">Name</td><td style="padding:6px 0;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding:6px 0; color:#6b6b76;">Email</td><td style="padding:6px 0;">${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding:6px 0; color:#6b6b76;">Phone</td><td style="padding:6px 0;">${escapeHtml(data.phone || "—")}</td></tr>
          <tr><td style="padding:6px 0; color:#6b6b76;">Company</td><td style="padding:6px 0;">${escapeHtml(data.company || "—")}</td></tr>
          ${extraRows}
          ${
            !data.servicesInterested || data.servicesInterested.length === 0
              ? `<tr><td style="padding:6px 0; color:#6b6b76;">Interested in</td><td style="padding:6px 0;">${escapeHtml(serviceLabel)}</td></tr>`
              : ""
          }
        </table>
        <p style="margin:16px 0 4px; color:#6b6b76; font-size:14px;">Message</p>
        <p style="margin:0; padding:12px; background:#f7f7f8; border-radius:8px; white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
    `,
  });
}

/** Confirmation email sent back to the person who submitted the form. */
export async function sendEnquiryConfirmation(data: EnquiryInput) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: data.email,
    subject: "We've got your message — InstaBeam",
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#0b0b0b; max-width:560px;">
        <h2 style="margin:0 0 12px;">Thanks, ${escapeHtml(data.name.split(" ")[0])}.</h2>
        <p style="margin:0 0 12px; line-height:1.6;">
          We've received your enquiry and someone from the InstaBeam team will get back
          to you within one business day. If it's urgent, message us directly on
          <a href="${siteConfig.whatsapp.href}" style="color:#00a8c7;">WhatsApp</a>.
        </p>
        <p style="margin:0; color:#6b6b76; font-size:13px;">— ${siteConfig.name}, ${siteConfig.tagline}</p>
      </div>
    `,
  });
}
