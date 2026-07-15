import type { BlogPost } from "../types";

export const landingPageGuide: BlogPost = {
  slug: "landing-page-guide-for-paid-traffic",
  title: "Building Landing Pages That Don't Waste Your Ad Spend",
  excerpt:
    "Sending paid traffic to your homepage is the most common way to quietly lose money on ads. Here's how to structure a landing page that actually matches what the ad promised.",
  category: "landing-pages",
  publishedAt: "2026-07-01",
  content: [
    {
      type: "p",
      text: "The fastest way to waste ad budget isn't bad targeting — it's sending a visitor who clicked a specific offer to a generic homepage and expecting them to find their own way to convert. Message match between the ad and the landing page is one of the biggest, cheapest levers available, and most stores never pull it.",
    },
    { type: "h2", id: "message-match", text: "Message match: the single biggest lever" },
    {
      type: "p",
      text: "If your ad says '30% off your first order,' the landing page needs to say that too — visibly, immediately, without the visitor hunting for it. Every gap between what the ad promised and what the page delivers costs you conversions, because it makes the visitor pause and re-evaluate whether they're in the right place.",
    },
    {
      type: "ul",
      items: [
        "Headline on the landing page should echo the ad's hook, not restate your brand's general positioning.",
        "If the ad promotes a specific product or offer, the page should lead with that product/offer — not a category page or homepage carousel.",
        "Keep the same visual style between ad creative and landing page hero — a jarring shift makes visitors question if they clicked the right link.",
      ],
    },
    { type: "h2", id: "structure", text: "The structure that consistently works" },
    {
      type: "p",
      text: "There's no single 'perfect' landing page, but this order handles the vast majority of paid-traffic use cases well:",
    },
    {
      type: "ol",
      items: [
        "Hero: the offer/product, one clear headline, one clear CTA button — above the fold, no scrolling required to see it.",
        "Proof: reviews, ratings, press mentions, or trust badges — right after the hero, before you ask for anything else.",
        "Benefit breakdown: 3–4 short blocks answering 'why this, why now' — not a full spec sheet, just the reasons that actually drive the decision.",
        "Objection handling: shipping time, return policy, sizing/fit — address the specific things that make people hesitate at checkout.",
        "Final CTA: repeat the offer and button one more time at the bottom, for visitors who scrolled the whole way before deciding.",
      ],
    },
    { type: "h2", id: "one-goal", text: "One page, one goal" },
    {
      type: "p",
      text: "A landing page with a navigation menu, five different products, and three competing CTAs is asking a paid visitor to do your targeting work for you. Strip the navigation, remove links that lead anywhere except the conversion action, and give the visitor exactly one decision to make.",
    },
    {
      type: "callout",
      tone: "tip",
      text: "If you're worried about removing navigation entirely, keep a minimal logo (non-clickable or linking to the offer, not the homepage) for brand trust, but drop the full menu. Every exit point is a chance to lose the visitor before they convert.",
    },
    { type: "h2", id: "mobile", text: "Design for mobile first, literally" },
    {
      type: "p",
      text: "Most paid social traffic arrives on mobile. Build and review the mobile layout first, not as an afterthought after the desktop version is done — check that the CTA button is reachable with a thumb without scrolling awkwardly, that form fields aren't cramped, and that page load time is fast on a typical mobile connection, not just office wifi.",
    },
    { type: "h2", id: "testing", text: "What to test, in order of impact" },
    {
      type: "p",
      text: "Not all A/B tests are worth running. In order of how much they typically move conversion rate:",
    },
    {
      type: "ol",
      items: [
        "Headline and offer framing — the single highest-leverage test on most pages.",
        "Hero image/video — what the visitor sees in the first second.",
        "CTA button copy and placement — 'Get 30% Off' usually beats generic 'Shop Now.'",
        "Form length (for lead-gen pages) — every extra field measurably drops completion rate; ask only for what you truly need at this stage.",
        "Page length and section order — worth testing, but expect smaller gains than the above.",
      ],
    },
    { type: "h2", id: "speed-again", text: "Speed matters more on landing pages than anywhere else" },
    {
      type: "p",
      text: "A paid visitor has zero brand loyalty built up yet — they clicked an ad, not searched for you by name. A slow-loading landing page loses this visitor faster than almost any other type of traffic, because there's no existing relationship buying you patience. Compress images, avoid heavy embeds above the fold, and test load time on actual mobile data, not just your office broadband.",
    },
  ],
};
