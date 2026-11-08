import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim().toUpperCase();
  const name = String(body?.name ?? "").trim();
  const college = String(body?.college ?? "").trim();
  if (!code || !name) return NextResponse.json({ error: "Team code and team name are required" }, { status: 400 });
  if (code.length > 24 || name.length > 80 || college.length > 120)
    return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
  const { data, error } = await auth.db.from("teams").insert({ code, name, college }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  return NextResponse.json({ team: data }, { status: 201 });
}