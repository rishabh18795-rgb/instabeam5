import { listAllLeads, type Lead } from "@/lib/supabase";

export const runtime = "nodejs";

const COLUMNS: (keyof Lead)[] = [
  "created_at",
  "name",
  "company",
  "website",
  "email",
  "phone",
  "budget",
  "status",
  "source",
  "page",
  "message",
  "notes",
  "ip",
  "user_agent",
];

function csvCell(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const status = (searchParams.get("status") as never) ?? "all";

    const leads = await listAllLeads({ q, status });
    const rows = [
      COLUMNS.join(","),
      ...leads.map((lead) => COLUMNS.map((col) => csvCell(lead[col])).join(",")),
    ];
    const csv = rows.join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="instabeam-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("[admin/leads/export] failed:", error);
    return new Response("Export failed.", { status: 500 });
  }
}
