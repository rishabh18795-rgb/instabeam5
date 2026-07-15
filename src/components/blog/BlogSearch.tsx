"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { BlogCategory, BlogPost } from "@/lib/blog/types";
import { categoryLabels } from "@/lib/blog/types";
import { PostCard } from "@/components/blog/PostCard";

export function BlogSearch({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<BlogCategory | "all">("all");

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = category === "all" || post.category === category;
      const matchesQuery =
        query.trim() === "" ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-full border border-mist-200 bg-paper py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-beam-300"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              category === "all"
                ? "bg-ink text-paper"
                : "bg-mist-100 text-mist-600 hover:bg-mist-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                category === cat
                  ? "bg-ink text-paper"
                  : "bg-mist-100 text-mist-600 hover:bg-mist-200"
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-mist-500">
          No articles match &ldquo;{query}&rdquo;. Try a different search or category.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {filtered.map((post, i) => (
            <PostCard key={post.slug} post={post} featured={i === 0 && category === "all" && query === ""} />
          ))}
        </div>
      )}
    </div>
  );
}
