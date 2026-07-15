"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/**
 * Counts up from 0 to the numeric portion of `value` when it scrolls
 * into view, preserving whatever prefix/suffix/decimal formatting the
 * source string already has — "2,350+", "15.69x", "7.32%", "₹3.85L" all
 * parse and re-render correctly without per-stat configuration.
 */
function parseStat(value: string) {
  const match = value.match(/^([^\d]*)([\d,]+\.?\d*)([^\d]*)$/);
  if (!match) return null;
  const [, prefix, numberStr, suffix] = match;
  const decimals = numberStr.includes(".") ? numberStr.split(".")[1].length : 0;
  const target = parseFloat(numberStr.replace(/,/g, ""));
  const useGrouping = numberStr.includes(",");
  if (Number.isNaN(target)) return null;
  return { prefix, suffix, decimals, target, useGrouping };
}

export function AnimatedCounter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const parsed = parseStat(value);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);

  useEffect(() => {
    if (!isInView || !parsed) return;
    const controls = animate(0, parsed.target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const formatted = parsed.useGrouping
          ? latest.toLocaleString("en-IN", {
              minimumFractionDigits: parsed.decimals,
              maximumFractionDigits: parsed.decimals,
            })
          : latest.toFixed(parsed.decimals);
        setDisplay(`${parsed.prefix}${formatted}${parsed.suffix}`);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
