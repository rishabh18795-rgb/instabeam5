import type { BlogPost } from "../types";

export const ga4Guide: BlogPost = {
  slug: "ga4-setup-guide-for-shopify",
  title: "GA4 Setup Guide: What to Track Before You Spend on Ads",
  excerpt:
    "GA4's default setup misses the events that actually matter for e-commerce. Here's what to configure first, and how to tell if your data is trustworthy before you make decisions from it.",
  category: "analytics",
  publishedAt: "2026-07-08",
  content: [
    {
      type: "p",
      text: "GA4 replaced Universal Analytics with an event-based model that's more powerful but far less forgiving of a lazy setup. A default install tracks page views and not much else useful — none of the e-commerce events that actually tell you whether your ads are working. This is the setup we run before any store starts spending seriously on paid traffic.",
    },
    { type: "h2", id: "core-events", text: "The core events you need, in order of importance" },
    {
      type: "ul",
      items: [
        "purchase — non-negotiable. Without this, nothing else in GA4 tells you what you actually care about.",
        "add_to_cart — your best early signal of intent, and useful for retargeting audiences even before checkout.",
        "begin_checkout — tells you how much of your cart-to-purchase drop-off is happening at checkout specifically, versus earlier.",
        "view_item — needed to build product-level funnels and see which listings drive interest vs. which convert.",
        "sign_up / generate_lead — if you have an email capture or lead form, this closes the loop for non-purchase conversions.",
      ],
    },
    {
      type: "p",
      text: "On Shopify, GA4's native integration (or the Google & YouTube channel app) handles most of these automatically through the Enhanced Ecommerce data layer — but 'installed' isn't the same as 'verified.' Always confirm events in DebugView with a real test session before trusting the reports.",
    },
    { type: "h2", id: "verifying", text: "How to verify it's actually working" },
    {
      type: "ol",
      items: [
        "Open GA4 → Admin → DebugView, and enable debug mode (via the GA4 Debugger Chrome extension, or ?debug_mode=true in the URL).",
        "Walk through a full purchase on your own store — view a product, add to cart, start checkout, complete a test order.",
        "Confirm each event appears in DebugView in real time, with the expected parameters (item name, price, currency) attached.",
        "Check the purchase event specifically includes a transaction_id and value — without these, revenue reporting will be wrong or missing entirely.",
      ],
    },
    {
      type: "callout",
      tone: "warning",
      text: "A common silent failure: the purchase event fires, but without a value or currency parameter attached. GA4 will show the conversion happened but report ₹0 revenue — easy to miss unless you're checking the actual event parameters, not just whether the event count is non-zero.",
    },
    { type: "h2", id: "conversions", text: "Mark the right events as conversions" },
    {
      type: "p",
      text: "In GA4, not every event is automatically a 'conversion' — you choose which ones count. Mark purchase (and generate_lead, if relevant) as conversions in Admin → Events. This is what feeds Google Ads if you're running Search/Shopping campaigns, and what shows up in your top-line conversion reporting — get this wrong and every downstream report is wrong too.",
    },
    { type: "h2", id: "channels", text: "Understanding where your traffic actually comes from" },
    {
      type: "p",
      text: "GA4's default channel grouping is decent but not perfect, especially for WhatsApp and social traffic, which often gets lumped into 'Direct' or 'Unassigned' without proper UTM tagging. Tag every link you share manually — WhatsApp broadcasts, Instagram bio links, email campaigns — with consistent utm_source/utm_medium/utm_campaign parameters, or GA4 will systematically undercount those channels.",
    },
    {
      type: "ul",
      items: [
        "utm_source: where the click came from (whatsapp, instagram, newsletter)",
        "utm_medium: the type of channel (social, email, cpc, referral)",
        "utm_campaign: the specific campaign or promotion name",
      ],
    },
    { type: "h2", id: "reports-to-watch", text: "The reports actually worth checking weekly" },
    {
      type: "p",
      text: "GA4 has dozens of reports; most stores only need a handful on a regular basis:",
    },
    {
      type: "ul",
      items: [
        "Realtime — mainly useful right after launching a new campaign, to confirm traffic and events are flowing.",
        "Acquisition → Traffic acquisition — which channels are actually driving sessions, cross-checked against your UTM tagging.",
        "Monetization → Ecommerce purchases — revenue and conversion rate by item, to spot which products are working in ads vs. organic.",
        "Explore → a custom funnel exploration from view_item → add_to_cart → begin_checkout → purchase, to see exactly where drop-off happens.",
      ],
    },
    { type: "h2", id: "connecting-ads", text: "Connect GA4 to your ad platforms" },
    {
      type: "p",
      text: "Link GA4 to Google Ads (Admin → Product Links) so conversion data flows both ways, and export key GA4 audiences (like cart abandoners) for retargeting where the platform supports it. This closes the loop between what GA4 measures and what your ad platforms can act on — otherwise you're tracking performance in one tool and optimizing in another with no connection between them.",
    },
    {
      type: "p",
      text: "None of this needs to be complicated, but it does need to be verified, not assumed. A GA4 setup that looks complete in the Admin panel but silently drops values or misses events will quietly send you the wrong signal on every optimization decision you make from it.",
    },
  ],
};
