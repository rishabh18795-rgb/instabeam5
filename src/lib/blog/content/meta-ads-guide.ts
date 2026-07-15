import type { BlogPost } from "../types";

export const metaAdsGuide: BlogPost = {
  slug: "meta-ads-guide-for-indian-ecommerce",
  title: "A Practical Meta Ads Guide for Indian D2C & Shopify Brands",
  excerpt:
    "How to structure your Meta Ads account, pick a starting budget, and read your results without drowning in metrics — written for stores just getting started or fixing a messy account.",
  category: "meta-ads",
  publishedAt: "2026-06-02",
  content: [
    {
      type: "p",
      text: "Most Meta Ads accounts we take over have the same problem: too many campaigns, not enough data in any single one, and a founder who's stopped trusting the numbers. This guide is the setup we actually use — not a theoretical best-practices list, but the structure and habits that hold up once real budget is on the line.",
    },
    { type: "h2", id: "account-structure", text: "Start with a boring account structure" },
    {
      type: "p",
      text: "The instinct when you open Ads Manager is to build a campaign for every product, every audience, every idea you have. Don't. Meta's algorithm needs volume in a single ad set to exit the learning phase and optimize properly — usually around 50 conversion events per week per ad set. Split your budget across ten thin ad sets and none of them ever leave learning.",
    },
    {
      type: "ul",
      items: [
        "One campaign objective at a time: Sales (conversions) for stores with a working pixel, Traffic only if you genuinely don't have purchase data yet.",
        "2–3 ad sets per campaign maximum when you're starting out — a broad audience, one interest-based audience, and a retargeting audience.",
        "3–5 ads per ad set, not 15. Meta needs enough spend per ad to judge it fairly.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      text: "If you're not sure whether to split an audience into two ad sets, don't. Merging almost always outperforms fragmenting when budgets are under ₹50,000/month.",
    },
    { type: "h2", id: "budget", text: "How much budget you actually need" },
    {
      type: "p",
      text: "Meta needs roughly 50 purchase (or add-to-cart, if purchases are rare) events per ad set per week to have enough data to optimize delivery. Work backwards from your conversion rate and average order value to figure out the minimum daily spend that gets you there — for most Indian D2C stores with a ₹1,500–3,000 AOV, that's somewhere between ₹800–2,000/day per ad set to start seeing consistent results within 2–3 weeks.",
    },
    {
      type: "p",
      text: "If your budget is below that, don't panic — it just means you should run fewer ad sets, not smaller ones. One well-fed ad set beats three starved ones every time.",
    },
    { type: "h2", id: "creative", text: "Creative is the lever that actually moves results" },
    {
      type: "p",
      text: "Once your account structure is sane, creative is where 80% of your performance swings live — targeting and bidding matter far less than most people think in 2026's ad platform. A few things that consistently work for Indian e-commerce brands:",
    },
    {
      type: "ul",
      items: [
        "UGC-style video over polished studio shots — even a founder talking to camera for 30 seconds usually outperforms a product-only ad.",
        "Show the product being used, not just sitting on a table. Motion holds attention in the first 3 seconds, which is where most scroll-past happens.",
        "Test hooks aggressively, keep the rest of the ad the same. The first line of copy and first second of video do most of the work — vary those before you touch anything else.",
        "Refresh creative every 2–3 weeks once frequency climbs past 2.5–3, or CTR will start dropping even if targeting is fine.",
      ],
    },
    { type: "h2", id: "reading-results", text: "How to actually read your results" },
    {
      type: "p",
      text: "ROAS (return on ad spend) is the number everyone fixates on, but it's a lagging, noisy metric — especially on a 7-day click attribution window where Meta is still guessing at some conversions. Look at it weekly, not daily, and pair it with two other numbers:",
    },
    {
      type: "ul",
      items: [
        "Cost per purchase, tracked against your actual margin (not revenue) — this tells you if you're profitable, ROAS alone doesn't.",
        "Hold-out or blended CAC from GA4/your store analytics, compared against what Ads Manager reports — the gap between them tells you how much Meta is over- or under-crediting itself.",
      ],
    },
    {
      type: "callout",
      tone: "warning",
      text: "Don't kill an ad set on day 2 because ROAS looks bad. Give it the full learning period (roughly 3–7 days depending on event volume) before making a call — early data is disproportionately noisy.",
    },
    { type: "h2", id: "common-mistakes", text: "The mistakes we see most often" },
    {
      type: "ol",
      items: [
        "Turning campaigns on and off repeatedly — every restart resets the learning phase and tanks delivery for days.",
        "Excluding past purchasers from every campaign by default, even prospecting ones — this quietly kills repeat-purchase revenue, which is usually your highest-margin channel.",
        "Optimizing for link clicks or landing page views on a store that already has purchase data — always optimize for the deepest reliable event you have volume for.",
        "No retargeting audience at all, or one that's too broad (all website visitors, 180 days) instead of intent-weighted (added to cart, 14 days).",
      ],
    },
    {
      type: "p",
      text: "None of this replaces a proper account audit — every store's history, catalog, and margin structure changes the specifics. But if you fix just the account structure and give your ad sets enough data to actually optimize, most of the accounts we've inherited improve within the first two weeks without spending a rupee more.",
    },
  ],
};
