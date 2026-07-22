"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Same publisher ID as the global AdSense loader script in
// src/app/layout.tsx — this component never loads adsbygoogle.js
// itself, it only registers an ad unit against the script that's
// already on the page.
const ADSENSE_CLIENT = "ca-pub-4114058216046667";

type DisplayAdProps = {
  /** Defaults to the one Display Ad unit currently configured
   * (7121833731) — overridable if a second ad unit is ever added. */
  slot?: string;
  className?: string;
  /** Small "Advertisement" label above the unit — off by default only
   * makes sense if a caller already renders its own label nearby. */
  label?: boolean;
};

/**
 * Reusable Google AdSense Display Ad unit. Reserves layout space up
 * front (no CLS once the ad resolves) and only calls
 * adsbygoogle.push() once the unit scrolls near the viewport, so ads
 * placed deep in long articles or pages don't fire before anyone
 * scrolls that far. Each mounted instance initializes exactly once —
 * navigating between pages naturally remounts a fresh instance with
 * its own guard, so this is safe across client-side route changes.
 */
export function DisplayAd({ slot = "7121833731", className, label = true }: DisplayAdProps) {
  const insRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || initialized.current) return;
        initialized.current = true;
        observer.disconnect();
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
          console.error("[DisplayAd] adsbygoogle push failed:", err);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      {label && (
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-mist-400">
          Advertisement
        </p>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        suppressHydrationWarning
      />
    </div>
  );
}
