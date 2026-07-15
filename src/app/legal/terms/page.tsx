import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern use of ${siteConfig.name}'s website.`,
  alternates: { canonical: "/legal/terms" },
  robots: { index: true, follow: true },
};

const lastUpdated = "15 July 2026";

export default function TermsPage() {
  return (
    <Container as="article" className="max-w-3xl py-20 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
        Legal
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-mist-500">Last updated: {lastUpdated}</p>

      <div className="prose-sm mt-10 space-y-8 text-[15px] leading-relaxed text-mist-700">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Acceptance of terms</h2>
          <p className="mt-2">
            By using instabeam.site (the &quot;Site&quot;), you agree to
            these Terms of Service. If you don&apos;t agree, please don&apos;t
            use the Site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. What this site is for</h2>
          <p className="mt-2">
            This Site describes InstaBeam&apos;s services — website and
            Shopify development, Meta and Google Ads management, GA4
            tracking implementation, and WhatsApp/AI bot setup — and lets
            you get in touch with us about a project. Content is provided
            for general informational purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. Enquiries and no obligation</h2>
          <p className="mt-2">
            Submitting the contact form is an enquiry, not a binding
            agreement. Any actual engagement — scope, pricing, timelines,
            and ad-spend arrangements — is governed by a separate written
            agreement between you and InstaBeam.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Advertising spend</h2>
          <p className="mt-2">
            Where InstaBeam manages advertising campaigns on your behalf, ad
            spend always remains in your own Meta/Google ad accounts. Our
            service fee is separate from, and does not include, ad spend.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Intellectual property</h2>
          <p className="mt-2">
            The Site&apos;s design, branding, illustrations, and copy are
            owned by InstaBeam unless otherwise noted, and may not be
            reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">6. No warranty</h2>
          <p className="mt-2">
            The Site is provided &quot;as is&quot; without warranties of any
            kind. We aim to keep information accurate and the Site available,
            but don&apos;t guarantee uninterrupted access or error-free
            content.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">7. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-ink underline underline-offset-2">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
