import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteLead, leadStatuses, listLeads, updateLead } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;
    const status = (searchParams.get("status") as never) ?? "all";
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const pageSize = Math.min(Number(searchParams.get("pageSize") ?? "20") || 20, 100);

    const { leads, total } = await listLeads({ q, status, page, pageSize });
    return NextResponse.json({ ok: true, leads, total, page, pageSize });
  } catch (error) {
    console.error("[admin/leads] GET failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not load leads. Is Supabase configured?" },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(leadStatuses as [string, ...string[]]).optional(),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(request: Request) {
  try {
    const body = patchSchema.parse(await request.json());
    const { id, ...patch } = body;
    const lead = await updateLead(id, patch as never);
    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }
    console.error("[admin/leads] PATCH failed:", error);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}

const deleteSchema = z.object({ id: z.string().uuid() });

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { id } = deleteSchema.parse({ id: searchParams.get("id") });
    await deleteLead(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }
    console.error("[admin/leads] DELETE failed:", error);
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
