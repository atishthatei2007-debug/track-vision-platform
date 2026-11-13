import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as Blob | null;
    const runId = formData.get("run_id") as string | null;
    const teamCode = formData.get("team_code") as string | null;

    if (!file || !runId) {
      return NextResponse.json({ error: "video file and run_id are required" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${teamCode || "run"}_${runId}.webm`;
    const storagePath = `recordings/${fileName}`;

    const db = getSupabaseAdmin();

    // 1. Upload video to public race-recordings bucket
    const { data: uploadData, error: uploadErr } = await db.storage
      .from("race-recordings")
      .upload(storagePath, buffer, {
        contentType: file.type || "video/webm",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    // 2. Generate permanent public URL
    const { data: { publicUrl } } = db.storage
      .from("race-recordings")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      ok: true,
      publicUrl,
      fileName,
      storagePath,
    });
  } catch (e) {
    console.error("Upload handler error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db.storage.from("race-recordings").list("recordings", {
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const recordings = (data || []).map((item) => {
      const { data: { publicUrl } } = db.storage.from("race-recordings").getPublicUrl(`recordings/${item.name}`);
      return {
        name: item.name,
        created_at: item.created_at,
        size: item.metadata?.size,
        publicUrl,
      };
    });

    return NextResponse.json({ recordings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to list recordings" }, { status: 500 });
  }
}
