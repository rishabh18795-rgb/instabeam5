"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { ebook } from "@/lib/site-config";

/**
 * Compact, high-visibility ebook teaser for the hero. The full section
 * with bonuses/stats still lives further down the page (StatsAndEbook) —
 * this is deliberately small and impossible to miss, not a duplicate.
 */
export function EbookCallout() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-500/10 via-white/[0.04] to-transparent p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
        <BookOpenCheck className="h-5 w-5" strokeWidth={1.75} />
      </span>

      <div className="flex-1">
        <p className="text-sm font-semibold text-paper">
          {ebook.title}
        </p>
        <p className="mt-0.5 text-xs text-mist-400">
          <span className="font-semibold text-gold-300">{ebook.priceCurrent}</span>{" "}
          <span className="line-through">{ebook.priceOriginal}</span> · Instant
          download · 5 bonuses included
        </p>
      </div>

      <Magnetic strength={0.2} className="w-full sm:w-auto">
        <Button href={ebook.href} variant="gradient" size="sm" className="w-full sm:w-auto">
          Download Ebook
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Magnetic>
    </motion.div>
  );
}
