/**
 * Central content source for the marketing site.
 *
 * Phase 1 hard-codes this file so the site ships with zero placeholder
 * content. From Phase 3 onward, the Admin Portal reads/writes the same
 * shape from the database (see prisma/schema.prisma once added) and
 * this file becomes the seed/fallback data.
 */

export const siteConfig = {
  name: "InstaBeam",
  legalName: "Instabeam",
  tagline: "One Signal. Full Funnel.",
  description:
    "InstaBeam builds the site or store that converts, runs the ads that bring the right traffic, tracks every click in GA4, and sets up WhatsApp + AI bots that turn that traffic into paying customers — one connected team, not four disconnected vendors.",
  url: "https://instabeam.site",
  founder: "Rishabh Shukla",
  email: "hello@instabeam.co",
  whatsapp: {
    number: "+919695113255",
    href: "https://wa.me/919695113255",
    hrefWithMessage: (message: string) =>
      `https://wa.me/919695113255?text=${encodeURIComponent(message)}`,
  },
  /**
   * LinkedIn/Instagram URLs aren't confirmed yet — left empty rather than
   * guessed, so the footer can render the icons without ever pointing to
   * the wrong (or a placeholder "#") destination. Fill these in and the
   * icons appear automatically; see Footer.tsx.
   */
  social: {
    linkedin: "",
    instagram: "",
  },
  /**
   * Only surface these badges once actually registered/verified — set to
   * true when confirmed. Not claiming government recognition without
   * confirmation.
   */
  badges: {
    startupIndia: false,
    msme: false,
  },
  keywords: [
    "AI digital agency",
    "Shopify development India",
    "Meta ads agency",
    "Google ads agency",
    "GA4 tracking setup",
    "WhatsApp AI chatbot",
    "funnel audit",
    "website development agency",
  ],
} as const;

export const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
] as const;

export type Service = {
  slug: string;
  label: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: "globe" | "target" | "bar-chart" | "message-circle";
  features: string[];
  faqs: { question: string; answer: string }[];
};

export const services: Service[] = [
  {
    slug: "website-shopify",
    label: "Website & Shopify",
    name: "Sites & stores that convert",
    shortDescription:
      "Custom websites and Shopify stores built to convert, not just to look good — fast, mobile-first, and wired for tracking from day one.",
    description:
      "We design and build custom websites and Shopify stores engineered around conversion, not decoration. Every build ships fast, mobile-first, and pre-wired for GA4 and ad-platform tracking so the moment traffic arrives, you can measure exactly what it does.",
    icon: "globe",
    features: [
      "Custom Next.js websites or Shopify theme builds, designed around your actual funnel — not a generic template.",
      "Mobile-first layouts, since most paid traffic in India arrives on a phone.",
      "GA4 and ad-platform tracking (Meta Pixel, Conversions API, Google Ads tag) wired in before launch, not bolted on after.",
      "Page speed optimization — compressed images, minimal blocking scripts, clean Core Web Vitals.",
      "Checkout and cart-flow review on Shopify builds to remove friction before it costs you sales.",
    ],
    faqs: [
      {
        question: "Do you build on Shopify or fully custom code?",
        answer:
          "Both — we recommend Shopify for most product-based stores because of its checkout and payments ecosystem, and custom Next.js builds for service businesses, lead-gen sites, or stores with specific needs Shopify can't flex to.",
      },
      {
        question: "Will my site be ready for ads from day one?",
        answer:
          "Yes — GA4 and ad-platform tracking are part of every build, not an add-on. We test the full funnel (view → add to cart → purchase) before handing it over.",
      },
    ],
  },
  {
    slug: "meta-google-ads",
    label: "Meta & Google Ads",
    name: "Campaigns that find buyers",
    shortDescription:
      "Campaigns built on real audience research, tested creative, and budgets that go where the data says, not where the guesswork says.",
    description:
      "We plan, launch, and manage Meta and Google Ads campaigns grounded in audience research and structured creative testing. Budgets move toward what the data proves works — spend always stays in your own ad accounts, we just run the strategy.",
    icon: "target",
    features: [
      "Account structure and campaign setup on Meta Ads Manager and Google Ads, built for clean data from the start.",
      "Creative testing across multiple angles and formats before scaling any single ad.",
      "Weekly optimization based on GA4 and platform data — not a 'set and forget' approach.",
      "Conversions API setup alongside the browser pixel, so you're not flying blind on iOS traffic.",
      "Ad spend always stays in your own Meta/Google accounts — full ownership and visibility, always.",
    ],
    faqs: [
      {
        question: "Do you require a minimum ad budget?",
        answer:
          "We'll tell you honestly on the discovery call whether your budget is enough to get meaningful signal — there's no fixed minimum, but very small budgets limit how fast we can test and learn.",
      },
      {
        question: "Who owns the ad account and the data?",
        answer:
          "You do. We work inside your own Meta and Google Ads accounts as a partner/admin — nothing about your account, data, or spend is locked to us.",
      },
    ],
  },
  {
    slug: "ga4-tracking",
    label: "GA4 & Tracking",
    name: "Know what's working",
    shortDescription:
      "Proper event tracking and dashboards so you always know what's actually working — before you spend another rupee on ads.",
    description:
      "We implement GA4 event tracking, conversion tagging, and reporting dashboards so every click, add-to-cart, and purchase is attributed correctly. No more guessing which channel is actually driving revenue.",
    icon: "bar-chart",
    features: [
      "Full GA4 event setup — purchase, add_to_cart, begin_checkout, view_item, lead capture — verified in DebugView, not just installed.",
      "Meta Conversions API and Google Ads conversion tracking, deduplicated against the browser pixel.",
      "UTM tagging conventions for every channel (WhatsApp, Instagram, email) so nothing lands in 'Unassigned.'",
      "Custom funnel exploration reports so you can see exactly where visitors drop off.",
      "A short onboarding walkthrough so your team knows how to read the reports, not just receive them.",
    ],
    faqs: [
      {
        question: "I already have GA4 installed — do I need this?",
        answer:
          "Installed and verified are different things. We regularly find GA4 setups tracking page views but silently missing purchase values or double-counting conversions — worth a free audit before you trust the numbers.",
      },
      {
        question: "Can you fix tracking without touching my ad accounts?",
        answer:
          "Yes — tracking setup (GA4, GTM, Conversions API) is independent of whether we also manage your ad campaigns.",
      },
    ],
  },
  {
    slug: "whatsapp-ai-bots",
    label: "WhatsApp & AI Bots",
    name: "Never lose a warm lead",
    shortDescription:
      "Instant replies, lead qualification, and order updates on WhatsApp — so interested visitors don't go cold waiting for a human.",
    description:
      "We build WhatsApp API bot flows that reply instantly, qualify leads, share order updates, and hand off to your team the moment a conversation needs a human touch — so no warm lead ever goes cold waiting for a reply.",
    icon: "message-circle",
    features: [
      "WhatsApp Business API setup and bot flow design — FAQs, lead qualification, order status updates.",
      "Instant automated replies outside business hours, with clear hand-off to a human for anything the bot can't resolve.",
      "Abandoned-cart and post-purchase follow-up flows where the platform supports it.",
      "Flows designed to feel useful, not spammy — we deliberately avoid over-automating the parts of WhatsApp that work because they feel personal.",
      "Simple dashboard/handoff process so your team can take over a conversation at any point.",
    ],
    faqs: [
      {
        question: "Will the bot feel robotic to my customers?",
        answer:
          "That's the main thing we design against — bots handle repetitive questions (order status, FAQs, basic qualification) instantly, and hand off anything nuanced to a human immediately rather than trying to fake a conversation.",
      },
      {
        question: "Do I need the official WhatsApp Business API?",
        answer:
          "For automated flows at any real volume, yes — we help you get set up with an approved provider rather than using unofficial tools that risk your number getting banned.",
      },
    ],
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Discovery call",
    description:
      "We audit what you have today — site, ads, tracking, WhatsApp — and map where you're losing customers in the funnel.",
  },
  {
    number: "02",
    title: "Build & connect",
    description:
      "We build or fix your site/store, install GA4 and conversion tracking, and set up your WhatsApp bot flow — tested end to end before launch.",
  },
  {
    number: "03",
    title: "Launch & optimize",
    description:
      "Ads go live with a small test budget first. We optimize weekly based on what the data actually shows, not assumptions.",
  },
  {
    number: "04",
    title: "Report & grow",
    description:
      "Monthly strategy calls with real numbers — traffic, spend, leads, conversations — so we scale what's working and cut what isn't.",
  },
] as const;

export const stats = [
  { value: "2,350+", label: "Leads generated" },
  { value: "15.69x", label: "ROAS achieved" },
  { value: "7.32%", label: "Conversion rate" },
  { value: "₹3.85L", label: "Revenue tracked" },
] as const;

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number; // 1-5
};

/**
 * Deliberately empty — no fabricated reviews, names, or star ratings.
 * TestimonialsSection renders an honest "just getting started" state
 * while this is empty. Add real testimonials here (or via the Admin
 * Portal from Phase 3 onward) and the carousel activates automatically.
 */
export const testimonials: Testimonial[] = [];

export type CaseStudy = {
  slug: string;
  client: string;
  summary: string;
  services: string[];
  result: string;
};

/**
 * Deliberately empty — same honesty policy as testimonials. No invented
 * client results, before/after numbers, or logos. The /case-studies page
 * renders an honest "in progress" state while this is empty. Add real,
 * client-approved write-ups here (or via the Admin Portal from Phase 3
 * onward) and the page switches to showing them automatically.
 */
export const caseStudies: CaseStudy[] = [];

export const faqs = [
  {
    question: "Do you only work with Shopify, or custom sites too?",
    answer:
      "Both. We build fully custom websites and Shopify stores depending on what fits your business and budget.",
  },
  {
    question: "Do I need to already be running ads?",
    answer:
      "No. We can start from zero — set up your ad accounts, tracking, and first campaigns from scratch.",
  },
  {
    question: "Is the WhatsApp bot fully automated, or does a human step in?",
    answer:
      "Both. The bot handles FAQs, order status, and lead qualification instantly, then hands off to your team for anything that needs a human touch.",
  },
  {
    question: "How is this different from hiring separate freelancers?",
    answer:
      "One team means your site, ads, tracking, and WhatsApp bot are all connected from day one — no waiting on three different people to sync up.",
  },
  {
    question: "Do you manage the ad spend, or does it stay in my account?",
    answer:
      "Ad spend always stays in your own Meta/Google ad accounts — you retain full ownership and visibility. Our fee is separate from spend.",
  },
] as const;

export const ebook = {
  title: "The Complete Facebook & Instagram Ads Guide",
  edition: "2026 Edition",
  author: "Rishabh Shukla — Founder, MechServi",
  priceCurrent: "₹199",
  priceOriginal: "₹999",
  href: "https://rishabh18795-rgb.github.io/meta-ads-ebook/",
  description:
    "Written for Indian entrepreneurs & Shopify sellers — a step-by-step guide from zero budget to consistent daily sales. Set up your ad account, find your audience, write creatives that convert, and scale from ₹1,000 to ₹50,000 a day, with real campaign numbers behind every chapter.",
} as const;
