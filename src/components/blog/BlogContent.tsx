import { cloneElement } from "react";
import Link from "next/link";
import { Info, Lightbulb, TriangleAlert, ArrowUpRight, ExternalLink } from "lucide-react";
import type { ContentBlock } from "@/lib/blog/types";
import { getAdInsertionIndices } from "@/lib/blog/utils";
import { DisplayAd } from "@/components/ads/DisplayAd";

const calloutStyles = {
  tip: {
    icon: Lightbulb,
    className: "border-beam-200 bg-beam-50 text-beam-900",
    iconClassName: "text-beam-600",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-gold-300 bg-gold-100/60 text-mist-900",
    iconClassName: "text-gold-700",
  },
  info: {
    icon: Info,
    className: "border-mist-200 bg-mist-50 text-mist-900",
    iconClassName: "text-mist-500",
  },
} as const;

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "p":
      return <p className="text-[17px] leading-relaxed text-mist-700">{block.text}</p>;
    case "h2":
      return (
        <h2
          id={block.id}
          className="scroll-mt-28 pt-6 font-display text-2xl font-semibold tracking-tight text-ink"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          id={block.id}
          className="scroll-mt-28 pt-2 font-display text-xl font-semibold tracking-tight text-ink"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-mist-700">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-5 text-[17px] leading-relaxed text-mist-700">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-beam-400 pl-5 text-lg italic leading-relaxed text-mist-600">
          {block.text}
        </blockquote>
      );
    case "callout": {
      const style = calloutStyles[block.tone];
      const Icon = style.icon;
      return (
        <div
          className={`flex gap-3 rounded-2xl border px-5 py-4 text-[15px] leading-relaxed ${style.className}`}
        >
          <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`} strokeWidth={1.75} />
          <span>{block.text}</span>
        </div>
      );
    }
    case "links":
      return (
        <div className="rounded-2xl border border-mist-200 bg-mist-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mist-500">
            {block.heading ?? "Related reading"}
          </p>
          <ul className="mt-3 space-y-2">
            {block.items.map((item) =>
              item.external ? (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[15px] font-medium text-beam-700 underline decoration-beam-200 underline-offset-2 hover:text-beam-800"
                  >
                    {item.text}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  </a>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-[15px] font-medium text-beam-700 underline decoration-beam-200 underline-offset-2 hover:text-beam-800"
                  >
                    {item.text}
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

export function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  const adIndices = new Set(getAdInsertionIndices(blocks));

  return (
    <div className="space-y-5">
      {blocks.flatMap((block, i) => {
        const nodes = [];
        if (adIndices.has(i)) {
          nodes.push(<DisplayAd key={`ad-${i}`} className="py-3" />);
        }
        const rendered = renderBlock(block);
        if (rendered) nodes.push(cloneElement(rendered, { key: i }));
        return nodes;
      })}
    </div>
  );
}
