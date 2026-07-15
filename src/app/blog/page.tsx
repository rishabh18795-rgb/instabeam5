import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { GridPattern } from "@/components/graphics/GridPattern";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { NewsletterBox } from "@/components/blog/NewsletterBox";
import { getAllPosts } from "@/lib/blog/utils";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical, no-fluff writing on Meta Ads, Google Ads, WhatsApp automation, Shopify, tracking, and GA4 — from the team that runs InstaBeam's client accounts day to day.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  openGraph: {
    title: `Blog — ${siteConfig.name}`,
    description:
      "Practical, no-fluff writing on Meta Ads, Google Ads, WhatsApp automation, Shopify, tracking, and GA4.",
    url: `${siteConfig.url}/blog`,
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-24">
        <GridPattern tone="dark" className="opacity-50" />
        <Container className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-beam-300">
            The InstaBeam Blog
          </p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Practical growth writing, not agency filler.
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-mist-300">
            Everything here is written from work we actually do for clients —
            ad account structure, tracking fixes, WhatsApp flows, Shopify
            launches. No fabricated case studies, no recycled listicles.
          </p>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container>
          <BlogSearch posts={posts} />
        </Container>
      </section>

      <section className="bg-mist-50 py-16 sm:py-20">
        <Container className="max-w-2xl">
          <NewsletterBox />
        </Container>
      </section>
    </>
  );
}
