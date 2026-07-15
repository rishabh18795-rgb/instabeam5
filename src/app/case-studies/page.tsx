import type { Metadata } from "next";
import { Sparkles, Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/graphics/GridPattern";
import { caseStudies, stats, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "Real client work from InstaBeam — published as projects wrap, with client approval. No invented results.",
  alternates: { canonical: "/case-studies" },
};

// Real names only — same policy as the homepage Trust section.
const clients = ["MechServi", "Guerdon Kicks"];

export default function CaseStudiesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: `${siteConfig.url}/case-studies` },
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
            Case Studies
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Real work, published as it wraps.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            We&apos;d rather show you nothing than a fabricated result. Case
            studies go up here only once a project is complete and the
            client has approved sharing the numbers.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          {caseStudies.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Real case studies render here once caseStudies in site-config.ts is populated. */}
            </div>
          ) : (
            <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-mist-300 bg-mist-50 p-10 text-center sm:p-14">
              <Sparkles className="mx-auto h-7 w-7 text-beam-500" strokeWidth={1.75} />
              <h2 className="mt-5 text-balance font-display text-2xl font-semibold tracking-tight text-ink">
                Our first published case studies are in progress.
              </h2>
              <p className="mt-3 text-balance text-[15px] leading-relaxed text-mist-600">
                We&apos;re currently working with the clients below and a few
                others — write-ups get published here once each project
                wraps and the client signs off on sharing the results.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {clients.map((name) => (
                  <span
                    key={name}
                    className="font-display text-lg font-semibold tracking-tight text-mist-500"
                  >
                    {name}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 rounded-full border border-dashed border-mist-300 px-3 py-1.5 text-xs font-medium text-mist-400">
                  <Plus className="h-3 w-3" strokeWidth={2} />
                  Your brand here
                </span>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-mist-200 pt-8">
                {stats.slice(0, 2).map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-xl font-semibold text-ink">{stat.value}</p>
                    <p className="text-xs text-mist-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Button href="/contact" variant="gradient" className="mt-8">
                Be one of our first published case studies
              </Button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
