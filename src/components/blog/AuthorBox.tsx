import { author } from "@/lib/blog/types";
import { siteConfig } from "@/lib/site-config";

export function AuthorBox() {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-mist-200 bg-mist-50/60 p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-paper">
        {initials}
      </div>
      <div>
        <p className="font-semibold text-ink">{author.name}</p>
        <p className="text-sm text-mist-500">{author.role}</p>
        <p className="mt-2 text-sm leading-relaxed text-mist-600">{author.bio}</p>
        <a
          href={siteConfig.whatsapp.hrefWithMessage("Hi! I read your blog and wanted to ask about InstaBeam.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-beam-600 hover:text-beam-700"
        >
          Message on WhatsApp →
        </a>
      </div>
    </div>
  );
}
