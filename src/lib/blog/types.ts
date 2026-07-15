export type BlogCategory =
  | "meta-ads"
  | "whatsapp"
  | "shopify"
  | "tracking"
  | "landing-pages"
  | "analytics";

export const categoryLabels: Record<BlogCategory, string> = {
  "meta-ads": "Meta Ads",
  whatsapp: "WhatsApp Automation",
  shopify: "Shopify",
  tracking: "Tracking & Attribution",
  "landing-pages": "Landing Pages",
  analytics: "Analytics",
};

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; tone: "tip" | "warning" | "info"; text: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  content: ContentBlock[];
};

export const author = {
  name: "Rishabh Shukla",
  role: "Founder, InstaBeam",
  bio: "Rishabh runs growth for InstaBeam clients day to day — building the sites, running the ad accounts, and wiring up the tracking himself before any of it gets handed to a team.",
} as const;
