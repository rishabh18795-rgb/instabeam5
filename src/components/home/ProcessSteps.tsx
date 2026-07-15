"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { processSteps, siteConfig } from "@/lib/site-config";

export function ProcessSteps() {
  return (
    <section id="process" className="bg-paper py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="How We Work"
          title="A clear process, every time."
          description="No black boxes. Every project follows the same documented steps, so you always know what's happening and why."
        />

        <div className="relative mt-16">
          {/* connecting line — desktop only, spans dot-row center to center */}
          <div className="pointer-events-none absolute inset-x-[12.5%] top-5 hidden h-px bg-mist-200 lg:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{ transformOrigin: "left" }}
              className="h-full w-full bg-[linear-gradient(90deg,var(--color-beam-400),var(--color-gold-500))]"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.12 }}
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 bg-paper font-display text-sm font-semibold text-ink shadow-[0_2px_8px_-2px_rgba(11,11,11,0.08)]"
                >
                  {step.number}
                </motion.span>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            href={siteConfig.whatsapp.hrefWithMessage(
              "Hi Instabeam, I'd like to talk through a project"
            )}
            variant="secondary"
            size="md"
          >
            Talk to us on WhatsApp
          </Button>
        </div>
      </Container>
    </section>
  );
}
