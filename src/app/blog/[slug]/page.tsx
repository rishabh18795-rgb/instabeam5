import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BlogContent } from "@/components/blog/BlogContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { SocialFollowBar } from "@/components/blog/SocialFollowBar";
import { AuthorBox } from "@/components/blog/AuthorBox";
import { NewsletterBox } from "@/components/blog/NewsletterBox";
import { PostCard } from "@/components/blog/PostCard";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { categoryLabels } from "@/lib/blog/types";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  readingTime,
  tableOfContents,
  formatDate,
} from "@/lib/blog/utils";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.publishedAt,
      authors: [siteConfig.founder],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const toc = tableOfContents(post);
  if (post.faqs && post.faqs.length > 0) {
    toc.push({ id: "faqs", text: "FAQs", level: 2 });
  }
  const related = getRelatedPosts(post);
  const url = `${siteConfig.url}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: siteConfig.founder },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faqJsonLd =
    post.faqs && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article>
        <section className="border-b border-mist-100 bg-paper pb-12 pt-16 sm:pt-20">
          <Container className="max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-mist-500 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to blog
            </Link>

            <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-beam-600">
              <span>{categoryLabels[post.category]}</span>
              <span className="h-1 w-1 rounded-full bg-mist-300" />
              <span className="flex items-center gap-1 text-mist-400">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {readingTime(post)} min read
              </span>
              <span className="h-1 w-1 rounded-full bg-mist-300" />
              <span className="text-mist-400">{formatDate(post.publishedAt)}</span>
            </div>

            <h1 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-balance text-lg leading-relaxed text-mist-600">
              {post.excerpt}
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-mist-100 pt-6">
              <span className="text-sm text-mist-500">By {siteConfig.founder}</span>
              <SocialFollowBar title={post.title} slug={post.slug} />
            </div>
          </Container>
        </section>

        <section className="bg-paper py-12 sm:py-16">
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_220px]">
              <div className="max-w-3xl">
                <BlogContent blocks={post.content} />

                {post.faqs && post.faqs.length > 0 && (
                  <div id="faqs" className="scroll-mt-28 pt-10">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                      Frequently asked questions
                    </h2>
                    <div className="mt-6">
                      <FaqAccordion items={post.faqs} />
                    </div>
                  </div>
                )}

                <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl border border-mist-200 bg-mist-50 p-8 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight text-ink">
                      Want this fixed on your own funnel?
                    </p>
                    <p className="mt-1 text-sm text-mist-600">
                      Get a free, no-obligation audit of your ads, tracking, and site.
                    </p>
                  </div>
                  <Button href="/contact" variant="gradient" className="w-full sm:w-auto shrink-0">
                    Book a Free Audit
                  </Button>
                </div>

                <div className="mt-10 border-t border-mist-100 pt-8">
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>

                <div className="mt-10">
                  <AuthorBox />
                </div>
              </div>

              <aside className="hidden lg:block">
                <TableOfContents items={toc} />
              </aside>
            </div>
          </Container>
        </section>

        <section className="bg-mist-50 py-16 sm:py-20">
          <Container className="max-w-2xl">
            <NewsletterBox />
          </Container>
        </section>

        {related.length > 0 && (
          <section className="bg-paper py-16 sm:py-20">
            <Container>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Related reading
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </Container>
          </section>
        )}
      </article>
    </>
  );
}
