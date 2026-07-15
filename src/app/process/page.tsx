import type { Metadata } from "next";
import { PhoneCall, Hammer, Rocket, LineChart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/graphics/GridPattern";
import { processSteps, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How InstaBeam works — from the first discovery call to monthly reporting. No black boxes, no vague retainers.",
  alternates: { canonical: "/process" },
};

const stepIcons = [PhoneCall, Hammer, Rocket, LineChart];

export default function ProcessPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Process", item: `${siteConfig.url}/process` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
        <GridPattern tone="dark" className="opacity-50" />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
            How we work
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            No black boxes. No vague retainers.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            Every engagement follows the same four stages — so you always
            know what we&apos;re doing, why, and what happens next.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container className="max-w-4xl">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-7 top-4 bottom-4 hidden w-px bg-mist-200 sm:block"
            />
            <ol className="space-y-10">
              {processSteps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <li key={step.number} className="relative flex gap-6">
                    <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink text-beam-400">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-beam-600">
                        Step {step.number}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
                        {step.title}
                      </h2>
                      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-mist-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-16 rounded-3xl border border-mist-200 bg-mist-50 p-10 text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Ready to start with a discovery call?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-mist-600">
              It&apos;s free, and you&apos;ll walk away knowing exactly where you&apos;re
              losing customers in the funnel — whether or not you work with
              us after.
            </p>
            <Button href="/contact" variant="gradient" className="mt-6">
              Book a Free Funnel Audit
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
