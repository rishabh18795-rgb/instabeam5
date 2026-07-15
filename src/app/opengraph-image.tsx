import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, generated at build/request time from brand tokens
 * (no external image asset required). Mirrors the funnel-beam mark used
 * across the site.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0B0B0B",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(0,217,255,0.25), transparent 45%), radial-gradient(circle at 85% 85%, rgba(244,180,0,0.18), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <path
              d="M12 13 L32 49 L52 13"
              stroke="#00D9FF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="49.5" r="4.5" fill="#F4B400" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#FFFFFF" }}>
            instabeam
          </span>
        </div>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          One signal. Full funnel.
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            fontSize: 26,
            color: "#BCBCC4",
            maxWidth: 820,
          }}
        >
          Websites · Ads · GA4 Tracking · WhatsApp AI Bots — one connected
          system, not four disconnected vendors.
        </div>
      </div>
    ),
    { ...size }
  );
}
