import { cn } from "@/lib/utils";

/**
 * Soft, animated aurora-mesh gradient used behind hero/CTA sections.
 * Pure CSS (no images), GPU-cheap, and respects prefers-reduced-motion
 * via the global stylesheet.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div className="absolute left-1/2 top-[-20%] h-[60rem] w-[60rem] -translate-x-1/2 animate-aurora-slow rounded-full bg-[radial-gradient(circle_at_center,var(--color-beam-400)_0%,transparent_60%)] opacity-20 blur-3xl" />
      <div className="absolute right-[-10%] top-[10%] h-[40rem] w-[40rem] animate-aurora-slower rounded-full bg-[radial-gradient(circle_at_center,var(--color-gold-500)_0%,transparent_65%)] opacity-[0.15] blur-3xl" />
      <div className="absolute left-[-10%] bottom-[-10%] h-[35rem] w-[35rem] animate-aurora-slow rounded-full bg-[radial-gradient(circle_at_center,var(--color-beam-300)_0%,transparent_65%)] opacity-10 blur-3xl" />
    </div>
  );
}
