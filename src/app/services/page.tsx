import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BarChart3, Globe, MessageCircle, Target, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GridPattern } from "@/components/graphics/GridPattern";
import { services, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website & Shopify builds, Meta & Google Ads management, GA4 tracking, and WhatsApp automation — run by one connected InstaBeam team.",
  alternates: { canonical: "/services" },
};

const icons: Record<string, LucideIcon> = {
  globe: Globe,
  target: Target,
  "bar-chart": BarChart3,
  "message-circle": MessageCircle,
};

export default function ServicesIndexPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteConfig.url}/services` },
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
            Services
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            One team for the whole funnel.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            Site or store, ads, tracking, and WhatsApp — built to work
            together instead of four vendors who&apos;ve never spoken to each
            other.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = icons[service.icon];
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-mist-200 bg-paper p-8 transition-all duration-300 hover:-translate-y-1 hover:border-beam-300 hover:shadow-[0_20px_60px_-25px_rgba(11,11,11,0.25)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-beam-400 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
                    {service.label}
                  </p>
                  <h2 className="mt-2 flex items-center gap-1.5 font-display text-2xl font-semibold tracking-tight text-ink">
                    {service.name}
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-mist-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-beam-600 group-hover:opacity-100" />
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-mist-600">
                    {service.shortDescription}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
