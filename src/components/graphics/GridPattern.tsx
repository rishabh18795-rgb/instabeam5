import { cn } from "@/lib/utils";

/**
 * Subtle dot/line grid used to give dark sections technical, "system"
 * texture without resorting to a stock photo. Pure SVG pattern, tiny
 * payload, infinitely scalable.
 */
export function GridPattern({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const id = "instabeam-grid-pattern";
  const stroke = tone === "dark" ? "rgba(255,255,255,0.08)" : "rgba(11,11,11,0.06)";

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke={stroke} strokeWidth="1" />
        </pattern>
        <radialGradient id={`${id}-fade`} cx="50%" cy="0%" r="75%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width="100%" height="100%" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} mask={`url(#${id}-mask)`} />
    </svg>
  );
}
