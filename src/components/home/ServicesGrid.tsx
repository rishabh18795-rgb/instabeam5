"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, Globe, MessageCircle, Target, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/lib/site-config";

const icons: Record<string, LucideIcon> = {
  globe: Globe,
  target: Target,
  "bar-chart": BarChart3,
  "message-circle": MessageCircle,
};

export function ServicesGrid() {
  return (
    <section id="services" className="bg-mist-50 py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our Services"
          title="What we do."
          description="Website and Shopify builds, Meta & Google Ads, GA4 tracking, and WhatsApp automation — run by one team so nothing falls through the gaps between them."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {services.map((service, i) => {
            const Icon = icons[service.icon];
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl bg-[linear-gradient(135deg,var(--color-beam-400),var(--color-gold-500))] p-px transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-16px_rgba(0,217,255,0.35)]"
              >
                <div className="relative h-full overflow-hidden rounded-[calc(1rem-1px)] bg-paper/95 p-8 backdrop-blur-xl transition-colors duration-300 group-hover:bg-paper/85">
                  {/* ambient glow revealed on hover */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--color-beam-400)_0%,transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />

                  <div className="relative mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-beam-400 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[linear-gradient(135deg,var(--color-beam-400),var(--color-gold-500))] group-hover:text-ink">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>

                  <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
                    {service.label}
                  </p>
                  <h3 className="relative mt-2 flex items-center gap-1.5 font-display text-xl font-semibold tracking-tight text-ink">
                    {service.name}
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-mist-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-beam-600 group-hover:opacity-100" />
                  </h3>
                  <p className="relative mt-3 text-[15px] leading-relaxed text-mist-600">
                    {service.shortDescription}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
