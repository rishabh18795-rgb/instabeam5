import { ALLOWED_FILE_TYPES, MAX_UPLOAD_BYTES } from "./constants";

export const extOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

/** Shared by the browser (fast feedback) and the server action (the check that counts). */
export function validateFileMeta(name: string, size: number, mime: string): string | null {
  const ext = extOf(name);
  const allowed = ALLOWED_FILE_TYPES[ext];
  if (!allowed) return `.${ext || "?"} files aren't supported. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(", ")}.`;
  if (!allowed.includes(mime)) return `That file's type doesn't match its .${ext} extension.`;
  if (size <= 0) return "That file is empty.";
  if (size > MAX_UPLOAD_BYTES) return `Files can be at most ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`;
  return null;
}

/** Storage-safe file name: no path separators, control characters or leading dots. */
export function safeFileName(name: string): string {
  const cleaned = name.normalize("NFKC").replace(/[\\/\u0000-\u001f\u007f]/g, "_").replace(/[^\w.\- ()]/g, "_").replace(/^\.+/, "").trim();
  return cleaned.slice(-120) || "file";
}

/** Magic-number check so a renamed executable can't masquerade as a document. */
export function matchesMagic(ext: string, head: Uint8Array): boolean {
  const starts = (...b: number[]) => b.every((v, i) => head[i] === v);
  switch (ext) {
    case "pdf": return starts(0x25, 0x50, 0x44, 0x46); // %PDF
    case "png": return starts(0x89, 0x50, 0x4e, 0x47);
    case "jpg": case "jpeg": return starts(0xff, 0xd8, 0xff);
    case "zip": case "docx": case "xlsx": case "pptx": return starts(0x50, 0x4b); // PK
    case "csv": return !head.includes(0); // text: no NUL bytes
    default: return false;
  }
}
