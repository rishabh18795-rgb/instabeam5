import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your information.`,
  alternates: { canonical: "/legal/privacy" },
  robots: { index: true, follow: true },
};

const lastUpdated = "15 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <Container as="article" className="max-w-3xl py-20 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
        Legal
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-mist-500">Last updated: {lastUpdated}</p>

      <div className="prose-sm mt-10 space-y-8 text-[15px] leading-relaxed text-mist-700">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink">1. Who we are</h2>
          <p className="mt-2">
            {siteConfig.legalName} (&quot;InstaBeam&quot;, &quot;we&quot;, &quot;us&quot;) operates
            instabeam.site. This policy explains what information we collect
            through this website, why we collect it, and how you can control
            it. If you have questions, email us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-ink underline underline-offset-2">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">2. Information we collect</h2>
          <p className="mt-2">When you submit our contact/enquiry form, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your name and email address</li>
            <li>Your phone number, if you choose to provide it</li>
            <li>Your company name, if you choose to provide it</li>
            <li>The service you&apos;re enquiring about and the message you send us</li>
          </ul>
          <p className="mt-2">
            We also collect standard technical data (such as IP address and
            browser type) automatically for security and rate-limiting
            purposes when you submit a form.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">3. How we use it</h2>
          <p className="mt-2">We use the information you submit to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Respond to your enquiry and follow up about a potential project</li>
            <li>Send you a one-time confirmation email acknowledging your message</li>
            <li>Maintain a record of enquiries so our team can track and prioritise leads</li>
          </ul>
          <p className="mt-2">We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">4. Third-party processors</h2>
          <p className="mt-2">
            We use Resend to deliver transactional emails (enquiry
            notifications and confirmations) and Vercel to host this website.
            Both process data solely on our behalf to provide these services.
            From Phase 3 onward, enquiry data is additionally stored in a
            Supabase (PostgreSQL) database that only our team can access
            through the Admin Portal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">5. Data retention</h2>
          <p className="mt-2">
            We retain enquiry records for as long as reasonably necessary to
            respond to you and maintain business records, or until you ask us
            to delete them.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">6. Your rights</h2>
          <p className="mt-2">
            You can ask us to access, correct, or delete the personal
            information we hold about you at any time by emailing{" "}
            <a href={`mailto:${siteConfig.email}`} className="text-ink underline underline-offset-2">
              {siteConfig.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">7. Cookies</h2>
          <p className="mt-2">
            We use analytics and advertising cookies, subject to your
            consent — see our{" "}
            <a href="/legal/cookies" className="text-ink underline underline-offset-2">
              Cookie Policy
            </a>{" "}
            for the full list and how to change your preference.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink">8. Changes to this policy</h2>
          <p className="mt-2">
            We may update this policy as the site evolves. Material changes
            will update the &quot;last updated&quot; date above.
          </p>
        </section>
      </div>
    </Container>
  );
}
