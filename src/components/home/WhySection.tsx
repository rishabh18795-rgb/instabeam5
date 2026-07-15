"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Code2,
  Filter,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Target,
  TrendingUpDown,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const oldWay: { label: string; icon: LucideIcon }[] = [
  { label: "Website developer", icon: Code2 },
  { label: "Ads freelancer", icon: Megaphone },
  { label: "Tracking freelancer", icon: TrendingUpDown },
  { label: "WhatsApp vendor", icon: MessageSquareWarning },
];

const instabeamWay: { label: string; icon: LucideIcon }[] = [
  { label: "One team", icon: Users },
  { label: "One dashboard", icon: LayoutDashboard },
  { label: "One funnel", icon: Filter },
  { label: "One strategy", icon: Target },
];

export function WhySection() {
  return (
    <section id="why" className="bg-paper py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why Instabeam"
          title="Why businesses switch to us."
          description="Most businesses end up with a web developer who doesn't understand ads, an ad freelancer who doesn't understand tracking, and a support team that never sees the data at all. Each piece works in isolation — and leads fall through the gaps between them."
        />

        <div className="mt-14 grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          {/* Old way — fragmented, muted */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-mist-200 bg-mist-50 p-6 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              The old way
            </p>
            <ul className="mt-5 space-y-2.5">
              {oldWay.map((item, i) => (
                <li key={item.label}>
                  <div
                    className="flex items-center gap-3 rounded-xl border border-dashed border-mist-300 bg-paper/60 px-4 py-3"
                    style={{ opacity: 1 - i * 0.06 }}
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-mist-400" strokeWidth={1.75} />
                    <span className="text-sm text-mist-600">{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-mist-500">
              Four vendors. Four handoffs. Leads fall through the gaps.
            </p>
          </motion.div>

          {/* Convergence arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center py-2 text-beam-500 lg:py-0"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-beam-200 bg-beam-50">
              <ArrowDown className="h-5 w-5 lg:hidden" strokeWidth={2} />
              <ArrowRight className="hidden h-5 w-5 lg:block" strokeWidth={2} />
            </span>
          </motion.div>

          {/* InstaBeam — unified, vibrant */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-2xl border border-ink bg-ink p-6 text-paper sm:p-8"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--color-beam-500)_0%,transparent_70%)] opacity-25 blur-2xl" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-beam-300">
              Instabeam
            </p>
            <ul className="relative mt-5 space-y-2.5">
              {instabeamWay.map((item) => (
                <li key={item.label}>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[linear-gradient(120deg,var(--color-beam-400),var(--color-gold-500))]">
                      <item.icon className="h-3.5 w-3.5 text-ink" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-medium text-mist-100">{item.label}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="relative mt-4 text-xs text-mist-400">
              One team, one shared source of truth, no handoffs.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
