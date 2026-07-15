import type { BlogPost } from "../types";

export const shopifyChecklist: BlogPost = {
  slug: "shopify-store-launch-checklist",
  title: "The Shopify Launch Checklist We Run Before Any Store Goes Live",
  excerpt:
    "Everything that needs to be in place before you turn on ads — tracking, payments, speed, and the small details that quietly cost stores their first sales.",
  category: "shopify",
  publishedAt: "2026-06-18",
  content: [
    {
      type: "p",
      text: "Launching a Shopify store and launching a Shopify store that's actually ready for paid traffic are two different things. This is the checklist we run through on every build before a single rupee goes to ads — most of it takes an afternoon, and skipping it is the single most common reason a store's first campaign underperforms.",
    },
    { type: "h2", id: "tracking", text: "1. Tracking, before anything else" },
    {
      type: "ul",
      items: [
        "GA4 installed with Enhanced Ecommerce events firing correctly — view_item, add_to_cart, begin_checkout, purchase, verified in DebugView, not assumed.",
        "Meta Pixel and Conversions API both installed and deduplicated (matching event IDs) — pixel-only tracking loses 15–30% of conversions to iOS privacy changes and ad blockers.",
        "Google Ads conversion tracking linked, if you're planning to run Search or Shopping ads.",
        "A test purchase run end-to-end with a real card (refunded after) to confirm every event fires and every pixel matches — don't trust the 'installed' checkmark alone.",
      ],
    },
    { type: "h2", id: "payments-shipping", text: "2. Payments and shipping, fully configured" },
    {
      type: "ul",
      items: [
        "All intended payment methods live and tested — UPI, cards, and COD if you're offering it (COD still drives a large share of first-time orders for many Indian categories).",
        "Shipping rates configured correctly by zone/weight, not a flat guess — miscalculated shipping is a top cause of checkout abandonment.",
        "Tax settings correct for your state/GST registration.",
        "Return and refund policy pages published and linked in the footer — required by payment gateways and by customer trust.",
      ],
    },
    { type: "h2", id: "speed", text: "3. Page speed" },
    {
      type: "p",
      text: "Every additional second of load time measurably drops conversion rate — this compounds with paid traffic since you're paying for every visitor who bounces before the page even renders.",
    },
    {
      type: "ul",
      items: [
        "Compress and resize product images before upload — don't rely on the theme to do it (use WebP where the theme supports it).",
        "Remove unused apps — every installed app adds script weight even when it's not actively used on a page.",
        "Limit homepage sections above the fold to what's actually needed — heavy carousels and video backgrounds are common speed killers.",
        "Check mobile page speed specifically, not just desktop — most Indian e-commerce traffic is mobile-first.",
      ],
    },
    { type: "h2", id: "product-pages", text: "4. Product pages that actually convert" },
    {
      type: "ul",
      items: [
        "At least 4–6 product photos per item, including one lifestyle/in-use shot — pure white-background shots alone underperform.",
        "Clear, benefit-led product descriptions, not just a spec dump.",
        "Size/fit guide for apparel, materials/dimensions for everything else — the #1 driver of returns is a mismatch between expectation and reality.",
        "Social proof visible above the fold once you have any — reviews, ratings, or trust badges.",
        "A visible, sticky 'Add to Cart' on mobile so it's never more than a thumb-reach away.",
      ],
    },
    { type: "h2", id: "checkout", text: "5. Checkout friction" },
    {
      type: "ul",
      items: [
        "Guest checkout enabled — forcing account creation before purchase is one of the highest-impact conversion killers.",
        "Shipping cost shown as early as possible, ideally before checkout — surprise shipping costs at the last step is the #1 reason for cart abandonment industry-wide.",
        "Trust badges (secure checkout, return policy) visible near the payment step.",
        "Abandoned checkout email/WhatsApp flow turned on — even a single well-timed reminder recovers a meaningful share of otherwise-lost orders.",
      ],
    },
    { type: "h2", id: "legal-trust", text: "6. Legal and trust pages" },
    {
      type: "ul",
      items: [
        "Privacy Policy, Terms of Service, Shipping Policy, and Return/Refund Policy — all published, not just Shopify's default placeholders left unedited.",
        "A real, findable Contact page with an actual email/phone, not just a form.",
        "About page — even a short one — since first-time visitors from cold ads will often check before buying.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      text: "Run this checklist again after any theme update or major app install — both can silently break tracking scripts or checkout customizations without any visible error.",
    },
    { type: "h2", id: "pre-launch-test", text: "7. The pre-launch test that catches everything else" },
    {
      type: "p",
      text: "Before turning on ads, have someone who's never seen the store try to buy something on their phone, on mobile data, without any guidance. Watch where they hesitate. It's almost always more revealing than any checklist — including this one.",
    },
  ],
};
