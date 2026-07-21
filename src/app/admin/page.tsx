"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  LogOut,
  Search,
  Trash2,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { Lead, LeadStatus } from "@/lib/supabase";
import { leadStatuses } from "@/lib/supabase";

const PAGE_SIZE = 20;

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-beam-100 text-beam-700 border-beam-200",
  Contacted: "bg-amber-100 text-amber-700 border-amber-200",
  Qualified: "bg-violet-100 text-violet-700 border-violet-200",
  Won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Lost: "bg-mist-200 text-mist-600 border-mist-300",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQ, status]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        status,
      });
      if (debouncedQ) params.set("q", debouncedQ);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Failed to load leads.");
      setLeads(json.leads);
      setTotal(json.total);
    } catch (err) {
      toast.show("error", err instanceof Error ? err.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ, status, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateStatus = async (lead: Lead, newStatus: LeadStatus) => {
    const prev = leads;
    setLeads((current) =>
      current.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l))
    );
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Update failed.");
      toast.show("success", `Status updated to ${newStatus}.`);
    } catch (err) {
      setLeads(prev);
      toast.show("error", err instanceof Error ? err.message : "Update failed.");
    }
  };

  const openNotes = (lead: Lead) => {
    setNotesLead(lead);
    setNotesValue(lead.notes ?? "");
  };

  const saveNotes = async () => {
    if (!notesLead) return;
    setSavingNotes(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notesLead.id, notes: notesValue }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Save failed.");
      setLeads((current) =>
        current.map((l) => (l.id === notesLead.id ? { ...l, notes: notesValue } : l))
      );
      toast.show("success", "Notes saved.");
      setNotesLead(null);
    } catch (err) {
      toast.show("error", err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingNotes(false);
    }
  };

  const deleteLead = async (lead: Lead) => {
    if (!confirm(`Delete the lead from ${lead.name}? This can't be undone.`)) return;
    const prev = leads;
    setLeads((current) => current.filter((l) => l.id !== lead.id));
    try {
      const res = await fetch(`/api/admin/leads?id=${lead.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Delete failed.");
      toast.show("success", "Lead deleted.");
      setTotal((t) => t - 1);
    } catch (err) {
      setLeads(prev);
      toast.show("error", err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const exportCsv = () => {
    const params = new URLSearchParams({ status });
    if (debouncedQ) params.set("q", debouncedQ);
    window.location.href = `/api/admin/leads/export?${params.toString()}`;
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-mist-50">
      <header className="border-b border-mist-200 bg-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">InstaBeam Leads</h1>
            <p className="text-sm text-mist-500">{total} total enquiries</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-mist-200 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company, phone, website..."
              className="w-full rounded-xl border border-mist-200 bg-paper py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-mist-400 outline-none focus:border-beam-500 focus:ring-2 focus:ring-beam-100"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | "all")}
            className="rounded-xl border border-mist-200 bg-paper px-3.5 py-2.5 text-sm text-ink outline-none focus:border-beam-500 focus:ring-2 focus:ring-beam-100"
          >
            <option value="all">All statuses</option>
            {leadStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-mist-200 bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-beam-400 hover:bg-mist-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-mist-200 bg-paper">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-mist-200 text-xs uppercase tracking-wide text-mist-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-mist-400">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-mist-400">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-mist-100 last:border-0 hover:bg-mist-50">
                    <td className="whitespace-nowrap px-4 py-3 text-mist-500">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{lead.name}</td>
                    <td className="px-4 py-3 text-mist-600">{lead.company || "—"}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-mist-600">
                      {lead.website || "—"}
                    </td>
                    <td className="px-4 py-3 text-mist-600">
                      <a href={`mailto:${lead.email}`} className="hover:text-beam-600">
                        {lead.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-mist-600">
                      {lead.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-mist-600">
                      {lead.budget || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead, e.target.value as LeadStatus)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium outline-none",
                          statusStyles[lead.status]
                        )}
                      >
                        {leadStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openNotes(lead)}
                          aria-label="Notes"
                          className={cn(
                            "rounded-lg p-1.5 transition-colors hover:bg-mist-100",
                            lead.notes ? "text-beam-600" : "text-mist-400"
                          )}
                        >
                          <StickyNote className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLead(lead)}
                          aria-label="Delete"
                          className="rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-mist-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-mist-200 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-mist-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {notesLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 backdrop-blur-sm"
          onClick={() => setNotesLead(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-mist-200 bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg font-semibold text-ink">
              Notes — {notesLead.name}
            </h3>
            <textarea
              autoFocus
              rows={6}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Internal notes about this lead..."
              className="mt-4 w-full resize-none rounded-xl border border-mist-200 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-beam-500 focus:ring-2 focus:ring-beam-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setNotesLead(null)}
                className="rounded-full px-4 py-2 text-sm font-medium text-mist-500 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
              >
                {savingNotes ? "Saving..." : "Save notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
