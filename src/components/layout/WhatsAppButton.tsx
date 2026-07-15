"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

/**
 * Site-wide floating WhatsApp entry point. Appears after a short scroll
 * (so it doesn't compete with the hero's own WhatsApp link) and stays
 * pinned bottom-right on every page.
 */
export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = siteConfig.whatsapp.hrefWithMessage(
    "Hi InstaBeam, I'd like to talk through a project"
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 right-5 z-40 sm:bottom-6 sm:right-6"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <AnimatePresence>
            {open && (
              <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-3 flex w-64 items-center gap-3 rounded-2xl border border-mist-200 bg-paper p-4 text-left shadow-[0_20px_40px_-12px_rgba(11,11,11,0.25)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    Chat with InstaBeam
                  </span>
                  <span className="block text-xs text-mist-500">
                    Usually replies within minutes
                  </span>
                </span>
              </motion.a>
            )}
          </AnimatePresence>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with InstaBeam on WhatsApp"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)] transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping-slow" />
            <MessageCircle className="relative h-6 w-6" strokeWidth={2} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
