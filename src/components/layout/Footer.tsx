import Link from "next/link";
import { Instagram, Linkedin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { navLinks, services, siteConfig } from "@/lib/site-config";

const socialLinks = [
  { key: "linkedin", href: siteConfig.social.linkedin, label: "LinkedIn", icon: Linkedin },
  { key: "instagram", href: siteConfig.social.instagram, label: "Instagram", icon: Instagram },
].filter((link) => link.href);

const serviceLinks = services.map((service) => ({
  label: service.label,
  href: `/services/${service.slug}`,
}));

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-mist-200 bg-mist-50">
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mist-600">
              {siteConfig.tagline} — the site, the ads, the tracking, and the
              WhatsApp layer, run by one team.
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-mist-400 hover:text-ink"
                  >
                    <link.icon className="h-4 w-4" strokeWidth={1.75} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              Services
            </p>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-mist-600 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              Company
            </p>
            <ul className="mt-4 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-mist-600 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-mist-600 transition-colors hover:text-ink"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              Get in touch
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-mist-600 transition-colors hover:text-ink"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.whatsapp.hrefWithMessage(
                    "Hi InstaBeam, I'd like to talk through a project"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-600 transition-colors hover:text-ink"
                >
                  WhatsApp us
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.whatsapp.number}`}
                  className="text-mist-600 transition-colors hover:text-ink"
                >
                  {siteConfig.whatsapp.number}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-mist-200 pt-8 sm:flex-row sm:items-center">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-xs text-mist-500">
              © {year} {siteConfig.name}. All rights reserved.
            </p>
            {(siteConfig.badges.startupIndia || siteConfig.badges.msme) && (
              <div className="flex gap-2">
                {siteConfig.badges.startupIndia && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-mist-200 px-2.5 py-1 text-[10px] font-medium text-mist-500">
                    <ShieldCheck className="h-3 w-3" /> Startup India
                  </span>
                )}
                {siteConfig.badges.msme && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-mist-200 px-2.5 py-1 text-[10px] font-medium text-mist-500">
                    <ShieldCheck className="h-3 w-3" /> MSME
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="text-xs text-mist-500 hover:text-ink">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="text-xs text-mist-500 hover:text-ink">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
