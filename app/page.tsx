"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Activity,
  Antenna,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Flame,
  Map,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import TrackVisionHero from "@/components/TrackVisionHero";
import { type GccTab } from "@/components/gcc/GccNav";
import GccOverview from "@/components/gcc/GccOverview";
import GccTeamsDirectory from "@/components/gcc/GccTeamsDirectory";
import GccLeaderboardTable from "@/components/gcc/GccLeaderboardTable";
import GccReplayCenter from "@/components/gcc/GccReplayCenter";
import GccHardwareMonitor from "@/components/gcc/GccHardwareMonitor";
import GccReports from "@/components/gcc/GccReports";
import GccEventLog from "@/components/gcc/GccEventLog";
import GccTrackMap from "@/components/gcc/GccTrackMap";
import GccAiAnalyst from "@/components/gcc/GccAiAnalyst";
import GccStatusBar from "@/components/GccStatusBar";
import AudioEngine, { playCheckpointBeep, playRaceStart, playRaceFinish } from "@/components/AudioEngine";
import RaceSchedulePanel from "@/components/RaceSchedulePanel";
import SponsorWall from "@/components/SponsorWall";
import GallerySection from "@/components/GallerySection";
import EventCountdown from "@/components/EventCountdown";
import LiveKitSpectatorPlayer from "@/components/livekit/LiveKitSpectatorPlayer";
import NirmanRulebookFaq from "@/components/NirmanRulebookFaq";
import FloatingArenaMenu from "@/components/FloatingArenaMenu";
import TiltCard from "@/components/kinetics/TiltCard";
import CyberScrambleText from "@/components/kinetics/CyberScrambleText";
import MissionControlHudBar from "@/components/kinetics/MissionControlHudBar";
import MechanicalBlastDoors from "@/components/kinetics/MechanicalBlastDoors";
import InteractiveBotInspector from "@/components/kinetics/InteractiveBotInspector";

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

  // GCC Smart Race Control Active Module (defaults to Opening Hero "home")
  const [activeTab, setActiveTab] = useState<GccTab>("home");
  const lenis = useLenis();
  // Audio: track previous checks to only beep on NEW checkpoint events
  const prevChecksRef = useRef<number[]>([]);
  // Audio: track previous run status to detect race start/finish
  const prevRunStatusRef = useRef<string | null>(null);

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

      // Audio: Detect run status transitions
      const prevStatus = prevRunStatusRef.current;
      const newStatus = run?.status ?? null;
      if (newStatus !== prevStatus) {
        if (newStatus === "running" && prevStatus !== "running") {
          playRaceStart();
        } else if (newStatus === "finished" && prevStatus === "running") {
          playRaceFinish();
        }
        prevRunStatusRef.current = newStatus;
      }

      if (run) {
        const { data: ev } = await db
          .from("checkpoint_events")
          .select("*")
          .eq("run_id", run.id)
          .order("checkpoint_no");
        if (mounted) {
          const arr = (ev ?? []) as Checkpoint[];
          setEvents(arr);
          const newChecks = arr.map((x) => x.checkpoint_no);
          // Audio: Beep for each newly detected checkpoint
          const prevChecks = prevChecksRef.current;
          for (const cp of newChecks) {
            if (!prevChecks.includes(cp)) {
              playCheckpointBeep(cp as 1 | 2 | 3 | 4);
            }
          }
          prevChecksRef.current = newChecks;
          setChecks(newChecks);
        }
      } else {
        setEvents([]);
        setChecks([]);
        prevChecksRef.current = [];
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

  useEffect(() => {
    if (!lenis) return;
    const id = setTimeout(() => lenis.resize(), 320);
    return () => clearTimeout(id);
  }, [activeTab, lenis]);

  const handleSelectTab = (tab: GccTab) => {
    setActiveTab(tab);
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleScrollToLive = () => {
    handleSelectTab("live");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#03060a", position: "relative" }}>
      {/* ── PERSISTENT SHOWCASE ANIMATION VIDEO LAYER (Edge-to-Edge Fullscreen 100vh) ── */}
      <div
        style={{
          position: activeTab === "home" ? "relative" : "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: "100vh",
          width: "100%",
          zIndex: 0,
          pointerEvents: activeTab === "home" ? "auto" : "none",
        }}
      >
        <TrackVisionHero
          onEnterArena={handleScrollToLive}
          onSelectTab={handleSelectTab}
          isBackground={activeTab !== "home"}
        />
      </div>

      {/* ── DYNAMIC PORTAL OVERLAY CONTAINER (Translucent motorsport glass over the animation video) ── */}
      {activeTab !== "home" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            minHeight: "100vh",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            background: "rgba(3, 7, 14, 0.88)",
          }}
        >
          <GccStatusBar
            connected={connected}
            eventCount={events.length}
            isRunning={isRunning}
            activeTeamName={currentTeam?.name}
            teamsCount={teams.length}
            finishedCount={teams.filter((t) => t.status === "finished").length}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{
                maxWidth: 1440,
                margin: "0 auto",
                padding: "24px 24px 60px",
              }}
            >
              {/* Portal Header with Fast Portal Navigation & Return to Showcase */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 24,
                  paddingBottom: 16,
                  borderBottom: "1px solid rgba(45, 75, 110, 0.35)",
                }}
              >
                {/* Return Button */}
                <button
                  onClick={() => handleSelectTab("home")}
                  className="btn"
                  style={{
                    fontSize: 12,
                    padding: "8px 18px",
                    gap: 8,
                    background: "rgba(10, 20, 34, 0.85)",
                    border: "1px solid rgba(0, 240, 255, 0.4)",
                    color: "#00f0ff",
                    boxShadow: "0 0 15px rgba(0, 240, 255, 0.15)",
                  }}
                >
                  <Zap size={14} color="#00f0ff" />
                  <span>← RETURN TO 3D SHOWCASE ANIMATION</span>
                </button>

                {/* Portal Quick-Tabs Switcher */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    overflowX: "auto",
                    padding: "4px 0",
                  }}
                >
                  {[
                    { id: "live" as GccTab, label: "Live Arena", icon: Radio },
                    { id: "overview" as GccTab, label: "Overview", icon: Activity },
                    { id: "teams" as GccTab, label: "Teams", icon: Users },
                    { id: "leaderboard" as GccTab, label: "Leaderboard", icon: Award },
                    { id: "replay" as GccTab, label: "Replay", icon: RotateCcw },
                    { id: "hardware" as GccTab, label: "Hardware", icon: Cpu },
                    { id: "reports" as GccTab, label: "Reports", icon: BarChart3 },
                    { id: "eventlog" as GccTab, label: "Event Log", icon: ScrollText },
                    { id: "map" as GccTab, label: "Track Map", icon: Map },
                    { id: "ai" as GccTab, label: "AI Analyst", icon: Sparkles },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectTab(tab.id)}
                        className={`gcc-tab-btn ${isActive ? "active" : ""}`}
                        style={{ fontSize: 11, padding: "6px 12px" }}
                      >
                        <Icon size={13} color={isActive ? "#ff6a00" : "#8da3be"} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Quick Link to Admin Console */}
                <Link
                  href="/admin"
                  className="btn"
                  style={{
                    fontSize: 11,
                    padding: "7px 14px",
                    gap: 6,
                    background: "rgba(10, 20, 34, 0.75)",
                    border: "1px solid rgba(0, 240, 255, 0.35)",
                  }}
                >
                  <Shield size={13} color="#00f0ff" />
                  <span>Race Control</span>
                </Link>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
            <GccOverview
              teams={teams}
              active={active}
              events={events}
              connected={connected}
              onGoToLive={handleScrollToLive}
            />
          )}

          {/* TAB 2: TEAMS DIRECTORY */}
          {activeTab === "teams" && (
            <GccTeamsDirectory
              teams={teams}
              activeTeamId={active?.team_id}
            />
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <GccLeaderboardTable
              teams={teams}
              activeTeamId={active?.team_id}
            />
          )}

          {/* TAB 4: REPLAY CENTER */}
          {activeTab === "replay" && (
            <GccReplayCenter videoId={videoId} />
          )}

          {/* TAB 5: HARDWARE MONITOR */}
          {activeTab === "hardware" && (
            <GccHardwareMonitor
              connected={connected}
              eventCount={events.length}
            />
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === "reports" && (
            <GccReports teams={teams} />
          )}

          {/* TAB 8: LIVE EVENT LOG */}
          {activeTab === "eventlog" && (
            <GccEventLog
              teams={teams}
              active={active}
              events={events}
              connected={connected}
            />
          )}

          {/* TAB 9: RACE TRACK MAP */}
          {activeTab === "map" && (
            <GccTrackMap
              active={active}
              events={events}
              connected={connected}
            />
          )}

          {/* TAB 10: AI RACE ANALYST */}
          {activeTab === "ai" && (
            <GccAiAnalyst
              teams={teams}
              active={active}
              events={events}
            />
          )}

          {/* TAB 7: LIVE COMPETITION SPECTATOR ARENA (Original Core Preserved) */}
          {activeTab === "live" && (
            <>
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
                  <Link href="/admin" className="btn btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
                    <Shield size={14} />
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

              {/* Main Arena Grid: Broadcast & Live Telemetry wrapped in Mechanical Blast Doors */}
              <MechanicalBlastDoors>
                <section className="two-col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 0.9fr)", gap: 18 }}>
                {/* Live Broadcast Card */}
                <div className="panel hud-panel" style={{ overflow: "hidden" }}>
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
                      <span>LIVE TRACK BROADCAST // WEBRTC</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="eq-bars">
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                        <span className="eq-bar" />
                      </div>
                      <span className="pill pill-green">WEBRTC LIVE</span>
                    </div>
                  </div>

                  {/* Real-time WebRTC LiveKit Spectator Player */}
                  <LiveKitSpectatorPlayer />

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
                        <TiltCard key={n} maxTilt={6} className="gate-tilt-wrap">
                          <div className={`gate-card ${cleared ? "cleared" : "pending"}`}>
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
                        </TiltCard>
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
            </MechanicalBlastDoors>

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
                            {t.best_time_ms ? (
                              <CyberScrambleText text={fmt(t.best_time_ms)} duration={350} />
                            ) : (
                              "—"
                            )}
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

                  <div data-lenis-prevent style={{ display: "grid", gap: 8, maxHeight: 310, overflowY: "auto", paddingRight: 4 }}>
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

              {/* NIRMAN-inspired Marquee Divider */}
              <div className="marquee-shell" aria-hidden="true">
                <div className="marquee-track">
                  <span>NIRMAN 6.0 // LINE FOLLOWER ARENA</span>
                  <span>•</span>
                  <span>TRANSFORM WITH TECHNOLOGY</span>
                  <span>•</span>
                  <span>4-GATE ESP32 LASER TIMING</span>
                  <span>•</span>
                  <span>SILICON UNIVERSITY // 20.3533° N, 85.8266° E</span>
                  <span>•</span>
                  <span>NIRMAN 6.0 // LINE FOLLOWER ARENA</span>
                  <span>•</span>
                  <span>TRANSFORM WITH TECHNOLOGY</span>
                  <span>•</span>
                  <span>4-GATE ESP32 LASER TIMING</span>
                  <span>•</span>
                  <span>SILICON UNIVERSITY // 20.3533° N, 85.8266° E</span>
                  <span>•</span>
                </div>
              </div>

              {/* Arena Intel, Rulebook Modal & Race-Day FAQs */}
              <NirmanRulebookFaq />

              {/* Techfest-Style Interactive Bot Subsystem Inspector */}
              <InteractiveBotInspector />

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
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )}
  <FloatingArenaMenu activeTab={activeTab} onSelectTab={handleSelectTab} />
  <MissionControlHudBar
    checksCount={checks.length}
    totalGates={4}
    activeRunTeam={active?.teams?.name ?? null}
    isRunning={active?.status === "running"}
  />
</div>
);
}
