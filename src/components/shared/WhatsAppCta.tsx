"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** "Chat on WhatsApp" CTA shown after a successful form submission, with
 * a prefilled message so the visitor doesn't have to type anything. */
export function WhatsAppCta({ message, className }: { message: string; className?: string }) {
  const href = siteConfig.whatsapp.hrefWithMessage(message);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(37,211,102,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={2} />
      Chat on WhatsApp
    </a>
  );
}
