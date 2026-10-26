/** Only same-site /ops paths — blocks open redirects via ?next=. */
export function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/ops";
  if (!next.startsWith("/ops") || next.startsWith("//") || next.includes("\\") || next.includes("://")) return "/ops";
  return next;
}
