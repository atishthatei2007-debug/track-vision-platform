import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const runId = String(body?.run_id ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(runId))
    return NextResponse.json({ error: "A valid run_id is required" }, { status: 400 });
  const { data, error } = await auth.db.rpc("admin_abort_run", { p_run_id: runId, p_admin_id: auth.user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ result: data });
}