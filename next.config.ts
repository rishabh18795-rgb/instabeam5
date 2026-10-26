import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  devIndicators: false,
  experimental: {
    // Keep a visited/prefetched workspace page in the client router cache for 30 s so a
    // repeat click or Back/Forward is instant instead of waiting on the server again.
    // Freshness is preserved: every mutating server action calls revalidatePath(), and
    // the realtime notification handler calls router.refresh(); both clear this cache.
    staleTimes: { dynamic: 30, static: 180 },
  },
  // Pins the workspace root to this repo — otherwise Next.js can infer it
  // from an unrelated lockfile higher up the local filesystem tree.
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
