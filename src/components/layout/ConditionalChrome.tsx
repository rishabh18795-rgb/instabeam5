"use client";

import { usePathname } from "next/navigation";

/** Hides the marketing Navbar/Footer/WhatsApp button on /admin — the
 * dashboard is a self-contained tool, not a marketing page. Every other
 * route renders its children exactly as before. */
export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
