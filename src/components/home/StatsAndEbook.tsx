"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Percent,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GridPattern } from "@/components/graphics/GridPattern";
import { AnimatedCounter } from "@/components/home/AnimatedCounter";
import { ebook, stats } from "@/lib/site-config";

const statIcons: LucideIcon[] = [Users, TrendingUp, Percent, IndianRupee];

const bonuses = [
  {
    title: "Quick-Start Checklist",
    description:
      "A 12-point setup checklist covering Business Manager, Pixel install, campaign launch, and weekly review.",
  },
  {
    title: "Private WhatsApp Community",
    description:
      "Get ongoing ad tips, updates, and feedback alongside other Indian entrepreneurs running Meta Ads.",
  },
  {
    title: "Ad Copy & Product Page Structure",
    description:
      "Ready-to-use headline, benefit-bullet, social proof, and CTA templates for your Shopify product pages.",
  },
  {
    title: "Canva Ad Templates",
    description:
      "15 ready-made Feed, Reel cover, carousel, and Story ad templates you can customise in minutes.",
  },
  {
    title: "20 AI Prompts",
    description:
      "Copy-paste prompts for ad copy, hooks, video scripts, and retargeting messages that actually convert.",
  },
];

export function StatsAndEbook() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-28">
      <GridPattern tone="dark" className="opacity-50" />
      <Container className="relative">
        <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-16 sm:grid-cols-4 sm:gap-6">
          {stats.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-beam-400/30 hover:bg-white/[0.06] hover:shadow-[0_16px_40px_-16px_var(--color-beam-500)] sm:p-6"
              >
                {Icon && (
                  <Icon
                    className="mb-3 h-5 w-5 text-beam-400 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.75}
                  />
                )}
                <AnimatedCounter
                  value={stat.value}
                  className="beam-gradient-text block font-display text-3xl font-semibold tracking-tight sm:text-4xl"
                />
                <p className="mt-1 text-sm text-mist-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-14 pt-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
              Resource · {ebook.edition}
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {ebook.title}.
            </h2>
            <p className="mt-4 max-w-lg text-balance leading-relaxed text-mist-300">
              {ebook.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold">
                  {ebook.priceCurrent}
                </span>
                <span className="text-sm text-mist-500 line-through">
                  {ebook.priceOriginal}
                </span>
              </div>
              <span className="text-sm text-mist-400">Instant PDF download</span>
            </div>

            <p className="mt-2 text-sm text-mist-500">
              By {ebook.author}
            </p>

            <Button href={ebook.href} size="lg" className="group mt-8">
              Get the ebook + all 5 bonuses
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist-500">
              Included free
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
              5 bonuses with every copy.
            </h3>
            <ul className="mt-6 space-y-4">
              {bonuses.map((bonus) => (
                <li key={bonus.title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-beam-400" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-paper">{bonus.title}</p>
                    <p className="mt-0.5 text-sm text-mist-400">{bonus.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
