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
  ChevronRight,
  Clock,
  Cpu,
  Flame,
  Map,
  Play,
  Radio,
  RotateCcw,
  ScrollText,
  Shield,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import TrackVisionHero from "@/components/TrackVisionHero";
import GccNav, { type GccTab } from "@/components/gcc/GccNav";
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
import MechanicalBlastDoors from "@/components/kinetics/MechanicalBlastDoors";
import InteractiveBotInspector from "@/components/kinetics/InteractiveBotInspector";
import MissionControlHudBar from "@/components/kinetics/MissionControlHudBar";

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

  // Active Navigation Module
  const [activeTab, setActiveTab] = useState<GccTab>("home");
  const [cinematicOpen, setCinematicOpen] = useState(false);

  const lenis = useLenis();
  const prevChecksRef = useRef<number[]>([]);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F3", color: "#292929", position: "relative" }}>
      {/* ── AUDIO SOUND ENGINE ── */}
      <AudioEngine />

      {/* ── PERSISTENT TOP NAVIGATION BAR ── */}
      <GccNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        connected={connected}
        activeRunCount={isRunning ? 1 : 0}
      />

      {/* ── STATUS BAR ── */}
      <GccStatusBar
        connected={connected}
        eventCount={events.length}
        isRunning={isRunning}
        activeTeamName={currentTeam?.name}
        teamsCount={teams.length}
        finishedCount={teams.filter((t) => t.status === "finished").length}
      />

      {/* ── OPTIONAL 3D CINEMATIC INTRO MODAL ── */}
      {cinematicOpen && (
        <div className="fixed inset-0 z-[100] bg-[#03060a] flex flex-col">
          <div className="bg-[#292929] text-white px-4 py-2.5 flex justify-between items-center border-b-2 border-[#FF8A32] z-20">
            <span className="font-mono text-xs font-bold text-[#FF8A32] flex items-center gap-2">
              <Zap size={14} /> 3D ROBOT CINEMATIC SHOWCASE // NIRMAN 6.0
            </span>
            <button
              onClick={() => setCinematicOpen(false)}
              className="font-mono text-xs font-black px-3 py-1 bg-[#FF8A32] text-[#292929] border border-black shadow-[1.5px_1.5px_0_#000] rounded hover:bg-[#ff9c4e] cursor-pointer"
            >
              ✕ RETURN TO RACE CONTROL
            </button>
          </div>
          <div className="relative flex-1 w-full h-full">
            <TrackVisionHero
              onEnterArena={() => {
                setCinematicOpen(false);
                handleScrollToLive();
              }}
              onSelectTab={(tab) => {
                setCinematicOpen(false);
                handleSelectTab(tab);
              }}
              isBackground={false}
            />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-[1520px] mx-auto px-4 sm:px-6 pt-4 pb-20">
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════════
              TAB 01: SHOWCASE (HOMEPAGE — PADDOCK GRANDSTAND ARCADE HYBRID)
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Main Hero Card */}
              <section className="bg-[#FFFFFF] border-[3px] border-[#292929] rounded shadow-[6px_6px_0px_#292929] overflow-hidden">
                {/* Vintage Grand Prix Monochrome Checkered Ribbon */}
                <div className="h-4 bg-[#292929] flex overflow-hidden border-b-2 border-[#292929]">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-full shrink-0 ${
                        i % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#292929]"
                      }`}
                    />
                  ))}
                </div>

                <div className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Editorial Hero Details */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB36B] border-2 border-[#292929] rounded font-mono text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_#292929]">
                        <Flame size={14} className="text-[#292929]" />
                        SEASON 2026 // STAGE 01
                      </span>
                      <span className="font-mono text-xs px-2.5 py-1 bg-[#F5D9C0] border-2 border-[#292929] rounded font-bold shadow-[2px_2px_0px_#292929]">
                        CIRCUIT NIRMAN 6.0
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#292929] tracking-tight leading-[1.1]">
                      THE FUTURE OF{" "}
                      <span className="bg-[#FF8A32] text-[#292929] px-2.5 py-0.5 border-[2.5px] border-[#292929] shadow-[4px_4px_0px_#292929] inline-block -rotate-1">
                        ROBOTICS RACING
                      </span>
                    </h1>

                    <p className="font-mono text-sm sm:text-base text-[#444] leading-relaxed max-w-xl font-medium">
                      Official high-precision race control for autonomous line-following robotics.
                      Integrated with 4-point optical sensor gates, sub-millisecond hardware timing,
                      and live motorsport telemetry.
                    </p>

                    {/* REFINED CHUNKY NEOBRUTALIST ACTION BUTTONS */}
                    <div className="pt-2 flex flex-wrap gap-4">
                      {/* Primary Button (Racing Orange) */}
                      <button
                        onClick={handleScrollToLive}
                        className="font-mono text-sm font-black px-7 py-4 bg-[#FF8A32] text-[#292929] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5 cursor-pointer"
                      >
                        <Play size={18} fill="#292929" />
                        <span>ENTER LIVE ARENA</span>
                      </button>

                      {/* Secondary Button (Leaderboard) */}
                      <button
                        onClick={() => handleSelectTab("leaderboard")}
                        className="font-mono text-sm font-black px-7 py-4 bg-[#FFFFFF] text-[#292929] border-[2.5px] border-[#292929] rounded shadow-[4px_4px_0px_#292929] hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#F5D9C0] hover:shadow-[7px_7px_0px_#292929] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2.5 cursor-pointer"
                      >
                        <Trophy size={18} />
                        <span>VIEW LEADERBOARD</span>
                      </button>

                      {/* 3D Cinematic Trigger Button */}
                      <button
                        onClick={() => setCinematicOpen(true)}
                        className="font-mono text-sm font-black px-5 py-4 bg-[#FFF9F3] text-[#292929] border-[2.5px] border-[#292929] rounded shadow-[3.5px_3.5px_0px_#292929] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#F5D9C0] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Video size={16} />
                        <span>3D CINEMATIC</span>
                      </button>
                    </div>

                    {/* Bolder Orange Benchmark Feature Block */}
                    <div className="bg-[#FFB36B] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#FFFFFF] border-2 border-[#292929] rounded flex items-center justify-center font-bold text-lg shadow-[1.5px_1.5px_0px_#292929] shrink-0">
                          ⚡
                        </div>
                        <div>
                          <div className="font-mono text-xs font-black text-[#292929] uppercase">
                            BENCHMARK LAP RECORD: {fastestLap?.best_time_ms ? fmt(fastestLap.best_time_ms) : "12.45s"}
                          </div>
                          <div className="font-mono text-[11px] text-[#292929]/80 font-bold">
                            Set by <span className="underline font-black">{fastestLap?.name ?? "CyberStriker"}</span> ({fastestLap?.code ?? "TV-02"}) · Sector 1: 3.89s
                          </div>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block font-mono text-[10px] font-black px-2 py-1 bg-[#292929] text-white rounded shrink-0">
                        AUTHENTICATED
                      </span>
                    </div>
                  </div>

                  {/* Right: Official Stopwatch Box */}
                  <div className="lg:col-span-5 bg-[#FFF9F3] border-[2.5px] border-[#292929] rounded p-6 shadow-[5px_5px_0px_#292929] space-y-4">
                    <div className="flex justify-between items-center border-b-2 border-[#292929] pb-3">
                      <span className="font-mono text-xs font-black text-[#FF8A32] flex items-center gap-1.5 uppercase">
                        <Timer size={16} /> OFFICIAL RACE STOPWATCH
                      </span>
                      <span
                        className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] ${
                          isRunning ? "bg-[#FF8A32] text-[#292929] animate-pulse" : "bg-[#22c55e] text-white"
                        }`}
                      >
                        {isRunning ? "● LIVE ON TRACK" : "CIRCUIT READY"}
                      </span>
                    </div>

                    {/* Digital Timing Panel */}
                    <div className="text-center py-5 bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded shadow-[3px_3px_0px_#292929]">
                      <div className="font-mono text-[11px] text-[#A3A3A3] font-bold uppercase tracking-widest">
                        CIRCUIT ELAPSED DURATION
                      </div>
                      <div className="font-mono text-5xl sm:text-6xl font-black text-[#292929] tracking-tight my-1">
                        {elapsed.toFixed(2)}<span className="text-2xl text-[#FF8A32]">s</span>
                      </div>
                      <div className="font-mono text-xs text-[#292929] font-bold">
                        ACTIVE ROBOT: <span className="text-[#FF8A32] font-black">{currentTeam?.name ?? "No Active Heat"}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#A3A3A3] mt-0.5 font-bold">
                        {currentTeam?.college ?? "Silicon Institute of Technology"}
                      </div>
                    </div>

                    {/* Progress & Sector Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                      <div className="p-3 bg-[#FFFFFF] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929]">
                        <div className="text-[10px] text-[#A3A3A3] font-bold">GATES CLEARED</div>
                        <div className="font-black text-lg text-[#292929]">{cpCount} / 4 GATES</div>
                      </div>
                      <div className="p-3 bg-[#FFFFFF] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929]">
                        <div className="text-[10px] text-[#A3A3A3] font-bold">COURSE PROGRESS</div>
                        <div className="font-black text-lg text-[#FF8A32]">{Math.round((cpCount / 4) * 100)}%</div>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 bg-[#E8E8E8] border-2 border-[#292929] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#FF8A32] border-r-2 border-[#292929] transition-all duration-300"
                        style={{ width: `${(cpCount / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Optical Sensor Gates (Gates 01–04) */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b-2 border-[#292929] gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu size={20} className="text-[#FF8A32]" />
                    <h2 className="font-mono text-sm sm:text-base font-black uppercase text-[#292929] tracking-wider">
                      OPTICAL SENSOR GATES // BEAM-BREAK REALTIME TELEMETRY
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#A3A3A3]">
                    ESP32 HARDWARE INTERRUPT (ADC1 SENSORS)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((gateNo) => {
                    const isCleared = checks.includes(gateNo);
                    const label = gateLabels[gateNo];
                    const ev = events.find((e) => e.checkpoint_no === gateNo);
                    const timeStr = ev ? new Date(ev.detected_at).toLocaleTimeString() : "--:--:--";

                    return (
                      <div
                        key={gateNo}
                        className={`border-[2.5px] border-[#292929] rounded p-4.5 shadow-[4px_4px_0px_#292929] transition-all ${
                          isCleared
                            ? "bg-[#FFFFFF] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#292929]"
                            : "bg-[#FFF9F3] opacity-80 border-dashed"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="font-mono text-xs font-black bg-[#F5D9C0] px-2.5 py-1 border border-[#292929] rounded shadow-[1px_1px_0px_#292929]">
                            GATE 0{gateNo}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] ${
                              isCleared
                                ? "bg-[#FF8A32] text-[#292929] shadow-[1px_1px_0px_#292929]"
                                : "bg-[#E8E8E8] text-[#A3A3A3]"
                            }`}
                          >
                            {isCleared ? "CLEARED" : isRunning ? "ARMED" : "WAITING"}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-[#A3A3A3] font-bold">
                          {label.desc}
                        </div>
                        <div className="font-mono text-[10px] text-[#FF8A32] font-black mb-2">
                          Sector {gateNo}
                        </div>

                        <div className="font-mono text-2xl font-black text-[#292929]">
                          {isCleared ? timeStr : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Official Leaderboard Summary Table */}
              <section className="bg-[#FFFFFF] border-[3px] border-[#292929] rounded shadow-[6px_6px_0px_#292929] overflow-hidden">
                <div className="bg-[#292929] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Trophy size={20} className="text-[#FF8A32]" />
                    <div>
                      <h2 className="font-mono text-sm sm:text-base font-black uppercase tracking-wider">
                        OFFICIAL COMPETITION LEADERBOARD // NIRMAN 6.0
                      </h2>
                      <div className="font-mono text-[10px] text-[#A3A3A3]">
                        RANKINGS DERIVED FROM REAL SUPABASE TIMING & BEAM BREAKS
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTab("leaderboard")}
                    className="font-mono text-xs font-black px-3 py-1.5 bg-[#FF8A32] text-[#292929] border border-black shadow-[1.5px_1.5px_0_#000] rounded hover:bg-[#ff9c4e] self-start sm:self-auto cursor-pointer"
                  >
                    FULL TIMING SHEET →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs min-w-[650px]">
                    <thead>
                      <tr className="bg-[#FFF9F3] border-b-2 border-[#292929] text-[#292929] font-black text-[11px] uppercase tracking-wider">
                        <th className="py-3.5 px-4">POS</th>
                        <th className="py-3.5 px-4">CODE</th>
                        <th className="py-3.5 px-4">ROBOT & INSTITUTION</th>
                        <th className="py-3.5 px-4">STATUS</th>
                        <th className="py-3.5 px-4 text-right">BEST LAP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#E8E8E8]">
                      {sorted.slice(0, 6).map((t, idx) => {
                        const isP1 = idx === 0 && t.best_time_ms != null;
                        const isPodium = idx < 3 && t.best_time_ms != null;
                        return (
                          <tr
                            key={t.id}
                            className={`transition-colors ${
                              isP1
                                ? "bg-[#FFB36B]/25 font-bold"
                                : idx % 2 === 1
                                ? "bg-[#FFF9F3]"
                                : "bg-[#FFFFFF]"
                            } hover:bg-[#F5D9C0]/50`}
                          >
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded border border-[#292929] ${
                                  isP1
                                    ? "bg-[#FF8A32] text-[#292929] shadow-[2px_2px_0px_#292929]"
                                    : isPodium
                                    ? "bg-[#F5D9C0] text-[#292929] shadow-[1px_1px_0px_#292929]"
                                    : "bg-[#E8E8E8] text-[#292929]"
                                }`}
                              >
                                #{idx + 1}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-[#FF8A32] text-sm">
                              {t.code}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-black text-[#292929] text-sm">{t.name}</div>
                              <div className="text-[11px] text-[#A3A3A3]">{t.college}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] uppercase ${
                                  t.status === "running"
                                    ? "bg-[#FF8A32] text-[#292929] animate-pulse"
                                    : "bg-[#FFFFFF] text-[#292929]"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-base text-[#292929]">
                              {fmt(t.best_time_ms)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* NIRMAN-inspired Marquee Divider */}
              <div className="marquee-shell py-2 font-mono text-xs uppercase tracking-wider" aria-hidden="true">
                <div className="flex gap-4 items-center whitespace-nowrap overflow-hidden font-black">
                  <span>NIRMAN 6.0 // AUTONOMOUS LINE FOLLOWER ARENA</span>
                  <span>•</span>
                  <span>4-GATE ESP32 LASER TIMING</span>
                  <span>•</span>
                  <span>SILICON UNIVERSITY // 20.3533° N, 85.8266° E</span>
                  <span>•</span>
                  <span>TRANSFORM WITH TECHNOLOGY</span>
                  <span>•</span>
                  <span>NIRMAN 6.0 // AUTONOMOUS LINE FOLLOWER ARENA</span>
                  <span>•</span>
                  <span>4-GATE ESP32 LASER TIMING</span>
                </div>
              </div>

              {/* Interactive Bot Inspector & Rulebook */}
              <InteractiveBotInspector />
              <NirmanRulebookFaq />
              <SponsorWall />

              {/* Footer */}
              <footer className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-6 shadow-[5px_5px_0px_#292929] flex flex-col sm:flex-row justify-between items-center gap-3 font-mono text-xs">
                <div>
                  <span className="font-black text-[#292929]">TRACK VISION // NIRMAN 6.0 GRAND PRIX</span>
                  <div className="text-[10px] text-[#A3A3A3] mt-0.5">
                    Hardware: ESP32 ADC1 (CH1-CH4) · Timing: Server Timestamps
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#F5D9C0] border border-[#292929] rounded font-bold">
                    PRO CIRCUIT EDITION
                  </span>
                </div>
              </footer>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 02: LIVE ARENA (SPECTATOR HUB & WEBRTC BROADCAST)
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "live" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Arena Header */}
              <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-5 shadow-[4px_4px_0px_#292929] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FF8A32] border-2 border-[#292929] rounded flex items-center justify-center font-mono font-black text-xl text-[#292929] shadow-[2px_2px_0px_#292929]">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h2 className="font-digital text-xl font-black text-[#292929]">
                      LIVE ARENA // <span className="text-[#FF8A32]">TELEMETRY BROADCAST</span>
                    </h2>
                    <div className="font-mono text-xs text-[#A3A3A3] font-bold">
                      NIRMAN 6.0 AUTONOMOUS COMPETITION CIRCUIT
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-3 py-1 bg-[#F5D9C0] border-2 border-[#292929] rounded shadow-[2px_2px_0px_#292929]">
                    WEBRTC FEED ONLINE
                  </span>
                  <Link href="/admin">
                    <button className="font-mono text-xs font-black px-4 py-2 bg-[#292929] text-white border-2 border-[#292929] rounded shadow-[2.5px_2.5px_0px_#FF8A32]">
                      DISPATCH COCKPIT →
                    </button>
                  </Link>
                </div>
              </div>

              {/* Quick KPI Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929]">
                  <div className="font-mono text-[10px] text-[#A3A3A3] font-bold uppercase">TRACK RECORD</div>
                  <div className="font-digital text-2xl font-black text-[#292929] mt-0.5">
                    {fastestLap?.best_time_ms ? fmt(fastestLap.best_time_ms) : "--.--s"}
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929]">
                  <div className="font-mono text-[10px] text-[#A3A3A3] font-bold uppercase">ESP32 SENSORS</div>
                  <div className="font-digital text-2xl font-black text-[#FF8A32] mt-0.5">
                    4 CHANNELS ACTIVE
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929]">
                  <div className="font-mono text-[10px] text-[#A3A3A3] font-bold uppercase">REGISTERED TEAMS</div>
                  <div className="font-digital text-2xl font-black text-[#292929] mt-0.5">
                    {teams.length} COMPETITORS
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border-[2.5px] border-[#292929] rounded p-4 shadow-[4px_4px_0px_#292929]">
                  <div className="font-mono text-[10px] text-[#A3A3A3] font-bold uppercase">ARENA STATUS</div>
                  <div className="font-digital text-2xl font-black text-[#FF8A32] mt-0.5">
                    {isRunning ? "RACE IN PROGRESS" : "TRACK READY"}
                  </div>
                </div>
              </div>

              {/* Main Arena Grid: LiveKit Spectator Video & Active Telemetry */}
              <MechanicalBlastDoors>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: WebRTC Spectator Player (8 cols) */}
                  <div className="lg:col-span-8 bg-[#FFFFFF] border-[3px] border-[#292929] rounded shadow-[5px_5px_0px_#292929] overflow-hidden">
                    <div className="bg-[#292929] text-white p-3 px-4 flex justify-between items-center font-mono text-xs font-bold">
                      <span className="flex items-center gap-2">
                        <Radio size={14} className="text-[#FF8A32]" />
                        LIVE TRACK BROADCAST // WEBRTC
                      </span>
                      <span className="bg-[#FF8A32] text-[#292929] px-2 py-0.5 rounded font-black">
                        1080p 60FPS
                      </span>
                    </div>

                    <LiveKitSpectatorPlayer />

                    {/* Active Heat Banner */}
                    <div className="p-4 bg-[#FFF9F3] border-t-2 border-[#292929] flex justify-between items-center font-mono text-xs">
                      <div>
                        <span className="text-[#A3A3A3] font-bold">ACTIVE RUN: </span>
                        <span className="font-black text-[#292929] text-sm">
                          {currentTeam?.name ?? "No Active Heat"} ({currentTeam?.code ?? "STANDBY"})
                        </span>
                      </div>
                      <div className="font-digital text-xl font-black text-[#FF8A32]">
                        {elapsed.toFixed(2)}s
                      </div>
                    </div>
                  </div>

                  {/* Right: Optical Gates Progress Box (4 cols) */}
                  <div className="lg:col-span-4 bg-[#FFFFFF] border-[3px] border-[#292929] rounded p-5 shadow-[5px_5px_0px_#292929] space-y-4">
                    <div className="font-mono text-xs font-black uppercase tracking-wider text-[#292929] pb-2 border-b-2 border-[#292929] flex items-center justify-between">
                      <span>CIRCUIT SECTORS</span>
                      <span className="text-[#FF8A32]">{cpCount}/4 GATES</span>
                    </div>

                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((g) => {
                        const isCleared = checks.includes(g);
                        const label = gateLabels[g];
                        return (
                          <div
                            key={g}
                            className={`p-3 rounded border-2 border-[#292929] font-mono text-xs flex justify-between items-center ${
                              isCleared
                                ? "bg-[#FFB36B]/30 shadow-[2px_2px_0px_#292929]"
                                : "bg-[#FFF9F3] text-[#A3A3A3]"
                            }`}
                          >
                            <span className="font-black text-[#292929]">{label.name}</span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded border border-[#292929] ${
                                isCleared ? "bg-[#FF8A32] text-[#292929]" : "bg-[#E8E8E8] text-[#A3A3A3]"
                              }`}
                            >
                              {isCleared ? "CLEARED" : "WAITING"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </MechanicalBlastDoors>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 03: OVERVIEW
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccOverview
                teams={teams}
                active={active}
                events={events}
                connected={connected}
                onGoToLive={handleScrollToLive}
              />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 04: TEAMS DIRECTORY
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccTeamsDirectory teams={teams} activeTeamId={active?.team_id} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 05: LEADERBOARD TABLE
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccLeaderboardTable teams={teams} activeTeamId={active?.team_id} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 06: REPLAY CENTER
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "replay" && (
            <motion.div
              key="replay"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccReplayCenter videoId={videoId} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 07: HARDWARE MONITOR
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "hardware" && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccHardwareMonitor connected={connected} eventCount={events.length} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 08: REPORTS
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccReports teams={teams} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 09: EVENT LOG
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "eventlog" && (
            <motion.div
              key="eventlog"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccEventLog
                teams={teams}
                active={active}
                events={events}
                connected={connected}
              />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 10: TRACK MAP
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccTrackMap active={active} events={events} connected={connected} />
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 11: AI ANALYST
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <GccAiAnalyst teams={teams} active={active} events={events} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
