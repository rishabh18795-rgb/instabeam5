import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { ToastProvider } from "@/components/ops/Toast";
import "./ops.css";

export const metadata: Metadata = {
  title: { default: "InstaBeam Workspace", template: "%s · InstaBeam Workspace" },
  description: "Private workspace for the InstaBeam co-founders.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};
export const viewport: Viewport = { themeColor: "#08090b", width: "device-width", initialScale: 1 };

// Run the workspace's server functions next to its database (Supabase project is in
// Tokyo, ap-northeast-1). Measured from Vercel's default iad1 region, one database round
// trip cost 240-690 ms and every page needs at least two; co-locating removes that.
// Scoped to /ops only — the public site's functions keep the project's default region.
export const preferredRegion = "hnd1";

// Dynamic by design: the theme comes from a cookie, and everything under
// /ops is per-user. None of this touches the public pages' static output.
export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("ops-theme")?.value;
  const t = theme === "light" || theme === "system" ? theme : "dark";
  return (
    <div className="ops-root" data-theme={t}>
      <ToastProvider>{children}</ToastProvider>
    </div>
  );
}
