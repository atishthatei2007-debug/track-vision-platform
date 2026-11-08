import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const expected = process.env.ESP32_DEVICE_SECRET;
  const supplied = req.headers.get("x-device-secret");
  if (!expected || !supplied || supplied !== expected)
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.from("runs")
      .select("id,team_id,started_at,status")
      .eq("status", "running")
      .order("started_at", { ascending: false })
      .limit(1).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ active_run: data ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server configuration error" }, { status: 503 });
  }
}