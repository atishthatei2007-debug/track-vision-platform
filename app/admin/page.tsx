"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import LiveKitBroadcaster from "@/components/livekit/LiveKitBroadcaster";
import ObsWhipIngressPanel from "@/components/livekit/ObsWhipIngressPanel";
import TeamRaceRecorder from "@/components/TeamRaceRecorder";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import {
  AlertTriangle,
  Antenna,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Flag,
  Flame,
  HelpCircle,
  LogIn,
  LogOut,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  Timer,
  Trophy,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  status: string;
  best_time_ms: number | null;
};

type ActiveRun = {
  id: string;
  team_id: string;
  started_at: string;
  status?: string;
  elapsed_ms?: number | null;
  teams?: Team;
};

type CheckpointEvent = {
  id: string;
  run_id: string;
  checkpoint_no: number;
  detected_at: string;
  device_id?: string;
};

type RecentRun = {
  id: string;
  team_id: string;
  started_at: string;
  finished_at: string | null;
  elapsed_ms: number | null;
  status: string;
  teams?: Team;
};

const db = getSupabaseBrowser();

const gateLabels: Record<number, { name: string; desc: string }> = {
  1: { name: "GATE 01", desc: "START LINE BEAM" },
  2: { name: "GATE 02", desc: "SECTOR 1 SPLIT" },
  3: { name: "GATE 03", desc: "SECTOR 2 HAIRPIN" },
  4: { name: "GATE 04", desc: "FINISH LINE BEAM" },
};

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [active, setActive] = useState<ActiveRun | null>(null);
  const [checks, setChecks] = useState<number[]>([]);
  const [activeEvents, setActiveEvents] = useState<CheckpointEvent[]>([]);
  const [latestEvents, setLatestEvents] = useState<CheckpointEvent[]>([]);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Authentication & Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");
  const [busy, setBusy] = useState(false);

  // Safety Confirmation Modal
  const [abortModalOpen, setAbortModalOpen] = useState(false);

  // Filters & Tabs
  const [teamSearch, setTeamSearch] = useState("");
  const [activeView, setActiveView] = useState<"cockpit" | "camera" | "teams" | "logs">("cockpit");

  // Fetch Full Operational State
  const refresh = useCallback(async () => {
    if (!db) return;
    try {
      const [{ data: ts }, { data: rs }, { data: hist }, { data: allEv }] = await Promise.all([
        db.from("teams").select("*").order("code"),
        db
          .from("runs")
          .select("*,teams(*)")
          .eq("status", "running")
          .order("started_at", { ascending: false })
          .limit(1),
        db
          .from("runs")
          .select("*,teams(*)")
          .order("created_at", { ascending: false })
          .limit(8),
        db
          .from("checkpoint_events")
          .select("*")
          .order("detected_at", { ascending: false })
          .limit(10),
      ]);

      setTeams((ts ?? []) as Team[]);
      const run = (rs?.[0] ?? null) as ActiveRun | null;
      setActive(run);
      setRecentRuns((hist ?? []) as RecentRun[]);
      setLatestEvents((allEv ?? []) as CheckpointEvent[]);

      if (run) {
        const { data: ev } = await db
          .from("checkpoint_events")
          .select("*")
          .eq("run_id", run.id)
          .order("checkpoint_no");
        const evArr = (ev ?? []) as CheckpointEvent[];
        setActiveEvents(evArr);
        setChecks(evArr.map((x) => x.checkpoint_no));
      } else {
        setActiveEvents([]);
        setChecks([]);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!db) return;
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Realtime PostgreSQL changes subscription
  useEffect(() => {
    if (!db || !session) return;
    refresh();

    const channel = db
      .channel("gcc-admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "runs" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkpoint_events" }, () => refresh())
      .subscribe((s) => setConnected(s === "SUBSCRIBED"));

    return () => {
      db.removeChannel(channel);
    };
  }, [session, refresh]);

  // Live Timer Tick for Active Run
  useEffect(() => {
    if (!active?.started_at) {
      setElapsed(0);
      return;
    }
    const tick = () => {
      setElapsed((Date.now() - new Date(active.started_at).getTime()) / 1000);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [active]);

  async function api(path: string, body: any) {
    if (!session?.access_token) throw new Error("Please sign in again.");
    const r = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const contentType = r.headers.get("content-type") || "";
    let j: any = null;
    if (contentType.includes("application/json")) {
      j = await r.json().catch(() => null);
    } else {
      const text = await r.text().catch(() => "");
      throw new Error(`Server returned non-JSON response (${r.status}): ${text.slice(0, 80)}`);
    }
    if (!r.ok || !j) throw new Error(j?.error || `Request failed (${r.status})`);
    return j;
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    setMessage("");
    const { error } = await db.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setMessageType("error");
      setMessage(error.message);
    } else {
      setMessageType("success");
      setMessage("Authenticated. Welcome, Race Director.");
    }
  }

  async function addTeam(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/teams", { code, name, college });
      setCode("");
      setName("");
      setCollege("");
      await refresh();
      setMessageType("success");
      setMessage(`Team ${code} registered successfully.`);
    } catch (e) {
      setMessageType("error");
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function startRun() {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/runs/start", { team_id: selected });
      await refresh();
      setMessageType("success");
      setMessage("Race dispatched. ESP32 hardware armed for Gates 01 → 04.");
    } catch (e) {
      setMessageType("error");
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmAbortRun() {
    if (!active) return;
    setAbortModalOpen(false);
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/runs/abort", { run_id: active.id });
      await refresh();
      setMessageType("info");
      setMessage(`Run aborted for ${active.teams?.name ?? active.team_id}. Timing nullified.`);
    } catch (e) {
      setMessageType("error");
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Derived Values
  const filteredTeams = teams.filter((t) => {
    if (!teamSearch) return true;
    const q = teamSearch.toLowerCase();
    return (
      t.code.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.college.toLowerCase().includes(q)
    );
  });

  const lastSensorEvent = latestEvents[0];
  const cpCount = checks.length;
  const isRunning = Boolean(active);

  // ── 1. CONFIGURATION REQUIRED FALLBACK ──
  if (!db) {
    return (
      <main className="min-h-screen bg-[#FFF9F3] flex items-center justify-center p-6 text-[#292929]">
        <div className="max-w-md w-full text-center p-8 bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded shadow-[5px_5px_0px_#292929]">
          <AlertTriangle size={42} className="text-[#FF8A32] mx-auto mb-4" />
          <h2 className="font-digital text-xl font-black mb-2 uppercase text-[#292929]">Configuration Required</h2>
          <p className="font-mono text-xs text-[#525252] leading-relaxed">
            Configure your Supabase public URL and anon key in <code className="text-[#FF8A32] font-bold">.env.local</code>.
          </p>
        </div>
      </main>
    );
  }

  // ── 2. NEOBRUTALISM ORGANIZER AUTHENTICATION LOGIN ──
  if (!session) {
    return (
      <main className="min-h-screen bg-[#FFF9F3] flex flex-col items-center justify-center p-4 sm:p-6 relative text-[#292929]">
        <div className="w-full max-w-md">
          {/* Back to Public Arena Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#292929] hover:text-[#FF8A32] mb-6 transition-colors group select-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>← RETURN TO SPECTATOR ARENA</span>
          </Link>

          {/* NeoBrutalist Login Console Box */}
          <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] shadow-[6px_6px_0px_#292929] rounded p-6 sm:p-8">
            {/* Top Brand Header */}
            <div className="flex items-center gap-3 pb-5 mb-6 border-b-2 border-[#292929]">
              <div className="w-12 h-12 rounded border-2 border-[#292929] bg-[#FF8A32] shadow-[2px_2px_0px_#292929] flex items-center justify-center shrink-0">
                <ShieldCheck size={26} color="#FFFFFF" />
              </div>
              <div>
                <div className="font-mono text-[10px] text-[#FF8A32] font-black tracking-widest uppercase">
                  GCC SMART RACE CONTROL
                </div>
                <h1 className="font-digital text-xl font-black text-[#292929] tracking-wider">
                  RACE DIRECTOR <span className="text-[#FF8A32]">COCKPIT</span>
                </h1>
              </div>
            </div>

            <p className="font-mono text-xs text-[#525252] mb-6 leading-relaxed">
              Official access portal for authorized race marshals, timing directors, and technical officials.
            </p>

            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#292929] mb-1.5 uppercase tracking-wider">
                  OFFICIAL MARSHAL EMAIL
                </label>
                <input
                  type="email"
                  placeholder="marshal@nirman.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FFF9F3] border-2 border-[#292929] rounded px-3.5 py-2.5 font-mono text-xs text-[#292929] shadow-[2px_2px_0px_#292929] focus:outline-none focus:border-[#FF8A32] focus:shadow-[3px_3px_0px_#FF8A32] transition-all placeholder:text-[#A3A3A3]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-[#292929] mb-1.5 uppercase tracking-wider">
                  SECURITY KEY / PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#FFF9F3] border-2 border-[#292929] rounded px-3.5 py-2.5 font-mono text-xs text-[#292929] shadow-[2px_2px_0px_#292929] focus:outline-none focus:border-[#FF8A32] focus:shadow-[3px_3px_0px_#FF8A32] transition-all placeholder:text-[#A3A3A3]"
                />
              </div>

              <Button
                type="submit"
                variant="racing"
                size="lg"
                disabled={busy}
                className="w-full mt-4 font-mono font-bold text-xs py-3"
              >
                <LogIn size={15} />
                <span>{busy ? "AUTHENTICATING MARSHAL..." : "AUTHORIZE ACCESS"}</span>
              </Button>
            </form>

            {/* Notification Badge */}
            {message && (
              <div
                className={`mt-4 p-3 rounded border-2 border-[#292929] font-mono text-xs flex items-center gap-2 shadow-[2px_2px_0px_#292929] ${
                  messageType === "error"
                    ? "bg-[#ef4444] text-white"
                    : "bg-[#10b981] text-white"
                }`}
              >
                <Zap size={14} />
                <span>{message}</span>
              </div>
            )}

            {/* Footer Credentials Note */}
            <div className="mt-6 pt-4 border-t-2 border-[#292929]/30 flex justify-between items-center text-[10px] font-mono text-[#525252]">
              <span>ENCRYPTION: AES-256</span>
              <span>PORT: 443 / SSL</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── 3. AUTHENTICATED RACE DIRECTOR COCKPIT ──
  return (
    <main className="min-h-screen bg-[#FFF9F3] text-[#292929] pb-16 selection:bg-[#FF8A32] selection:text-white">
      {/* ── TOP COCKPIT HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-[2.5px] border-[#292929] shadow-[0_4px_0px_#292929] px-4 sm:px-6 py-2.5">
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded border-2 border-[#292929] bg-[#FFF9F3] shadow-[2px_2px_0px_#292929] flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
              title="Return to Public Arena"
            >
              <ArrowLeft size={16} className="text-[#292929]" />
            </Link>

            <div className="w-9 h-9 rounded border-2 border-[#292929] bg-[#FF8A32] shadow-[2px_2px_0px_#292929] flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/track-vision-logo.png"
                alt="Track Vision"
                width={24}
                height={24}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-digital text-sm font-black tracking-widest text-[#292929]">
                  GCC <span className="text-[#FF8A32]">RACE DIRECTOR COCKPIT</span>
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 bg-[#FFB36B] text-[#292929] font-extrabold border border-[#292929] shadow-[1px_1px_0_#292929]">
                  OFFICIAL MARSHAL
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#525252]">
                EVENT: <span className="text-[#FF8A32] font-bold">NIRMAN 6.0</span> // LINE FOLLOWER PROTOCOL
              </div>
            </div>
          </div>

          {/* Right: Quick View Switchers, Realtime Pill & Sign Out */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switchers */}
            <div className="flex items-center gap-1 border-2 border-[#292929] bg-[#FFF9F3] p-1 rounded shadow-[2px_2px_0px_#292929]">
              {[
                { id: "cockpit", label: "Race Control", icon: Flag },
                { id: "camera", label: "LiveKit Camera", icon: Video },
                { id: "teams", label: "Teams", icon: Users },
                { id: "logs", label: "Audit Log", icon: Clock },
              ].map((v) => {
                const Icon = v.icon;
                const isActive = activeView === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveView(v.id as any)}
                    className={`font-mono text-[11px] uppercase font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#FF8A32] text-white border-2 border-[#292929] shadow-[1.5px_1.5px_0px_#292929]"
                        : "text-[#292929] hover:bg-[#F5D9C0]"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Supabase Realtime State */}
            <div className="font-mono text-[10px] flex items-center gap-1.5 border-2 border-[#292929] bg-[#FFF9F3] px-2.5 py-1.5 rounded shadow-[2px_2px_0_#292929]">
              <span
                className={`w-2 h-2 rounded-full border border-[#292929] ${
                  connected ? "bg-[#10b981]" : "bg-[#A3A3A3]"
                }`}
              />
              <span className="font-bold text-[#292929] tracking-wider">
                {connected ? "SYNCED" : "OFFLINE"}
              </span>
            </div>

            {/* Sign Out Button */}
            <Button
              variant="charcoal"
              size="sm"
              onClick={() => db.auth.signOut()}
              className="gap-1.5 text-xs py-1 px-3 cursor-pointer"
            >
              <LogOut size={13} />
              <span>EXIT</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── INNER COCKPIT CONTAINER ── */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 pt-5">
        {/* Dynamic Notification Strip */}
        {message && (
          <div
            className={`mb-5 p-3.5 rounded border-2 border-[#292929] shadow-[3px_3px_0px_#292929] font-mono text-xs flex items-center justify-between gap-3 ${
              messageType === "error"
                ? "bg-[#fee2e2] text-[#991b1b] border-[#dc2626]"
                : messageType === "success"
                ? "bg-[#dcfce7] text-[#166534] border-[#16a34a] font-bold"
                : "bg-[#FFB36B] text-[#292929] font-bold"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap size={16} />
              <span>{message}</span>
            </div>
            <button
              onClick={() => setMessage("")}
              className="font-bold hover:opacity-75 p-0.5 cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── RACE CONTROL & TELEMETRY PRIMARY ROW ── */}
        {(activeView === "cockpit" || activeView === "camera") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
            {/* ── 1. RACE CONTROL (5 COLUMNS) ── */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 sm:p-6 shadow-[5px_5px_0px_#292929]">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#292929]">
                  <div className="flex items-center gap-2">
                    <Flag size={17} className="text-[#FF8A32]" />
                    <h2 className="font-digital text-sm font-black text-[#292929] tracking-widest uppercase">
                      RACE CONTROL // DISPATCH
                    </h2>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border-2 border-[#292929] shadow-[1px_1px_0_#292929] uppercase ${
                      isRunning ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#dcfce7] text-[#15803d]"
                    }`}
                  >
                    {isRunning ? "● RACE ACTIVE" : "TRACK READY"}
                  </span>
                </div>

                {/* Digital Stopwatch HUD */}
                <div className="bg-[#FFF9F3] border-2 border-[#292929] rounded p-4 mb-4 shadow-[3px_3px_0px_#292929] text-center">
                  <div className="font-mono text-[10px] text-[#525252] tracking-widest uppercase font-bold mb-1">
                    OFFICIAL RACE STOPWATCH
                  </div>
                  <div
                    className={`font-digital text-4xl sm:text-5xl font-black tracking-wider ${
                      isRunning ? "text-[#FF8A32]" : "text-[#292929]"
                    }`}
                  >
                    {elapsed.toFixed(2)}s
                  </div>
                  <div className="font-mono text-[10px] text-[#FF8A32] mt-1 font-bold">
                    SERVER-VALIDATED TIMESTAMP TIMING
                  </div>
                </div>

                {/* ACTIVE RUN STATE: ABORT BUTTON & ACTIVE TEAM INFO */}
                {active ? (
                  <div className="space-y-4">
                    {/* Active Competitor Card */}
                    <div className="bg-[#F5D9C0] border-2 border-[#292929] rounded p-4 shadow-[3px_3px_0px_#292929]">
                      <div className="font-mono text-[10px] text-[#292929] font-black tracking-widest uppercase flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A32] border border-[#292929] animate-pulse" />
                        ACTIVE COMPETITOR ON CIRCUIT
                      </div>
                      <div className="font-digital text-xl font-black text-[#292929] mt-1">
                        {active.teams?.name ?? "Active Robot"}
                      </div>
                      <div className="font-mono text-xs text-[#525252] mt-0.5">
                        CODE: <span className="text-[#FF8A32] font-bold">{active.teams?.code ?? active.team_id}</span> · INSTITUTION:{" "}
                        <span className="text-[#292929] font-bold">{active.teams?.college ?? "Silicon Univ"}</span>
                      </div>
                    </div>

                    {/* LARGE ABORT RACE BUTTON */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setAbortModalOpen(true)}
                      className="w-full py-4 text-sm font-mono font-black tracking-wider border-[2.5px] border-[#292929] rounded bg-[#fee2e2] text-[#b91c1c] shadow-[4px_4px_0px_#292929] hover:bg-[#fca5a5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#292929] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Square size={18} />
                      <span>ABORT ACTIVE RACE</span>
                    </button>
                    <p className="font-mono text-[10px] text-[#525252] text-center font-bold">
                      Requires manual safety confirmation. Cancelling will nullify this lap.
                    </p>
                  </div>
                ) : (
                  /* IDLE STATE: SELECT COMPETITOR & START RACE BUTTON */
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#292929] mb-2 uppercase tracking-wider">
                        SELECT REGISTERED COMPETITOR TO DISPATCH
                      </label>
                      <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="w-full bg-[#FFF9F3] border-2 border-[#292929] rounded px-3.5 py-3 font-mono text-xs text-[#292929] font-bold shadow-[2px_2px_0px_#292929] focus:outline-none focus:border-[#FF8A32] cursor-pointer"
                      >
                        <option value="">Choose competitor from registered roster...</option>
                        {teams
                          .filter((t) => t.status !== "disqualified")
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.code} — {t.name} ({t.college})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* LARGE START RACE BUTTON */}
                    <Button
                      variant="racing"
                      size="lg"
                      disabled={busy || !selected}
                      onClick={startRun}
                      className="w-full py-4 text-sm font-mono font-black tracking-wider border-[2.5px] border-[#292929] shadow-[4px_4px_0px_#292929] h-auto"
                    >
                      <Play size={18} />
                      <span>START RACE // DISPATCH BOT</span>
                    </Button>
                    <p className="font-mono text-[10px] text-[#525252] leading-relaxed text-center font-bold">
                      Arms the 4 optical laser checkpoints. Timing triggers when the robot cuts Gate 01.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Competitor Quick-Stats Card */}
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929] flex justify-between items-center text-center">
                <div className="px-2">
                  <div className="font-mono text-[9px] text-[#525252] uppercase font-bold">REGISTERED</div>
                  <div className="font-digital text-xl font-black text-[#292929]">{teams.length}</div>
                </div>
                <div className="w-[1.5px] h-8 bg-[#292929]/30" />
                <div className="px-2">
                  <div className="font-mono text-[9px] text-[#525252] uppercase font-bold">COMPLETED</div>
                  <div className="font-digital text-xl font-black text-[#15803d]">
                    {teams.filter((t) => t.status === "finished").length}
                  </div>
                </div>
                <div className="w-[1.5px] h-8 bg-[#292929]/30" />
                <div className="px-2">
                  <div className="font-mono text-[9px] text-[#525252] uppercase font-bold">FASTEST LAP</div>
                  <div className="font-digital text-xl font-black text-[#FF8A32]">
                    {teams.find((t) => t.best_time_ms != null)?.best_time_ms
                      ? fmt(teams.find((t) => t.best_time_ms != null)!.best_time_ms)
                      : "--.--s"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. LIVE TELEMETRY & 4-GATE MONITOR (7 COLUMNS) ── */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 sm:p-6 shadow-[5px_5px_0px_#292929]">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#292929]">
                  <div className="flex items-center gap-2">
                    <Antenna size={17} className="text-[#FF8A32]" />
                    <h2 className="font-digital text-sm font-black text-[#292929] tracking-widest uppercase">
                      LIVE OPTICAL TELEMETRY // 4 CHANNELS
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] bg-[#FFB36B] text-[#292929] shadow-[1px_1px_0_#292929]">
                    ESP32 ADC1
                  </span>
                </div>

                {/* 4 Checkpoint Gate Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[1, 2, 3, 4].map((n) => {
                    const cleared = checks.includes(n);
                    const label = gateLabels[n];
                    return (
                      <div
                        key={n}
                        className={`p-3 rounded border-2 border-[#292929] shadow-[3px_3px_0px_#292929] transition-all ${
                          cleared ? "bg-[#dcfce7]" : "bg-[#FFF9F3]"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`font-mono text-[10px] font-black ${
                              cleared ? "text-[#15803d]" : "text-[#292929]"
                            }`}
                          >
                            {label.name}
                          </span>
                          <span
                            className={`w-2.5 h-2.5 rounded-full border border-[#292929] ${
                              cleared ? "bg-[#16a34a]" : "bg-[#E8E8E8]"
                            }`}
                          />
                        </div>
                        <div className="font-mono text-[9px] text-[#525252] font-bold mt-1">{label.desc}</div>
                        <div
                          className={`mt-2 font-mono text-[10px] font-black px-1.5 py-0.5 rounded border border-[#292929] inline-block ${
                            cleared ? "bg-[#16a34a] text-white" : "bg-[#E8E8E8] text-[#525252]"
                          }`}
                        >
                          {cleared ? "CLEARED" : "STANDBY"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Course Progress Bar */}
                <div className="bg-[#FFF9F3] border-2 border-[#292929] rounded p-3.5 mb-4 shadow-[2px_2px_0px_#292929]">
                  <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                    <span className="text-[#525252] font-bold">COURSE PROGRESS:</span>
                    <span className="text-[#FF8A32] font-black font-digital text-sm">
                      {Math.round((cpCount / 4) * 100)}% ({cpCount}/4 GATES)
                    </span>
                  </div>
                  <div className="h-3 bg-[#E8E8E8] border border-[#292929] rounded overflow-hidden">
                    <div
                      className="h-full bg-[#FF8A32] transition-all duration-300"
                      style={{ width: `${(cpCount / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actual ESP32 Hardware Status & Last-Seen Info */}
                <div className="bg-[#FFF9F3] border-2 border-[#292929] rounded p-3.5 shadow-[2px_2px_0px_#292929] text-xs font-mono space-y-2 text-[#292929]">
                  <div className="flex justify-between items-center border-b border-[#292929]/20 pb-1.5">
                    <span className="text-[#525252] font-bold flex items-center gap-1.5">
                      <Cpu size={13} className="text-[#FF8A32]" /> HARDWARE INTERFACE:
                    </span>
                    <span className="text-[#292929] font-bold">
                      {lastSensorEvent?.device_id || "track-vision-esp32 (ADC1)"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-[#292929]/20 pb-1.5">
                    <span className="text-[#525252] font-bold flex items-center gap-1.5">
                      <Clock size={13} className="text-[#FF8A32]" /> LAST DETECTED TRIGGER:
                    </span>
                    <span className="text-[#15803d] font-bold">
                      {lastSensorEvent
                        ? `Gate 0${lastSensorEvent.checkpoint_no} at ${new Date(
                            lastSensorEvent.detected_at
                          ).toLocaleTimeString()}`
                        : "No sensor trigger recorded yet"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#525252] font-bold flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-[#15803d]" /> TELEMETRY VALIDATION:
                    </span>
                    <span className="text-[#FF8A32] font-bold">PostgreSQL Stored Procedure (RPC)</span>
                  </div>
                </div>
              </div>

              {/* Active Run Gate Events Feed */}
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-xs font-bold text-[#FF8A32] flex items-center gap-1.5">
                    <Zap size={14} /> ACTIVE RUN EVENT STREAM ({activeEvents.length})
                  </span>
                  <span className="font-mono text-[10px] text-[#525252] font-bold">
                    {isRunning ? "MONITORING SENSORS" : "STANDBY"}
                  </span>
                </div>

                {activeEvents.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-[#FFF9F3] border border-[#292929] rounded px-3 py-1.5 text-xs font-mono flex justify-between items-center"
                      >
                        <span className="text-[#15803d] font-bold flex items-center gap-2">
                          <CheckCircle2 size={13} /> Gate 0{ev.checkpoint_no} Cleared
                        </span>
                        <span className="text-[#FF8A32] font-bold text-[11px]">
                          {new Date(ev.detected_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 font-mono text-xs text-[#717171]">
                    Waiting for robot to trigger optical gates...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. LIVE CAMERA BROADCASTER & LOCAL RECORDER ROW ── */}
        {(activeView === "cockpit" || activeView === "camera") && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#292929]">
              <div className="flex items-center gap-2 font-mono text-xs uppercase font-black text-[#292929]">
                <Video size={16} className="text-[#FF8A32]" />
                <span>LIVE WEBRTC BROADCASTER & AUTOMATED TEAM RECORDER</span>
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFB36B] text-[#292929] border border-[#292929] shadow-[1px_1px_0_#292929]">
                LIVEKIT & SUPABASE STORAGE
              </span>
            </div>

            {/* OBS Studio WHIP Ingress Uplink (Primary Studio Uplink) */}
            <ObsWhipIngressPanel session={session} />

            {/* LiveKit Camera Broadcaster (DroidCam / Webcam Uplink - Instant Backup) */}
            <LiveKitBroadcaster session={session} />

            {/* Team Stream Auto-Recorder */}
            <TeamRaceRecorder activeRun={active} />
          </div>
        )}

        {/* ── 4. TEAM MANAGEMENT & RACE MONITORING ROW ── */}
        {(activeView === "cockpit" || activeView === "teams" || activeView === "logs") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ── TEAM MANAGEMENT (7 COLUMNS) ── */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 sm:p-6 shadow-[5px_5px_0px_#292929]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-[#292929] gap-2">
                  <div className="flex items-center gap-2">
                    <Users size={17} className="text-[#15803d]" />
                    <h2 className="font-digital text-sm font-black text-[#292929] tracking-widest uppercase">
                      COMPETITOR ROSTER & READINESS ({teams.length})
                    </h2>
                  </div>

                  {/* Search Filter */}
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-[#525252]" />
                    <input
                      type="text"
                      placeholder="Search code or team..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                      className="bg-[#FFF9F3] border border-[#292929] rounded pl-8 pr-3 py-1 font-mono text-xs text-[#292929] shadow-[1px_1px_0px_#292929] focus:outline-none focus:border-[#FF8A32] w-48 placeholder:text-[#A3A3A3]"
                    />
                  </div>
                </div>

                {/* Team Registration Inline Form */}
                <form
                  onSubmit={addTeam}
                  className="bg-[#FFF9F3] border-2 border-[#292929] rounded p-3 mb-4 shadow-[2px_2px_0px_#292929] grid grid-cols-1 sm:grid-cols-12 gap-2"
                >
                  <div className="sm:col-span-3">
                    <input
                      className="w-full bg-[#FFFFFF] border border-[#292929] rounded px-2.5 py-1.5 font-mono text-xs text-[#292929] shadow-[1px_1px_0px_#292929] placeholder:text-[#A3A3A3]"
                      placeholder="Code (TV-05)"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      className="w-full bg-[#FFFFFF] border border-[#292929] rounded px-2.5 py-1.5 font-mono text-xs text-[#292929] shadow-[1px_1px_0px_#292929] placeholder:text-[#A3A3A3]"
                      placeholder="Team Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      className="w-full bg-[#FFFFFF] border border-[#292929] rounded px-2.5 py-1.5 font-mono text-xs text-[#292929] shadow-[1px_1px_0px_#292929] placeholder:text-[#A3A3A3]"
                      placeholder="Institution"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="submit"
                      variant="racing"
                      size="sm"
                      disabled={busy}
                      className="w-full text-xs py-1.5 px-2"
                    >
                      <Plus size={13} />
                      <span>ADD</span>
                    </Button>
                  </div>
                </form>

                {/* Teams Table */}
                <div className="border-2 border-[#292929] rounded overflow-hidden shadow-[3px_3px_0px_#292929]">
                  <div className="bg-[#F5D9C0] border-b-2 border-[#292929] grid grid-cols-12 gap-2 p-2.5 font-mono text-[10px] font-black text-[#292929] uppercase tracking-wider">
                    <span className="col-span-2">CODE</span>
                    <span className="col-span-5">TEAM & COLLEGE</span>
                    <span className="col-span-3">BEST LAP</span>
                    <span className="col-span-2 text-right">STATUS</span>
                  </div>

                  <div className="divide-y divide-[#292929]/20 max-h-72 overflow-y-auto">
                    {filteredTeams.map((t) => {
                      const isCurrentlyActive = active?.team_id === t.id;
                      return (
                        <div
                          key={t.id}
                          className={`grid grid-cols-12 gap-2 p-2.5 font-mono text-xs items-center transition-colors ${
                            isCurrentlyActive
                              ? "bg-[#F5D9C0]"
                              : "bg-[#FFFFFF] hover:bg-[#FFF9F3]"
                          }`}
                        >
                          <span className="col-span-2 font-black text-[#FF8A32]">{t.code}</span>
                          <div className="col-span-5">
                            <div className="font-bold text-[#292929]">{t.name}</div>
                            <div className="text-[10px] text-[#525252] truncate">{t.college}</div>
                          </div>
                          <span className="col-span-3 font-digital text-sm text-[#FF8A32] font-black">
                            {fmt(t.best_time_ms)}
                          </span>
                          <div className="col-span-2 text-right">
                            <span
                              className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-[#292929] inline-block uppercase ${
                                isCurrentlyActive
                                  ? "bg-[#FF8A32] text-white"
                                  : t.status === "finished"
                                  ? "bg-[#dcfce7] text-[#15803d]"
                                  : "bg-[#E8E8E8] text-[#525252]"
                              }`}
                            >
                              {isCurrentlyActive ? "ON TRACK" : t.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 5. RACE HISTORY & RECENT RESULTS (5 COLUMNS) ── */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 sm:p-6 shadow-[5px_5px_0px_#292929]">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#292929]">
                  <div className="flex items-center gap-2">
                    <Trophy size={17} className="text-[#FF8A32]" />
                    <h2 className="font-digital text-sm font-black text-[#292929] tracking-widest uppercase">
                      RACE HISTORY // LOG ({recentRuns.length})
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF9F3] text-[#525252] border border-[#292929]">
                    POSTGRES AUDIT
                  </span>
                </div>

                {/* Runs History List */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {recentRuns.map((r, i) => {
                    const isFin = r.status === "finished";
                    const isAborted = r.status === "aborted";
                    return (
                      <div
                        key={r.id}
                        className="bg-[#FFF9F3] border-2 border-[#292929] rounded p-3 shadow-[2px_2px_0px_#292929] flex justify-between items-center font-mono text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#292929] flex items-center gap-2">
                            <span>#{recentRuns.length - i}</span>
                            <span className="text-[#FF8A32] font-black">{r.teams?.code ?? "BOT"}</span>
                            <span>{r.teams?.name ?? "Run"}</span>
                          </div>
                          <div className="text-[10px] text-[#525252] mt-0.5">
                            Started: {new Date(r.started_at).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-digital text-sm font-black text-[#FF8A32]">
                            {fmt(r.elapsed_ms)}
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border border-[#292929] uppercase inline-block mt-0.5 ${
                              isFin
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : isAborted
                                ? "bg-[#fee2e2] text-[#dc2626]"
                                : "bg-[#FFB36B] text-[#292929]"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SAFETY CONFIRMATION MODAL BEFORE ABORTING A RACE ── */}
      {abortModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292929]/75 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border-[3px] border-[#292929] shadow-[8px_8px_0px_#292929] rounded p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-[#dc2626] mb-3">
              <ShieldAlert size={28} />
              <h3 className="font-digital text-lg font-black text-[#292929] uppercase tracking-wider">
                CONFIRM RACE ABORT
              </h3>
            </div>

            <p className="font-mono text-xs text-[#292929] leading-relaxed mb-4">
              Are you sure you want to abort the active run for{" "}
              <strong className="text-[#FF8A32]">{active?.teams?.name ?? "Active Robot"}</strong> (
              {active?.teams?.code})?
            </p>

            <div className="bg-[#fee2e2] border-2 border-[#292929] p-3 rounded mb-5 font-mono text-[11px] text-[#991b1b]">
              <strong>SAFETY PROTOCOL:</strong> The run will be marked as <code className="font-bold">aborted</code>.
              Its lap time will be nullified, and the ESP32 gate interrupt session will be terminated immediately.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 font-mono font-black text-xs py-2.5 rounded border-2 border-[#292929] bg-[#dc2626] text-white shadow-[3px_3px_0px_#292929] hover:bg-[#b91c1c] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-60"
                onClick={confirmAbortRun}
                disabled={busy}
              >
                YES, ABORT RACE
              </button>
              <button
                type="button"
                className="flex-1 font-mono font-bold text-xs py-2.5 rounded border-2 border-[#292929] bg-[#FFFFFF] text-[#292929] shadow-[3px_3px_0px_#292929] hover:bg-[#F5D9C0] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                onClick={() => setAbortModalOpen(false)}
              >
                CANCEL / RESUME
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
