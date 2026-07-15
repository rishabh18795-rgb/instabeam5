"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AuroraBackground } from "@/components/graphics/AuroraBackground";
import { siteConfig } from "@/lib/site-config";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32">
      <AuroraBackground />
      <Container className="relative text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
        >
          Let&apos;s see what&apos;s leaking in your funnel.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300"
        >
          Send us your site or store — we&apos;ll send back a free audit
          covering tracking, ads, and where you&apos;re losing customers
          before checkout.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            href={siteConfig.whatsapp.hrefWithMessage(
              "Hi Instabeam, I'd like a free funnel audit"
            )}
            size="lg"
            className="group"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            href={`mailto:${siteConfig.email}`}
            variant="secondary"
            size="lg"
            className="border-white/15 bg-transparent text-paper hover:bg-white/5"
          >
            <Mail className="h-4 w-4" />
            Email us
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
