"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";

// Real names only — no invented clients. Typographic wordmarks (not
// image logos) since we don't have brand mark files for these yet;
// swap in actual logo assets via the Admin Portal in Phase 3.
const clients = ["MechServi", "Guerdon Kicks"];
const openSlots = 2;

export function TrustSection() {
  return (
    <section className="border-y border-mist-200 bg-paper py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between"
        >
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-mist-500">
            Trusted by
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:justify-end">
            {clients.map((name) => (
              <span
                key={name}
                className="font-display text-lg font-semibold tracking-tight text-mist-400 grayscale transition-all duration-300 hover:text-ink hover:grayscale-0"
              >
                {name}
              </span>
            ))}
            {Array.from({ length: openSlots }).map((_, i) => (
              <span
                key={`slot-${i}`}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-mist-300 px-3 py-1.5 text-xs font-medium text-mist-400"
              >
                <Plus className="h-3 w-3" strokeWidth={2} />
                Your brand here
              </span>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
