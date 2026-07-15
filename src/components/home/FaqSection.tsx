"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { faqs, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-mist-50 py-24 sm:py-28">
      <Container className="max-w-4xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." align="center" className="mx-auto" />

        <div className="mt-12 divide-y divide-mist-200 rounded-2xl border border-mist-200 bg-paper">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-medium text-ink">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-mist-500 transition-transform duration-300",
                      isOpen && "rotate-180 text-beam-600"
                    )}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-[15px] leading-relaxed text-mist-600">
                    {faq.answer}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-mist-600">Still have questions?</p>
          <Button
            href={siteConfig.whatsapp.hrefWithMessage(
              "Hi Instabeam, I'd like to book a free strategy call"
            )}
            variant="secondary"
            size="md"
          >
            <PhoneCall className="h-4 w-4" />
            Book a Free Strategy Call
          </Button>
        </div>
      </Container>
    </section>
  );
}
