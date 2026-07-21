"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useConsent } from "@/components/consent/ConsentProvider";
import type { ConsentState } from "@/lib/consent";

const toggleBase =
  "flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3";

function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <div className={toggleBase}>
      <div>
        <p className="text-sm font-medium text-paper">{label}</p>
        <p className="mt-0.5 text-xs text-mist-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-beam-400" : "bg-white/15"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function CookieConsentBanner() {
  const { consent, bannerVisible, acceptAll, rejectAll, savePreferences } = useConsent();
  const [managing, setManaging] = useState(false);
  const [draft, setDraft] = useState<ConsentState>(consent ?? { analytics: false, advertising: false });

  if (!bannerVisible) return null;

  const openManage = () => {
    setDraft(consent ?? { analytics: false, advertising: false });
    setManaging(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="false"
        className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-xl rounded-2xl border border-white/10 bg-ink/95 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-beam-400/15 text-beam-300">
            <Cookie className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-paper">We use cookies</p>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">
              We use analytics (GA4) and advertising (Google AdSense) cookies to
              understand traffic and show ads. Essential cookies are always on.
              You can change your choice anytime from the{" "}
              <span className="text-paper">footer</span>.{" "}
              <Link href="/legal/cookies" className="text-beam-300 underline hover:text-beam-200">
                Learn more
              </Link>
              .
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {managing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2.5">
                <div className={toggleBase}>
                  <div>
                    <p className="text-sm font-medium text-paper">Essential</p>
                    <p className="mt-0.5 text-xs text-mist-400">
                      Required for the site to function. Always on.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-mist-500">Always on</span>
                </div>
                <Switch
                  checked={draft.analytics}
                  onChange={(v) => setDraft((d) => ({ ...d, analytics: v }))}
                  label="Analytics"
                  description="Google Analytics 4 — helps us understand traffic and usage."
                />
                <Switch
                  checked={draft.advertising}
                  onChange={(v) => setDraft((d) => ({ ...d, advertising: v }))}
                  label="Advertising"
                  description="Google AdSense — personalized ads based on your visit."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {managing ? (
            <>
              <Button variant="gradient" size="sm" onClick={() => savePreferences(draft)}>
                Save preferences
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="border-white/15 bg-transparent text-paper hover:bg-white/5"
                onClick={() => setManaging(false)}
              >
                Back
              </Button>
            </>
          ) : (
            <>
              <Button variant="gradient" size="sm" onClick={acceptAll}>
                Accept all
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="border-white/15 bg-transparent text-paper hover:bg-white/5"
                onClick={rejectAll}
              >
                Reject non-essential
              </Button>
              <button
                type="button"
                onClick={openManage}
                className="ml-auto text-xs font-medium text-mist-400 underline hover:text-paper"
              >
                Manage preferences
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
