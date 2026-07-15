import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  Globe,
  MessageCircle,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/graphics/GridPattern";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { services, siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

const icons: Record<string, LucideIcon> = {
  globe: Globe,
  target: Target,
  "bar-chart": BarChart3,
  "message-circle": MessageCircle,
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: service.label,
    description: service.shortDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.label} — ${siteConfig.name}`,
      description: service.shortDescription,
      url: `${siteConfig.url}/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = icons[service.icon];
  const otherServices = services.filter((s) => s.slug !== service.slug);
  const url = `${siteConfig.url}/services/${service.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Services", item: `${siteConfig.url}/services` },
      { "@type": "ListItem", position: 3, name: service.label, item: url },
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "IN",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((faq) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
        <GridPattern tone="dark" className="opacity-50" />
        <Container className="relative">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-400 transition-colors hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All services
          </Link>

          <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-beam-400),var(--color-gold-500))] text-ink">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
            {service.label}
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed text-mist-300">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contact" variant="gradient">
              Book a Free Funnel Audit
            </Button>
            <Button
              href={siteConfig.whatsapp.hrefWithMessage(
                `Hi Instabeam, I'd like to know more about ${service.label}`
              )}
              variant="secondary"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                What&apos;s included
              </h2>
              <ul className="mt-6 space-y-4">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-beam-100 text-beam-600">
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-mist-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-14 font-display text-2xl font-semibold tracking-tight text-ink">
                Frequently asked
              </h2>
              <div className="mt-6">
                <FaqAccordion items={service.faqs} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-mist-200 bg-mist-50 p-8">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  Not sure this is the right fit?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-600">
                  Tell us where you&apos;re stuck on the free funnel audit call —
                  we&apos;ll point you to the right service, even if it&apos;s not this
                  one.
                </p>
                <Button href="/contact" className="mt-5 w-full justify-center">
                  Book a Free Audit
                </Button>
              </div>

              <div className="rounded-3xl border border-mist-200 p-8">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  Other services
                </h3>
                <ul className="mt-4 space-y-3">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="group flex items-center justify-between gap-2 text-sm font-medium text-mist-600 transition-colors hover:text-ink"
                      >
                        {s.label}
                        <ArrowUpRight className="h-3.5 w-3.5 text-mist-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-beam-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
