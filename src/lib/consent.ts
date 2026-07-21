/** Google Consent Mode v2 — shared types and cookie helpers.
 *
 * Two consent categories are exposed in the UI (Analytics, Advertising);
 * they map to Google's four required signals as recommended for a
 * simple two-toggle banner: the three ad_* signals move together in
 * practice, so grouping them under one "Advertising" toggle avoids
 * asking visitors to reason about signals they can't meaningfully
 * distinguish.
 */
export type ConsentState = {
  analytics: boolean;
  advertising: boolean;
};

export const CONSENT_COOKIE_NAME = "instabeam_consent";
export const CONSENT_COOKIE_MAX_AGE_DAYS = 180;

export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  advertising: false,
};

export function consentStateToGtagConsent(state: ConsentState) {
  const granted = "granted" as const;
  const denied = "denied" as const;
  return {
    analytics_storage: state.analytics ? granted : denied,
    ad_storage: state.advertising ? granted : denied,
    ad_user_data: state.advertising ? granted : denied,
    ad_personalization: state.advertising ? granted : denied,
  };
}

/** Reads the stored consent decision from document.cookie. Returns null
 * if the visitor hasn't made a choice yet (banner should show). */
export function readStoredConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`)
  );
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (typeof parsed.analytics === "boolean" && typeof parsed.advertising === "boolean") {
      return parsed;
    }
  } catch {
    // Malformed cookie — treat as no decision made.
  }
  return null;
}

export function writeStoredConsent(state: ConsentState) {
  if (typeof document === "undefined") return;
  const maxAge = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(state)
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}
