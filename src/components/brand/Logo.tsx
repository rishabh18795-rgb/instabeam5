import { cn } from "@/lib/utils";

/**
 * InstaBeam brand mark.
 *
 * The mark is two beams converging from a wide signal into a single point —
 * "one signal, full funnel" made literal. It's drawn as live SVG (not a
 * raster asset) so it stays perfectly crisp at any size and can be
 * recoloured or animated with CSS/Framer Motion.
 *
 * Static exports of the same mark live in /public/logo for favicons,
 * social cards, and anywhere a flat file is required — see
 * /docs/brand-guidelines.md.
 */

const gradientId = "instabeam-beam-gradient";

function BeamMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="10" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--color-beam-400)" />
          <stop offset="100%" stopColor="var(--color-gold-500)" />
        </linearGradient>
      </defs>
      <path
        d="M12 13 L32 49 L52 13"
        stroke={`url(#${gradientId})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="32" cy="49.5" r="4.5" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return <BeamMark className={className} />;
}

export function LogoWordmark({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "paper";
}) {
  return (
    <span
      className={cn(
        "font-display text-xl font-semibold tracking-tight lowercase",
        tone === "ink" ? "text-ink" : "text-paper",
        className
      )}
    >
      instabeam
    </span>
  );
}

export function Logo({
  className,
  tone = "ink",
  markClassName,
}: {
  className?: string;
  tone?: "ink" | "paper";
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-7 w-7", markClassName)} />
      <LogoWordmark tone={tone} />
    </span>
  );
}
