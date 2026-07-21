"use client";

import { useConsent } from "@/components/consent/ConsentProvider";

/** Small client island so Footer.tsx can stay a server component — only
 * this button needs access to the consent context. */
export function CookiePreferencesButton() {
  const { openPreferences } = useConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-xs text-mist-500 hover:text-ink"
    >
      Cookie Preferences
    </button>
  );
}
