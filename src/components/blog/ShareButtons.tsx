"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { XIcon, LinkedInIcon, WhatsAppIcon } from "@/components/blog/SocialIcons";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.url}/blog/${slug}`;

  const links = [
    {
      label: "Share on X",
      icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on LinkedIn",
      icon: LinkedInIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      label: "Share on WhatsApp",
      icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <div className="flex items-center gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-beam-300 hover:text-beam-600"
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-mist-200 text-mist-500 transition-colors hover:border-beam-300 hover:text-beam-600"
      >
        {copied ? <Check className="h-4 w-4 text-beam-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
