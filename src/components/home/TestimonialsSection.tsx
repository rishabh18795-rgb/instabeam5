"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Sparkles, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { stats, testimonials } from "@/lib/site-config";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Carousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setIndex((i) => (i + dir + testimonials.length) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <div className="relative mx-auto max-w-2xl">
      <div className="relative min-h-[280px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-mist-200 bg-paper p-8 text-center shadow-[0_20px_50px_-24px_rgba(11,11,11,0.15)] sm:p-10"
          >
            <Quote className="mx-auto h-7 w-7 text-beam-400" strokeWidth={1.5} />
            <p className="mt-4 text-balance text-lg leading-relaxed text-ink sm:text-xl">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-5 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={i < t.rating ? "h-4 w-4 fill-gold-500 text-gold-500" : "h-4 w-4 text-mist-200"}
                />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                {initials(t.name)}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-mist-500">
                  {t.role} · {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {testimonials.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-mist-400 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-beam-500" : "w-1.5 bg-mist-200"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-mist-400 hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-mist-300 bg-mist-50 p-10 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-beam-500" strokeWidth={1.75} />
      <p className="mt-4 text-balance text-lg font-medium text-ink">
        We&apos;re early — real client reviews will land here as projects wrap.
      </p>
      <p className="mt-2 text-balance text-sm leading-relaxed text-mist-600">
        We&apos;d rather show you nothing than a fake quote. In the meantime,
        the numbers above are real, and pulled from live campaigns.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {stats.slice(0, 2).map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-xl font-semibold text-ink">{stat.value}</p>
            <p className="text-xs text-mist-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <Button href="/contact" variant="secondary" size="sm" className="mt-6">
        Be one of our first case studies
      </Button>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-paper py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="What it's like to work with us."
          align="center"
          className="mx-auto"
        />
        <div className="mt-14">
          {testimonials.length > 0 ? <Carousel /> : <EmptyState />}
        </div>
      </Container>
    </section>
  );
}
