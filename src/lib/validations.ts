import { z } from "zod";

export const enquiryServices = [
  "website-shopify",
  "meta-google-ads",
  "ga4-tracking",
  "whatsapp-ai-bots",
  "not-sure",
] as const;

export const adSpendRanges = [
  "not-running-ads",
  "under-25k",
  "25k-1l",
  "1l-5l",
  "5l-plus",
] as const;

export const adSpendLabels: Record<(typeof adSpendRanges)[number], string> = {
  "not-running-ads": "Not running ads yet",
  "under-25k": "Under ₹25k/month",
  "25k-1l": "₹25k – ₹1L/month",
  "1l-5l": "₹1L – ₹5L/month",
  "5l-plus": "₹5L+/month",
};

// Loose "looks like a website" check — accepts with or without a
// protocol/www, doesn't require it to be a fully valid URL object since
// people paste bare domains ("yourstore.com") more often than not.
const websiteLike = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([/?#].*)?$/i;

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(120, "That name looks too long."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20, "That phone number looks too long.")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .trim()
    .max(160, "That company name looks too long.")
    .optional()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .max(200, "That URL looks too long.")
    .refine((val) => val === "" || websiteLike.test(val), {
      message: "Enter a valid website (e.g. yourbusiness.com).",
    })
    .optional()
    .or(z.literal("")),
  adSpend: z.enum(adSpendRanges).optional(),
  service: z.enum(enquiryServices, {
    message: "Select what you'd like help with.",
  }),
  // Multi-select "which services are you interested in" checkboxes on the
  // full contact form. `service` above stays as the single primary value
  // (derived from the first checked box) so existing email/admin code
  // that reads `service` keeps working unchanged.
  servicesInterested: z.array(z.enum(enquiryServices)).optional(),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(4000, "That message is too long."),
  // Which form this came from — surfaced in the notification email so the
  // team knows whether it was a quick hero audit request or a full
  // contact-page enquiry.
  source: z.enum(["hero-audit", "contact-page"]).optional(),
  // Honeypot field — real users never fill this in. Deliberately not
  // constrained to empty-only: a bot that fills it must still pass
  // validation so the route handler can fake a silent success instead of
  // returning a 400 that would tip the bot off.
  company_website: z.string().max(200).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
