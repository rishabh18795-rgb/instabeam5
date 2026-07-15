"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AuroraBackground } from "@/components/graphics/AuroraBackground";
import { GridPattern } from "@/components/graphics/GridPattern";
import { FunnelIllustration } from "@/components/graphics/FunnelIllustration";
import { EbookCallout } from "@/components/home/EbookCallout";
import { siteConfig } from "@/lib/site-config";

// react-hook-form + zod are only needed once the visitor reaches the form;
// splitting it out keeps the initial Hero paint lean.
const HeroEnquiryForm = dynamic(
  () => import("@/components/home/HeroEnquiryForm").then((m) => m.HeroEnquiryForm),
  {
    loading: () => (
      <div className="h-[420px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />
    ),
  }
);

const pillars = ["Build", "Advertise", "Measure", "Convert"];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Very subtle depth-of-field parallax — background drifts slower than
  // scroll, foreground content is untouched.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  // Subtle mouse-tracked 3D tilt on the funnel diagram — the kind of
  // premium micro-depth used on Linear/Stripe hero visuals. Disabled on
  // touch devices implicitly since onMouseMove never fires there.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 150, damping: 20 });
  const springTiltY = useSpring(tiltY, { stiffness: 150, damping: 20 });

  const handleFunnelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 10);
    tiltX.set(py * -10);
  };

  const handleFunnelMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <section ref={sectionRef} className="grain-overlay relative overflow-hidden bg-ink text-paper">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <AuroraBackground />
        <GridPattern tone="dark" className="opacity-60" />
      </motion.div>
      {/* blurred reflection lights — layered for depth */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-beam-400/20 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 h-64 w-64 translate-y-1/2 rounded-full bg-gold-500/15 blur-[100px]" />
      <div className="pointer-events-none absolute right-[8%] top-1/3 h-48 w-48 rounded-full bg-beam-300/10 blur-[90px]" />
      {/* thin top hairline + bottom vignette for a seamless transition into the next section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink" />

      <Container className="relative grid grid-cols-1 items-center gap-16 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-mist-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-beam animate-pulse" />
            Websites · Shopify · Meta &amp; Google Ads · GA4 · WhatsApp API · AI Bots
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            One signal.{" "}
            <span className="beam-gradient-text">Full funnel.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-mist-300"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/contact" size="lg" className="group">
              Book a free audit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              href="/#services"
              variant="secondary"
              size="lg"
              className="border-white/15 bg-transparent text-paper hover:bg-white/5"
            >
              See how it works
            </Button>
          </motion.div>

          <EbookCallout />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {pillars.map((pillar, i) => (
              <div key={pillar} className="flex items-center gap-2">
                <span className="font-mono text-xs text-mist-500">
                  0{i + 1}
                </span>
                <span className="text-sm font-medium text-mist-300">
                  {pillar}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 800 }}
            onMouseMove={handleFunnelMouseMove}
            onMouseLeave={handleFunnelMouseLeave}
            className="relative mx-auto w-full max-w-[300px] sm:max-w-sm"
          >
            <motion.div style={{ rotateX: springTiltX, rotateY: springTiltY }}>
              <FunnelIllustration />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <HeroEnquiryForm />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
