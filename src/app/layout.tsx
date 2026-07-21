import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ConditionalChrome } from "@/components/layout/ConditionalChrome";
import { ToastProvider } from "@/components/ui/Toast";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
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
      </body>
    </html>
  );
}
