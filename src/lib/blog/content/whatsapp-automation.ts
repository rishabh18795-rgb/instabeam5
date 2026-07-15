import type { BlogPost } from "../types";

export const whatsappAutomation: BlogPost = {
  slug: "whatsapp-automation-for-ecommerce",
  title: "WhatsApp Automation for E-commerce: What to Automate (and What Not To)",
  excerpt:
    "The WhatsApp Business API can qualify leads, confirm orders, and recover abandoned carts automatically — but over-automating it kills the thing that makes WhatsApp work. Here's where to draw the line.",
  category: "whatsapp",
  publishedAt: "2026-06-10",
  content: [
    {
      type: "p",
      text: "WhatsApp has the highest open rate of any channel available to Indian businesses right now — well above email, and usually above SMS too. That's exactly why it's easy to ruin: the same directness that makes it effective makes over-automation feel intrusive fast. This is the framework we use to decide what a bot should handle and what needs a human.",
    },
    { type: "h2", id: "what-to-automate", text: "What's safe to fully automate" },
    {
      type: "p",
      text: "The rule of thumb: automate anything that's a lookup, a status update, or a qualifying question with a small set of expected answers. These are things a human would answer identically every time anyway, so automating them costs nothing in quality and saves your team hours.",
    },
    {
      type: "ul",
      items: [
        "Order confirmations and shipping updates — pulled directly from your store/courier API, sent the moment status changes.",
        "FAQ-style questions (return policy, sizing, delivery timelines) — these repeat constantly and rarely need nuance.",
        "Initial lead qualification — budget range, what they're interested in, whether they're a returning customer — before handing off to a human.",
        "Abandoned cart nudges — a single, well-timed message with the product and a direct link back to checkout, sent 1–2 hours after abandonment.",
        "Appointment/consultation booking — collecting availability and confirming a slot doesn't need a human until the actual call.",
      ],
    },
    { type: "h2", id: "what-not-to-automate", text: "What needs a human, every time" },
    {
      type: "p",
      text: "The moment a conversation involves a complaint, a refund request, a price negotiation, or anything emotionally loaded, a bot response — even a good one — reads as dismissive. This is where automation should hand off, not attempt to resolve.",
    },
    {
      type: "ul",
      items: [
        "Complaints and negative feedback — route to a human immediately, don't attempt a scripted apology first.",
        "Custom quotes or negotiated pricing — anything that requires judgment.",
        "Anything the bot doesn't have high confidence it understood — a bad guess is worse than admitting it needs to escalate.",
        "High-value leads — if someone mentions a large order or enterprise interest, get a human in the conversation within minutes, not hours.",
      ],
    },
    {
      type: "callout",
      tone: "tip",
      text: "A simple test: would you be comfortable if the customer knew, mid-conversation, that they were talking to a bot? If the answer is no for that specific message, it shouldn't be automated.",
    },
    { type: "h2", id: "flow-design", text: "Designing the flow itself" },
    {
      type: "p",
      text: "The biggest mistake in WhatsApp bot flows isn't the technology — it's asking too many questions before delivering any value. Every flow we build follows the same shape:",
    },
    {
      type: "ol",
      items: [
        "Acknowledge immediately (within seconds) — even a simple 'Got it, one moment' beats silence.",
        "Ask at most 2–3 qualifying questions before offering something useful — a price range, a catalog link, an actual answer.",
        "Always give an explicit way to reach a human — 'type HELP' or a button — visible from the first message, not buried five replies in.",
        "Log everything to a CRM or sheet in real time so a human picking up the thread has full context, not a cold start.",
      ],
    },
    { type: "h2", id: "api-vs-tools", text: "WhatsApp Business API vs. no-code tools" },
    {
      type: "p",
      text: "For stores doing under a few hundred conversations a month, a no-code WhatsApp tool is often enough and avoids the Meta Business verification process. Once volume grows, or you need to trigger messages from store events (order placed, cart abandoned, COD confirmation), the official WhatsApp Business API through a Meta Business Solution Provider becomes worth the setup overhead — it's the only path to reliable order-triggered automation and template message approval for outbound notifications.",
    },
    {
      type: "callout",
      tone: "warning",
      text: "Meta enforces a 24-hour customer service window — you can only send free-form replies within 24 hours of the customer's last message. Outside that window, you need a pre-approved template message. Plan your flows around this, especially for order-status updates that might land outside the window.",
    },
    { type: "h2", id: "measuring-it", text: "How to know it's working" },
    {
      type: "p",
      text: "Track response time to first message, the percentage of conversations that get a human handoff (too high means your bot isn't handling enough; too low might mean it's over-automating sensitive conversations), and — most importantly — how many of your WhatsApp leads actually convert compared to other channels. WhatsApp consistently converts warmer than cold ad clicks precisely because it feels personal. Automation should protect that feeling, not erode it.",
    },
  ],
};
