import "server-only";
import type { ZodError } from "zod";

export type Result<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

export const ok = <T = undefined>(data?: T, message?: string): Result<T> => ({ ok: true, data, message });
export const fail = (error: string): Result<never> => ({ ok: false, error });

export function zodMessage(e: ZodError): string {
  const i = e.issues[0];
  return i ? i.message : "Please check the form and try again.";
}

/** Turn a Postgres/PostgREST error into something a person can act on, without leaking internals. */
export function dbError(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return "Something went wrong.";
  const msg = error.message ?? "";
  if (error.code === "42501" || /row-level security|permission denied/i.test(msg)) return "You don't have permission to do that.";
  if (/locked/i.test(msg)) return "Completed tasks are locked. Reopen the task to edit it.";
  if (error.code === "23514") return "One of the values isn't allowed. Please check the form.";
  if (error.code === "23503") return "That item is linked to something that no longer exists.";
  if (error.code === "23505") return "That already exists.";
  if (error.code === "P0002") return "That item no longer exists.";
  console.error("[workspace] database error", error.code, msg); // no row data is logged
  return "Couldn't save that. Please try again.";
}

/** Empty string -> null, trimmed. */
export const nullable = (v: unknown) => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
};
