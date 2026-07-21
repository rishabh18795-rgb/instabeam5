/** Shared request metadata captured for every lead — surfaced in
 * notification emails and stored alongside the lead in Supabase. */
export type RequestMeta = {
  ip: string;
  userAgent: string;
  sourcePage: string;
  timestamp: string;
};

export function getRequestMeta(request: Request): RequestMeta {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const sourcePage = request.headers.get("referer") ?? "unknown";
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return { ip, userAgent, sourcePage, timestamp };
}
