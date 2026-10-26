"use client";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { getDownloadUrl } from "@/lib/ops/actions/files";
import { useToast } from "./Toast";

/** Asks the server for a 60-second signed URL (authorised by RLS) and starts the download. */
export function FileDownloadButton({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  return (
    <button className="ops-btn ops-btn-ghost ops-btn-icon ops-btn-sm" aria-label={`Download ${name}`} disabled={busy}
      onClick={async () => {
        setBusy(true);
        const r = await getDownloadUrl(id);
        setBusy(false);
        if (r.ok && r.data) window.location.assign(r.data.url); else toast.error(r.ok ? "Couldn't download." : r.error);
      }}>
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
    </button>
  );
}
