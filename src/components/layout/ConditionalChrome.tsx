"use client";

import { usePathname } from "next/navigation";

/** Internal tools. Pages under these prefixes render customer and
 * employee data, so they get none of the public site's chrome and — more
 * importantly — none of its advertising/analytics scripts. */
const PRIVATE_PREFIXES = ["/admin", "/ops"];

export function isPrivatePath(pathname: string | null) {
  if (!pathname) return false;
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Renders its children on public pages only. Used in the root layout to
 * withhold the Navbar/Footer *and* every third-party script (AdSense, GTM,
 * Meta Pixel, consent banner) from /admin and /ops. `usePathname` resolves
 * during server rendering too, so these never reach the HTML of a private
 * page at all — they are not merely hidden after hydration. */
export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPrivatePath(pathname)) return null;
  return <>{children}</>;
}
