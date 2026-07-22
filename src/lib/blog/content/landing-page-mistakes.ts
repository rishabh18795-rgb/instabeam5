import type { BlogPost } from "../types";

export const landingPageMistakes: BlogPost = {
  slug: "landing-page-mistakes-that-kill-conversion-rate",
  title: "10 Landing Page Mistakes That Kill Your Conversion Rate",
  excerpt:
    "You can fix ad targeting all day and still lose the sale on the page itself. These are the ten mistakes we find most often when auditing a client's landing page before we touch their ad account.",
  category: "landing-pages",
  publishedAt: "2026-07-19",
  content: [
    {
      type: "p",
      text: "Every free audit we run starts with the landing page, not the ad account — because no amount of targeting precision fixes a page that loses people before they can convert. These ten mistakes account for the vast majority of the conversion leaks we find, roughly in the order we check them.",
    },
    { type: "h2", id: "slow-pages", text: "1. Page speed nobody bothered to measure" },
    {
      type: "p",
      text: "Every additional second of load time past 2-3 seconds measurably increases bounce rate — and paid traffic bounces faster than organic, because there's no existing trust built up yet. The usual culprits: unoptimized hero images, render-blocking scripts (chat widgets, tracking pixels loaded synchronously), and web fonts loaded from external sources without proper preloading.",
    },
    {
      type: "callout",
      tone: "tip",
      text: "Run your landing page through PageSpeed Insights before your next ad campaign, not after. A page scoring under 50 on mobile is actively costing you conversions on every rupee of ad spend that lands there.",
    },
    { type: "h2", id: "mobile-optimization", text: "2. Built for desktop, tested on desktop, sold on mobile" },
    {
      type: "p",
      text: "In most of the accounts we audit, 65-80% of paid traffic is mobile — yet the landing page was clearly designed on a desktop monitor and only glanced at on a phone afterward. Tap targets too small, forms that require pinch-zooming, hero text that wraps awkwardly, checkout buttons pushed below the fold. If you only test on desktop, you're optimizing for the minority of your actual traffic.",
    },
    { type: "h2", id: "forms", text: "3. Forms asking for more than the moment warrants" },
    {
      type: "p",
      text: "Every additional form field is a fresh opportunity to abandon. A cold visitor from a Meta ad has far less trust built up than someone who found you through months of content — asking for phone number, company size, and budget range all on a first touch is asking for information the relationship hasn't earned yet.",
    },
    {
      type: "ul",
      items: [
        "First touch (cold ad traffic): name, email, maybe one qualifying question — nothing else.",
        "Progressive profiling: capture the rest on a second interaction (a follow-up email, a WhatsApp conversation) once trust is higher.",
        "Autofill and input types matter — use type=\"email\", type=\"tel\" so mobile keyboards adapt automatically.",
        "Show inline validation errors, not a full-page error after submit that clears the whole form.",
      ],
    },
    { type: "h2", id: "cta-placement", text: "4. One CTA, buried, competing with navigation" },
    {
      type: "p",
      text: "A dedicated landing page for paid traffic doesn't need a full site navigation menu — every nav link is an exit ramp away from the one action you actually want. The primary CTA should appear above the fold, repeat at natural points as the visitor scrolls (after key proof sections), and stay visually distinct — one consistent color and label used only for the primary action, never reused for secondary links.",
    },
    { type: "h3", id: "cta-copy", text: "CTA copy that undersells the action" },
    {
      type: "p",
      text: "\"Submit\" and \"Learn More\" ask nothing and promise nothing. \"Get My Free Funnel Audit\" or \"Book My Free Call\" state exactly what happens next and what the visitor gets — small wording change, consistently measurable lift.",
    },
    { type: "h2", id: "trust-and-social-proof", text: "5-6. Missing trust badges and social proof" },
    {
      type: "p",
      text: "A cold visitor from an ad has zero built-up trust in your brand — the landing page has to build it fast. Real client names and logos (never invented — we only ever show verified, client-approved work), specific numbers instead of vague claims (\"1,200+ orders shipped\" beats \"trusted by many\"), and payment/security badges near the CTA all reduce the perceived risk of taking action.",
    },
    {
      type: "quote",
      text: "Specificity is what makes proof credible. \"Increased conversion rate\" convinces nobody. \"Conversion rate went from 1.8% to 3.1% over 6 weeks\" does — because a fabricated number wouldn't be that oddly specific.",
    },
    { type: "h2", id: "copywriting", text: "7. Copy that talks about the product instead of the outcome" },
    {
      type: "p",
      text: "Feature-led copy (\"Built with X technology\") requires the visitor to do the work of translating that into a benefit themselves — most won't bother. Benefit-led copy does that translation for them. Lead with the outcome, use the feature as supporting proof underneath, not the other way around.",
    },
    { type: "h2", id: "images", text: "8. Generic stock photography that actively erodes trust" },
    {
      type: "p",
      text: "Visitors have seen the same stock handshake-and-laptop photos a thousand times, and recognize them instantly as filler, not proof. Real product photos, real team photos, real screenshots of the actual dashboard or result — even imperfect — consistently outperform polished stock imagery, because they read as authentic.",
    },
    { type: "h2", id: "no-single-clear-goal", text: "9. The page tries to do three jobs at once" },
    {
      type: "p",
      text: "A landing page that's simultaneously trying to sell, collect newsletter signups, and showcase a full product catalog dilutes all three. A dedicated landing page for a specific campaign should have exactly one conversion goal — every other link and distraction should be minimized or removed, not just deprioritized.",
    },
    { type: "h2", id: "no-tracking-to-diagnose", text: "10. No tracking to actually diagnose any of this" },
    {
      type: "p",
      text: "The final, most common mistake: none of the above gets fixed because there's no scroll-depth or click tracking installed to reveal where people actually drop off. Without that data, every fix is a guess. Set up GA4 events and (ideally) a heatmap/session-recording tool before making major page changes — fix based on evidence, not intuition.",
    },
    {
      type: "links",
      heading: "Related reading",
      items: [
        { text: "Landing page guide for paid traffic", href: "/blog/landing-page-guide-for-paid-traffic" },
        { text: "Why tracking matters before spending on ads", href: "/blog/why-tracking-matters-before-spending-on-ads" },
        { text: "Google PageSpeed Insights", href: "https://pagespeed.web.dev/", external: true },
      ],
    },
    {
      type: "p",
      text: "None of these fixes require a full redesign — most are targeted changes you can ship in a week. The order matters, though: speed and mobile experience first (they affect everyone), then form friction and CTA clarity, then trust and copy. Fix the leaks in that order and the same ad spend converts noticeably better without touching targeting at all.",
    },
  ],
  faqs: [
    {
      question: "What's the single highest-impact landing page fix?",
      answer:
        "Page speed and mobile experience, because they affect 100% of your traffic before any other factor even gets a chance to matter. A slow or broken mobile experience caps your conversion rate no matter how good the copy or offer is.",
    },
    {
      question: "How many form fields should a landing page have?",
      answer:
        "For cold paid traffic, as few as possible — typically name and email, plus one qualifying question at most. Every additional field measurably increases abandonment; collect the rest later once trust is established.",
    },
    {
      question: "Should a landing page have full site navigation?",
      answer:
        "No — dedicated landing pages for paid campaigns should minimize or remove navigation menus. Every nav link is a way for a visitor to leave before completing the one action the page exists for.",
    },
    {
      question: "Does stock photography hurt conversion rates?",
      answer:
        "Generally yes. Visitors recognize generic stock imagery instantly and it reads as inauthentic. Real product shots, real team photos, and real screenshots consistently outperform polished stock photos in our testing.",
    },
  ],
};
