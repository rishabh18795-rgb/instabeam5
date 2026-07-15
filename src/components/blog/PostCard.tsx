import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog/types";
import { categoryLabels } from "@/lib/blog/types";
import { formatDate, readingTime } from "@/lib/blog/utils";

export function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-mist-200 bg-paper p-7 transition-all duration-300 hover:-translate-y-1 hover:border-beam-300 hover:shadow-[0_20px_60px_-25px_rgba(11,11,11,0.25)] ${
        featured ? "sm:col-span-2 sm:p-9" : ""
      }`}
    >
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-beam-600">
        <span>{categoryLabels[post.category]}</span>
        <span className="h-1 w-1 rounded-full bg-mist-300" />
        <span className="flex items-center gap-1 text-mist-400">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {readingTime(post)} min read
        </span>
      </div>

      <h3
        className={`mt-4 text-balance font-display font-semibold tracking-tight text-ink transition-colors group-hover:text-beam-700 ${
          featured ? "text-2xl sm:text-3xl" : "text-xl"
        }`}
      >
        {post.title}
      </h3>

      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-mist-600">
        {post.excerpt}
      </p>

      <div className="mt-6 flex items-center justify-between border-t border-mist-100 pt-4">
        <span className="text-xs text-mist-400">{formatDate(post.publishedAt)}</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-ink transition-transform group-hover:translate-x-0.5">
          Read
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
