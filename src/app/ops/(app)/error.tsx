"use client";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";

// Catches a failed page load without taking down the sidebar, and says so — errors
// are surfaced (and logged with Next's digest for the server logs), never swallowed.
export default function WorkspaceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[workspace] page failed to load", error.digest ?? "", error.message); }, [error]);
  return (
    <div className="ops-card mx-auto mt-10 max-w-md p-8 text-center" role="alert">
      <p className="ops-h2">This page couldn&apos;t load</p>
      <p className="ops-muted mt-2 text-[13.5px]">Something went wrong on our side. Your other pages are unaffected.</p>
      {error.digest && <p className="ops-faint mt-2 text-[11.5px]">Reference: {error.digest}</p>}
      <button className="ops-btn ops-btn-primary mt-5" onClick={reset}><RotateCw size={15} /> Try again</button>
    </div>
  );
}
