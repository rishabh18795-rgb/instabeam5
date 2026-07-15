import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { WhySection } from "@/components/home/WhySection";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ProcessSteps } from "@/components/home/ProcessSteps";
import { StatsAndEbook } from "@/components/home/StatsAndEbook";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { faqs, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <TrustSection />
      <WhySection />
      <ServicesGrid />
      <ProcessSteps />
      <StatsAndEbook />
      <TestimonialsSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
