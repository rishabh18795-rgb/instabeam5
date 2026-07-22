import type { BlogPost } from "../types";

export const whyTrackingMatters: BlogPost = {
  slug: "why-tracking-matters-before-spending-on-ads",
  title: "Why Tracking Matters Before Spending on Ads",
  excerpt:
    "Spending on ads before your tracking is verified means optimizing toward numbers you can't actually trust. Here's what has to be in place first, and how to check it's really working.",
  category: "tracking",
  publishedAt: "2026-07-21",
  content: [
    {
      type: "p",
      text: "We've inherited more ad accounts wrecked by bad tracking than by bad targeting. An algorithm optimizing toward a broken or incomplete conversion signal will happily spend your budget efficiently toward the wrong outcome — it doesn't know the data is wrong, it just optimizes what it's told to. Fixing tracking after the fact means months of misallocated spend you can't get back.",
    },
    { type: "h2", id: "ga4-foundation", text: "GA4 is the foundation, not an afterthought" },
    {
      type: "p",
      text: "GA4's event-based model tracks nothing meaningful by default beyond page views. Before spending seriously on ads, you need purchase (or generate_lead), add_to_cart, begin_checkout, and view_item firing correctly and verified in DebugView — not just \"installed,\" but confirmed with a real test transaction end to end, including the value and currency parameters on the purchase event.",
    },
    {
      type: "callout",
      tone: "warning",
      text: "A common silent failure: the purchase event fires, but without a value or currency parameter. GA4 shows the conversion happened but reports ₹0 revenue — invisible unless you check the actual event parameters, not just whether the event count is non-zero.",
    },
    { type: "h2", id: "meta-pixel", text: "Meta Pixel: necessary, but no longer sufficient on its own" },
    {
      type: "p",
      text: "The browser-based Meta Pixel fires from the visitor's own browser, which means it's directly affected by ad blockers, Safari's Intelligent Tracking Prevention, and iOS privacy settings — all of which have gotten more aggressive since iOS 14.5. Depending on your traffic mix, the Pixel alone can miss 15-30% of actual conversions. That's not a rounding error; it's enough to make Meta's algorithm think a profitable campaign is underperforming.",
    },
    { type: "h2", id: "conversions-api", text: "Conversions API and server-side tracking close the gap" },
    {
      type: "p",
      text: "The Conversions API (CAPI) sends the same events server-to-server, directly from your store's backend to Meta — bypassing the browser and its blockers entirely. It isn't a replacement for the Pixel; it's a second, more reliable path for the same data, and Meta explicitly recommends running both together with matching event IDs so the two don't double-count the same conversion.",
    },
    {
      type: "ul",
      items: [
        "Deduplication is critical — both Pixel and CAPI need to send the same event_id for the same conversion, or Meta counts it twice and your reported CPA looks artificially low.",
        "Server-side tracking is more resilient to browser privacy changes going forward, not just current ones — this is the direction the whole industry is moving.",
        "On Shopify, most CAPI setups can go through a certified partner integration rather than custom server code — verify the deduplication is actually working in Events Manager afterward.",
      ],
    },
    { type: "h2", id: "utm-parameters", text: "UTM parameters: the unglamorous habit that saves attribution" },
    {
      type: "p",
      text: "Every link you share outside of paid platforms — WhatsApp broadcasts, Instagram bio links, email campaigns, influencer posts — needs consistent utm_source, utm_medium, and utm_campaign parameters, or GA4 lumps that traffic into \"Direct\" or \"Unassigned\" and you lose the ability to see which channels actually work.",
    },
    {
      type: "ol",
      items: [
        "utm_source: where the click came from (whatsapp, instagram, newsletter, influencer-name).",
        "utm_medium: the type of channel (social, email, referral, cpc).",
        "utm_campaign: the specific campaign or promotion name, kept consistent so you can compare over time.",
        "Build a shared naming convention doc before your team starts tagging links independently — inconsistent tagging is almost as bad as no tagging.",
      ],
    },
    { type: "h2", id: "event-tracking-and-attribution", text: "Event tracking and the attribution model you're actually using" },
    {
      type: "p",
      text: "GA4's default attribution model (data-driven, when there's enough volume; otherwise a version of last-click) can differ meaningfully from what Meta or Google Ads report for the same conversions — each platform tends to give itself outsized credit in its own reporting. That's expected, not a bug, but it means you shouldn't sum the conversions reported by every platform and compare that total to your actual orders; you'll double or triple count.",
    },
    {
      type: "callout",
      tone: "info",
      text: "Use GA4 (or your store's actual order count) as the source of truth for total conversions, and use each ad platform's own reporting only to compare relative performance between campaigns within that platform — not as an absolute number to add across platforms.",
    },
    {
      type: "links",
      heading: "Related reading",
      items: [
        { text: "GA4 setup guide for Shopify", href: "/blog/ga4-setup-guide-for-shopify" },
        { text: "Facebook Pixel vs. Conversions API — why you need both", href: "/blog/facebook-pixel-vs-conversions-api" },
        { text: "Meta Conversions API documentation", href: "https://developers.facebook.com/docs/marketing-api/conversions-api", external: true },
      ],
    },
    { type: "h2", id: "verification-checklist", text: "Verify before you spend, not after" },
    {
      type: "p",
      text: "The checklist we run on every new account before touching the ad budget: GA4 core events verified in DebugView with a real test transaction, Meta Pixel and CAPI both firing with matching event IDs (confirmed in Events Manager's deduplication view), UTM tagging in place for every non-paid channel, and purchase events carrying correct value/currency. It takes a day, and it's the difference between an ad account optimizing toward reality and one optimizing toward noise.",
    },
  ],
  faqs: [
    {
      question: "Do I really need both Meta Pixel and Conversions API?",
      answer:
        "Yes — they're complementary, not redundant. The browser Pixel alone can miss 15-30% of conversions due to ad blockers and iOS privacy settings. Conversions API sends the same data server-side, bypassing those blockers. Run both together with matching event IDs so they deduplicate correctly.",
    },
    {
      question: "What GA4 events should I set up before running ads?",
      answer:
        "At minimum: purchase (or generate_lead for service businesses), add_to_cart, begin_checkout, and view_item. Verify each one in GA4's DebugView with a real test transaction — confirming an event 'exists' isn't the same as confirming it fires with correct parameters.",
    },
    {
      question: "Why do my ad platforms report more conversions than I actually got?",
      answer:
        "Each platform's attribution model tends to give itself credit, so summing conversions reported across Meta, Google, and GA4 will overcount. Use one source of truth (usually GA4 or actual order count) for the real total, and use each platform's own numbers only to compare relative performance between campaigns.",
    },
    {
      question: "What are UTM parameters and why do they matter?",
      answer:
        "UTM parameters are tags added to a URL (utm_source, utm_medium, utm_campaign) that tell GA4 exactly where traffic came from. Without them, traffic from WhatsApp, Instagram bio links, and email campaigns gets lumped into 'Direct' or 'Unassigned,' making it impossible to see which channels are actually working.",
    },
  ],
};
