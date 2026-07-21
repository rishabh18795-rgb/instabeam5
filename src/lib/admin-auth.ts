// Signed-cookie session for /admin — no external auth provider. Uses Web
// Crypto (available in both the Node.js API routes and edge middleware)
// so a single implementation works everywhere.

export const ADMIN_SESSION_COOKIE = "instabeam_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return secret;
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison — used for the admin password check. */
export function safeEqual(a: string, b: string) {
  const bufA = new TextEncoder().encode(a);
  const bufB = new TextEncoder().encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i] ^ bufB[i];
  return diff === 0;
}

export async function createSessionToken() {
  const secret = getSecret();
  const expiry = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(secret, String(expiry));
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const secret = getSecret();
  const [expiryStr, sig] = token.split(".");
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expectedSig = await hmac(secret, expiryStr);
  return safeEqual(sig, expectedSig);
}
