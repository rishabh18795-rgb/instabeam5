import type { BlogPost, ContentBlock } from "./types";
import { posts } from "./posts";

const WORDS_PER_MINUTE = 200;

function blockWordCount(block: ContentBlock): number {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
    case "quote":
    case "callout":
      return block.text.trim().split(/\s+/).filter(Boolean).length;
    case "ul":
    case "ol":
      return block.items.reduce(
        (sum, item) => sum + item.trim().split(/\s+/).filter(Boolean).length,
        0
      );
    case "links":
      return 0;
  }
}

export function readingTime(post: BlogPost): number {
  const words = post.content.reduce((sum, block) => sum + blockWordCount(block), 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export function tableOfContents(post: BlogPost): TocEntry[] {
  return post.content
    .filter((b): b is Extract<ContentBlock, { type: "h2" | "h3" }> => b.type === "h2" || b.type === "h3")
    .map((b) => ({ id: b.id, text: b.text, level: b.type === "h2" ? 2 : 3 }));
}

export function getAllPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const sameCategory = posts.filter((p) => p.slug !== post.slug && p.category === post.category);
  const rest = posts.filter(
    (p) => p.slug !== post.slug && p.category !== post.category
  );
  return [...sameCategory, ...rest].slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Where to insert Display Ads inside an article's blocks — one around
 * 30–40% through, and (only for long enough posts) one right before the
 * final section. Skipped entirely for short posts. Insertion points are
 * always pushed forward until the block right before them isn't a
 * heading, so an ad never gets sandwiched directly under a heading with
 * no content yet under it.
 */
export function getAdInsertionIndices(blocks: ContentBlock[]): number[] {
  const total = blocks.length;
  if (total < 8) return [];

  const isHeading = (b: ContentBlock) => b.type === "h2" || b.type === "h3";
  const nextSafeIndex = (from: number) => {
    let i = Math.min(Math.max(from, 1), total);
    while (i < total && isHeading(blocks[i - 1])) i++;
    return i;
  };

  const indices: number[] = [];
  const firstIndex = nextSafeIndex(Math.round(total * 0.35));
  if (firstIndex < total) indices.push(firstIndex);

  if (total >= 14) {
    const lastH2Index = blocks.reduce(
      (acc, b, i) => (b.type === "h2" ? i : acc),
      -1
    );
    if (lastH2Index > firstIndex + 2) {
      indices.push(lastH2Index);
    }
  }

  return indices;
}
