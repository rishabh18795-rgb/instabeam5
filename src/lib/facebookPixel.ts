/**
 * Meta Pixel — thin, safe wrappers around window.fbq.
 *
 * The actual fbq stub is defined by the inline bootstrap script in
 * src/components/analytics/MetaPixel.tsx (Meta's own official base
 * code, loaded via next/script). Every function here just calls into
 * that stub — nothing here loads or defines fbq itself, so this module
 * is safe to import from anywhere (forms, event handlers) without
 * risking a duplicate script load.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let initialized = false;

function callFbq(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[facebookPixel] fbq is not loaded yet — call skipped:", args);
    }
    return;
  }
  window.fbq(...args);
}

/** Registers the Pixel ID with fbq. Safe to call more than once —
 * every call after the first is a no-op, satisfying "initialize only
 * once" even if something downstream calls this again by mistake. */
export function init() {
  if (initialized) return;
  if (!META_PIXEL_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[facebookPixel] NEXT_PUBLIC_META_PIXEL_ID is not set — Meta Pixel disabled.");
    }
    return;
  }
  initialized = true;
  callFbq("init", META_PIXEL_ID);
}

/** Fires a PageView — call once on initial load and again on every
 * client-side route change (handled automatically by MetaPixel.tsx). */
export function pageView() {
  callFbq("track", "PageView");
}

/** Generic escape hatch for any standard or custom Meta Pixel event. */
export function track(event: string, data?: Record<string, unknown>) {
  callFbq("track", event, data);
}

export function trackLead(data?: Record<string, unknown>) {
  track("Lead", data);
}

export function trackContact(data?: Record<string, unknown>) {
  track("Contact", data);
}

export function trackPurchase(data: { value: number; currency: string } & Record<string, unknown>) {
  track("Purchase", data);
}

export function trackCompleteRegistration(data?: Record<string, unknown>) {
  track("CompleteRegistration", data);
}

export function trackViewContent(data?: Record<string, unknown>) {
  track("ViewContent", data);
}
