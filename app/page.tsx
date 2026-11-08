"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Antenna,
  Award,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Radio,
  Shield,
  Timer,
  Trophy,
  Wifi,
  Zap,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import TrackVisionHero from "@/components/TrackVisionHero";

type Team = {
  id: string;
  code: string;
  name: string;
  college: string;
  best_time_ms: number | null;
  status: string;
};

type Run = {
  id: string;
  team_id: string;
  started_at: string;
  finished_at: string | null;
  elapsed_ms: number | null;
  status: string;
  teams?: Team;
};

type Checkpoint = {
  id: string;
  run_id: string;
  checkpoint_no: number;
  detected_at: string;
};

const db = getSupabaseBrowser();

const demoTeams: Team[] = [
  { id: "demo1", code: "TV-01", name: "Circuit Breakers", college: "Silicon University", best_time_ms: 42350, status: "finished" },
  { id: "demo2", code: "TV-02", name: "Track Titans", college: "BCET", best_time_ms: 45120, status: "finished" },
  { id: "demo3", code: "TV-03", name: "RoboRangers", college: "Silicon University", best_time_ms: null, status: "registered" },
  { id: "demo4", code: "TV-04", name: "Byte Racers", college: "KIIT", best_time_ms: null, status: "registered" },
];

const fmt = (ms: number | null) => {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
};

const gateLabels: Record<number, { name: string; desc: string }> = {
  1: { name: "GATE 01", desc: "START LINE BEAM" },
  2: { name: "GATE 02", desc: "SECTOR 1 SPLIT" },
  3: { name: "GATE 03", desc: "SECTOR 2 HAIRPIN" },
  4: { name: "GATE 04", desc: "FINISH LINE BEAM" },
};

export default function Home() {
  const [teams, setTeams] = useState<Team[]>(demoTeams);
  const [active, setActive] = useState<Run | null>(null);
  const [checks, setChecks] = useState<number[]>([]);
  const [events, setEvents] = useState<Checkpoint[]>([]);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const videoId = process.env.NEXT_PUBLIC_YOUTUBE_VIDEO_ID;

  // Supabase Data & Realtime Sync
  useEffect(() => {
    if (!db) return;
    let mounted = true;

    const load = async () => {
      const [{ data: ts }, { data: rs }] = await Promise.all([
        db.from("teams").select("*").order("code"),
        db.from("runs").select("*,teams(*)").order("created_at", { ascending: false }).limit(1),
      ]);

      if (!mounted) return;
      if (ts && ts.length > 0) setTeams(ts as Team[]);

      const run = (rs?.[0] ?? null) as Run | null;
      setActive(run);

      if (run) {
        const { data: ev } = await db
          .from("checkpoint_events")
          .select("*")
          .eq("run_id", run.id)
          .order("checkpoint_no");
        if (mounted) {
          const arr = (ev ?? []) as Checkpoint[];
          setEvents(arr);
          setChecks(arr.map((x) => x.checkpoint_no));
        }
      } else {
        setEvents([]);
        setChecks([]);
      }
    };

    load();

    const channel = db
      .channel("track-vision-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "runs" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "checkpoint_events" }, () => load())
      .subscribe((s) => setConnected(s === "SUBSCRIBED"));

    return () => {
      mounted = false;
      db.removeChannel(channel);
    };
  }, []);

  // Live Timer Tick
  useEffect(() => {
    if (!active?.started_at) {
      setElapsed(0);
      return;
    }
    if (active.status === "finished" && active.elapsed_ms != null) {
      setElapsed(active.elapsed_ms / 1000);
      return;
    }
    if (active.status !== "running") return;

    const tick = () => {
      setElapsed((Date.now() - new Date(active.started_at).getTime()) / 1000);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [active]);

  // Derived Values
  const sorted = useMemo(
    () => [...teams].sort((a, b) => (a.best_time_ms ?? Infinity) - (b.best_time_ms ?? Infinity)),
    [teams]
  );
  const currentTeam = active ? teams.find((t) => t.id === active.team_id) || active.teams : undefined;
  const cpCount = checks.length;
  const isRunning = active?.status === "running";
  const fastestLap = sorted.find((t) => t.best_time_ms != null);

  return (
    <>
      {/* ── 1. Interactive Frame-Scrubbing Canvas Hero ── */}
      <TrackVisionHero />

      {/* ── 2. Live Competition Spectator Arena ── */}
      <main
        id="spectator-arena"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "48px 24px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Arena Section Heading */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: "radial-gradient(circle, #10243b 0%, #060e18 100%)",
                border: "1px solid rgba(0, 240, 255, 0.35)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)",
                overflow: "hidden",
              }}
            >
              <img
                src="/track-vision-logo.png"
                alt="Track Vision"
                width={40}
                height={40}
                style={{ objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))" }}
              />
            </div>
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: "#ffaa00",
                  letterSpacing: "0.22em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Zap size={13} color="#ffaa00" /> NIRMAN 6.0 // COMPETITION CONTROL
              </div>
              <div
                className="digital"
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  marginTop: 2,
                }}
              >
                LIVE ARENA{" "}
                <span
                  style={{
                    color: "#ff6a00",
                    textShadow: "0 0 20px rgba(255, 106, 0, 0.6)",
                  }}
                >
                  TELEMETRY
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="pill">
              <span className="live-beacon" /> LIVE ARENA
            </span>
            <span
              className="mono"
              style={{
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(10, 20, 32, 0.6)",
                padding: "6px 12px",
                borderRadius: 20,
                border: "1px solid rgba(45, 75, 110, 0.4)",
                color: connected ? "#00ff88" : "#8da3be",
              }}
            >
              <Wifi size={13} color={connected ? "#00ff88" : "#8da3be"} />
              {connected ? "REALTIME SYNCED" : "DEMO / STANDBY"}
            </span>
            <Link href="/admin" className="btn" style={{ fontSize: 12, padding: "8px 16px" }}>
              <Shield size={14} color="#00f0ff" />
              Organizer Admin
            </Link>
          </div>
        </header>

        {/* Quick Telemetry Chips */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div className="panel hud-panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(0, 240, 255, 0.1)",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Trophy size={20} color="#00f0ff" />
            </div>
            <div>
              <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>TRACK RECORD</div>
              <div className="digital" style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>
                {fastestLap?.best_time_ms ? fmt(fastestLap.best_time_ms) : "--.--s"}
              </div>
            </div>
          </div>

          <div className="panel hud-panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(255, 170, 0, 0.1)",
                border: "1px solid rgba(255, 170, 0, 0.3)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Cpu size={20} color="#ffaa00" />
            </div>
            <div>
              <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>ESP32 SENSORS</div>
              <div className="digital" style={{ fontSize: 18, color: "#ffaa00", fontWeight: 700 }}>
                4 CHANNELS ACTIVE
              </div>
            </div>
          </div>

          <div className="panel hud-panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(0, 255, 136, 0.1)",
                border: "1px solid rgba(0, 255, 136, 0.3)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Award size={20} color="#00ff88" />
            </div>
            <div>
              <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>REGISTERED TEAMS</div>
              <div className="digital" style={{ fontSize: 18, color: "#00ff88", fontWeight: 700 }}>
                {teams.length} COMPETITORS
              </div>
            </div>
          </div>

          <div className="panel hud-panel" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: isRunning ? "rgba(255, 42, 85, 0.15)" : "rgba(45, 75, 110, 0.2)",
                border: `1px solid ${isRunning ? "rgba(255, 42, 85, 0.5)" : "rgba(45, 75, 110, 0.4)"}`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Timer size={20} color={isRunning ? "#ff496b" : "#8da3be"} />
            </div>
            <div>
              <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>ARENA STATUS</div>
              <div
                className="digital"
                style={{
                  fontSize: 18,
                  color: isRunning ? "#ff496b" : "#8da3be",
                  fontWeight: 700,
                }}
              >
                {isRunning ? "RACE IN PROGRESS" : active?.status === "finished" ? "RUN FINISHED" : "TRACK READY"}
              </div>
            </div>
          </div>
        </section>

        {/* Main Arena Grid: Broadcast & Live Telemetry */}
        <section className="two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 0.9fr)", gap: 18 }}>
          {/* Live Broadcast Card */}
          <div className="panel hud-panel" style={{ overflow: "hidden" }}>
            {/* Panel Header */}
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
                background: "rgba(10, 18, 28, 0.5)",
              }}
            >
              <div style={{ fontWeight: 700, display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
                <Radio size={16} color="#00f0ff" />
                <span>LIVE TRACK BROADCAST</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="eq-bars">
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                  <span className="eq-bar" />
                </div>
                <span className="pill pill-orange">YOUTUBE FEED</span>
              </div>
            </div>

            {/* Video or High-Tech Standby Screen */}
            <div
              style={{
                aspectRatio: "16/9",
                background: "#03060a",
                position: "relative",
                display: "grid",
                placeItems: "center",
              }}
            >
              {videoId ? (
                <iframe
                  title="Track Vision live stream"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 0, width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: 32, position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      margin: "0 auto",
                      borderRadius: "50%",
                      background: "rgba(0, 240, 255, 0.08)",
                      border: "1px solid rgba(0, 240, 255, 0.3)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 0 30px rgba(0, 240, 255, 0.2)",
                    }}
                  >
                    <Activity size={32} color="#00f0ff" />
                  </div>
                  <div className="digital" style={{ fontSize: 19, fontWeight: 700, marginTop: 16 }}>
                    AWAITING LIVE VIDEO FEED
                  </div>
                  <p className="muted" style={{ fontSize: 13, maxWidth: 360, margin: "8px auto 0" }}>
                    Connect your OBS stream to YouTube Live and set <code style={{ color: "#00f0ff" }}>NEXT_PUBLIC_YOUTUBE_VIDEO_ID</code> in <code style={{ color: "#ffaa00" }}>.env.local</code>.
                  </p>
                </div>
              )}
            </div>

            {/* Active Race HUD Bar */}
            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
                background: isRunning
                  ? "linear-gradient(90deg, rgba(0, 240, 255, 0.08), rgba(11, 20, 32, 0.8))"
                  : "rgba(9, 16, 26, 0.7)",
                borderTop: "1px solid rgba(45, 75, 110, 0.3)",
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: isRunning ? "#00f0ff" : "#8da3be",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isRunning ? (
                    <>
                      <span className="live-beacon live-dot-green" /> ACTIVE ON TRACK
                    </>
                  ) : active?.status === "finished" ? (
                    <>
                      <CheckCircle2 size={12} color="#00ff88" /> LAST COMPLETED RUN
                    </>
                  ) : (
                    "TELEMETRY STANDBY"
                  )}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, marginTop: 2, color: "#fff" }}>
                  {currentTeam?.name ?? "Track Idle"}
                </div>
                <div className="muted mono" style={{ fontSize: 12, marginTop: 1 }}>
                  {currentTeam?.code ? `${currentTeam.code} · ${currentTeam.college}` : "Waiting for organizer to dispatch robot"}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.15em" }}>
                  OFFICIAL STOPWATCH
                </div>
                <div
                  className={`stopwatch-display ${active?.status === "finished" ? "finished" : ""}`}
                  style={{ marginTop: 2 }}
                >
                  {active
                    ? active.status === "finished" && active.elapsed_ms != null
                      ? (active.elapsed_ms / 1000).toFixed(2) + "s"
                      : elapsed.toFixed(2) + "s"
                    : "--.--s"}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Gate Laser Telemetry Card */}
          <div className="panel hud-panel" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 15 }}>
                <Antenna size={18} color="#00f0ff" />
                <span>LASER TELEMETRY</span>
              </div>
              <span className="pill pill-green">ESP32 DevKit</span>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>
              4 Optical Gates · Server-Timestamp Validation
            </p>

            {/* 4 Gates Visualizer */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 20 }}>
              {[1, 2, 3, 4].map((n) => {
                const cleared = checks.includes(n);
                const label = gateLabels[n];
                return (
                  <div key={n} className={`gate-card ${cleared ? "cleared" : "pending"}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: cleared ? "#00ff88" : "#8da3be" }}>
                          {label.name}
                        </div>
                        <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>
                          {label.desc}
                        </div>
                      </div>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: cleared ? "#00ff88" : "#35485e",
                          boxShadow: cleared ? "0 0 12px #00ff88" : "none",
                        }}
                      />
                    </div>

                    {/* Animated Laser Beam */}
                    <div className={`laser-beam ${cleared ? "active" : "standby"}`} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: cleared ? "#00ff88" : "#5d738c",
                        }}
                      >
                        {cleared ? "CLEARED" : "PENDING"}
                      </span>
                      {cleared && (
                        <span className="mono" style={{ fontSize: 10, color: "#a5f3d4" }}>
                          PASSED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checkpoint Progress Meter */}
            <div
              style={{
                marginTop: 22,
                padding: 16,
                borderRadius: 14,
                background: "rgba(5, 12, 20, 0.7)",
                border: "1px solid rgba(45, 75, 110, 0.4)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono muted" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
                  COURSE PROGRESS
                </span>
                <span className="digital" style={{ fontSize: 14, color: "#00f0ff", fontWeight: 700 }}>
                  {Math.round((cpCount / 4) * 100)}%
                </span>
              </div>

              <div
                style={{
                  height: 8,
                  background: "rgba(25, 40, 60, 0.6)",
                  borderRadius: 10,
                  marginTop: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(0, 240, 255, 0.2)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(cpCount / 4) * 100}%`,
                    background: "linear-gradient(90deg, #00f0ff, #00ff88)",
                    boxShadow: "0 0 16px rgba(0, 240, 255, 0.8)",
                    transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11 }}>
                <span className="mono" style={{ color: "#8da3be" }}>
                  {cpCount} of 4 Gates Triggered
                </span>
                <span className="mono" style={{ color: cpCount === 4 ? "#00ff88" : "#ffaa00" }}>
                  {cpCount === 4 ? "LAP COMPLETED" : "IN TRANSIT"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Second Row: Leaderboard & Checkpoint Log */}
        <section className="two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(300px, 0.7fr)", gap: 18, marginTop: 20 }}>
          {/* Leaderboard Panel */}
          <div className="panel hud-panel" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.18em" }}>
                  COMPETITION STANDINGS
                </div>
                <h2 style={{ fontSize: 22, margin: "4px 0 0", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <Trophy size={20} color="#ffbe28" /> Official Leaderboard
                </h2>
              </div>
              <span className="pill">FASTEST LAP</span>
            </div>

            {/* Table Header */}
            <div
              className="mono"
              style={{
                display: "grid",
                gridTemplateColumns: "46px minmax(130px, 1fr) 110px 90px",
                gap: 12,
                padding: "8px 14px",
                fontSize: 10,
                color: "#6b829c",
                letterSpacing: "0.1em",
                borderBottom: "1px solid rgba(45, 75, 110, 0.3)",
              }}
            >
              <span>POS</span>
              <span>TEAM / COLLEGE</span>
              <span>BEST LAP</span>
              <span>STATUS</span>
            </div>

            {/* Leaderboard Rows */}
            <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
              {sorted.map((t, i) => {
                const podiumClass = i === 0 ? "podium-1" : i === 1 ? "podium-2" : i === 2 ? "podium-3" : "";
                const rankColor = i === 0 ? "#ffbe28" : i === 1 ? "#c8dcf0" : i === 2 ? "#dc8250" : "#6c84a0";
                const isFinished = t.status === "finished";
                const isRunningTeam = active?.team_id === t.id && isRunning;

                return (
                  <div key={t.id} className={`leaderboard-row ${podiumClass}`}>
                    <strong className="digital" style={{ fontSize: 16, color: rankColor }}>
                      #{i + 1}
                    </strong>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                      <div className="muted mono" style={{ fontSize: 11, marginTop: 1 }}>
                        {t.code} · {t.college}
                      </div>
                    </div>
                    <strong className="digital" style={{ fontSize: 15, color: "#00f0ff" }}>
                      {fmt(t.best_time_ms)}
                    </strong>
                    <div>
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: isRunningTeam
                            ? "rgba(255, 170, 0, 0.15)"
                            : isFinished
                            ? "rgba(0, 255, 136, 0.12)"
                            : "rgba(45, 75, 110, 0.2)",
                          color: isRunningTeam ? "#ffaa00" : isFinished ? "#00ff88" : "#8da3be",
                          border: `1px solid ${
                            isRunningTeam
                              ? "rgba(255, 170, 0, 0.3)"
                              : isFinished
                              ? "rgba(0, 255, 136, 0.3)"
                              : "rgba(45, 75, 110, 0.2)"
                          }`,
                          display: "inline-block",
                        }}
                      >
                        {isRunningTeam ? "RACING" : t.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Gate Event Feed */}
          <div className="panel hud-panel" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div className="muted mono" style={{ fontSize: 10, letterSpacing: "0.18em" }}>
                  SENSOR LOGS
                </div>
                <h2 style={{ fontSize: 22, margin: "4px 0 0", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <Clock size={20} color="#00f0ff" /> Checkpoint Stream
                </h2>
              </div>
              <span className="pill pill-green">REALTIME</span>
            </div>

            <div style={{ display: "grid", gap: 8, maxHeight: 310, overflowY: "auto", paddingRight: 4 }}>
              {events.length > 0 ? (
                events.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(8, 16, 26, 0.7)",
                      border: "1px solid rgba(45, 75, 110, 0.35)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#00ff88",
                          boxShadow: "0 0 8px #00ff88",
                        }}
                      />
                      <div>
                        <strong style={{ color: "#f0f6ff" }}>Checkpoint 0{e.checkpoint_no} Cleared</strong>
                        <div className="muted mono" style={{ fontSize: 10 }}>
                          Beam interrupted & validated
                        </div>
                      </div>
                    </div>
                    <span className="mono" style={{ color: "#00f0ff", fontSize: 11 }}>
                      {new Date(e.detected_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 16px",
                    color: "#6c84a0",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  <Antenna size={28} color="#3c526b" style={{ margin: "0 auto 10px" }} />
                  Waiting for laser checkpoint interrupts...
                </div>
              )}
            </div>

            {/* Sync Heartbeat Footer */}
            <div
              style={{
                borderTop: "1px solid rgba(45, 75, 110, 0.3)",
                marginTop: 18,
                paddingTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: connected ? "#00ff88" : "#8da3be",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`live-beacon ${connected ? "live-dot-green" : ""}`} />
                <span>{connected ? "PostgreSQL Realtime Channel Active" : "Connecting to Database..."}</span>
              </div>
              <span style={{ opacity: 0.6 }}>PORT: 443</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid rgba(45, 75, 110, 0.2)",
            color: "#8da3be",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>TRACK VISION // NIRMAN 6.0 LINE FOLLOWER ARENA</span>
          <span>Hardware: ESP32 ADC1 (CH1-CH4) · Timing: Server Timestamps</span>
        </footer>
      </main>
    </>
  );
}
