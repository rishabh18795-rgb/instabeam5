export type BlogCategory =
  | "meta-ads"
  | "paid-ads"
  | "whatsapp"
  | "shopify"
  | "tracking"
  | "landing-pages"
  | "analytics";

export const categoryLabels: Record<BlogCategory, string> = {
  "meta-ads": "Meta Ads",
  "paid-ads": "Paid Ads Strategy",
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
  | { type: "callout"; tone: "tip" | "warning" | "info"; text: string }
  | {
      type: "links";
      heading?: string;
      items: { text: string; href: string; external?: boolean }[];
    };

export type BlogFaq = { question: string; answer: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  content: ContentBlock[];
  faqs?: BlogFaq[];
};

export const author = {
  name: "Rishabh Shukla",
  role: "Founder, InstaBeam",
  bio: "Rishabh runs growth for InstaBeam clients day to day — building the sites, running the ad accounts, and wiring up the tracking himself before any of it gets handed to a team.",
} as const;
