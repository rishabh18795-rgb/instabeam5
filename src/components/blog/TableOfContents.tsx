"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "@/lib/blog/utils";

export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-400">
        On this page
      </p>
      <ul className="mt-4 space-y-1 border-l border-mist-200">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block border-l-2 py-1.5 text-sm leading-snug transition-colors ${
                item.level === 3 ? "pl-8" : "pl-4"
              } ${
                activeId === item.id
                  ? "border-beam-500 font-medium text-ink"
                  : "border-transparent text-mist-500 hover:text-ink"
              }`}
              style={{ marginLeft: "-1px" }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
