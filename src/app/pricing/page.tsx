import type { Metadata } from "next";
import { Check, MessageCircleQuestion } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/graphics/GridPattern";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { DisplayAd } from "@/components/ads/DisplayAd";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "InstaBeam pricing is scoped to your funnel, not a fixed rate card. See what's included at each engagement level and get a custom quote.",
  alternates: { canonical: "/pricing" },
};

const tiers = [
  {
    name: "Foundation",
    tagline: "For brands starting from zero",
    description:
      "Get the fundamentals right before you spend a rupee on ads — a site or store that converts, and tracking that actually works.",
    features: [
      "Website or Shopify store build",
      "GA4 + conversion tracking setup, verified end to end",
      "Meta Pixel & Conversions API configured with deduplication",
      "Launch-ready checkout and speed review",
    ],
    cta: "Get a custom quote",
  },
  {
    name: "Growth",
    tagline: "For brands ready to run paid traffic",
    description:
      "Everything in Foundation, plus ongoing Meta & Google Ads management and WhatsApp automation to convert the traffic you're paying for.",
    features: [
      "Everything in Foundation",
      "Meta & Google Ads campaign management",
      "Weekly optimization based on GA4 data",
      "WhatsApp bot setup for lead qualification & order updates",
    ],
    cta: "Get a custom quote",
    highlighted: true,
  },
  {
    name: "Scale",
    tagline: "For brands with real ad spend and complex funnels",
    description:
      "A dedicated setup for multi-channel accounts — deeper creative testing cadence, custom reporting, and closer weekly involvement.",
    features: [
      "Everything in Growth",
      "Multi-channel campaign structure (Meta + Google + more)",
      "Custom GA4/Looker Studio reporting dashboards",
      "Priority WhatsApp support & monthly strategy calls",
    ],
    cta: "Get a custom quote",
  },
];

const pricingFaqs = [
  {
    question: "Why don't you list fixed prices?",
    answer:
      "Because a Shopify store for a 20-SKU brand and a custom site with a booking system aren't the same job, and quoting one fixed number for both would mean overcharging one of you. We'd rather scope it honestly on a free call than publish a number that doesn't apply to your situation.",
  },
  {
    question: "Is there a minimum contract length?",
    answer:
      "We'll be upfront about this on your quote call — it depends on the scope (a one-time site build vs. an ongoing ads retainer work differently). No surprise lock-ins either way.",
  },
  {
    question: "Does your fee include ad spend?",
    answer:
      "No — ad spend always stays in your own Meta/Google Ads accounts and is separate from our management fee. You retain full ownership and visibility of every rupee spent.",
  },
  {
    question: "How fast can I get a quote?",
    answer:
      "Book the free funnel audit call and you'll typically get a scoped quote within one business day of that call.",
  },
];

export default function PricingPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${siteConfig.url}/pricing` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pricingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
        <GridPattern tone="dark" className="opacity-50" />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
            Pricing
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Scoped to your funnel, not a rate card.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            We don&apos;t publish fixed prices because no two funnels cost the
            same to fix. Here&apos;s what&apos;s included at each level — book a free
            audit for an exact quote.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-3xl border p-8 ${
                  tier.highlighted
                    ? "border-beam-300 bg-mist-50 shadow-[0_20px_60px_-25px_rgba(0,217,255,0.35)]"
                    : "border-mist-200 bg-paper"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-8 rounded-full bg-[linear-gradient(120deg,var(--color-beam-400),var(--color-gold-500))] px-3 py-1 text-xs font-semibold text-ink">
                    Most common
                  </span>
                )}
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {tier.name}
                </h2>
                <p className="mt-1 text-sm text-mist-500">{tier.tagline}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-mist-600">
                  {tier.description}
                </p>

                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-mist-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-beam-600" strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  href="/contact"
                  variant={tier.highlighted ? "gradient" : "secondary"}
                  className="mt-8 w-full justify-center"
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-dashed border-mist-300 bg-mist-50 p-6 text-left">
            <MessageCircleQuestion className="mt-0.5 h-5 w-5 shrink-0 text-beam-600" strokeWidth={1.75} />
            <p className="text-sm leading-relaxed text-mist-600">
              We intentionally don&apos;t list ₹ figures here — the honest answer
              depends on your current site, ad spend, and how much work
              exists already. Every quote is scoped on a free call first, in
              writing, before you commit to anything.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-4">
        <Container>
          <DisplayAd />
        </Container>
      </section>

      <section className="bg-mist-50 py-20 sm:py-24">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
            Pricing questions
          </h2>
          <div className="mt-8">
            <FaqAccordion items={pricingFaqs} />
          </div>
        </Container>
      </section>
    </>
  );
}
