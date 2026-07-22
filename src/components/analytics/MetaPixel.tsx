"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { init, pageView, META_PIXEL_ID } from "@/lib/facebookPixel";

/**
 * Loads the Meta Pixel base code once (next/script, afterInteractive —
 * matches @next/third-parties's GoogleTagManager pattern already used
 * elsewhere in this layout), initializes it, and fires PageView on the
 * initial load plus every client-side route change.
 *
 * The bootstrap script below is Meta's own official base code
 * (unmodified, just reformatted) — it defines the fbq queueing stub
 * and loads fbevents.js itself, so this is the one and only place that
 * script gets requested from, regardless of how many times components
 * elsewhere call the exported track*() helpers.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const hasFiredInitialView = useRef(false);

  useEffect(() => {
    if (!hasFiredInitialView.current) {
      hasFiredInitialView.current = true;
      init();
      pageView();
      return;
    }
    pageView();
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <Script
      id="meta-pixel-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
`,
      }}
    />
  );
}
