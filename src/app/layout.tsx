import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ConditionalChrome } from "@/components/layout/ConditionalChrome";
import { ToastProvider } from "@/components/ui/Toast";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { CONSENT_COOKIE_NAME } from "@/lib/consent";
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

// Public by design — GA4's client-side Measurement ID is meant to be
// exposed in the page (unlike the service-role/secret keys elsewhere in
// this project). Rendering the component is skipped entirely when unset
// so local dev and preview builds without a real ID stay clean.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {/* @next/third-parties handles the gtag.js script, correct
            loading strategy, and — via GA4 Enhanced Measurement's
            History API listener — automatic page_view on client-side
            App Router navigation, with no manual dataLayer/router-event
            wiring needed and no risk of a duplicate page_view. Consent
            Mode v2 defaults are already set above before this ever
            loads, so GA4 automatically respects analytics_storage. */}
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  );
}
