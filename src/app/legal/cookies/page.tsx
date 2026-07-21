import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `How ${siteConfig.name} uses cookies, and how to control your preferences.`,
  alternates: { canonical: "/legal/cookies" },
  robots: { index: true, follow: true },
};

const lastUpdated = "22 July 2026";

const cookieTable = [
  {
    category: "Essential",
    always: true,
    cookies: "instabeam_consent, instabeam_admin_session",
    purpose:
      "Remembers your cookie choice, and — only for our own team logging into the admin dashboard — keeps that login session secure. Never set for regular visitors.",
  },
  {
    category: "Analytics",
    always: false,
    cookies: "_ga, _ga_N0ZSY0SPBP",
    purpose:
      "Google Analytics 4 — helps us understand how visitors use the site (pages viewed, traffic sources) in aggregate. Only set if you accept Analytics cookies.",
  },
  {
    category: "Advertising",
    always: false,
    cookies: "__gads, __gpi, IDE, and related Google advertising cookies",
    purpose:
      "Google AdSense — used to serve and measure ads, including personalized ads if you accept. Only set if you accept Advertising cookies.",
  },
];

export default function CookiePolicyPage() {
  return (
    <Container as="article" className="max-w-3xl py-20 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">Legal</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Cookie Policy
      </h1>
      <p className="mt-3 text-sm text-mist-500">Last updated: {lastUpdated}</p>

      <div className="prose-sm mt-10 space-y-8 text-[15px] leading-relaxed text-mist-700">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. What this covers</h2>
          <p className="mt-2">
            This page explains the cookies instabeam.site uses, grouped by
            category, and how to change your choice at any time. When you
            first visit, a banner asks you to accept, reject, or manage these
            categories individually — nothing beyond strictly essential
            cookies is set until you choose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Cookies we use</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-mist-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-mist-200 bg-mist-50 text-xs uppercase tracking-wide text-mist-500">
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Cookies</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {cookieTable.map((row) => (
                  <tr key={row.category} className="border-b border-mist-100 last:border-0 align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                      {row.category}
                      {row.always && (
                        <span className="mt-1 block text-[11px] font-normal text-mist-500">
                          Always on
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist-600">{row.cookies}</td>
                    <td className="px-4 py-3 text-mist-600">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-mist-500">
            Google publishes its own list of cookies used across its
            services — see{" "}
            <a
              href="https://business.safety.google/adscookies/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2"
            >
              Google&apos;s advertising cookie documentation
            </a>{" "}
            for the current, authoritative list of AdSense cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">
            3. Google Consent Mode
          </h2>
          <p className="mt-2">
            This site uses{" "}
            <a
              href="https://developers.google.com/tag-platform/security/guides/consent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2"
            >
              Google Consent Mode v2
            </a>
            . Until you accept Analytics or Advertising cookies, Google
            Analytics and AdSense operate in a restricted, non-personalized
            mode — they don&apos;t set the cookies listed above or use your
            data for personalization until you grant consent.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Changing your choice</h2>
          <p className="mt-2">
            You can change your cookie preferences at any time using the
            &quot;Cookie Preferences&quot; link in the footer of every page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Questions</h2>
          <p className="mt-2">
            Email us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-ink underline underline-offset-2">
              {siteConfig.email}
            </a>{" "}
            with any questions about this policy. See also our{" "}
            <a href="/legal/privacy" className="text-ink underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
