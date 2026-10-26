export type Part = { type: "text"; text: string } | { type: "link"; text: string; href: string };

/** Splits plain text into text and http(s) link parts. Never produces HTML. */
export function linkify(input: string): Part[] {
  const parts: Part[] = [];
  const re = /https?:\/\/[^\s<>"']+/gi;
  let last = 0;
  for (const m of input.matchAll(re)) {
    const start = m.index ?? 0;
    let url = m[0];
    // trailing punctuation belongs to the sentence, not the link
    const trail = url.match(/[.,;:!?)\]]+$/)?.[0] ?? "";
    url = url.slice(0, url.length - trail.length);
    let href: string | null = null;
    try { const u = new URL(url); if (u.protocol === "http:" || u.protocol === "https:") href = u.toString(); } catch { /* not a URL */ }
    if (!href) continue;
    if (start > last) parts.push({ type: "text", text: input.slice(last, start) });
    parts.push({ type: "link", text: url, href });
    last = start + url.length;
  }
  if (last < input.length) parts.push({ type: "text", text: input.slice(last) });
  return parts;
}
