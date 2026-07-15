import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ContentBlock } from "@/lib/blog/types";

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

export function BlogContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="text-[17px] leading-relaxed text-mist-700">
                {block.text}
              </p>
            );
          case "h2":
            return (
              <h2
                key={i}
                id={block.id}
                className="scroll-mt-28 pt-6 font-display text-2xl font-semibold tracking-tight text-ink"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                id={block.id}
                className="scroll-mt-28 pt-2 font-display text-xl font-semibold tracking-tight text-ink"
              >
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-mist-700">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5 text-[17px] leading-relaxed text-mist-700">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-beam-400 pl-5 text-lg italic leading-relaxed text-mist-600"
              >
                {block.text}
              </blockquote>
            );
          case "callout": {
            const style = calloutStyles[block.tone];
            const Icon = style.icon;
            return (
              <div
                key={i}
                className={`flex gap-3 rounded-2xl border px-5 py-4 text-[15px] leading-relaxed ${style.className}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`} strokeWidth={1.75} />
                <span>{block.text}</span>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
