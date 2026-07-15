import type { BlogPost } from "../types";

export const pixelVsCapi: BlogPost = {
  slug: "facebook-pixel-vs-conversions-api",
  title: "Facebook Pixel vs. Conversions API: Why You Need Both",
  excerpt:
    "The browser pixel alone misses a growing share of your conversions. Here's what the Conversions API actually fixes, how deduplication works, and how to check yours is set up right.",
  category: "tracking",
  publishedAt: "2026-06-25",
  content: [
    {
      type: "p",
      text: "If your Meta Ads reporting looks worse than it used to — ROAS creeping down even though sales feel steady — the pixel is very likely part of the problem, not your targeting. This is what's actually happening, and why the fix isn't optional anymore.",
    },
    { type: "h2", id: "why-pixel-alone-fails", text: "Why the browser pixel alone undercounts" },
    {
      type: "p",
      text: "The Meta Pixel is JavaScript that runs in the customer's browser and fires events (view content, add to cart, purchase) back to Meta. It depends on the browser actually letting that request through — and increasingly, it doesn't:",
    },
    {
      type: "ul",
      items: [
        "Safari's Intelligent Tracking Prevention and iOS 14.5+ App Tracking Transparency block or limit pixel data for a large share of iPhone users.",
        "Ad blockers (uBlock Origin, Brave's built-in blocker, many mobile browsers) block the pixel script from loading at all.",
        "Slow connections or users who close the tab before the page fully loads never let the pixel fire, even though the purchase happened.",
      ],
    },
    {
      type: "p",
      text: "The result: a meaningful share of real conversions — commonly cited industry-wide in the 15–30% range depending on your traffic mix — never reach Meta through the pixel alone. Meta's algorithm can't optimize toward buyers it never sees, so your campaigns quietly get worse at finding people who convert.",
    },
    { type: "h2", id: "what-capi-does", text: "What the Conversions API actually does" },
    {
      type: "p",
      text: "The Conversions API (CAPI) sends the same events server-to-server, directly from your store's backend to Meta — bypassing the browser entirely. It isn't a replacement for the pixel; it's a second, more reliable path for the same data, and Meta explicitly recommends running both together.",
    },
    {
      type: "ul",
      items: [
        "Server-side events aren't affected by ad blockers or browser tracking prevention — your backend talks to Meta's API directly.",
        "CAPI can include additional matching signals (hashed email, phone, or order ID) that improve Meta's ability to match the event to the right user, even when browser identifiers are blocked.",
        "Because it runs on your server, CAPI events tend to arrive more reliably and with more complete data than pixel-only events.",
      ],
    },
    { type: "h2", id: "deduplication", text: "The part people get wrong: deduplication" },
    {
      type: "p",
      text: "If you set up CAPI without deduplication, you'll double-count every conversion — the pixel fires once, CAPI fires again for the same purchase, and Meta reports two sales where there was one. This is the single most common CAPI misconfiguration we find in accounts we audit.",
    },
    {
      type: "p",
      text: "The fix is an event_id: both the pixel event and the matching CAPI event need to send the exact same event_id for the same real-world action. Meta uses that shared ID to recognize they're the same event and count it once. Most e-commerce platforms (Shopify's native CAPI integration included) handle this automatically once configured correctly — but it's worth verifying, not assuming.",
    },
    {
      type: "callout",
      tone: "warning",
      text: "After setting up CAPI, check Events Manager's deduplication column for your key events (Purchase especially). If you see two separate event counts instead of one deduplicated count, something's misconfigured — fix this before scaling spend, since it's actively feeding Meta's algorithm bad data.",
    },
    { type: "h2", id: "how-to-check", text: "How to check your own setup" },
    {
      type: "ol",
      items: [
        "Open Meta Events Manager → your pixel → Overview tab.",
        "Look at the 'Browser' and 'Server' columns for your Purchase event — you want to see events coming from both, not just one.",
        "Check the 'Event Match Quality' score — this reflects how much matching data (email, phone, external ID) is being passed, which directly affects how well Meta can attribute conversions.",
        "In the Test Events tool, fire a real test purchase and confirm you see exactly one deduplicated event, not two.",
      ],
    },
    { type: "h2", id: "bottom-line", text: "The bottom line" },
    {
      type: "p",
      text: "If you're running Meta Ads with any meaningful budget and only have the browser pixel installed, you're optimizing against incomplete data — and paying for it in worse targeting and inflated CPAs. Setting up CAPI properly (with deduplication verified, not assumed) is one of the highest-leverage, lowest-cost fixes available to almost any store running Meta Ads today.",
    },
  ],
};
