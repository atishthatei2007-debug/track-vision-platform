import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseAuthClient } from "@/lib/supabase-server";

export async function requireAdmin(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { ok: false as const, response: NextResponse.json({ error: "Sign-in required" }, { status: 401 }) };
  try {
    const auth = getSupabaseAuthClient();
    const { data: { user }, error } = await auth.auth.getUser(token);
    if (error || !user) return { ok: false as const, response: NextResponse.json({ error: "Invalid or expired session" }, { status: 401 }) };
    const db = getSupabaseAdmin();
    const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!admin) return { ok: false as const, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
    return { ok: true as const, user, db };
  } catch (e) {
    return { ok: false as const, response: NextResponse.json({ error: e instanceof Error ? e.message : "Authentication failed" }, { status: 500 }) };
  }
}