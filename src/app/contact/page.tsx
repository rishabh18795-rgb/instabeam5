import type { Metadata } from "next";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { GridPattern } from "@/components/graphics/GridPattern";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free funnel audit with InstaBeam. Tell us about your site, ads, and tracking — we'll reply within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
        <GridPattern tone="dark" className="opacity-50" />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
            Get in touch
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Let&apos;s see what&apos;s leaking in your funnel.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            Send us your site or store and a few details below — we&apos;ll
            send back a free audit covering tracking, ads, and where
            you&apos;re losing customers before checkout.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-8">
              <div className="rounded-2xl border border-mist-200 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mist-50 text-beam-600">
                    <Mail className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold text-ink">Email</p>
                </div>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="mt-3 block text-[15px] text-mist-600 hover:text-ink"
                >
                  {siteConfig.email}
                </a>
              </div>

              <div className="rounded-2xl border border-mist-200 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mist-50 text-beam-600">
                    <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold text-ink">WhatsApp</p>
                </div>
                <a
                  href={siteConfig.whatsapp.hrefWithMessage(
                    "Hi Instabeam, I'd like to talk through a project"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-[15px] text-mist-600 hover:text-ink"
                >
                  {siteConfig.whatsapp.number}
                </a>
              </div>

              <div className="rounded-2xl border border-mist-200 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mist-50 text-beam-600">
                    <Clock className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold text-ink">Response time</p>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-mist-600">
                  We reply to every enquiry within one business day —
                  usually faster on WhatsApp.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-mist-200 bg-mist-50 p-6 sm:p-10">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
