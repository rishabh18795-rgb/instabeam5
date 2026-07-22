import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon } from "@/components/blog/SocialIcons";

const INSTAGRAM_URL = "https://www.instagram.com/beam.growth/";
const LINKEDIN_URL = "https://www.linkedin.com/in/rishabh-shukla-896681a4/";

const buttonClassName =
  "flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-beam-300 hover:text-beam-600";

/**
 * Top-of-article social bar — same visual language as ShareButtons,
 * but a distinct, smaller set of links: WhatsApp shares this specific
 * article, Instagram and LinkedIn are static profile links (open in a
 * new tab), not article-share actions.
 */
export function SocialFollowBar({ title, slug }: { title: string; slug: string }) {
  const url = `${siteConfig.url}/blog/${slug}`;

  const links = [
    {
      label: "Share on WhatsApp",
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    },
    {
      label: "Follow InstaBeam on Instagram",
      icon: InstagramIcon,
      href: INSTAGRAM_URL,
    },
    {
      label: "Connect on LinkedIn",
      icon: LinkedInIcon,
      href: LINKEDIN_URL,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={buttonClassName}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
