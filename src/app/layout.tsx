import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ConditionalChrome } from "@/components/layout/ConditionalChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { CONSENT_COOKIE_NAME } from "@/lib/consent";
import { META_PIXEL_ID } from "@/lib/facebookPixel";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.founder, url: siteConfig.url }],
  creator: siteConfig.name,
  applicationName: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // Image is supplied automatically by src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    // Image is supplied automatically by src/app/opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo/mark-badge-dark.svg`,
  description: siteConfig.description,
  founder: {
    "@type": "Person",
    name: siteConfig.founder,
  },
  email: siteConfig.email,
  sameAs: [siteConfig.whatsapp.href],
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
};

// Public by design — GTM's container ID is meant to be exposed in the
// page (unlike the service-role/secret keys elsewhere in this project).
// Rendering the component is skipped entirely when unset so local dev
// and preview builds without a real ID stay clean. GA4 is no longer
// initialized directly here — it now runs as a tag inside this GTM
// container (see the migration report for the exact tags/triggers to
// create in the GTM web UI).
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Google Consent Mode v2 — sets default consent to "denied" for both
// analytics and advertising signals BEFORE the AdSense/GA4 scripts run,
// reading any prior stored decision synchronously so returning visitors
// who already chose don't get a flash of "denied" behavior. This must
// stay the literal first element in <head>: inline scripts execute
// synchronously as the parser reaches them, so placing it before the
// (async) AdSense tag guarantees this runs first regardless of how fast
// that script downloads — see the AdSense placement comment below for
// why ordering here matters.
const consentDefaultScript = `(function () {
  var COOKIE_NAME = ${JSON.stringify(CONSENT_COOKIE_NAME)};
  var state = { analytics: false, advertising: false };
  var match = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)"));
  if (match) {
    try {
      var parsed = JSON.parse(decodeURIComponent(match[1]));
      if (typeof parsed.analytics === "boolean" && typeof parsed.advertising === "boolean") {
        state = parsed;
      }
    } catch (e) {}
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.advertising ? "granted" : "denied",
    ad_user_data: state.advertising ? "granted" : "denied",
    ad_personalization: state.advertising ? "granted" : "denied"
  });
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Must stay first — see the comment on consentDefaultScript. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: consentDefaultScript }} />
        {/* Plain <script> tag, exactly as Google's AdSense snippet
            specifies — next/script adds a data-nscript attribute that
            adsbygoogle.js flags with a console warning ("head tag doesn't
            support data-nscript attribute"). `async` already makes this
            non-render-blocking without needing next/script's strategy
            prop. Nothing else React-managed lives in <head> — AdSense
            mutates its surroundings once it loads, which caused a real
            hydration mismatch when the JSON-LD script used to sit right
            next to it here (see the moved copy at the end of <body>). */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4114058216046667"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/* Required by Google's GTM install spec: a <noscript> fallback
            immediately after the opening <body> tag for visitors with
            JavaScript disabled. @next/third-parties's GoogleTagManager
            component only renders the <head> script half — this half
            has to be added separately. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {/* Meta's own official noscript fallback for the Pixel — same
            reasoning as the GTM one above. */}
        {META_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element -- 1x1 tracking beacon, not a content image; next/image doesn't apply here. */}
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <ConsentProvider>
          <ToastProvider>
            <ConditionalChrome>
              <Navbar />
            </ConditionalChrome>
            <main className="flex-1">{children}</main>
            <ConditionalChrome>
              <Footer />
              <WhatsAppButton />
            </ConditionalChrome>
          </ToastProvider>
          <CookieConsentBanner />
        </ConsentProvider>
        {/* Static, deterministic content — suppressHydrationWarning is
            safe here and guards against any future third-party script
            (AdSense or otherwise) mutating nearby <body> nodes the same
            way one did in <head>. */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {/* @next/third-parties loads gtm.js with next/script's
            "afterInteractive" strategy — it executes after hydration,
            well after the synchronous consent-default script in <head>
            has already run, so GTM's own consent-aware tag firing sees
            the correct default the moment it initializes. GA4 itself is
            no longer loaded directly here — it's configured as a tag
            inside this GTM container instead (see the migration report
            for the exact setup). */}
        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
        <MetaPixel />
      </body>
    </html>
  );
}
