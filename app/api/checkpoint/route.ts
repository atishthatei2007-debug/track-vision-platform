import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = process.env.ESP32_DEVICE_SECRET;
  const supplied = req.headers.get("x-device-secret");
  if (!expected || !supplied || supplied !== expected)
    return NextResponse.json({ error: "Unauthorized device" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const checkpoint = Number(body?.checkpoint_no);
  const runId = String(body?.run_id ?? "");
  const deviceId = String(body?.device_id ?? "track-vision-esp32");
  if (!Number.isInteger(checkpoint) || checkpoint < 1 || checkpoint > 4)
    return NextResponse.json({ error: "checkpoint_no must be an integer from 1 to 4" }, { status: 400 });
  if (!/^[0-9a-f-]{36}$/i.test(runId))
    return NextResponse.json({ error: "A valid run_id is required" }, { status: 400 });

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.rpc("record_checkpoint", {
      p_run_id: runId, p_checkpoint_no: checkpoint, p_device_id: deviceId
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ ok: true, result: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server configuration error" }, { status: 503 });
  }
}