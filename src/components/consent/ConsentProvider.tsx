"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  consentStateToGtagConsent,
  DEFAULT_CONSENT,
  readStoredConsent,
  writeStoredConsent,
  type ConsentState,
} from "@/lib/consent";

function pushConsentUpdate(state: ConsentState) {
  // @next/third-parties already declares window.dataLayer globally
  // (as Object[]) — reuse it rather than re-declaring with a
  // conflicting element type.
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  dataLayer.push(["consent", "update", consentStateToGtagConsent(state)]);
}

type ConsentContextValue = {
  /** null while still checking for a stored decision on first mount. */
  consent: ConsentState | null;
  bannerVisible: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (state: ConsentState) => void;
  openPreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setConsent(stored);
      setBannerVisible(false);
    } else {
      setConsent(DEFAULT_CONSENT);
      setBannerVisible(true);
    }
  }, []);

  const savePreferences = useCallback((state: ConsentState) => {
    setConsent(state);
    writeStoredConsent(state);
    pushConsentUpdate(state);
    setBannerVisible(false);
  }, []);

  const acceptAll = useCallback(
    () => savePreferences({ analytics: true, advertising: true }),
    [savePreferences]
  );
  const rejectAll = useCallback(
    () => savePreferences({ analytics: false, advertising: false }),
    [savePreferences]
  );
  const openPreferences = useCallback(() => setBannerVisible(true), []);

  return (
    <ConsentContext.Provider
      value={{ consent, bannerVisible, acceptAll, rejectAll, savePreferences, openPreferences }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
